
const mongoose = require('mongoose')

const walletTransactionSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    wallet: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Wallet',
      required: true
    },

    type: {
      type: String,
      enum: ['CREDIT', 'DEBIT'],
      required: true
    },

    amount: {
      type: Number,
      required: true,
      min: 0
    },

    reason: {
      type: String,
      enum: [
        'ENROLLMENT_PAYMENT',
        'WITHDRAWAL',
        'REFUND'
      ],
      required: true
    },

    referenceId: {
      type: mongoose.Schema.Types.ObjectId
    },

    balanceAfter: {
      type: Number,
      required: true
    }
  },
  {
    timestamps: true
  }
)

const WalletTransaction = mongoose.model(
  'WalletTransaction',
  walletTransactionSchema
)

module.exports = WalletTransaction