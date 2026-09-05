
const cron = require('node-cron')
const Enrollment = require('../models/Enrollment')

const expireEnrollments = () => {
  cron.schedule('0 0 * * *', async () => {
    try {
      const result = await Enrollment.updateMany(
        {
          enrollmentStatus: 'confirmed',
          endDate: { $lt: new Date() }
        },
        {
          $set: {
            enrollmentStatus: 'expired'
          }
        }
      )

      console.log(`Expired enrollments updated: ${result.modifiedCount}`)
    } catch (error) {
      console.error('Enrollment expiry job error:', error)
    }
  })
}

module.exports = expireEnrollments