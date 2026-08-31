
const Child = require('../models/Child')
const Enrollment = require('../models/Enrollment')
const Payment = require('../models/Payment')
const { ENROLLMENT_STATUS , PAYMENT_STATUS } = require('../constants')

const addChild = async (req, res) => {
    try {
        const { name, dateOfBirth, gender, medicalNotes, assignedRoom } = req.body

        if (!name || name.trim() === '') {
          return res.status(400).json({
            success: false,
            message: 'Child name is required'
          })
        }

        if (!dateOfBirth) {
          return res.status(400).json({
            success: false,
            message: 'Date of birth is required'
          })
        }

        const child = await Child.create({
          parent: req.user.id,
          name,
          dateOfBirth,
          gender,
          medicalNotes,
          assignedRoom
        })

        res.status(201).json({
          success: true,
          message: 'Child added successfully',
          data: child
        })

   } catch (error) {
        res.status(500).json({
          success: false,
          message: error.message
        })
      }
    }

const getMyChildren = async (req, res) => {
  try {

    const children = await Child.find({ parent: req.user.id })

    res.status(200).json({
      success: true,
      count: children.length,
      data: children
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const updateChild = async (req, res) => {
  try {

        const { name, dateOfBirth, gender, medicalNotes} = req.body

      if (name !== undefined && name.trim() === '') {
        return res.status(400).json({
          success: false,
          message: 'Child name cannot be empty'
        })
      }

      const child = await Child.findOneAndUpdate(

        {
           _id: req.params.id, 
           parent: req.user.id
        },
        {
          name,
          dateOfBirth,
          gender,
          medicalNotes
        } ,
        { new: true }
      )

        if (!child) {
          return res.status(404).json({
            success: false,
            message: 'child not found'
          })
        }

        res.status(200).json({
          success: true,
          message: 'child updated successfully',
          data: child
        })

    } 
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

// const deleteChild = async (req, res) => {
//   try {

//     const child = await Child.findOneAndDelete({
//       _id: req.params.id,
//       parent: req.user.id
//     })

//     if (!child) {
//       return res.status(404).json({
//         success: false,
//         message: 'child not found'
//       })
//     }

//     res.status(200).json({
//       success: true,
//       message: 'child deleted successfully',
//       data: child
//     })

//   } 
//   catch (error) {
//     res.status(500).json({
//       success: false,
//       message: error.message
//     })
//   }
// }

const deleteChild = async (req, res) => {
  try {
    const child = await Child.findOne({
      _id: req.params.id,
      parent: req.user.id
    })

    if (!child) {
      return res.status(404).json({
        success: false,
        message: 'Child not found'
      })
    }

    // Find enrollment belonging to this child
    const enrollment = await Enrollment.findOne({
      child: child._id
    })

  
    if (enrollment) {

      if (enrollment.enrollmentStatus === ENROLLMENT_STATUS.PENDING) {

    
        await Payment.deleteMany({
          enrollment: enrollment._id,
          status: PAYMENT_STATUS.PENDING
        })

        
        await Enrollment.findByIdAndDelete(enrollment._id)

      } else {

      
        return res.status(400).json({
          success: false,
          message: 'Cannot delete child with an active enrollment'
        })
      }
    }

    // Finally delete child
    await Child.findByIdAndDelete(child._id)

    res.status(200).json({
      success: true,
      message: 'Child and pending enrollment deleted successfully'
    })

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

module.exports = { addChild, getMyChildren,updateChild, deleteChild }