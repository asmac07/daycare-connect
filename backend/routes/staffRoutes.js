
const express = require('express')
const router = express.Router()
const { createStaff, getMyStaff, getStaffDaycare, updateStaff, toggleStaffStatus,
    getAssignedChildren, getAssignedParents
                        } = require('../controllers/staffController')
const { protect } = require('../middlewares/authMiddleware')
const { authorizeRoles } = require('../middlewares/roleMiddleware')
const { getDailyCareChildren,
    saveDailyCareUpdate , getParentDailyCareUpdates } = require('../controllers/dailyCareController')

router.post('/create', protect, authorizeRoles('owner'), createStaff)
router.get('/myStaff', protect, authorizeRoles('owner'), getMyStaff)
router.get('/myDaycare', protect, authorizeRoles('staff'), getStaffDaycare)
router.put('/update/:id', protect, authorizeRoles('owner'), updateStaff)
router.put('/toggleStatus/:id', protect,authorizeRoles('owner'),toggleStaffStatus)
router.get('/assignedChildren', protect,authorizeRoles('staff'),getAssignedChildren)
router.get('/assigned-parents',protect,authorizeRoles('staff'),getAssignedParents)
router.get('/daily-care/children', protect, authorizeRoles('staff'),getDailyCareChildren)
router.post('/daily-care/update', protect, authorizeRoles('staff'), saveDailyCareUpdate)
router.get( '/daily-care-updates',protect, authorizeRoles('parent'),  getParentDailyCareUpdates)

module.exports = router