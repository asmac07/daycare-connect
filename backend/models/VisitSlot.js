const mongoose = require('mongoose')

const visitSlotSchema = new mongoose.Schema({
        daycare: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Daycare',
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        startTime: {
            type: String,
            required: true
        },
        endTime: {
            type: String,
            required: true
        },
        status: {
            type: String,
            enum: ['available', 'booked','reschedule_requested', 'rescheduled','cancelled', 'completed'],
            default: 'available'
        },
        bookedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        bookedAt: {
            type: Date
        },
        child: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Child',
            required: false
        }
        }, { timestamps: true })

module.exports = mongoose.model('VisitSlot', visitSlotSchema)