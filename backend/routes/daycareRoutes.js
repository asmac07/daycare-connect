

const express = require('express')
const router = express.Router()
const { createDaycare, getMyDaycare, updateDaycare,searchNearbyDaycare, getApprovedDaycares } = require('../controllers/daycareController')
const { protect } = require('../middlewares/authMiddleware')
const checkBlockedUser = require('../middlewares/checkBlockedUser')

router.post('/create', protect, checkBlockedUser, createDaycare)
router.get('/getMyDaycare', protect,  checkBlockedUser, getMyDaycare)
router.put('/update', protect, checkBlockedUser, updateDaycare )
router.get('/search', protect,  checkBlockedUser,searchNearbyDaycare)
router.get('/approved', protect, checkBlockedUser, getApprovedDaycares)

module.exports = router