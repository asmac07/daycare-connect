
const User = require('../models/User')
const Daycare = require('../models/Daycare')
const Enrollment = require('../models/Enrollment')
const Payment = require('../models/Payment')


const getAdminAnalytics = async (req, res) => {
  try {

    const { period, startDate, endDate } = req.query

    // --------------------------------
    // 1. Create date filter
    // --------------------------------

    let enrollmentDateFilter = {}
    let paymentDateFilter = {}

    if (startDate && endDate) {

      const start = new Date(startDate)
      const end = new Date(endDate)

      end.setHours(23, 59, 59, 999)

      enrollmentDateFilter = {
        createdAt: {
          $gte: start,
          $lte: end
        }
      }

      paymentDateFilter = {
        paidAt: {
          $gte: start,
          $lte: end
        }
      }
    }

    // --------------------------------
    // 2. Basic counts
    // --------------------------------

    const totalUsers = await User.countDocuments({
      role: { $ne: 'admin' },
      isDeleted: false
    })

    const totalParents = await User.countDocuments({
      role: 'parent',
      isDeleted: false
    })

    const totalOwners = await User.countDocuments({
      role: 'owner',
      isDeleted: false
    })

    const totalStaff = await User.countDocuments({
      role: 'staff',
      isDeleted: false
    })

    const totalDaycares = await Daycare.countDocuments({
      isDeleted: false
    })

    const totalEnrollments = await Enrollment.countDocuments(
      enrollmentDateFilter
    )

    // --------------------------------
    // 3. Total revenue
    // --------------------------------

    const revenueResult = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          ...paymentDateFilter
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ])

    const totalRevenue =
      revenueResult.length > 0
        ? revenueResult[0].totalRevenue
        : 0


    // --------------------------------
    // 4. User distribution
    // --------------------------------

    const userDistribution = await User.aggregate([
      {
        $match: {
          isDeleted: false,
          role: { $ne: 'admin' }
        }
      },
      {
        $group: {
          _id: '$role',
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          count: -1
        }
      }
    ])


    // --------------------------------
    // 5. Enrollment status
    // --------------------------------

    const enrollmentStatus = await Enrollment.aggregate([
      {
        $match: enrollmentDateFilter
      },
      {
        $group: {
          _id: '$enrollmentStatus',
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          count: -1
        }
      }
    ])


    // --------------------------------
    // 6. Enrollment trend
    // --------------------------------

    const enrollmentTrend = await Enrollment.aggregate([
      {
        $match: enrollmentDateFilter
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ])


    // --------------------------------
    // 7. Payment trend
    // --------------------------------

    const paymentTrend = await Payment.aggregate([
      {
        $match: {
          status: 'paid',
          ...paymentDateFilter
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$paidAt' },
            month: { $month: '$paidAt' }
          },
          revenue: { $sum: '$amount' }
        }
      },
      {
        $sort: {
          '_id.year': 1,
          '_id.month': 1
        }
      }
    ])


    // --------------------------------
    // 8. Top 5 Daycares
    // --------------------------------

    const topDaycares = await Enrollment.aggregate([
      {
        $match: enrollmentDateFilter
      },
      {
        $group: {
          _id: '$daycare',
          totalEnrollments: { $sum: 1 }
        }
      },
      {
        $sort: {
          totalEnrollments: -1
        }
      },
      {
        $limit: 5
      },
      {
        $lookup: {
          from: 'daycares',
          localField: '_id',
          foreignField: '_id',
          as: 'daycare'
        }
      },
      {
        $unwind: '$daycare'
      },
      {
        $project: {
          _id: 1,
          daycareName: '$daycare.name',
          totalEnrollments: 1
        }
      }
    ])


    // --------------------------------
    // 9. Payment history
    // --------------------------------

    const paymentHistory = await Payment.find({
      status: 'paid',
      ...paymentDateFilter
    })
      .populate('parent', 'name email')
      .populate({
        path: 'enrollment',
        select: 'daycare package amount',
        populate: {
          path: 'daycare',
          select: 'name'
        }
      })
      .sort({ paidAt: -1 })
      .limit(20)


    // --------------------------------
    // Final response
    // --------------------------------

    res.status(200).json({
      success: true,

      data: {
        overview: {
          totalUsers,
          totalParents,
          totalOwners,
          totalStaff,
          totalDaycares,
          totalEnrollments,
          totalRevenue
        },

        userDistribution,

        enrollmentStatus,

        enrollmentTrend,

        paymentTrend,

        topDaycares,

        paymentHistory
      }
    })

  } catch (error) {

    console.log('ADMIN ANALYTICS ERROR:', error)

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}


module.exports = {
  getAdminAnalytics
}