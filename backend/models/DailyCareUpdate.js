const mongoose = require('mongoose')

const dailyCareUpdateSchema = new mongoose.Schema(
  {
    child: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Child',
      required: true
    },

    enrollment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Enrollment',
      required: true
    },

    daycare: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Daycare',
      required: true
    },

    staff: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    attendance: {
      type: String,
      enum: ['Present', 'Absent'],
      required: true
    },

    breakfast: {
      type: String,
      enum: ['Done', 'Not Done'],
      default: 'Not Done'
    },

    lunch: {
      type: String,
      enum: ['Done', 'Not Done'],
      default: 'Not Done'
    },

    nap: {
      type: String,
      enum: ['Done', 'Not Done'],
      default: 'Not Done'
    },

    activity: {
      type: String,
      enum: ['Done', 'Not Done'],
      default: 'Not Done'
    }
  },
  {
    timestamps: true
  }
)

module.exports = mongoose.model(
  'DailyCareUpdate',
  dailyCareUpdateSchema
)