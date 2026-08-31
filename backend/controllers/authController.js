
const { OAuth2Client } = require('google-auth-library')
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)
const mongoose = require("mongoose")

const User = require('../models/User')
const Daycare = require('../models/Daycare')

const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const crypto = require('crypto')
const sendEmail = require('../utils/sendEmail')

const { ROLES, USER_STATUS } = require('../constants')

const register = async (req, res) => {

  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();
    const { name, email, password, role } = req.body

    if (!name || name.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Name is required'
      })
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email'
      })
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      })
    }

    if (![ ROLES.PARENT,
            ROLES.OWNER].includes(role)) {
            return res.status(400).json({
              success: false,
              message: 'Invalid role selected'
            })
    }

    const status = USER_STATUS.ACTIVE

    const existingUser = await User.findOne({ email }).session(session)

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    // const user = await User.create({
    //   name,
    //   email,
    //   password: hashedPassword,
    //   role,
    //   status
    // })

    const user = new User({
      name,
      email,
      password: hashedPassword,
      role,
      status
    })
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString()

      user.otp = otpCode

      user.otpExpires = Date.now() + 15 * 60 * 1000

      await user.save( { session } )
      
      await sendEmail(
                  user.email,
                  'Verify Your Email - DayCare Connect',
                  `<p>Hi ${user.name},</p>
                  <p>Your verification code is: <strong>${otpCode}</strong></p>
                  <p>This code expires in 15 minutes.</p>`
                )

                await session.commitTransaction()

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email using the OTP sent to your email address.',
       data: { id: user._id, name: user.name, email: user.email }
    })

  } 
  
  catch (error) {

    await session.abortTransaction()

    res.status(500).json({
      success: false,
      message: error.message
    })
  }
  finally{
    session.endSession()
  }
}

const login = async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'User not found'
      })
    }

    const isMatch = await bcrypt.compare(password, user.password)

    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    if (user.isDeleted) {
       return res.status(403).json({
        success: false,
        message: 'This account has been deleted'
      })
    }

    if (user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been blocked'
      })
    }

    if (!user.isVerified) {
       return res.status(403).json({
       success: false,
        message: 'Please verify your email before logging in'
     })
}

     if (user.status === USER_STATUS.PENDING){
              return res.status(403).json({
                success: false,
                message: 'Your account is waiting for approval'
              })
    }

    if (user.status === USER_STATUS.REJECTED) {
            return res.status(403).json({
              success: false,
              message: 'Your account has been rejected'
            })
    }

     if (user.status === USER_STATUS.SUSPENDED){
            return res.status(403).json({
              success: false,
              message: 'Your account has been suspended'
            })
    }

    const accessToken = jwt.sign(
        { id: user._id, 
          role: user.role,
         daycare: user.daycare
         },
        process.env.JWT_SECRET,
        { expiresIn: '15m' }
    )

    const refreshToken = jwt.sign(
        { 
          id: user._id 
        },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
    )

user.refreshToken = refreshToken
await user.save()

      // store refresh token in httpOnly  cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    })

    res.status(200).json({
      success: true,
      message: 'Login successful',
      accessToken,
  
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })

  } 
  catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const refreshAccessToken = async (req, res) => {
  try {

    const refreshToken = req.cookies.refreshToken

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token not found'
      })
    }

    const decoded = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    )

    const user = await User.findById(decoded.id)

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      })
    }

    if (user.isDeleted) {
      return res.status(403).json({
        success: false,
        message: 'This account has been deleted'
      })
    }

if (user.isBlocked) {
  return res.status(403).json({
    success: false,
    message: 'Your account has been blocked'
  })
}

    if (user.refreshToken !== refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
    }

    const newAccessToken = jwt.sign(
      {
        id: user._id,
        role: user.role,
        daycare: user.daycare
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '15m'
      }
    )

    return res.status(200).json({
      success: true,
      accessToken: newAccessToken
    })

  } catch (error) {

    return res.status(401).json({
      success: false,
      message: 'Invalid or expired refresh token'
    })
  }
}

