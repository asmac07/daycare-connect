
const express = require('express')
const router = express.Router()
const { createOrder , verifyPayment } = require('../controllers/paymentController')
const { protect } = require('../middlewares/authMiddleware')

router.post('/createOrder', protect, createOrder)
router.post('/verifyPayment', protect,verifyPayment )

module.exports = router