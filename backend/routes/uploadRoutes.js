
const express = require('express')
const router = express.Router()

const { uploadFile } = require('../controllers/uploadController')
const upload = require('../middlewares/uploadMiddleware')
const { protect } = require('../middlewares/authMiddleware')

router.post('/', protect, upload.single('file'), uploadFile)

module.exports = router