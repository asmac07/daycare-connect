
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
        transactions: transactions
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

    console.log('STEP 1: Calling RazorpayX payout')

    const payout = await createRazorpayXPayout(Number(amount))

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

    console.log('RAZORPAY ERROR DATA:', error.response?.data)
    console.log('WITHDRAW MONEY ERROR:', error.message)

    await session.abortTransaction()

    console.log('WITHDRAW MONEY ERROR:', error)

    res.status(500).json({
      success: false,
      message:
        error.response?.data?.error?.description || error.message
    })

  } finally {
    session.endSession()
  }
}

const createRazorpayXPayout = async (amount) => {

  const response = await axios.post(
    'https://api.razorpay.com/v1/payouts',
    {
      account_number: process.env.RAZORPAYX_ACCOUNT_NUMBER,
      // fund_account_id: fundAccountId,
      fund_account_id: process.env.RAZORPAYX_FUND_ACCOUNT_ID,
      amount: Number(amount) * 100,
      currency: 'INR',
      mode: 'UPI',
      purpose: 'payout',
      queue_if_low_balance: true, //insufficiant blnce
      reference_id: `WITHDRAW_${Date.now()}`,  //to identify the withdrawl request
      narration: 'DayCare wallet withdrawal'
    },
    {
      auth: {
        username: process.env.RAZORPAYX_KEY_ID,
        password: process.env.RAZORPAYX_KEY_SECRET
      }
    }
  )

  return response.data  //inlude payout id and payout status
}

 const razorpayXWebhook = async (req, res) => {
  try {
    console.log('RAZORPAYX WEBHOOK RECEIVED')

    const webhookSignature = req.headers['x-razorpay-signature']

    console.log('WEBHOOK SIGNATURE:', webhookSignature)
    console.log('RAW BODY EXISTS:', !!req.rawBody)
    console.log('WEBHOOK BODY:', req.body)

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAYX_WEBHOOK_SECRET)
      .update(req.rawBody)
      .digest('hex')

    if (webhookSignature !== expectedSignature) {
      return res.status(400).json({
        success: false,
        message: 'Invalid webhook signature'
      })
    }

    console.log('WEBHOOK SIGNATURE VERIFIED')

    const event = req.body.event

    console.log('WEBHOOK EVENT:', event)

    const payout = req.body.payload?.payout?.entity

    if (!payout) {
      console.log('PAYOUT DATA NOT FOUND')

      return res.status(200).json({
        success: true
      })
    }

    console.log('PAYOUT ID:', payout.id)
    console.log('PAYOUT STATUS:', payout.status)

    const transaction = await WalletTransaction.findOne({
      razorpayPayoutId: payout.id
    })

    if (!transaction) {
      console.log('Wallet transaction not found')

      return res.status(200).json({
        success: true
      })
    }

    // -----------------------------------
    // 1. PAYOUT PROCESSED
    // -----------------------------------

    if (event === 'payout.processed') {

      // Already processed
      if (transaction.payoutStatus === 'SUCCESS') {
        console.log('Payout already processed')

        return res.status(200).json({
          success: true
        })
      }

      const session = await mongoose.startSession()

      try {
        session.startTransaction()

        const wallet = await Wallet.findById(transaction.wallet)
          .session(session)

        if (!wallet) {
          throw new Error('Wallet not found')
        }

        // Deduct amount only after RazorpayX processed the payout
        wallet.balance -= transaction.amount

        await wallet.save({ session })

        transaction.payoutStatus = 'SUCCESS'
        transaction.balanceAfter = wallet.balance

        await transaction.save({ session })

        await session.commitTransaction()

        console.log('Wallet balance deducted successfully')
        console.log('Wallet transaction updated to SUCCESS')

      } catch (error) {

        await session.abortTransaction()

        console.log('PROCESSED WEBHOOK TRANSACTION ERROR:', error)

        throw error

      } finally {
        session.endSession()
      }
    }

    // -----------------------------------
    // 2. PAYOUT FAILED
    // -----------------------------------

    else if (event === 'payout.failed') {

      if (
        transaction.payoutStatus === 'FAILED' ||
        transaction.payoutStatus === 'SUCCESS'
      ) {
        console.log('Payout already finalized')

        return res.status(200).json({
          success: true
        })
      }

      transaction.payoutStatus = 'FAILED'

      await transaction.save()

      console.log('Wallet transaction updated to FAILED')
    }

    // -----------------------------------
    // 3. PAYOUT REVERSED
    // -----------------------------------

    else if (event === 'payout.reversed') {

      if (transaction.payoutStatus === 'FAILED') {
        console.log('Payout already reversed/failed')

        return res.status(200).json({
          success: true
        })
      }

      const session = await mongoose.startSession()

      try {
        session.startTransaction()

        const wallet = await Wallet.findById(transaction.wallet)
          .session(session)

        if (!wallet) {
          throw new Error('Wallet not found')
        }

        /*
          If the payout was already processed,
          the amount was deducted from wallet.

          Reversed means RazorpayX returned the
          payout amount, so add it back.
        */
        if (transaction.payoutStatus === 'SUCCESS') {
          wallet.balance += transaction.amount

          await wallet.save({ session })

          transaction.balanceAfter = wallet.balance
        }

        transaction.payoutStatus = 'FAILED'

        await transaction.save({ session })

        await session.commitTransaction()

        console.log('Reversed payout amount returned to wallet')
        console.log('Wallet transaction updated to FAILED')

      } catch (error) {

        await session.abortTransaction()

        console.log('REVERSED WEBHOOK TRANSACTION ERROR:', error)

        throw error

      } finally {
        session.endSession()
      }
    }

    return res.status(200).json({
      success: true
    })

  } catch (error) {

    console.log('WEBHOOK ERROR:', error.message)

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  getOwnerWallet,
  withdrawMoney,
  razorpayXWebhook,
  createRazorpayXPayout
}