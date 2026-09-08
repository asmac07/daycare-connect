
const express = require('express')
const router = express.Router()

const { getMessages } = require('../controllers/messageController')
const { protect } = require('../middlewares/authMiddleware')
const checkBlockedUser = require('../middlewares/checkBlockedUser')

router.get('/:daycareId/:parentId', protect,  getMessages)

module.exports = router

