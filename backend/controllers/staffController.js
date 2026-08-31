
const User = require('../models/User')
const Daycare = require('../models/Daycare')
const Enrollment = require('../models/Enrollment')
const { ENROLLMENT_STATUS } = require('../constants')

const bcrypt = require('bcryptjs')
const sendEmail = require('../utils/sendEmail')

const createStaff = async (req, res) => {
  try {
    const { name, email, password , designation} = req.body

    if (!name || !email || !password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and a password (6+ chars) are required'
      })
    }

    const daycare = await Daycare.findOne({ owner: req.user.id })

    if (!daycare) {
      return res.status(400).json({
        success: false,
        message: 'Create your daycare before adding staff'
      })
    }

    const existingUser = await User.findOne({ email })

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const staff = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'staff',
      status: 'active',
      isVerified: true, 
      daycare: daycare._id,
      designation
    })

     await sendEmail(
      email,
      'Welcome to DayCare Connect!',
      `<p>Hi ${name},</p>
       <p>You've been added as a staff member for "<strong>${daycare.name}</strong>".</p>
       <p>You can log in using this email and the temporary password provided by your daycare owner.</p>
       <p><a href="http://localhost:5173/login">Login here</a></p>`
    )

    res.status(201).json({
      success: true,
      message: 'Staff account created successfully',
      data: staff
    })

  } catch (error) {
    res.status(500).json({
       success: false,
        message: error.message
       })
  }
}

const getMyStaff = async (req, res) => {
  try {
    const daycare = await Daycare.findOne({ owner: req.user.id })

    if (!daycare) {
      return res.status(404).json({ success: false, message: 'Daycare not found' })
    }

    const staffList = await User.find({ daycare: daycare._id, role: 'staff' }).select('-password')

    res.status(200).json({ success: true, data: staffList })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getStaffDaycare = async (req, res) => {
  try {
    const daycare = await Daycare.findById(req.user.daycare)

    if (!daycare) {
      return res.status(404).json({ success: false, message: 'No daycare assigned' })
    }

    if (daycare.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'This daycare is temporarily blocked'
      })
    }

    res.status(200).json({
       success: true, 
       data: daycare 
      })

  } catch (error) {
    res.status(500).json({
       success: false, 
       message: error.message
       })
  }
}

const updateStaff = async (req, res) => {
  try {
    const { name, email, designation } = req.body

    const staff = await User.findOne({
      _id: req.params.id,
      role: 'staff'
    })

    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff not found'
      })
    }

    //if the staff.name is undefined , the old value remains
    staff.name = name || staff.name 
    staff.email = email || staff.email
    staff.designation = designation || staff.designation

    await staff.save()

    res.status(200).json({
      success: true,
      message: 'Staff updated successfully',
      data: staff
    })

  } 
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const toggleStaffStatus = async (req, res) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' })

    if (!staff) {
      return res.status(404).json({ success: false, message: 'Staff not found' })
    }

    staff.isBlocked = !staff.isBlocked
    await staff.save()

    res.status(200).json({
      success: true,
      message: `Staff ${staff.isBlocked ? 'deactivated' : 'activated'} successfully`,
      data: staff
    })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getAssignedChildren = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      assignedStaff: req.user.id,
      enrollmentStatus: ENROLLMENT_STATUS.CONFIRMED
    })
      .populate('child', 'name dateOfBirth gender medicalNotes')
      .populate('parent', 'name email phone')
      .populate('daycare', 'name address')

    const children = enrollments.map((enrollment) => ({
      enrollmentId: enrollment._id,
      child: enrollment.child,
      parent: enrollment.parent,
      daycare: enrollment.daycare
    }))

    res.status(200).json({
      success: true,
      data: children
    })

  } catch (error) {
    console.log('GET ASSIGNED CHILDREN ERROR:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = { createStaff,
   getMyStaff,
    getStaffDaycare, 
    updateStaff,
    toggleStaffStatus,
   getAssignedChildren
   }