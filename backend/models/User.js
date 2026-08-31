
const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
            name: {
                type: String,
                required: true
            },

            email: {
                type: String,
                required: true,
                unique: true
            },

            password: {
                type: String,
                required: true
            },

            phone: {
                type: String
            },
            
            role: {
                type: String,
                enum: ['parent', 'owner', 'staff', 'admin'],
                required: true
            },

            designation: {
                    type: String,
                    enum: ['Teacher', 'Caretaker', 'Nurse', 'Administrator'],
                    
            },

            status: {
                type: String,
                enum: ['pending', 'active', 'rejected', 'suspended', 'blocked'],
                default: 'active'
            },

            isVerified: {
                type: Boolean,
                default: false
                },

            otp: {
                type: String
                },

            otpExpires: {
                type: Date
                },

            isDeleted: {
                type: Boolean,
                default: false
            },

            isBlocked: {
                type: Boolean,
                default: false
            },
             
            refreshToken: {
                type: String
            },

           daycare: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Daycare'
            },

            resetPasswordToken: {
                 type: String
            },
            
            resetPasswordExpires: {
                type: Date
            }
            
         }, { timestamps: true })

const User = mongoose.model('User', userSchema)

module.exports = User