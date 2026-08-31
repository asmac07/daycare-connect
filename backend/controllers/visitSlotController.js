
const VisitSlot = require('../models/VisitSlot')
const Daycare = require('../models/Daycare')
const sendEmail = require('../utils/sendEmail')
const User = require('../models/User')
const Child = require('../models/Child')
const { VISIT_SLOT_STATUS } = require('../constants')



const createSlot = async (req, res) => {

  try {

        const { date, startTime, endTime } = req.body

        if (!date || !startTime || !endTime) {
          return res.status(400).json({
            success: false,
            message: 'Date, start time, and end time are required'
          })
        }

        const daycare = await Daycare.findOne({ owner: req.user.id })

        if (!daycare) {
          return res.status(404).json({ 
            success: false,
             message: 'Daycare not found' })
        }
          const existingSlots = await VisitSlot.find({
            daycare: daycare._id,
            date
          })

      for (const slot of existingSlots) { //comparing each slot with existing slot

          const isOverlapping =
                startTime < slot.endTime &&
                endTime > slot.startTime

          if (isOverlapping) {
            return res.status(400).json({
              success: false,
              message: 'A visit slot already exists during this time.'
            })
          }
        }
        const slot = await VisitSlot.create({
          daycare: daycare._id,
          date,
          startTime,
          endTime
        })

        res.status(201).json({
          success: true,
          message: 'Visit slot created successfully',
          data: slot
        })

      }
   catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getMySlots = async (req, res) => {
  try {
    const daycare = await Daycare.findOne({ owner: req.user.id })

    if (!daycare) {
      return res.status(404).json({ success: false, message: 'Daycare not found' })
    }

    const slots = await VisitSlot.find({ daycare: daycare._id })
                    .populate('bookedBy', 'name email')
                    .populate('child', 'name dateOfBirth')

    res.status(200).json({
       success: true,
        data: slots })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getAvailableSlots = async (req, res) => {
  try {
    const { daycareId } = req.params

    const slots = await VisitSlot.find({
      daycare: daycareId,
      status: VISIT_SLOT_STATUS.AVAILABLE
    })

    res.status(200).json({ success: true, data: slots })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const bookSlot = async (req, res) => {
  try {

    const { childId } = req.body

       if (!childId) {
          return res.status(400).json({
            success: false,
            message: 'Child is required for booking'
          })
        }

        const child = await Child.findOne({
        _id: childId,
        parent: req.user.id
      })

      if (!child) {
        return res.status(404).json({
          success: false,
          message: 'Child not found'
        })
      }

    const slot = await VisitSlot.findOneAndUpdate(
              { _id: req.params.id,
               status: VISIT_SLOT_STATUS.AVAILABLE 
              },
              { 
                status: VISIT_SLOT_STATUS.BOOKED ,
                 bookedBy: req.user.id ,
                 child : childId
              },
              { 
                new: true
             }
            )

    if (!slot) {
      return res.status(400).json({
        success: false,
        message: 'This slot is no longer available'
      })
    }

    res.status(200).json({
      success: true,
      message: 'Visit slot booked successfully',
      data: slot
    })

  } 
  catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getMyBookings = async (req, res) => {
  try {
    const bookings = await VisitSlot.find({
      bookedBy: req.user.id,
      status: VISIT_SLOT_STATUS.BOOKED
    })
      .populate('daycare', 'name address')
      .populate('bookedBy', 'name email')

    res.status(200).json({
      success: true,
      data: bookings
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const cancelBooking = async (req, res) => {
  try {
    const slot = await VisitSlot.findOneAndUpdate(
      { _id: req.params.id, bookedBy: req.user.id },
      { status: VISIT_SLOT_STATUS.AVAILABLE , bookedBy: null },
      { new: true }
    )

    if (!slot) {
      return res.status(404).json({ success: false, message: 'Booking not found' })
    }

    const parent = await User.findById(req.user.id)

        await sendEmail(
        parent.email,
        'Visit Slot Cancelled',
        `
        <h2>Booking Cancelled</h2>

        <p>Hello ${parent.name},</p>

        <p>Your visit slot has been cancelled successfully.</p>

        <p><strong>Date:</strong> ${slot.date.toDateString()}</p>
        <p><strong>Time:</strong> ${slot.startTime} - ${slot.endTime}</p>

        <p>You can book another slot anytime.</p>
        `
        )
        
    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: slot
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const getVisitSlotDetails = async (req, res) => {
  try {

      const slot = await VisitSlot.findById(req.params.id)
        .populate('bookedBy', 'name email')
        .populate('child', 'name dateOfBirth')

      if (!slot) {
        return res.status(404).json({
          success: false,
          message: 'Visit slot not found'
        })
      }

      res.status(200).json({
        success: true,
        data: slot
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
}

const rescheduleBooking = async (req, res) => {
  try {
    const { date, startTime, endTime } = req.body

    if (!date || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Date, start time and end time are required'
      })
    }

    const daycare = await Daycare.findOne({
      owner: req.user.id
    })

    if (!daycare) {
      return res.status(404).json({
        success: false,
        message: 'Daycare not found'
      })
    }

    const slot = await VisitSlot.findOne({
      _id: req.params.id,
      daycare: daycare._id,
      status: 'booked'
    })
      .populate('bookedBy', 'name email')
      .populate('child', 'name dateOfBirth gender')

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Booked visit slot not found'
      })
    }

    slot.date = date
    slot.startTime = startTime
    slot.endTime = endTime

    await slot.save()

    await sendEmail(
      slot.bookedBy.email,
      'Visit Rescheduled - DayCare Connect',
      `
        <h2>Visit Rescheduled</h2>

        <p>Hello ${slot.bookedBy.name},</p>

        <p>Your daycare visit has been rescheduled.</p>

        <p>
          <strong>New Date:</strong>
          ${new Date(date).toDateString()}
        </p>

        <p>
          <strong>New Time:</strong>
          ${startTime} - ${endTime}
        </p>

        <p>
          <strong>Child:</strong>
          ${slot.child?.name || 'Not available'}
        </p>

        <p>Please make sure to attend at the new scheduled time.</p>
      `
    )

    res.status(200).json({
      success: true,
      message: 'Visit rescheduled successfully',
      data: slot
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const cancelBookingByOwner = async (req, res) => {
  try {

    const daycare = await Daycare.findOne({
      owner: req.user.id
    })

    if (!daycare) {
      return res.status(404).json({
        success: false,
        message: 'Daycare not found'
      })
    }

    const slot = await VisitSlot.findOne({
      _id: req.params.id,
      daycare: daycare._id,
      status: 'booked'
    })
      .populate('bookedBy', 'name email')
      .populate('child', 'name')

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Booked visit not found'
      })
    }

    slot.status = 'cancelled'

    await slot.save()

    await sendEmail(
      slot.bookedBy.email,
      'Visit Cancelled - DayCare Connect',
      `
        <h2>Visit Cancelled</h2>

        <p>Hello ${slot.bookedBy.name},</p>

        <p>
          Your daycare visit has been cancelled by the daycare.
        </p>

        <p>
          <strong>Child:</strong>
          ${slot.child?.name || 'Not available'}
        </p>

        <p>
          <strong>Date:</strong>
          ${new Date(slot.date).toDateString()}
        </p>

        <p>
          <strong>Time:</strong>
          ${slot.startTime} - ${slot.endTime}
        </p>
      `
    )

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully',
      data: slot
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const markVisitCompleted = async (req, res) => {
  try {

        const slot = await VisitSlot.findById(req.params.id)
          .populate('bookedBy', 'name email')
          .populate('child', 'name dateOfBirth gender')

        if (!slot) {
          return res.status(404).json({
            success: false,
            message: 'Visit slot not found'
          })
        }

        // Only booked visits can completed
        if (slot.status !== VISIT_SLOT_STATUS.BOOKED) {
          return res.status(400).json({
            success: false,
            message: 'Only booked visits can be marked as completed'
          })
        }

        // alrdy a loggedin owner
        const daycare = await Daycare.findOne({
          _id: slot.daycare,
          owner: req.user.id
        })

        if (!daycare) {
          return res.status(403).json({
            success: false,
            message: 'You are not authorized to complete this visit'
          })
        }

         if (!slot.bookedBy) {
          return res.status(400).json({
            success: false,
            message: 'This visit has no parent booking'
          })
        }

        const visitDate = new Date(slot.date)

        const [hours, minutes] = slot.endTime
          .split(':')
          .map(Number)

        visitDate.setHours(hours, minutes, 0, 0)

        const now = new Date()

        // Cannot complete before visit ends
        if (now < visitDate) {
          return res.status(400).json({
            success: false,
            message: 'This visit has not been completed yet'
          })
        }

        slot.status = VISIT_SLOT_STATUS.COMPLETED

        await slot.save()

        res.status(200).json({
          success: true,
          message: 'Visit marked as completed successfully',
          data: slot
        })

      } catch (error) {

        console.log('Mark visit completed error:', error)

        res.status(500).json({
          success: false,
          message: error.message
        })
      }
  }
module.exports = { createSlot, getMySlots, getAvailableSlots,
   bookSlot, cancelBooking , getVisitSlotDetails ,
    getMyBookings ,rescheduleBooking , cancelBookingByOwner,
    markVisitCompleted}