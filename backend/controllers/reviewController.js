const Review = require('../models/Review')
const Daycare = require('../models/Daycare')
const User= require('../models/User')
const addReview = async (req, res) => {
  try {
    const { daycare, enrollment, rating, comment } = req.body

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5'
      })
    }

    if (req.user.isBlocked) {
  return res.status(403).json({
    success: false,
    message: 'Your account has been blocked'
  })
}
    const review = await Review.create({
      parent: req.user.id,
      daycare,
      enrollment,
      rating,
      comment
    })

    const allReviews = await Review.find({ daycare })
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length

    await Daycare.findByIdAndUpdate(daycare, { 
        averageRating: avgRating ,
        totalReviews: allReviews.length
    })

    res.status(201).json({
      success: true,
      message: 'Review added successfully',
      data: review
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getReviewsByDaycare = async (req, res) => {
  try {
    
    if (req.user.isBlocked) {
  return res.status(403).json({
    success: false,
    message: 'Your account has been blocked'
  })
}
    const reviews = await Review.find({ daycare: req.params.daycareId }).populate('parent', 'name')
    res.status(200).json({ success: true, data: reviews })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { addReview, getReviewsByDaycare }
