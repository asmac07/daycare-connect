
const express = require('express')
const router = express.Router()

const { protect } = require('../middlewares/authMiddleware')
const { authorizeRoles } = require('../middlewares/roleMiddleware')


const { getOwnerWallet, withdrawMoney ,razorpayXWebhook , addBankAccount} = require('../controllers/walletController')


router.get('/owner', protect, authorizeRoles('owner'), getOwnerWallet)
router.post( '/withdraw', protect, authorizeRoles('owner'), withdrawMoney)
router.post('/razorpayx/webhook',  razorpayXWebhook)
router.post('/bank-account',protect, authorizeRoles('owner'), addBankAccount)
module.exports = router