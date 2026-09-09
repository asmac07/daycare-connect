
require('dotenv').config()

const express = require('express')
const cors = require('cors')
const cookieParser = require('cookie-parser')

const authRoutes = require('./routes/authRoutes')
const daycareRoutes = require('./routes/daycareRoutes')
const childRoutes = require('./routes/childRoutes')
const enrollmentRoutes = require('./routes/enrollmentRoutes')
const adminRoutes = require('./routes/adminRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const staffRoutes = require('./routes/staffRoutes')
const visitSlotRoutes = require('./routes/visitSlotRoutes')
// const { apiLimiter } = require('./middlewares/rateLimit')
const messageRoutes = require('./routes/messageRoutes')
const paymentRoutes = require('./routes/paymentRoutes')
const walletRoutes = require('./routes/walletRoutes')
const staffMessageRoutes = require('./routes/staffMessageRoutes')
const uploadRoutes = require('./routes/uploadRoutes')

const app = express()

// app.use(apiLimiter)

app.use(cors({
    origin: process.env.CLIENT_URL,
    credentials : true
}
))
app.use(express.json())
app.use(cookieParser())

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/daycare', daycareRoutes)
app.use('/api/v1/child', childRoutes)
app.use('/api/v1/enrollment', enrollmentRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/review', reviewRoutes)
app.use('/api/v1/staff', staffRoutes)
app.use('/api/v1/visitSlots', visitSlotRoutes)
app.use('/api/v1/payment', paymentRoutes)
app.use('/api/v1/messages', messageRoutes)
app.use('/api/v1/wallet', walletRoutes)
app.use('/api/v1/staff-messages', staffMessageRoutes)
app.use('/api/v1/upload', uploadRoutes)

module.exports = app