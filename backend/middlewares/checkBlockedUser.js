
const checkBlockedUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('isBlocked')

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked by the admin'
      })
    }

    next()
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = checkBlockedUser