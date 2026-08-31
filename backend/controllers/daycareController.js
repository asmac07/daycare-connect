
const Daycare = require('../models/Daycare')
const { DAYCARE_STATUS } = require('../constants')

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

    const daycare = await Daycare.findOne( {owner: req.user.id } )

    if (!daycare) {

      return res.status(404).json({
        success: false,
        message: 'Daycare not found'
      })
    }

    res.status(200).json({
      success: true,
      data: daycare
    })

  }
   catch (error) {

    res.status(500).json({
      success: false,
      message: error.message
    })

  }
}

const updateDaycare = async (req, res) => {
  try {
       const { seatCapacity } = req.body

      if (seatCapacity !== undefined && seatCapacity <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Seat capacity must be a positive number'
        })
      }

      const daycare = await Daycare.findOneAndUpdate(  { owner: req.user.id },  req.body,  { new: true })
      

      if (!daycare) {
                return res.status(404).json({
                  success: false,
                  message: 'Daycare not found'
                })
      }

      res.status(200).json({
        success: true,
        message: 'Daycare updated successfully',
        data: daycare
      })

    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      })
    }
}

// const searchNearbyDaycare = async (req, res) => {
//   try {
//     const {
//       lng,
//       lat,
//       page = 1,
//       limit = 6,
//       minRating
//     } = req.query

//     const pageNumber = Number(page)
//     const limitNumber = Number(limit)

//     const skip = (pageNumber - 1) * limitNumber

//     const filter = {
//       verificationStatus: DAYCARE_STATUS.APPROVED,
//       isBlocked: false,
//       location: {
//         $near: {
//           $geometry: {
//             type: 'Point',
//             coordinates: [Number(lng), Number(lat)]
//           }
//           // $maxDistance: 200000
//         }
//       }
//     }

//     if (minRating) {
//       filter.averageRating = {
//         $gte: Number(minRating)
//       }
//     }

//     const daycares = await Daycare.find(filter)
//       .skip(skip)
//       .limit(limitNumber)

//     const total = await Daycare.countDocuments({
//       verificationStatus: DAYCARE_STATUS.APPROVED,
//       isBlocked: false,
//       ...(minRating && {
//         averageRating: {
//           $gte: Number(minRating)
//         }
//       })
//     })

//     // const total = await Daycare.countDocuments(filter)


//     res.status(200).json({
//       success: true,
//       count: daycares.length,
//       total,
//       page: pageNumber,
//       limit: limitNumber,
//       totalPages: Math.ceil(total / limitNumber),
//       data: daycares
//     })

//   } catch (error) {
//     console.error(error)

//     res.status(500).json({
//       success: false,
//       message: error.message
//     })
//   }
// }


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