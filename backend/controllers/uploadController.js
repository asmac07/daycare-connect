
const cloudinary = require('../config/cloudinary')

const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      })
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'daycare-chat'
        },
        (error, result) => {
          if (error) {
            reject(error)
          } else {
            resolve(result)
          }
        }
      )

      stream.end(req.file.buffer)
    })

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully',
      fileUrl: result.secure_url,
      fileName: req.file.originalname
    })
  } catch (error) {
    console.log('File upload error:', error)

    res.status(500).json({
      success: false,
      message: 'File upload failed'
    })
  }
}

module.exports = { uploadFile }