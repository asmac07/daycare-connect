

const express = require('express')
const router = express.Router()
const { createDaycare, getMyDaycare, updateDaycare,searchNearbyDaycare, getApprovedDaycares } = require('../controllers/daycareController')
const { protect } = require('../middlewares/authMiddleware')

router.post('/create', protect, createDaycare)
router.get('/getMyDaycare', protect, getMyDaycare)
router.put('/update', protect, updateDaycare )
router.get('/search', protect, searchNearbyDaycare)
router.get('/approved', protect, getApprovedDaycares)

module.exports = router