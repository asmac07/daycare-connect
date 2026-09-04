
const Daycare = require('../models/Daycare')
const Enrollment = require('../models/Enrollment')
const sendEmail = require('../utils/sendEmail')
const User = require('../models/User')
const { ENROLLMENT_STATUS, AGE_GROUPS, PACKAGE_PRICES } = require('../constants')

const createEnrollmentRequest = async (req, res) => {
  try {
    const { child, daycare, ageGroup, package: packageType } = req.body

    if (!child || !daycare || !ageGroup || !packageType) {
      return res.status(400).json({
        success: false,
        message: 'Child, daycare, age group, and package are required'
      })
    }

    if (![AGE_GROUPS.INFANT, AGE_GROUPS.TODDLER, AGE_GROUPS.PRESCHOOL].includes(ageGroup)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid age group'
      })
    }

    if (!PACKAGE_PRICES[packageType]) {
      return res.status(400).json({
        success: false,
        message: 'Invalid package selected'
      })
    }

    const amount = PACKAGE_PRICES[packageType]

    const existingActiveEnrollment = await Enrollment.findOne({
      child,
      enrollmentStatus: {
        $in: [ENROLLMENT_STATUS.PENDING, ENROLLMENT_STATUS.APPROVED, ENROLLMENT_STATUS.CONFIRMED]
      }
    })

    if (existingActiveEnrollment) {
      return res.status(400).json({
        success: false,
        message: 'This child already has an active or pending enrollment. Please wait for it to be resolved before enrolling elsewhere.'
      })
    }

    const daycareData = await Daycare.findById(daycare)

    if (!daycareData) {
      return res.status(404).json({
        success: false,
        message: 'Daycare not found'
      })
    }

    if (daycareData.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'This daycare is temporarily unavailable'
      })
    }

    if (daycareData.seatsAvailable <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No seats available in this daycare'
      })
    }

    const enrollment = await Enrollment.create({
      parent: req.user.id,
      child,
      daycare,
      ageGroup,
      package: packageType,
      amount,
      enrollmentStatus: ENROLLMENT_STATUS.PENDING
    })

    res.status(201).json({
      success: true,
      message: 'Enrollment request submitted successfully',
      data: enrollment
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const approveEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id).populate('parent', 'name email')

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    const daycare = await Daycare.findOne({
      _id: enrollment.daycare,
      owner: req.user.id
    })

    if (!daycare) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this daycare'
      })
    }
      
    if (daycare.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'This daycare is temporarily blocked'
        })
      }


    if (enrollment.enrollmentStatus !== ENROLLMENT_STATUS.APPROVED) {
      if (daycare.seatsAvailable <= 0) {
        return res.status(400).json({
          success: false,
          message: 'No seats available'
        })
      }

      daycare.seatsAvailable = daycare.seatsAvailable - 1
      await daycare.save()
    }
     enrollment.enrollmentStatus = ENROLLMENT_STATUS.APPROVED

    await enrollment.save()

    await sendEmail(
      enrollment.parent.email,
      'Enrollment Request Approved!',
      `
      <p>Hi ${enrollment.parent.name},</p>
      <p>Your enrollment request for "<strong>${daycare.name}</strong>" has been approved!</p>
      <p><strong>Package:</strong> ${enrollment.package}</p>
      <p><strong>Amount:</strong> ₹${enrollment.amount}</p>
      `
    )

    res.status(200).json({
      success: true,
      message: 'Enrollment approved successfully',
      data: enrollment
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const rejectEnrollment = async (req, res) => {
  try {
    const { reason } = req.body

    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required'
      })
    }

    const enrollment = await Enrollment.findById(req.params.id).populate('parent', 'name email')

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    const daycare = await Daycare.findOne({
      _id: enrollment.daycare,
      owner: req.user.id
    })

    if (!daycare) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized for this daycare'
      })
    }

    if (daycare.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'This daycare is currently blocked. Enrollment cannot be processed.'
        })
      }

    if (enrollment.enrollmentStatus === ENROLLMENT_STATUS.APPROVED) {
      daycare.seatsAvailable += 1
      await daycare.save()
    }


    enrollment.enrollmentStatus = ENROLLMENT_STATUS.REJECTED
    enrollment.reason = reason
    await enrollment.save()

    await sendEmail(
      enrollment.parent.email,
      'Update on Your Enrollment Request',
      `
      <p>Hi ${enrollment.parent.name},</p>
      <p>Unfortunately, your enrollment request for "<strong>${daycare.name}</strong>" was not approved at this time.</p>
      <p><strong>Reason:</strong></p>
      <p>${reason}</p>
      `
    )

    res.status(200).json({
      success: true,
      message: 'Enrollment rejected',
      data: enrollment
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const deleteEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    // Delete related payment records
    await Payment.deleteMany({
      enrollment: enrollment._id
    })

    // Delete enrollment
    await Enrollment.findByIdAndDelete(enrollment._id)

    res.status(200).json({
      success: true,
      message: 'Enrollment and related payment deleted successfully'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// parent
const getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ parent: req.user.id })
      .populate('child')
      .populate('daycare', 'name address owner')
      .populate('assignedStaff', 'name email designation')

    res.status(200).json({
      success: true,
      data: enrollments
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const getDaycareEnrollments = async (req, res) => {
  try {
    const { page = 1, limit = 5 } = req.query
    const skip = (Number(page) - 1) * Number(limit)

    const daycare = await Daycare.findOne({ owner: req.user.id })

    if (!daycare) {
      return res.status(404).json({
        success: false,
        message: 'Daycare not found'
      })
    }

    const total = await Enrollment.countDocuments({ daycare: daycare._id })

    const enrollments = await Enrollment.find({ daycare: daycare._id })
      .populate('child', 'name dateOfBirth gender')
      .populate('parent', 'name email phone')
      .populate('assignedStaff', 'name email')
      .skip(skip)
      .limit(Number(limit))

    res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      total,
      data: enrollments
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const assignStaff = async (req, res) => {
  try {
    const { staffId } = req.body

    console.log('Enrollment ID:', req.params.id)
    console.log('Staff ID:', staffId)
    console.log('Owner ID:', req.user.id)


     if (!staffId) {
      return res.status(400).json({
        success: false,
        message: 'Staff ID is required'
      })
    }


    const enrollment = await Enrollment.findById(req.params.id)

    if (!enrollment) {
      return res.status(404).json({ success: false, message: 'Enrollment not found' })
    }

    const daycare = await Daycare.findOne({ _id: enrollment.daycare, owner: req.user.id })

    if (!daycare) {
      return res.status(403).json({ success: false, message: 'Not authorized for this daycare' })
    }

    if (enrollment.enrollmentStatus !== ENROLLMENT_STATUS.CONFIRMED) {
      return res.status(400).json({ success: false, message: 'Only confirmed enrollments can be assigned staff' })
    }

    const staff = await User.findOne({ _id: staffId, role: 'staff', daycare: daycare._id })

    if (!staff) {
      return res.status(400).json({ success: false, message: 'Invalid staff member' })
    }


    enrollment.assignedStaff = staffId
    await enrollment.save()

    res.status(200).json({
      success: true,
      message: 'Staff assigned successfully',
      data: enrollment
    })

  } catch (error) {
     console.error('ASSIGN STAFF ERROR:', error)
    res.status(500).json({
       success: false, 
       message: error.message })
  }
}


const getMyAssignedStaff = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      parent: req.user.id,
      enrollmentStatus: ENROLLMENT_STATUS.CONFIRMED,
      assignedStaff: { $ne: null }
    })
      .populate('assignedStaff', 'name email')
      .populate('daycare', 'name')
      .populate('child','name')

    res.status(200).json({
      success: true,
      data: enrollments
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  createEnrollmentRequest,
  approveEnrollment,
  rejectEnrollment,
  getMyEnrollments,
  getDaycareEnrollments,
  assignStaff,
  deleteEnrollment,
  getMyAssignedStaff
}