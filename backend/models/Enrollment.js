
const mongoose = require('mongoose')

const enrollmentSchema = new mongoose.Schema({
            child: {

                type: mongoose.Schema.Types.ObjectId,
                ref: 'Child',
                required: true
            },

            parent: {

                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },

            daycare: {

                type: mongoose.Schema.Types.ObjectId,
                ref: 'Daycare',
                required: true
            },

            ageGroup: {
                type: String,
                enum: ['Infant', 'Toddler', 'Preschool'],
                required: true
            },

            package: {
                type: String,
                enum: ['daily', 'weekly', 'monthly'],
                required: true
          },

           amount: {
                type: Number,
                required: true
            },

            enrollmentStatus: {
                type: String,
                enum: ['pending', 'approved', 'rejected', 'confirmed'],
                default: 'pending'
            },

              reason: {
                type: String,
                default: null
            },

            paymentStatus: {
                type: String,
                enum: ['pending', 'paid','failed'],
                default: 'pending'
            } ,

            assignedStaff: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                    default: null
            }
                        
            }, { timestamps: true })

module.exports = mongoose.model('Enrollment', enrollmentSchema)