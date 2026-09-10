
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
    defualt : ''
  },
  messageType: {
      type: String,
      enum: ['text', 'image', 'file', 'audio', 'video'],
      default: 'text'
},

  fileUrl: {
      type: String,
      default: null
    },

   fileName: {
      type: String,
      default: null
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