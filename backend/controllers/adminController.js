
const User = require('../models/User')
const Daycare = require('../models/Daycare')
const sendEmail = require('../utils/sendEmail')

const { DAYCARE_STATUS } = require('../constants')


const getAllUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 5,
      search = '',
      role
    } = req.query

    const skip = (Number(page) - 1) * Number(limit)
    // this is an object for mongodb, to  store the search condition
    const filter = {}

    // Search by name or email
    if (search.trim()) {
      filter.$or = [
        {
          name: {  $regex: search.trim(),  $options: 'i' }
        },
        {
          email: { $regex: search.trim(),  $options: 'i' }
        }
      ]
    }

    // Optional role filter
    if (role) {
      filter.role = role
    } else{
      filter.role = {$ne : 'admin'}
    }

    const total = await User.countDocuments(filter)

    const users = await User.find(filter)
      .select('-password -refreshToken -otp -resetPasswordToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))

    res.status(200).json({
      success: true,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
      data: users
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


const blockUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.role === 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin account cannot be blocked'
        })
      }

    user.isBlocked = true

    await user.save()

    res.status(200).json({
      success: true,
      message: 'User blocked successfully',
      data: user
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const unblockUser = async (req, res) => {
  try {

    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    user.isBlocked = false

    await user.save()

    res.status(200).json({
      success: true,
      message: 'User unblocked successfully',
      data: user
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}



const getPendingDaycares = async (req, res) => {
  try {
    const daycares = await Daycare.find({ verificationStatus: DAYCARE_STATUS.PENDING })
    res.status(200).json({ success: true, count: daycares.length, data: daycares })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const approveDaycare = async (req, res) => {
  try {
    const daycare = await Daycare.findById(req.params.id).populate('owner','name email')

    if (!daycare) {
      return res.status(404).json({ success: false, message: 'Daycare not found' })
    }

      daycare.verificationStatus = DAYCARE_STATUS.APPROVED
    await daycare.save()

    await sendEmail(
      daycare.owner.email,
      'Your Daycare Has Been Approved!',
      `<p>Hi ${daycare.owner.name},</p>
       <p>Great news — your daycare "<strong>${daycare.name}</strong>" has been approved and is now visible to parents searching nearby.</p>`
    )

    res.status(200).json({ success: true, message: 'Daycare approved successfully', data: daycare })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const rejectDaycare = async (req, res) => {
  try {

    const { reason } = req.body

    if (!reason || reason.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        })
    }

    const daycare = await Daycare.findById(req.params.id).populate('owner','name email')

    if (!daycare) {
      return res.status(404).json({ success: false, message: 'Daycare not found' })
    }

   

    if (daycare.verificationStatus !== DAYCARE_STATUS.PENDING) {
      return res.status(400).json({
        success: false,
        message: 'Only pending daycares can be rejected'
      })
    }

    daycare.verificationStatus = DAYCARE_STATUS.REJECTED
    daycare.reason= reason
    await daycare.save()

     await sendEmail(
      daycare.owner.email,
      'Update on Your Daycare Application',
      `<p>Hi ${daycare.owner.name},</p>
       <p>Unfortunately, your daycare "<strong>${daycare.name}</strong>" application was not approved at this time.</p>
       <p><strong>Reason:</strong></p>

        <p>${reason}</p>

        <p>Please update your daycare information and submit it again.</p>
       `
    )
    
    res.status(200).json({ success: true, message: 'Daycare rejected successfully', data: daycare })
  }
   catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const blockDaycare = async (req, res) => {
  try {
    const daycare = await Daycare.findById(req.params.id)

    if (!daycare) {
      return res.status(404).json({ success: false, message: 'Daycare not found' })
    }

    daycare.isBlocked = true
    await daycare.save()

    res.status(200).json({ success: true, message: 'Daycare blocked successfully', data: daycare })
  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const unblockDaycare = async (req, res) => {
  try {

    const daycare = await Daycare.findById(req.params.id)

    if (!daycare) {
      return res.status(404).json({
        success: false,
        message: 'Daycare not found'
      })
    }

    daycare.isBlocked = false
    await daycare.save()

    res.status(200).json({
      success: true,
      message: 'Daycare unblocked successfully',
      data: daycare
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const getAllDaycares = async (req, res) => {
  try {
    const { page=1 , limit =5} = req.query

    const skip = (Number(page) - 1) * Number(limit)
    
    const total = await Daycare.countDocuments()

    const daycares = await Daycare.find()
                      .skip(skip)
                      .limit(Number(limit))

    res.status(200).json({
             success: true,
             page: Number(page),
            limit: Number(limit),
             total,
              data: daycares 
            })
  }
   catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const suspendDaycare = async (req, res) => {
  try {

    const daycare = await Daycare.findById(req.params.id)

    if (!daycare) {
      return res.status(404).json({
        success: false,
        message: 'Daycare not found'
      })
    }

    daycare.verificationStatus = DAYCARE_STATUS.SUSPENDED

    await daycare.save()

    res.status(200).json({
      success: true,
      message: 'Daycare suspended successfully',
      data: daycare
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = { 
                    // getPendingUsers,
                    // approveUser,
                    // rejectUser,
                    getAllUsers,
                    blockUser,
                    unblockUser,
                    getPendingDaycares,
                    approveDaycare,
                    rejectDaycare,
                    blockDaycare ,
                    unblockDaycare, 
                    getAllDaycares,
                    suspendDaycare
                }
