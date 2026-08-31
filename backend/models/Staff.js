const mongoose = require('mongoose')

const staffSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    daycare: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Daycare',
      required: true
    },

    name: {
      type: String,
      required: true,
      trim: true
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true
    },

    password: {
      type: String,
      required: true
    },

    designation: {
      type: String,
      enum: ['Teacher', 'Caretaker', 'Nurse', 'Administrator'],
      default: 'Caretaker'
    },

    isActive: {
      type: Boolean,
      default: true
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model('Staff', staffSchema)