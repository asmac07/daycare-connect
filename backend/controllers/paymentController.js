
const Razorpay = require('razorpay')
const crypto = require('crypto')
const Enrollment = require('../models/Enrollment')
const Payment = require('../models/Payment')
const { ENROLLMENT_STATUS, PAYMENT_STATUS } = require('../constants')

const mongoose = require('mongoose')
const Wallet = require('../models/Wallet')
const WalletTransaction = require('../models/WalletTransaction')

    // this connect backend to razorpay accnt
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

const createOrder = async (req, res) => {
  try {
    const { enrollmentId, amount } = req.body

    if (!enrollmentId || !amount) {
      return res.status(400).json({ success: false, message: 'Enrollment ID and amount are required' })
    }

    if (amount <= 0) {

      return res.status(400).json({
        success: false,
        message: 'Invalid payment amount'
      })

    }

    const enrollment = await Enrollment.findOne({
                        _id: enrollmentId, 
                        parent: req.user.id
                     }).populate('daycare')

    if (!enrollment) {
      return res.status(404).json({ 
        success: false,
         message: 'Enrollment not found' 
        })
    }

    if (enrollment.daycare.isBlocked) {
        return res.status(403).json({
          success: false,
          message: 'This daycare is temporarily unavailable'
        })
      }

      
    if (enrollment.enrollmentStatus !== ENROLLMENT_STATUS.APPROVED) {
      return res.status(400).json({ 
        success: false,
         message: 'Enrollment must be approved before payment' 
        })
    }

     const existingPayment = await Payment.findOne({
      enrollment: enrollmentId,
      status: PAYMENT_STATUS.PAID
    })

      if (existingPayment) {

            return res.status(400).json({
                success: false,
                message: 'Payment has already been completed'
            })
      }

    const order = await razorpay.orders.create({
      amount: amount * 100, // Razorpay expects amount in paise (smallest unit)
      currency: 'INR',
      receipt: `enrollment_${enrollmentId}` // identifier
    })

    const payment = await Payment.create({

            parent: req.user.id,
            enrollment: enrollmentId,
            amount: amount,
            razorpayOrderId: order.id,
            status: PAYMENT_STATUS.PENDING
    })


    res.status(200).json({
      success: true,
      message:'payment order created successfully',
      data: {
        paymentId:payment._id,
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    })

  } catch (error) {
    res.status(500).json({ 
        success: false,
         message: error.message 
        })
  }
}

const verifyPayment= async ( req, res)=>{

   const session = await mongoose.startSession()

    try{
            const {
                    razorpay_order_id,
                    razorpay_payment_id,
                    razorpay_signature
                    } = req.body

            if ( !razorpay_order_id || !razorpay_payment_id
                 ||!razorpay_signature ) {

                return res.status(400).json({
                    success: false,
                    message: 'Payment details are missing'
                 })
            }

            const payment = await Payment.findOne({
                razorpayOrderId: razorpay_order_id,
                parent: req.user.id
             })

               if (!payment) {
                    return res.status(404).json({
                        success: false,
                        message: 'Payment record not found'
                    })
                }

               if (payment.status === PAYMENT_STATUS.PAID) {
                    return res.status(400).json({
                        success: false,
                        message: 'Payment already verified'
                    })
                }
                    //create the signtre 
                const generatedSignature = crypto
                    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                    .update(
                        `${razorpay_order_id}|${razorpay_payment_id}`
                    )
                    .digest('hex')

                if (generatedSignature !== razorpay_signature) {
                             payment.status = PAYMENT_STATUS.FAILED
                             await payment.save()

                            return res.status(400).json({
                                success: false,
                                message: 'Payment verification failed'
                            })
                }

                // start mongodb transaction
                session.startTransaction()
                
                  // update paymant
                    payment.razorpayPaymentId = razorpay_payment_id
                    payment.razorpaySignature = razorpay_signature
                    payment.status = PAYMENT_STATUS.PAID
                    payment.paidAt = new Date()

                    await payment.save({ session })

                      //get enrollmnt+ daycare
                    const enrollment = await Enrollment.findById(payment.enrollment)
                                        .populate('daycare')
                                        .session(session)

                        // if (enrollment) {
                        // enrollment.paymentStatus = 'paid'
                        // enrollment.enrollmentStatus = 'confirmed'
                        // await enrollment.save()
                        // }

                if (!enrollment) {
                      throw new Error('Enrollment not found')
                    }

                    //get daycare owner

                     const ownerId = enrollment.daycare.owner

                      // find owner wallet
                     let wallet = await Wallet.findOne({
                                  owner: ownerId
                                }).session(session)

                      //Create Wallet if not exists

                       if (!wallet) {

                          const wallets = await Wallet.create(
                            [
                              {
                                owner: ownerId,
                                balance: 0
                              }
                            ],
                            { session }
                          )

                          wallet = wallets[0]
                        }


                        // credit owner wallet
                        wallet.balance += payment.amount

                         await wallet.save({ session })

                         //create trascation  history
                          await WalletTransaction.create(
                            [
                              {
                                owner: ownerId,
                                wallet: wallet._id,
                                type: 'CREDIT',
                                amount: payment.amount,
                                reason: 'ENROLLMENT_PAYMENT',
                                referenceId: payment._id,
                                balanceAfter: wallet.balance
                              }
                            ],
                            { session }
                          )

                          //conform enrollmnt
                          enrollment.paymentStatus = 'paid'
                            enrollment.enrollmentStatus = 'confirmed'

                            await enrollment.save({ session })

                      //commit trasaction
                      await session.commitTransaction()

                     res.status(200).json({
                            success: true,
                            message: 'Payment verified successfully',
                            data: {
                                    paymentId: payment._id,
                                    amount: payment.amount,
                                    ownerId: ownerId,
                                    walletBalance: wallet.balance
                                  }
                         })

        }
         catch(error){

          //Rollback everything if any operation fails
              await session.abortTransaction()

               console.log('VERIFY PAYMENT ERROR:', error)

                res.status(500).json({
                success: false,
                message: error.message
                })
            }
            finally{
              session.endSession()
            }
}
module.exports = { createOrder , verifyPayment}