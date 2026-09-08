

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

router.post( '/enrollmentRequest', protect, checkBlockedUser, createEnrollmentRequest)

router.put('/approve/:id',protect,  authorizeRoles('owner'), checkBlockedUser,approveEnrollment)

router.put('/reject/:id',protect, authorizeRoles('owner'), checkBlockedUser, rejectEnrollment)

router.get('/getMyEnrollments',protect, checkBlockedUser,getMyEnrollments)

router.get('/getDaycareEnrollments',protect, checkBlockedUser,getDaycareEnrollments)

router.put('/assignStaff/:id', protect,  checkBlockedUser,assignStaff)

router.delete('/delete/:id',protect, checkBlockedUser,deleteEnrollment)

router.get( '/my-assigned-staff', protect, authorizeRoles('parent'), checkBlockedUser, getMyAssignedStaff)

router.post('/renew', protect, authorizeRoles('parent'),  checkBlockedUser,renewEnrollment)

router.get( '/check-availability',protect, authorizeRoles('parent'), checkBlockedUser,checkEnrollmentAvailability)
module.exports = router

