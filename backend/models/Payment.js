
const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema(
  {
    parent: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true
    },

    amount: {
      type: Number,
      required: true
    },

    razorpayOrderId: {
      type: String,
      required: true
    },

    razorpayPaymentId: {
      type: String
    },

    razorpaySignature: {
      type: String
    },

    status: {
      type: String,
      enum: ['pending', 'paid', 'failed'],
      default: 'pending'
    },

    paidAt: {
      type: Date
    }
  },
  {
    timestamps: true
  }
)

const Payment = mongoose.model('Payment', paymentSchema)

module.exports = Payment