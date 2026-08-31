const express = require('express')
const router = express.Router()
const { authLimiter }  = require("../middlewares/rateLimit.js")
const { register, login, refreshAccessToken , forgotPassword,
         resetPassword, googleLogin, verifyOtp,
        completeGoogleSignup, logout } = require('../controllers/authController')


router.post('/register',authLimiter, register)
router.post('/login',authLimiter, login)
router.post('/refresh', refreshAccessToken)
router.post('/forgotPassword', authLimiter, forgotPassword)
router.put('/resetPassword/:token', authLimiter, resetPassword)

router.post('/google',googleLogin)
router.post('/google/complete',completeGoogleSignup)

router.post('/verifyOtp', verifyOtp)
router.post('/logout', logout)
module.exports = router