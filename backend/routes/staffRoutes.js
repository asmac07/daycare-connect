
const express = require('express')
const router = express.Router()
const { createStaff, getMyStaff, getStaffDaycare, updateStaff, toggleStaffStatus,
    getAssignedChildren, getAssignedParents
                        } = require('../controllers/staffController')
const { protect } = require('../middlewares/authMiddleware')
const { authorizeRoles } = require('../middlewares/roleMiddleware')

router.post('/create', protect, authorizeRoles('owner'), createStaff)
router.get('/myStaff', protect, authorizeRoles('owner'), getMyStaff)
router.get('/myDaycare', protect, authorizeRoles('staff'), getStaffDaycare)
router.put('/update/:id', protect, authorizeRoles('owner'), updateStaff)
router.put('/toggleStatus/:id', protect,authorizeRoles('owner'),toggleStaffStatus)
router.get('/assignedChildren', protect,getAssignedChildren)
router.get('/assigned-parents',protect,authorizeRoles('staff'),getAssignedParents)

module.exports = router