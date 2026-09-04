

const Message = require('../models/Message')

const getMessages = async (req, res) => {
  try {
    const { daycareId, parentId } = req.params

    const messages = await Message.find({
      daycare: daycareId,
      parent: parentId
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

