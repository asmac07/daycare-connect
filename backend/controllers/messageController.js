
const User = require('../models/User')

const Message = require('../models/Message')

const getMessages = async (req, res) => {
  try {
    const { daycareId, parentId , childId } = req.params
    
    if (req.user.isBlocked) {
  return res.status(403).json({
    success: false,
    message: 'Your account has been blocked'
  })
}
    const messages = await Message.find({
      daycare: daycareId,
      parent: parentId,
      child: childId
    }).sort({ createdAt: 1 })

    res.status(200).json({
      success: true,
      data: messages
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  getMessages
}

