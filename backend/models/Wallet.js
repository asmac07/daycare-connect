const mongoose = require('mongoose')

const walletSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },

    balance: {
      type: Number,
      default: 0,
      min: 0
    },

    bankAccount: {
      accountHolderName: {
        type: String,
        trim: true
      },

      accountNumber: {
        type: String,
        trim: true
      },

      ifsc: {
        type: String,
        trim: true,
        uppercase: true
      },

      bankName: {
        type: String,
        trim: true
      },

      fundAccountId: {
        type: String
      }
    }
  },
  {
    timestamps: true
  }
)

const Wallet = mongoose.model('Wallet', walletSchema)

module.exports = Wallet