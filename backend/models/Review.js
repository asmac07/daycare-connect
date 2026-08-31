
const mongoose = require('mongoose')


const reviewSchema = new mongoose.Schema({
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

            enrollment: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Enrollment',
                required: true
            },

            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },

            comment: {
                type: String,
                trim: true
            }

            }, { timestamps: true })

module.exports = mongoose.model('Review', reviewSchema)