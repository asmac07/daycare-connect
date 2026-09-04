
const express = require('express')

const router = express.Router()

const {
  getStaffMessages
} = require('../controllers/staffMessageController')

const { protect } = require('../middlewares/authMiddleware')

router.get('/:daycareId/:parentId/:staffId', protect,getStaffMessages)

module.exports = router