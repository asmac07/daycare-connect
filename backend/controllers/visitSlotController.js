
const VisitSlot = require('../models/VisitSlot')
const Daycare = require('../models/Daycare')
const sendEmail = require('../utils/sendEmail')
const User = require('../models/User')
const Child = require('../models/Child')
const mongoose = require('mongoose')
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
                    .sort({ updatedAt: -1 })
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

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const slots = await VisitSlot.find({
      daycare: daycareId,
      status: VISIT_SLOT_STATUS.AVAILABLE,
      date: { $gte: today }
    }).sort({
      date: 1,
      startTime: 1
    })

    res.status(200).json({
      success: true,
      data: slots
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
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
                 bookedAt: new Date(),
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
        status: {
          $in: [
            VISIT_SLOT_STATUS.BOOKED,
            VISIT_SLOT_STATUS.RESCHEDULE_REQUESTED
          ]
        }
      })
      .populate('daycare', 'name address')
      .populate('bookedBy', 'name email')
      .sort({ updatedAt:-1 })

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
        .sort({ bookedAt: -1})
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

const requestReschedule = async (req, res) => {
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
      status: VISIT_SLOT_STATUS.BOOKED
    })
      .populate('bookedBy', 'name email')
      .populate('child', 'name dateOfBirth gender')

    if (!slot) {
      return res.status(404).json({
        success: false,
        message: 'Booked visit slot not found'
      })
    }

    // Change booking status
    slot.status = VISIT_SLOT_STATUS.RESCHEDULE_REQUESTED

    await slot.save()

    // Notify parent
    await sendEmail(
      slot.bookedBy.email,
      'Visit Reschedule Request - DayCare Connect',
      `
        <h2>Visit Reschedule Request</h2>

        <p>Hello ${slot.bookedBy.name},</p>

        <p>
          The daycare has requested you to reschedule your visit.
        </p>

        <p>
          Please log in and select another available slot.
        </p>

        <p>
          <strong>Current Date:</strong>
          ${new Date(slot.date).toDateString()}
        </p>

        <p>
          <strong>Current Time:</strong>
          ${slot.startTime} - ${slot.endTime}
        </p>

        <p>
          <strong>Child:</strong>
          ${slot.child?.name || 'Not available'}
        </p>
      `
    )

    return res.status(200).json({
      success: true,
      message: 'Reschedule request sent to parent',
      data: slot
    })

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const rescheduleToNewSlot = async (req, res) => {
  const session = await mongoose.startSession()

  try {
    const { newSlotId } = req.body
    const oldSlotId = req.params.id

    // 1. Check new slot ID
    if (!newSlotId) {
      return res.status(400).json({
        success: false,
        message: 'New slot is required'
      })
    }

    // 2. Prevent selecting the same slot
    if (oldSlotId === newSlotId) {
      return res.status(400).json({
        success: false,
        message: 'Please select a different slot'
      })
    }

    // 3. Start transaction
    session.startTransaction()

    // 4. Find the old booking
    const oldSlot = await VisitSlot.findOne({
      _id: oldSlotId,
      bookedBy: req.user.id,
      status: VISIT_SLOT_STATUS.RESCHEDULE_REQUESTED
    }).session(session)

    if (!oldSlot) {
      await session.abortTransaction()

      return res.status(404).json({
        success: false,
        message: 'Reschedule request not found'
      })
    }

    // 5. Find the new slot
    const newSlot = await VisitSlot.findOne({
      _id: newSlotId,
      daycare: oldSlot.daycare,
      status: VISIT_SLOT_STATUS.AVAILABLE
    }).session(session)

    if (!newSlot) {
      await session.abortTransaction()

      return res.status(400).json({
        success: false,
        message: 'Selected slot is no longer available'
      })
    }

    // 6. Save Parent and Child IDs
    const parentId = oldSlot.bookedBy
    const childId = oldSlot.child

    // 7. mark old slot as rescheduled
    oldSlot.status = VISIT_SLOT_STATUS.AVAILABLE
    oldSlot.bookedBy = null
    oldSlot.child = null
    oldSlot.bookedAt = null
    await oldSlot.save({ session })

    // 8. Book new slot
    newSlot.status = VISIT_SLOT_STATUS.BOOKED
    newSlot.bookedBy = parentId
    newSlot.child = childId
    newSlot.bookedAt = new Date()
    
    await newSlot.save({ session })

    // 9. Commit transaction
    await session.commitTransaction()

    return res.status(200).json({
      success: true,
      message: 'Visit rescheduled successfully',
      data: newSlot
    })

  } catch (error) {

    await session.abortTransaction()

    return res.status(500).json({
      success: false,
      message: error.message
    })

  } finally {

    session.endSession()
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
    getMyBookings ,requestReschedule ,
    rescheduleToNewSlot, cancelBookingByOwner,
    markVisitCompleted}