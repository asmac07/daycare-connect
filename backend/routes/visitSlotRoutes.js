const express = require('express')
const router = express.Router()

const { protect } = require('../middlewares/authMiddleware')
const { authorizeRoles } = require('../middlewares/roleMiddleware')

const {
  createSlot,getMySlots,getAvailableSlots,bookSlot,
  cancelBooking  , getMyBookings , getVisitSlotDetails,
    requestReschedule,cancelBookingByOwner , rescheduleToNewSlot,
    markVisitCompleted } = require('../controllers/visitSlotController')

//  for Owner
router.post('/visitSlot',protect,authorizeRoles('owner'),createSlot)
router.get('/mySlots', protect,authorizeRoles('owner'),getMySlots)
router.get('/visitSlotDetails', protect, authorizeRoles('parent'), getVisitSlotDetails)
// router.put('/:id/reschedule', protect, authorizeRoles('owner'),rescheduleBooking)
router.patch('/:id/request-reschedule',protect,authorizeRoles('owner'),requestReschedule)
router.put('/:id/cancel-by-owner', protect, authorizeRoles('owner'),cancelBookingByOwner)
router.put( '/:id/complete',protect, authorizeRoles('owner', 'staff'),markVisitCompleted)

// for parent
router.get('/daycare/:daycareId',protect,authorizeRoles('parent'),getAvailableSlots)
router.put('/:id/book',protect,authorizeRoles('parent'),bookSlot)
router.put('/:id/cancel',protect,authorizeRoles('parent'),cancelBooking)
router.get('/myBookings', protect, authorizeRoles('parent'), getMyBookings)
router.put( '/:id/reschedule', protect, authorizeRoles('parent'),rescheduleToNewSlot)
module.exports = router
