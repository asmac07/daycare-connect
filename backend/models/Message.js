
const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({

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

                sender: {
                     type: mongoose.Schema.Types.ObjectId, 
                     ref: 'User', 
                     required: true
                     },

                  

                text: {
                     type: String, 
                     default:''
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
                    // Message read status
               read: { 
                    type: Boolean, 
                    default: false 
                    }, 
                    // Time when message was read 
               readAt: {
                     type: Date, default: null }      

          }, { timestamps: true })

module.exports = mongoose.model('Message', messageSchema)