const express = require('express')
const router = express.Router()
const { addReview, getReviewsByDaycare } = require('../controllers/reviewController')
const { protect } = require('../middlewares/authMiddleware')

router.post('/add', protect, addReview)
router.get('/daycare/:daycareId', getReviewsByDaycare)

module.exports = router