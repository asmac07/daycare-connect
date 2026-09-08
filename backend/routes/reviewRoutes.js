const express = require('express')
const router = express.Router()
const { addReview, getReviewsByDaycare } = require('../controllers/reviewController')
const { protect } = require('../middlewares/authMiddleware')
const checkBlockedUser = require('../middlewares/checkBlockedUser')

router.post('/add', protect, checkBlockedUser, addReview)
router.get('/daycare/:daycareId', checkBlockedUser,getReviewsByDaycare)

module.exports = router