const logout = async (req, res) => {
  try {

    const refreshToken = req.cookies.refreshToken

    if (refreshToken) {

      const user = await User.findOne({
        refreshToken
      })

      if (user) {
        user.refreshToken = null
        await user.save()
      }
    }

    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax'
    })

    return res.status(200).json({
      success: true,
      message: 'Logout successful'
    })

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: error.message
    })
  }
}

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

        if (!email) {
            return res.status(400).json({
              success: false,
              message: 'Email is required'
            })
         }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

        if (!emailRegex.test(email)) {
              return res.status(400).json({
                success: false,
                message: 'Please enter a valid email'
              })
        }
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If an account exists with this email, a reset link has been sent'
      })
    }

    if (user.role === 'staff') {
          return res.status(403).json({
            success: false,
            message: 'Staff members are not allowed to reset their password'
          })
        }

    if (user.isBlocked) {
        return res.status(403).json({
            success:false,
            message:'Blocked users cannot reset password'
        })
    }

    if (user.isDeleted) {
        return res.status(403).json({
            success:false,
            message:'Account no longer exists'
        })
    }

    if (
          user.resetPasswordToken &&
          user.resetPasswordExpires &&
          user.resetPasswordExpires > Date.now()
        ) {
            return res.status(400).json({
              success: false,
              message: 'A password reset link has already been sent. Please check your email or try again after 15 minutes.'
            })
           }

    const resetToken = crypto.randomBytes(32).toString('hex')

    user.resetPasswordToken = resetToken
    user.resetPasswordExpires = Date.now() + 15 * 60 * 1000
    await user.save()

    const resetUrl = `${process.env.CLIENT_URL}/resetPassword/${resetToken}`
    

    await sendEmail(
      user.email,
      'Reset Your Password - DayCare Connect',
      `<p>Click the link below to reset your password. This link expires in 15 minutes.</p>
       <a href="${resetUrl}">${resetUrl}</a>`
    )

    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, a reset link has been sent'
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const resetPassword = async (req, res) => {
    try {
          const { token } = req.params
          const { password } = req.body

          if (!password || password.length < 6) {
            return res.status(400).json({
              success: false,
              message: 'Password must be at least 6 characters'
            })
          }
            // here checks the token expires, by checking using $gt  compared to current time
          const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
          })
          

          if (!user) {
            return res.status(400).json({
              success: false,
              message: 'Invalid or expired reset link'
            })
          }

         if (user.role === 'staff') {
            return res.status(403).json({
              success: false,
              message: 'Staff members are not allowed to reset their password'
            })
          }


          if (user.isBlocked) {
              return res.status(403).json({
                success: false,
                message: 'Your account has been blocked'
              })
            }

            if (user.isDeleted) {
              return res.status(403).json({
                success: false,
                message: 'Account not found'
              })
            }

          user.password = await bcrypt.hash(password, 10)
          user.resetPasswordToken = undefined
          user.resetPasswordExpires = undefined
          await user.save()

          res.status(200).json({
            success: true,
            message: 'Password reset successful. Please login with your new password.'
          })

    }
     catch (error) {
      res.status(500).json({ success: false, message: error.message })
    }
  }

 const googleLogin = async (req, res) => {

     try {
        const { token } = req.body

        if (!token) {
          return res.status(400).json({
             success: false, 
             message: 'Google token is required' })
        }
              //  ticket contain verified user info
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: process.env.GOOGLE_CLIENT_ID
        })

        const payload = ticket.getPayload()
        const { email, name } = payload

        let user = await User.findOne({ email })

        
        if (!user) {
      
          return res.status(200).json({
            success: true,
            isNewUser: true,
            data: { name, email, token }
          })
        }

        if (user.isBlocked) {
          return res.status(403).json({
             success: false,
              message: 'Your account has been blocked'
             })
        }
        if (user.isDeleted) {
          return res.status(403).json({ 
            success: false,
            message: 'This account has been deleted' 
          })
        }

        const accessToken = jwt.sign(
          { id: user._id, role: user.role, daycare: user.daycare },
          process.env.JWT_SECRET,
          { expiresIn: '15m' }
        )
        const refreshToken = jwt.sign(
          { id: user._id },
          process.env.JWT_REFRESH_SECRET,
          { expiresIn: '7d' }
        )

        user.refreshToken = refreshToken
        await user.save()

        res.cookie('refreshToken', refreshToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 7 * 24 * 60 * 60 * 1000
            })


        res.status(200).json({
          success: true,
          isNewuser :false,
          message: 'Login successful',
          accessToken,
          
          data: { id: user._id, 
                  name: user.name,
                  email: user.email,
                  role: user.role
                }

        })

      } 
      catch (error) {
        res.status(500).json({ 
          success: false,
           message: error.message
           })
      }
}

const completeGoogleSignup = async (req, res) => {
  try {
    const { token, role } = req.body

    if (!token || !role) {
      return res.status(400).json({ success: false, message: 'Token and role are required' })
    }

    if (![ROLES.PARENT, ROLES.OWNER].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role selected' })
    }

    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID
    })

    const payload = ticket.getPayload()
    const { email, name } = payload

    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' })
    }

    const user = await User.create({
      name,
      email,
      password: await bcrypt.hash(crypto.randomBytes(16).toString('hex'), 10),
      role,
      status: USER_STATUS.ACTIVE,
      isVerified: true
    })

    const accessToken = jwt.sign(
      { id: user._id, role: user.role, daycare: user.daycare },
      process.env.JWT_SECRET,
      { expiresIn: '15m' }
    )
    const refreshToken = jwt.sign(
        { id: user._id },
         process.env.JWT_REFRESH_SECRET, 
         { expiresIn: '7d' }
        )

            user.refreshToken = refreshToken
            await user.save()

            res.cookie('refreshToken', refreshToken, {
                  httpOnly: true,
                  secure: process.env.NODE_ENV === 'production',
                  sameSite: 'lax',
                  maxAge: 7 * 24 * 60 * 60 * 1000
            })

    res.status(201).json({
      success: true,
      message: 'Account created successfully',
      accessToken,
      
      data: { 
        id: user._id,
         name: user.name,
          email: user.email,
           role: user.role
           }
    })

  } catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

const verifyOtp = async (req, res) => {
  try {
    const { email, otp } = req.body

    if (!email || !otp) {

      return res.status(400).json({
         success: false, 
         message: 'Email and OTP are required' 
        })
    }

    const user = await User.findOne({ email })

    if (!user) {
      return res.status(404).json({
         success: false,
          message: 'User not found'
         })
    }

    if (user.isVerified) {
      return res.status(400).json({
         success: false,
          message: 'Account already verified' 
        })
    }

    if (!user.otp || !user.otpExpires || user.otpExpires < Date.now()) {
      return res.status(400).json({
         success: false,
          message: 'OTP expired. Please request a new one.'
         })
    }

    if (user.otp !== otp) {
      return res.status(400).json({ 
        success: false,
         message: 'Invalid OTP'
         })
    }

    user.isVerified = true
    user.otp = undefined
    user.otpExpires = undefined
    await user.save()

    res.status(200).json({ success: true, message: 'Email verified successfully. You can now log in.' })

  } 
  catch (error) {
    res.status(500).json({ success: false, message: error.message })
  }
}

module.exports = { register, login ,refreshAccessToken,
                  forgotPassword, resetPassword, 
                  googleLogin ,
                  completeGoogleSignup,
                   verifyOtp,
                   logout
 }