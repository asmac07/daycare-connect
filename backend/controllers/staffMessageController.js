
const StaffMessage = require('../models/StaffMessage')
const Enrollment = require('../models/Enrollment')
const { ENROLLMENT_STATUS } = require('../constants')

const getStaffMessages = async (req, res) => {
  try {
    const { daycareId, parentId, staffId } = req.params

    const enrollment = await Enrollment.findOne({
      daycare: daycareId,
      parent: parentId,
      assignedStaff: staffId,
      enrollmentStatus: ENROLLMENT_STATUS.CONFIRMED
    })

    if (!enrollment) {
      return res.status(403).json({
        success: false,
        message: 'Parent and staff are not assigned to this daycare'
      })
    }

    const messages = await StaffMessage.find({
      daycare: daycareId,
      parent: parentId,
      staff: staffId
    }).sort({ createdAt: 1 })

    res.status(200).json({
      success: true,
      data: messages
    })

  } catch (error) {
    console.log('GET STAFF MESSAGES ERROR:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  getStaffMessages
}