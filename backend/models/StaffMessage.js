
const mongoose = require('mongoose')

const staffMessageSchema = new mongoose.Schema({

  daycare: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Daycare',
    required: true
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  staff: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  text: {
    type: String,
    required: true
  },

  delivered: {
    type: Boolean,
    default: false
  },

  read: {
    type: Boolean,
    default: false
  },

  readAt: {
    type: Date,
    default: null
  }

}, { timestamps: true })

module.exports = mongoose.model('StaffMessage', staffMessageSchema)