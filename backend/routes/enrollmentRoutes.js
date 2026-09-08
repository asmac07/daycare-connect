

const express = require('express')

const router = express.Router()

const {
  createEnrollmentRequest,
  approveEnrollment,
  rejectEnrollment,
  getMyEnrollments,
  getDaycareEnrollments,
  assignStaff,
  deleteEnrollment,
  getMyAssignedStaff, renewEnrollment,
  checkEnrollmentAvailability
} = require('../controllers/enrollmentController')

const { protect } = require('../middlewares/authMiddleware')
const { authorizeRoles } = require('../middlewares/roleMiddleware')
const checkBlockedUser = require('../middlewares/checkBlockedUser')

router.post( '/enrollmentRequest', protect, createEnrollmentRequest)

router.put('/approve/:id',protect,  authorizeRoles('owner'), approveEnrollment)

router.put('/reject/:id',protect, authorizeRoles('owner'), rejectEnrollment)

router.get('/getMyEnrollments',protect,getMyEnrollments)

router.get('/getDaycareEnrollments',protect, getDaycareEnrollments)

router.put('/assignStaff/:id', protect, assignStaff)

router.delete('/delete/:id',protect, deleteEnrollment)

router.get( '/my-assigned-staff', protect, authorizeRoles('parent'),  getMyAssignedStaff)

router.post('/renew', protect, authorizeRoles('parent'), renewEnrollment)

router.get( '/check-availability',protect, authorizeRoles('parent'), checkEnrollmentAvailability)
module.exports = router

