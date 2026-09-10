
const express = require('express')
const router = express.Router()
const { protect } = require('../middlewares/authMiddleware')
const { authorizeRoles } = require('../middlewares/roleMiddleware')
const { getAllUsers, blockUser, unblockUser,
    getPendingDaycares, approveDaycare, rejectDaycare, blockDaycare, unblockDaycare,
    getAllDaycares,suspendDaycare
                 } = require('../controllers/adminController')
const {
  getAdminAnalytics
} = require('../controllers/adminAnalyticsController')

router.get('/users', protect, authorizeRoles('admin'), getAllUsers)
router.put('/users/:id/block', protect, authorizeRoles('admin'), blockUser)
router.put('/users/:id/unblock', protect, authorizeRoles('admin'), unblockUser)

router.get('/pendingDaycares', protect, authorizeRoles('admin'), getPendingDaycares)
router.put('/daycares/:id/approve', protect, authorizeRoles('admin'), approveDaycare)
router.put('/daycares/:id/reject', protect, authorizeRoles('admin'), rejectDaycare)
router.put('/daycares/:id/block', protect, authorizeRoles('admin'), blockDaycare)
router.put('/daycares/:id/unblock', protect, authorizeRoles('admin'), unblockDaycare)
router.get('/allDaycares', protect, authorizeRoles('admin'), getAllDaycares)
router.put('/daycares/:id/suspend',protect,authorizeRoles('admin'),suspendDaycare)

router.get( '/analytics', protect,  authorizeRoles('admin'),getAdminAnalytics)

module.exports = router