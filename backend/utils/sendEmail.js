
const nodemailer = require('nodemailer')

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
})



const sendEmail = async (to, subject, html) => {
  try {
    console.log('Sending email to:', to)

    const info = await transporter.sendMail({
      from: `"DayCare Connect" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html
    })

    console.log('Email sent successfully:', info.response)
  } catch (error) {
    console.error('Email Error:', error)
    throw error
  }
}


module.exports = sendEmail