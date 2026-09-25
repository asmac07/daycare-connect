const mongoose = require('mongoose')
const Wallet = require('../models/Wallet')
const WalletTransaction = require('../models/WalletTransaction')
const axios = require('axios')
const crypto = require('crypto')

const getOwnerWallet = async (req, res) => {
  try {

    // Find owner's wallet
    const wallet = await Wallet.findOne({
      owner: req.user.id
    })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      })
    }

    // Find owner's transaction history
    const transactions = await WalletTransaction.find({
      owner: req.user.id
    })
      .sort({ createdAt: -1 })

    res.status(200).json({
      success: true,
      data: {
        balance: wallet.balance,
        transactions: transactions,
        bankAccount: wallet.bankAccount
      }
    })

  } catch (error) {

    console.log('GET OWNER WALLET ERROR:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


const withdrawMoney = async (req, res) => {
  const session = await mongoose.startSession()

  try {
    const { amount } = req.body

    // Validate amount
    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Enter a valid withdrawal amount'
      })
    }

    // Start transaction
    session.startTransaction()

    const wallet = await Wallet.findOne({
      owner: req.user.id
    }).session(session)

    if (!wallet) {
      throw new Error('Wallet not found')
    }

    if (amount > wallet.balance) {
      throw new Error('Insufficient wallet balance')
    }

    // Check whether owner has a bank account
    if (!wallet.bankAccount?.fundAccountId) {
      throw new Error(
        'Please add a bank account before withdrawal'
      )
    }

    console.log('STEP 1: Calling RazorpayX payout')

    // Create payout using owner's fund account
    const payout = await createRazorpayXPayout(
      Number(amount),
      wallet.bankAccount.fundAccountId
    )

    console.log('RAZORPAYX PAYOUT:', payout)

    // Create withdrawal transaction with PROCESSING status
    await WalletTransaction.create(
      [
        {
          owner: req.user.id,
          wallet: wallet._id,
          type: 'DEBIT',
          amount: Number(amount),
          reason: 'WITHDRAWAL',
          balanceAfter: wallet.balance,
          razorpayPayoutId: payout.id,
          payoutStatus: 'PROCESSING'
        }
      ],
      { session }
    )

    // Confirm database transaction
    await session.commitTransaction()

    res.status(200).json({
      success: true,
      message: 'Withdrawal request created successfully',
      data: {
        amount: Number(amount),
        balance: wallet.balance
      }
    })

  } catch (error) {

    console.log(
      'RAZORPAY ERROR DATA:',
      error.response?.data
    )

    console.log(
      'WITHDRAW MONEY ERROR:',
      error.message
    )

    await session.abortTransaction()

    console.log(
      'WITHDRAW MONEY ERROR:',
      error
    )

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.error?.description ||
        error.message
    })

  } finally {
    session.endSession()
  }
}


const createRazorpayXPayout = async (
  amount,
  fundAccountId
) => {

  const response = await axios.post(
    'https://api.razorpay.com/v1/payouts',
    {
      account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,

      // Owner-specific RazorpayX fund account
      fund_account_id: fundAccountId,

      amount: Number(amount) * 100,
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      queue_if_low_balance: true,
      reference_id: `WITHDRAW_${Date.now()}`,
      narration: 'DayCare wallet withdrawal'
    },
    {
      auth: {
        username: process.env.RAZORPAYX_KEY_ID,
        password: process.env.RAZORPAYX_KEY_SECRET
      }
    }
  )

  return response.data
}


