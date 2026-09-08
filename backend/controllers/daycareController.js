
const Daycare = require('../models/Daycare')
const { DAYCARE_STATUS } = require('../constants')
const Enrollment = require('../models/Enrollment')
const { ENROLLMENT_STATUS } = require('../constants')

const createDaycare = async (req, res) => {
  try {
        const { name, address, location, seatCapacity, facilities } = req.body

        if (!name || name.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Daycare name is required'
          })
        }

        if (!address || address.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Address is required'
          })
        }

        if (!seatCapacity || seatCapacity <= 0) {
          return res.status(400).json({
            success: false,
            message: 'Seat capacity must be a positive number'
          })
        }

        if (
          !location ||
          !Array.isArray(location.coordinates) ||
          location.coordinates.length !== 2
        ) {
          return res.status(400).json({
            success: false,
            message: 'Valid location coordinates are required'
          })
        }

        const dayCare = await Daycare.create({
          name,
          owner: req.user.id,
          address,
          location,
          seatCapacity,
          seatsAvailable: seatCapacity,
          facilities
        })

        res.status(201).json({
          success: true,
          message: 'Daycare registered successfully',
          data: dayCare
        })

      } catch (error) {
        res.status(500).json({ message: error.message })
      }
}


const getMyDaycare = async (req, res) => {
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

    const confirmedEnrollments = await Enrollment.countDocuments({
      daycare: daycare._id,
      enrollmentStatus: ENROLLMENT_STATUS.CONFIRMED
    })

    const availableSeats = Math.max(
      0,
      daycare.seatCapacity - confirmedEnrollments
    )

    res.status(200).json({
      success: true,
      data: {
        ...daycare.toObject(),
        occupiedSeats: confirmedEnrollments,
        availableSeats
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const updateDaycare = async (req, res) => {
  try {
    const {
      name,
      address,
      location,
      seatCapacity,
      facilities
    } = req.body

    const daycare = await Daycare.findOne({
      owner: req.user.id
    })

    if (!daycare) {
      return res.status(404).json({
        success: false,
        message: 'Daycare not found'
      })
    }

    if (seatCapacity !== undefined) {
      const newCapacity = Number(seatCapacity)

      if (isNaN(newCapacity) || newCapacity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Seat capacity must be a positive number'
        })
      }

      const confirmedEnrollments = await Enrollment.countDocuments({
        daycare: daycare._id,
        enrollmentStatus: ENROLLMENT_STATUS.CONFIRMED
      })

      if (newCapacity < confirmedEnrollments) {
        return res.status(400).json({
          success: false,
          message: `Seat capacity cannot be less than currently occupied seats (${confirmedEnrollments})`
        })
      }

      daycare.seatCapacity = newCapacity
    }

    if (name !== undefined) {
      daycare.name = name
    }

    if (address !== undefined) {
      daycare.address = address
    }

    if (location !== undefined) {
      daycare.location = location
    }

    if (facilities !== undefined) {
      daycare.facilities = facilities
    }

    await daycare.save()

    const confirmedEnrollments = await Enrollment.countDocuments({
      daycare: daycare._id,
      enrollmentStatus: ENROLLMENT_STATUS.CONFIRMED
    })

    const availableSeats = Math.max(
      0,
      daycare.seatCapacity - confirmedEnrollments
    )

    res.status(200).json({
      success: true,
      message: 'Daycare updated successfully',
      data: {
        ...daycare.toObject(),
        occupiedSeats: confirmedEnrollments,
        availableSeats
      }
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const searchNearbyDaycare = async (req, res) => {
  try {
    const {
      lng,
      lat,
      page = 1,
      limit = 5,
      minRating
    } = req.query

    const pageNumber = Number(page)
    const limitNumber = Number(limit)

    const skip = (pageNumber - 1) * limitNumber

    const filter = {
      verificationStatus: DAYCARE_STATUS.APPROVED,
      isBlocked: false,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [Number(lng), Number(lat)]
          }
        }
      }
    }

    if (minRating) {
      filter.averageRating = {
        $gte: Number(minRating)
      }
    }

    const daycares = await Daycare.find(filter)
      .skip(skip)
      .limit(limitNumber)

    const total = await Daycare.countDocuments({
      verificationStatus: DAYCARE_STATUS.APPROVED,
      isBlocked: false,
      ...(minRating && {
        averageRating: {
          $gte: Number(minRating)
        }
      })
    })

    res.status(200).json({
      success: true,
      count: daycares.length,
      total,
      page: pageNumber,
      limit: limitNumber,
      totalPages: Math.ceil(total / limitNumber),
      data: daycares
    })

  } catch (error) {
    console.error(error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


const getApprovedDaycares = async (req, res) => {
  try {
    const daycares = await Daycare.find({
      verificationStatus: DAYCARE_STATUS.APPROVED
    }).select('name');

    res.status(200).json({
      success: true,
      data: daycares
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = { createDaycare ,
                    getMyDaycare ,
                    updateDaycare,
                    searchNearbyDaycare, getApprovedDaycares
                 } 