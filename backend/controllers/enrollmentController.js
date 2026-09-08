
const Daycare = require('../models/Daycare')
const Enrollment = require('../models/Enrollment')
const sendEmail = require('../utils/sendEmail')
const User = require('../models/User')
const { ENROLLMENT_STATUS, AGE_GROUPS, PACKAGE_PRICES } = require('../constants')

const createEnrollmentRequest = async (req, res) => {
  try {
    const {
      child,
      daycare,
      ageGroup,
      package: packageType,
      startDate,
      endDate
    } = req.body

    
    if (
      !child ||
      !daycare ||
      !ageGroup ||
      !packageType ||
      !startDate ||
      !endDate
    ) {
      return res.status(400).json({
        success: false,
        message:
          'Child, daycare, age group, package, start date and end date are required'
      })
    }

    // Convert dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validate dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      })
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      })
    }

    
    if (
      ![
        AGE_GROUPS.INFANT,
        AGE_GROUPS.TODDLER,
        AGE_GROUPS.PRESCHOOL
      ].includes(ageGroup)
    ) {
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

    // checks the enrollmnet alrdy avlbl 
    const existingActiveEnrollment = await Enrollment.findOne({
      child,
      enrollmentStatus: {
        $in: [
          ENROLLMENT_STATUS.PENDING,
          ENROLLMENT_STATUS.APPROVED,
          ENROLLMENT_STATUS.CONFIRMED
        ]
      }
    })

    if (existingActiveEnrollment) {
      return res.status(400).json({
        success: false,
        message:
          'This child already has an active or pending enrollment. Please wait for it to be resolved before enrolling elsewhere.'
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

    // Find CONFIRMED enrollments that overlap
    const overlappingEnrollments = await Enrollment.find({
      daycare: daycare,
      enrollmentStatus: ENROLLMENT_STATUS.CONFIRMED,

      startDate: {
        $lte: end
      },

      endDate: {
        $gte: start
      }
    })

    //  Calculate booked seats
    const bookedSeats = overlappingEnrollments.length

    //  Calculate available seats for selected dates
    const availableSeats =
      daycareData.seatCapacity - bookedSeats

    console.log('Seat availability check:', {
      daycare: daycareData.name,
      startDate: start,
      endDate: end,
      capacity: daycareData.seatCapacity,
      bookedSeats,
      availableSeats
    })

    // If no seat available
    if (availableSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No seats available for the selected dates',
        availableSeats: 0
      })
    }

    
    const enrollment = await Enrollment.create({
      parent: req.user.id,
      child,
      daycare,
      ageGroup,
      package: packageType,
      amount,
      startDate: start,
      endDate: end,
      enrollmentStatus: ENROLLMENT_STATUS.PENDING
    })

    
    res.status(201).json({
      success: true,
      message: 'Enrollment request submitted successfully',
      data: enrollment,
      availability: {
        capacity: daycareData.seatCapacity,
        bookedSeats,
        availableSeats
      }
    })

  } catch (error) {
    console.error('CREATE ENROLLMENT ERROR:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


const approveEnrollment = async (req, res) => {
  try {
    const enrollment = await Enrollment.findById(req.params.id)
      .populate('parent', 'name email')

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

    // Already approved
    if (enrollment.enrollmentStatus === ENROLLMENT_STATUS.APPROVED) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment is already approved'
      })
    }

    // Don't approve rejected/confirmed/expired enrollments
    if (
      enrollment.enrollmentStatus !== ENROLLMENT_STATUS.PENDING
    ) {
      return res.status(400).json({
        success: false,
        message: 'Only pending enrollments can be approved'
      })
    }

    // Check overlapping confirmed enrollments
    const overlappingEnrollments = await Enrollment.find({
      daycare: enrollment.daycare,

      enrollmentStatus: ENROLLMENT_STATUS.CONFIRMED,

      _id: {
        $ne: enrollment._id
      },

      startDate: {
        $lte: enrollment.endDate
      },

      endDate: {
        $gte: enrollment.startDate
      }
    })

    const bookedSeats = overlappingEnrollments.length

    const availableSeats =
      daycare.seatCapacity - bookedSeats

    console.log('Approval availability:', {
      capacity: daycare.seatCapacity,
      bookedSeats,
      availableSeats
    })

    if (availableSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No seats available for the selected dates'
      })
    }

    // Approve enrollment
    enrollment.enrollmentStatus = ENROLLMENT_STATUS.APPROVED

    await enrollment.save()

    await sendEmail(
      enrollment.parent.email,
      'Enrollment Request Approved!',
      `
      <p>Hi ${enrollment.parent.name},</p>

      <p>
        Your enrollment request for
        "<strong>${daycare.name}</strong>"
        has been approved!
      </p>

      <p>
        <strong>Package:</strong> ${enrollment.package}
      </p>

      <p>
        <strong>Amount:</strong> ₹${enrollment.amount}
      </p>

      <p>
        <strong>Start Date:</strong>
        ${new Date(enrollment.startDate).toLocaleDateString()}
      </p>

      <p>
        <strong>End Date:</strong>
        ${new Date(enrollment.endDate).toLocaleDateString()}
      </p>
      `
    )

    res.status(200).json({
      success: true,
      message: 'Enrollment approved successfully',
      data: enrollment,
      availability: {
        capacity: daycare.seatCapacity,
        bookedSeats,
        availableSeats
      }
    })

  } catch (error) {
    console.error('APPROVE ENROLLMENT ERROR:', error)

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

    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || 6

    const skip = (page - 1) * limit

    // Get total number of enrollments
    const totalEnrollments = await Enrollment.countDocuments({
      parent: req.user.id
    })

    // Get enrollments for current page
    const enrollments = await Enrollment.find({
      parent: req.user.id
    })
      .populate('child')
      .populate('daycare', 'name address owner')
      .populate('assignedStaff', 'name email designation')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)

    const totalPages = Math.ceil(
      totalEnrollments / limit
    )

    res.status(200).json({
      success: true,
      data: enrollments,
      pagination: {
        currentPage: page,
        totalPages,
        totalEnrollments,
        limit
      }
    })

  } catch (error) {

    console.error('GET MY ENROLLMENTS ERROR:', error)

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

const renewEnrollment = async (req, res) => {
  try {

    const {
      enrollmentId,
      package: packageType,
      startDate,
      endDate
    } = req.body

    
    if (!enrollmentId || !packageType || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment ID, package, start date and end date are required'
      })
    }

    //  Validate package
    let amount

    if (packageType === 'daily') {
      amount = 300
    } else if (packageType === 'weekly') {
      amount = 1000
    } else if (packageType === 'monthly') {
      amount = 5500
    } else {
      return res.status(400).json({
        success: false,
        message: 'Invalid package'
      })
    }

    // Validate dates
    const start = new Date(startDate)
    const end = new Date(endDate)

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      })
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be after start date'
      })
    }

    
    const oldEnrollment = await Enrollment.findOne({
      _id: enrollmentId,
      parent: req.user.id
    })

    if (!oldEnrollment) {
      return res.status(404).json({
        success: false,
        message: 'Enrollment not found'
      })
    }

    // Check whether old enrollment has actually expired
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const enrollmentEndDate = new Date(oldEnrollment.endDate)
    enrollmentEndDate.setHours(0, 0, 0, 0)

    if (enrollmentEndDate >= today) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment has not expired yet'
      })
    }

    
    const daycare = await Daycare.findById(oldEnrollment.daycare)

    if (!daycare) {
      return res.status(404).json({
        success: false,
        message: 'Daycare not found'
      })
    }

    
    if (daycare.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'This daycare is temporarily unavailable'
      })
    }

    // Check overlapping confirmed enrollments
    const overlappingEnrollments = await Enrollment.find({
      daycare: oldEnrollment.daycare,

      enrollmentStatus: ENROLLMENT_STATUS.CONFIRMED,

      // Don't count the old enrollment
      _id: {
        $ne: oldEnrollment._id
      },

      // Overlap condition
      startDate: {
        $lte: end
      },

      endDate: {
        $gte: start
      }
    })


    const bookedSeats = overlappingEnrollments.length

    
    const availableSeats =
      daycare.seatCapacity - bookedSeats

    console.log('RENEWAL AVAILABILITY:', {
      daycare: daycare.name,
      startDate: start,
      endDate: end,
      capacity: daycare.seatCapacity,
      bookedSeats,
      availableSeats
    })

    
    if (availableSeats <= 0) {
      return res.status(400).json({
        success: false,
        message: 'No seats available for the selected renewal dates',
        availability: {
          capacity: daycare.seatCapacity,
          bookedSeats,
          availableSeats: 0
        }
      })
    }

    //  Create renewal enrollment
    const newEnrollment = await Enrollment.create({
      child: oldEnrollment.child,
      parent: oldEnrollment.parent,
      daycare: oldEnrollment.daycare,
      ageGroup: oldEnrollment.ageGroup,

      package: packageType,
      amount,

      startDate: start,
      endDate: end,

      enrollmentStatus: ENROLLMENT_STATUS.APPROVED,
      paymentStatus: 'pending',

      assignedStaff: null,
      isRenewal: true
    })

    
    res.status(201).json({
      success: true,
      message: 'Renewal created successfully',

      data: newEnrollment,

      availability: {
        capacity: daycare.seatCapacity,
        bookedSeats,
        availableSeats
      }
    })

  } catch (error) {

    console.error('RENEW ENROLLMENT ERROR:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const checkEnrollmentAvailability = async (req, res) => {
  try {
    const { daycareId, startDate, endDate } = req.query

  
    if (!daycareId || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'Daycare, start date and end date are required'
      })
    }

    
    const requestedStartDate = new Date(startDate)
    const requestedEndDate = new Date(endDate)

    
    if (
      isNaN(requestedStartDate.getTime()) ||
      isNaN(requestedEndDate.getTime())
    ) {
      return res.status(400).json({
        success: false,
        message: 'Invalid date format'
      })
    }

    if (requestedEndDate < requestedStartDate) {
      return res.status(400).json({
        success: false,
        message: 'End date cannot be before start date'
      })
    }

    
    const daycare = await Daycare.findById(daycareId)

    if (!daycare) {
      return res.status(404).json({
        success: false,
        message: 'Daycare not found'
      })
    }

    //  Check overlapping confirmed enrollments
    const bookedSeats = await Enrollment.countDocuments({
      daycare: daycareId,
      enrollmentStatus: ENROLLMENT_STATUS.CONFIRMED,
      startDate: { $lte: requestedEndDate },
      endDate: { $gte: requestedStartDate }
    })

    // Calculate available seats
    const availableSeats = Math.max(
      0,
      daycare.seatCapacity - bookedSeats
    )

    
    return res.status(200).json({
      success: true,
      seatCapacity: daycare.seatCapacity,
      bookedSeats,
      availableSeats,
      isAvailable: availableSeats > 0,
      message:
        availableSeats > 0
          ? `${availableSeats} seat(s) available for the selected dates`
          : 'No seats available for the selected dates'
    })

  } catch (error) {
    console.error('Check availability error:', error)

    return res.status(500).json({
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
  getMyAssignedStaff,
  renewEnrollment,
  checkEnrollmentAvailability
}