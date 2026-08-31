const express = require('express')
const router = express.Router()
const { createEnrollmentRequest, approveEnrollment, rejectEnrollment, getMyEnrollments,
    getDaycareEnrollments , assignStaff, deleteEnrollment } = require('../controllers/enrollmentController')
const { protect } = require('../middlewares/authMiddleware')

router.post("/enrollmentRequest", protect, createEnrollmentRequest)
router.put('/approve/:id', protect, approveEnrollment)
router.put('/reject/:id', protect, rejectEnrollment)
router.get("/getMyEnrollments", protect, getMyEnrollments)
router.get('/getDaycareEnrollments', protect, getDaycareEnrollments)
router.put('/assignStaff/:id',protect, assignStaff)
router.delete( '/delete/:id', protect, deleteEnrollment
)

module.exports = router