
const express = require('express')
const router = express.Router()
const { addChild, getMyChildren, updateChild, deleteChild } = require('../controllers/childController')
const { protect } = require('../middlewares/authMiddleware')

router.post('/addChild', protect, addChild)
router.get('/myChildren', protect, getMyChildren)
router.put('/updateChild/:id', protect, updateChild)
router.delete('/deleteChild/:id', protect, deleteChild)

module.exports = router