const razorpayXWebhook = async (req, res) => {
  try {

    console.log('RAZORPAYX WEBHOOK RECEIVED')

    const webhookSignature =
      req.headers['x-razorpay-signature']

    console.log(
      'WEBHOOK SIGNATURE:',
      webhookSignature
    )

    console.log(
      'RAW BODY EXISTS:',
      !!req.rawBody
    )

    console.log(
      'WEBHOOK BODY:',
      req.body
    )

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac(
        'sha256',
        process.env.RAZORPAYX_WEBHOOK_SECRET
      )
      .update(req.rawBody)
      .digest('hex')

    if (webhookSignature !== expectedSignature) {

      console.log('INVALID WEBHOOK SIGNATURE')

      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      })
    }

    console.log('WEBHOOK SIGNATURE VERIFIED')

    const event = req.body.event

    console.log(
      'WEBHOOK EVENT:',
      event
    )

    const payout =
      req.body.payload?.payout?.entity

    console.log(
      'PAYOUT OBJECT:',
      JSON.stringify(payout, null, 2)
    )

    if (!payout) {

      console.log(
        'PAYOUT DATA NOT FOUND'
      )

      return res.status(200).json({
        success: true
      })
    }

    console.log(
      'PAYOUT ID:',
      payout.id
    )

    console.log(
      'PAYOUT STATUS:',
      payout.status
    )

    const transaction =
      await WalletTransaction.findOne({
        razorpayPayoutId: payout.id
      })

    console.log(
      'SEARCHING TRANSACTION FOR PAYOUT ID:',
      payout.id
    )

    console.log(
      'TRANSACTION FOUND:',
      transaction
    )

    if (!transaction) {

      console.log(
        'Wallet transaction not found'
      )

      console.log(
        'Searching payout ID:',
        payout.id
      )

      return res.status(200).json({
        success: true
      })
    }

    console.log(
      'TRANSACTION FOUND:',
      transaction._id
    )

    console.log(
      'TRANSACTION STATUS:',
      transaction.payoutStatus
    )


    // -----------------------------------
    // 1. PAYOUT PROCESSED
    // -----------------------------------

    if (event === 'payout.processed') {

      console.log(
        'PAYOUT PROCESSED EVENT RECEIVED'
      )

      // Already processed
      if (
        transaction.payoutStatus === 'SUCCESS'
      ) {

        console.log(
          'Payout already processed'
        )

        return res.status(200).json({
          success: true
        })
      }

      const session =
        await mongoose.startSession()

      try {

        session.startTransaction()

        const wallet =
          await Wallet.findById(
            transaction.wallet
          ).session(session)

        if (!wallet) {
          throw new Error(
            'Wallet not found'
          )
        }

        console.log(
          'WALLET BALANCE BEFORE DEDUCTION:',
          wallet.balance
        )

        // Deduct amount only after
        // RazorpayX processed the payout
        wallet.balance -= transaction.amount

        await wallet.save({
          session
        })

        transaction.payoutStatus =
          'SUCCESS'

        transaction.balanceAfter =
          wallet.balance

        await transaction.save({
          session
        })

        await session.commitTransaction()

        console.log(
          'Wallet balance deducted successfully'
        )

        console.log(
          'Wallet transaction updated to SUCCESS'
        )

      } catch (error) {

        await session.abortTransaction()

        console.log(
          'PROCESSED WEBHOOK TRANSACTION ERROR:',
          error
        )

        throw error

      } finally {

        session.endSession()
      }
    }


    // -----------------------------------
    // 2. PAYOUT REJECTED
    // -----------------------------------

    else if (
      event === 'payout.rejected'
    ) {

      console.log(
        'PAYOUT REJECTED EVENT RECEIVED'
      )

      console.log(
        'TRANSACTION STATUS BEFORE REJECT:',
        transaction.payoutStatus
      )

      // Already finalized
      if (
        transaction.payoutStatus === 'FAILED' ||
        transaction.payoutStatus === 'SUCCESS'
      ) {

        console.log(
          'Payout already finalized'
        )

        return res.status(200).json({
          success: true
        })
      }

      transaction.payoutStatus =
        'FAILED'

      await transaction.save()

      console.log(
        'Wallet transaction updated to FAILED'
      )
    }


    // -----------------------------------
    // 3. PAYOUT REVERSED
    // -----------------------------------

    else if (
      event === 'payout.reversed'
    ) {

      console.log(
        'PAYOUT REVERSED EVENT RECEIVED'
      )

      console.log(
        'TRANSACTION STATUS BEFORE REVERSE:',
        transaction.payoutStatus
      )

      console.log(
        'TRANSACTION ID:',
        transaction._id
      )

      console.log(
        'PAYOUT ID:',
        payout.id
      )

      // Already reversed
      if (
        transaction.payoutStatus === 'FAILED'
      ) {

        console.log(
          'Payout already reversed/failed'
        )

        return res.status(200).json({
          success: true
        })
      }

      const session =
        await mongoose.startSession()

      try {

        session.startTransaction()

        const wallet =
          await Wallet.findById(
            transaction.wallet
          ).session(session)

        if (!wallet) {
          throw new Error(
            'Wallet not found'
          )
        }

        console.log(
          'WALLET BALANCE BEFORE REVERSE:',
          wallet.balance
        )

        /*
          If the payout was already processed,
          the amount was deducted from wallet.

          Reversed means RazorpayX returned the
          payout amount, so add it back.
        */

        if (
          transaction.payoutStatus === 'SUCCESS'
        ) {

          console.log(
            'REVERSING SUCCESSFUL PAYOUT'
          )

          console.log(
            'ADDING BACK AMOUNT:',
            transaction.amount
          )

          wallet.balance +=
            transaction.amount

          await wallet.save({
            session
          })

          transaction.balanceAfter =
            wallet.balance

          console.log(
            'WALLET BALANCE AFTER REVERSE:',
            wallet.balance
          )
        }

        transaction.payoutStatus =
          'FAILED'

        console.log(
          'SETTING TRANSACTION STATUS TO FAILED'
        )

        await transaction.save({
          session
        })

        await session.commitTransaction()

        console.log(
          'Reversed payout amount returned to wallet'
        )

        console.log(
          'Wallet transaction updated to FAILED'
        )

      } catch (error) {

        await session.abortTransaction()

        console.log(
          'REVERSED WEBHOOK TRANSACTION ERROR:',
          error
        )

        throw error

      } finally {

        session.endSession()
      }
    }


    return res.status(200).json({
      success: true
    })

  } catch (error) {

    console.log(
      'WEBHOOK ERROR:',
      error.message
    )

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const addBankAccount = async (req, res) => {
  try {

    const {
      accountHolderName,
      accountNumber,
      ifsc,
      bankName,
      phone
    } = req.body

    // Validate required fields
    if (
      !accountHolderName ||
      !accountNumber ||
      !ifsc ||
      !bankName ||
      !phone
    ) {
      return res.status(400).json({
        success: false,
        message: 'All bank details and mobile number are required'
      })
    }

    // Validate account number
    if (!/^\d{9,18}$/.test(accountNumber)) {
      return res.status(400).json({
        success: false,
        message: 'Account number must be between 9 and 18 digits'
      })
    }

    // Validate mobile number
    if (!/^[6-9]\d{9}$/.test(phone)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid 10-digit mobile number'
      })
    }

    // Find owner's wallet
    const wallet = await Wallet.findOne({
      owner: req.user.id
    })

    if (!wallet) {
      return res.status(404).json({
        success: false,
        message: 'Wallet not found'
      })
    }

    // Find owner details
    const owner = await mongoose
      .model('User')
      .findById(req.user.id)

    if (!owner) {
      return res.status(404).json({
        success: false,
        message: 'Owner not found'
      })
    }

    // Create RazorpayX Contact
    const contactResponse = await axios.post(
      'https://api.razorpay.com/v1/contacts',
      {
        name: accountHolderName,
        email: owner.email,
        contact: phone,
        type: 'vendor',
        reference_id: `OWNER_${owner._id}`
      },
      {
        auth: {
          username: process.env.RAZORPAYX_KEY_ID,
          password: process.env.RAZORPAYX_KEY_SECRET
        }
      }
    )

    const contactId = contactResponse.data.id

    // Create RazorpayX Fund Account
    const fundAccountResponse = await axios.post(
      'https://api.razorpay.com/v1/fund_accounts',
      {
        contact_id: contactId,
        account_type: 'bank_account',
        bank_account: {
          name: accountHolderName,
          ifsc: ifsc,
          account_number: accountNumber
        }
      },
      {
        auth: {
          username: process.env.RAZORPAYX_KEY_ID,
          password: process.env.RAZORPAYX_KEY_SECRET
        }
      }
    )

    const fundAccountId = fundAccountResponse.data.id

    // Save bank details in wallet
    wallet.bankAccount = {
      accountHolderName,
      accountNumber,
      ifsc,
      bankName,
      fundAccountId
    }

    await wallet.save()

    res.status(200).json({
      success: true,
      message: 'Bank account added successfully',
      data: {
        accountHolderName,
        accountNumber: `XXXXXX${accountNumber.slice(-4)}`,
        ifsc,
        bankName,
        fundAccountId
      }
    })

  } catch (error) {

    console.log(
      'ADD BANK ACCOUNT ERROR:',
      error.response?.data || error.message
    )

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.error?.description ||
        error.message
    })
  }
}

module.exports = {
  getOwnerWallet,
  withdrawMoney,
  razorpayXWebhook,
  createRazorpayXPayout,
  addBankAccount
}