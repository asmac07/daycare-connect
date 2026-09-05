
const mongoose = require('mongoose')
const Wallet = require('../models/Wallet')
const WalletTransaction = require('../models/WalletTransaction')

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

    //validate amount
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
    }).session(session) //this db oprtion is tha part of current trasacrion

    if (!wallet) {
      throw new Error('Wallet not found')
    }


    if (amount > wallet.balance) {
      throw new Error('Insufficient wallet balance')
    }

    
    wallet.balance -= Number(amount)

    // wallet updated is included this trasction
    await wallet.save({ session })

    
    await WalletTransaction.create(
      [
        {
          owner: req.user.id,
          wallet: wallet._id,
          type: 'DEBIT',
          amount: Number(amount),
          reason: 'WITHDRAWAL',
          balanceAfter: wallet.balance
        }
      ],
      { session }
    )

    //confrmation(trasnsaction succed)
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

    await session.abortTransaction()

    console.log('WITHDRAW MONEY ERROR:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })

  } finally {
    session.endSession()
  }
}


module.exports = {
  getOwnerWallet,
  withdrawMoney
}