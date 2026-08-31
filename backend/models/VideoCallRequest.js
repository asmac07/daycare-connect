
const mongoose = require('mongoose')

const videoCallRequestSchema = new mongoose.Schema({
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

            child: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Child',
                required: true
            },

            daycare: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Daycare',
                required: true
            },

            status: {
                type: String,
                enum: ['pending', 'accepted', 'rejected'],
                default: 'pending'
            }

            }, { timestamps: true })

module.exports = mongoose.model('VideoCallRequest', videoCallRequestSchema)