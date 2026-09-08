
const mongoose = require('mongoose')

const daycareSchema = new mongoose.Schema({
        name: {
            type: String,
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true
        },

        address: {
            type: String,
            required: true
        },

        location: {
            type: {
            type: String,
            enum: ['Point'],
            default: 'Point'
            },

         coordinates: {
              type: [Number]  
              }
        },
        seatCapacity: {
            type: Number,
            required: true
        },

        seatsAvailable: {
            type: Number
        },
        facilities: {
            type: [String]   
        },
        verificationStatus: {
            type: String,
            enum: ['pending', 'approved', 'rejected','suspended'],
            default: 'pending'
        } ,

        reason: {
                type: String,
                default: null
        } ,

        isDeleted: {
            type: Boolean,
            default: false
        },

        isBlocked: {
            type: Boolean,
            default: false
        },

        averageRating: {
            type: Number,
            default: 0
       },
       
       totalReviews: {
            type: Number,
            default: 0
        }
        
    }, { timestamps: true })

daycareSchema.index({ location: '2dsphere' })

module.exports = mongoose.model('Daycare', daycareSchema)