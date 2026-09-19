
const express = require('express')

const router = express.Router()

const {
  getStaffMessages
} = require('../controllers/staffMessageController')

const { protect } = require('../middlewares/authMiddleware')

router.get('/:daycareId/:parentId/:staffId/:childId', protect,getStaffMessages)

module.exports = router