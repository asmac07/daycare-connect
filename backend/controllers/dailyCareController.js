const Enrollment = require('../models/Enrollment')
const DailyCareUpdate = require('../models/DailyCareUpdate')
const { ENROLLMENT_STATUS } = require('../constants')

const getDailyCareChildren = async (req, res) => {
  try {
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    const enrollments = await Enrollment.find({
      assignedStaff: req.user.id,
      enrollmentStatus: ENROLLMENT_STATUS.CONFIRMED,
      startDate: {
        $lte: today
      },
      endDate: {
        $gte: today
      }
    })
      .populate('child', 'name dateOfBirth gender medicalNotes')
      .populate('parent', 'name email phone')
      .populate('daycare', 'name address')

    const enrollmentIds = enrollments.map(
      (enrollment) => enrollment._id
    )

    const updates = await DailyCareUpdate.find({
      enrollment: { $in: enrollmentIds },
      date: today
    })

    const updateMap = new Map(
      updates.map((update) => [
        update.enrollment.toString(),
        update
      ])
    )

    const data = enrollments.map((enrollment) => ({
      ...enrollment.toObject(),
      dailyCareUpdate:
        updateMap.get(enrollment._id.toString()) || null
    }))

    res.status(200).json({
      success: true,
      data
    })

  } catch (error) {
    console.log('GET DAILY CARE CHILDREN ERROR:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const saveDailyCareUpdate = async (req, res) => {
  try {
    const {
      enrollmentId,
      attendance,
      breakfast,
      lunch,
      nap,
      activity
    } = req.body

    if (!enrollmentId) {
      return res.status(400).json({
        success: false,
        message: 'Enrollment ID is required'
      })
    }

    const enrollment = await Enrollment.findOne({
      _id: enrollmentId,
      assignedStaff: req.user.id,
      enrollmentStatus: ENROLLMENT_STATUS.CONFIRMED
    })

    if (!enrollment) {
      return res.status(404).json({
        success: false,
        message: 'Active enrollment not found'
      })
    }

    const today = new Date()

    today.setHours(0, 0, 0, 0)

    const enrollmentStartDate = new Date(enrollment.startDate)
    enrollmentStartDate.setHours(0, 0, 0, 0)

    const enrollmentEndDate = new Date(enrollment.endDate)
    enrollmentEndDate.setHours(0, 0, 0, 0)

    if (
      today < enrollmentStartDate ||
      today > enrollmentEndDate
    ) {
      return res.status(400).json({
        success: false,
        message: 'This enrollment is not active today'
      })
    }

    const existingUpdate = await DailyCareUpdate.findOne({
      child: enrollment.child,
      enrollment: enrollment._id,
      date: today
    })

    if (existingUpdate) {
      existingUpdate.attendance = attendance
      existingUpdate.breakfast = breakfast
      existingUpdate.lunch = lunch
      existingUpdate.nap = nap
      existingUpdate.activity = activity

      await existingUpdate.save()

      return res.status(200).json({
        success: true,
        message: 'Daily care update updated successfully',
        data: existingUpdate
      })
    }

    const dailyCareUpdate = await DailyCareUpdate.create({
      child: enrollment.child,
      enrollment: enrollment._id,
      daycare: enrollment.daycare,
      staff: req.user.id,
      date: today,
      attendance,
      breakfast,
      lunch,
      nap,
      activity
    })

    res.status(201).json({
      success: true,
      message: 'Daily care update saved successfully',
      data: dailyCareUpdate
    })

  } catch (error) {
    console.log('SAVE DAILY CARE UPDATE ERROR:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const getParentDailyCareUpdates = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({
      parent: req.user.id
    }).select('_id')

    const enrollmentIds = enrollments.map(
      (enrollment) => enrollment._id
    )

    const updates = await DailyCareUpdate.find({
      enrollment: { $in: enrollmentIds }
    })
      .populate('child', 'name dateOfBirth gender')
      .populate('staff', 'name designation')
      .populate('daycare', 'name')
      .populate('enrollment', 'enrollmentStatus startDate endDate')
      .sort({ date: -1 })

    res.status(200).json({
      success: true,
      data: updates
    })

  } catch (error) {
    console.log('GET PARENT DAILY CARE UPDATES ERROR:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = {
  getDailyCareChildren,
  saveDailyCareUpdate,
  getParentDailyCareUpdates
}