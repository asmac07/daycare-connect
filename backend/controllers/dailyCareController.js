const Enrollment = require('../models/Enrollment')
const DailyCareUpdate = require('../models/DailyCareUpdate')
const { ENROLLMENT_STATUS } = require('../constants')

const getDailyCareChildren = async (req, res) => {
  try {
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    console.log('TODAY:', today)

const allAssigned = await Enrollment.find({
  assignedStaff: req.user.id
})

console.log(
  'ALL ASSIGNED ENROLLMENTS:',
  allAssigned.map((enrollment) => ({
    id: enrollment._id,
    child: enrollment.child,
    status: enrollment.enrollmentStatus,
    startDate: enrollment.startDate,
    endDate: enrollment.endDate,
    assignedStaff: enrollment.assignedStaff
  }))
)

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
    const today = new Date()

    today.setHours(0, 0, 0, 0)

    const enrollments = await Enrollment.find({
      parent: req.user.id
    })
      .populate('child', 'name dateOfBirth gender')
      .populate('assignedStaff', 'name designation')
      .populate('daycare', 'name')
      .sort({ createdAt: -1 })

    const enrollmentIds = enrollments.map(
      (enrollment) => enrollment._id
    )

    const updates = await DailyCareUpdate.find({
      enrollment: { $in: enrollmentIds }
    })
      .populate('child', 'name dateOfBirth gender')
      .populate('staff', 'name designation')
      .populate('daycare', 'name')
      .populate(
        'enrollment',
        'enrollmentStatus startDate endDate'
      )
      .sort({ date: -1 })

    // Latest daily update for each enrollment
    const latestUpdateByEnrollment = new Map()

    updates.forEach((update) => {
      const enrollmentId = update.enrollment?._id?.toString()

      if (!enrollmentId) return

      if (
        !latestUpdateByEnrollment.has(enrollmentId) ||
        new Date(update.date) >
          new Date(
            latestUpdateByEnrollment.get(enrollmentId).date
          )
      ) {
        latestUpdateByEnrollment.set(enrollmentId, update)
      }
    })

    // Group enrollments by child
    const enrollmentsByChild = new Map()

    enrollments.forEach((enrollment) => {
      const childId = enrollment.child?._id?.toString()

      if (!childId) return

      if (!enrollmentsByChild.has(childId)) {
        enrollmentsByChild.set(childId, [])
      }

      enrollmentsByChild.get(childId).push(enrollment)
    })

    const data = []

    enrollmentsByChild.forEach((childEnrollments) => {
      // Find currently active enrollment
      const activeEnrollment = childEnrollments.find(
        (enrollment) => {
          if (
            enrollment.enrollmentStatus !== 'confirmed' ||
            !enrollment.startDate ||
            !enrollment.endDate
          ) {
            return false
          }

          const startDate = new Date(enrollment.startDate)
          const endDate = new Date(enrollment.endDate)

          startDate.setHours(0, 0, 0, 0)
          endDate.setHours(0, 0, 0, 0)

          return today >= startDate && today <= endDate
        }
      )

      // Active enrollment gets priority
      const selectedEnrollment =
        activeEnrollment || childEnrollments[0]

      if (!selectedEnrollment) return

      const enrollmentId =
        selectedEnrollment._id.toString()

      const latestUpdate =
        latestUpdateByEnrollment.get(enrollmentId)

      // If active enrollment has no daily update yet,
      // still return the child with dailyCareUpdate = null
      if (latestUpdate) {
        data.push(latestUpdate)
      } else {
        data.push({
          _id: `enrollment-${enrollmentId}`,
          child: selectedEnrollment.child,
          daycare: selectedEnrollment.daycare,
          staff: selectedEnrollment.assignedStaff,
          enrollment: {
            _id: selectedEnrollment._id,
            enrollmentStatus:
              selectedEnrollment.enrollmentStatus,
            startDate: selectedEnrollment.startDate,
            endDate: selectedEnrollment.endDate
          },
          date: null,
          attendance: null,
          breakfast: null,
          lunch: null,
          nap: null,
          activity: null
        })
      }
    })

    res.status(200).json({
      success: true,
      data
    })

  } catch (error) {
    console.log(
      'GET PARENT DAILY CARE UPDATES ERROR:',
      error
    )

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