
import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'
import { statusStyles } from '../../constants/statusStyles'

const ParentEnrollments = () => {
  const [enrollments, setEnrollments] = useState([])
  const [reviewingId, setReviewingId] = useState(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [reviewMessage, setReviewMessage] = useState('')

  const [packageType, setPackageType] = useState('')

  const [renewingEnrollment, setRenewingEnrollment] = useState(null)
  const [renewStartDate, setRenewStartDate] = useState('')
  const [renewEndDate, setRenewEndDate] = useState('')

  const fetchMyEnrollments = async () => {
    try {
      const response = await axiosInstance.get('/enrollment/getMyEnrollments')
      setEnrollments(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchMyEnrollments()
  }, [])

  const handleAddReview = async (enrollment) => {
    try {
      await axiosInstance.post('/review/add', {
        daycare: enrollment.daycare,
        enrollment: enrollment._id,
        rating,
        comment
      })
      toast.success('Review submitted successfully!')
      setReviewingId(null)
      setComment('')
      setRating(5)
    } catch (error) {
      setReviewMessage(error.response?.data?.message || 'Failed to submit review')
    }
  }

  const handlePayment = async (enrollment) => {
   try {
    
    const response = await axiosInstance.post('/payment/createOrder', {
      enrollmentId: enrollment._id,
      amount: enrollment.amount
    })

    const {
      paymentId,
      orderId,
      amount,
      currency,
      keyId
    } = response.data.data

    // razorpay checkout options
    const options = {
      key: keyId,
      amount: amount,
      currency: currency,
      name: 'DayCare Connect',
      description: 'Daycare Enrollment Payment',
      order_id: orderId,

      handler: async function (paymentResponse) {

        try {

          //  Verify payment in backend
          const verifyResponse = await axiosInstance.post(
            '/payment/verifyPayment',
            {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            }
          )

          if (verifyResponse.data.success) {
            toast.success('Payment successful!')

            // Refresh enrollments
            fetchMyEnrollments()
          }

        } catch (error) {

          toast.error(
            error.response?.data?.message ||
            'Payment verification failed'
          )

        }
      },

      prefill: {
        name: enrollment.parent?.name || '',
        email: enrollment.parent?.email || ''
      },

      theme: {
        color: '#4A90A4'
      }
    }

    // open Razorpay checkout
    const razorpay = new window.Razorpay(options)

    razorpay.open()

  } 
  catch (error) {

    console.log(error)

    toast.error(
      error.response?.data?.message ||
      'Unable to start payment'
    )
  }
}

const handleRenewEnrollment = async () => {

  if (!packageType) {
    toast.error('Please select a package')
    return
  }

  if (!renewStartDate || !renewEndDate) {
    toast.error('Please select start and end dates')
    return
  }

  if (new Date(renewEndDate) < new Date(renewStartDate)) {
    toast.error('End date must be after start date')
    return
  }

  try {

    const response = await axiosInstance.post('/enrollment/renew', {
      enrollmentId: renewingEnrollment._id,
      package: packageType,
      startDate: renewStartDate,
      endDate: renewEndDate
    })

    const newEnrollment = response.data.data

    toast.success('Renewal created. Proceeding to payment...')

    setRenewingEnrollment(null)
    setRenewStartDate('')
    setRenewEndDate('')
    setPackageType('')

    // Open Razorpay for renewal
    await handlePayment(newEnrollment)

    // Refresh after renewal
    fetchMyEnrollments()

  } catch (error) {

    console.error('Renewal error:', error)

    toast.error(
      error.response?.data?.message ||
      'Failed to renew enrollment'
    )
  }
}


const isEnrollmentExpired = (endDate) => {
    if (!endDate) return false

    const today = new Date()
    const expiryDate = new Date(endDate)

    today.setHours(0, 0, 0, 0)
    expiryDate.setHours(0, 0, 0, 0)

    return expiryDate < today
  }


return (

  <div>

    <h1 className="text-2xl font-semibold font-baloo text-dc-ink mb-6">
      My Enrollments
    </h1>


    <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">

      {reviewMessage && (
        <p className="text-sm text-dc-green font-semibold mb-4">
          {reviewMessage}
        </p>
      )}


      {enrollments.length === 0 ? (

        <p className="text-dc-muted text-sm">
          No enrollments yet.
        </p>

      ) : (

        <div className="space-y-4">

          {enrollments.map((en) => (

            <div
              key={en._id}
              className="border-[1.5px] border-dc-border rounded-2xl p-5"
            >

              <h2 className="text-lg font-semibold font-baloo text-dc-blue mb-1">
                {en.daycare?.name}
              </h2>

              <p className="text-sm text-dc-muted mb-4">
                {en.daycare?.address}
              </p>


              <hr className="mb-4 border-dc-border" />


              <h3 className="font-semibold text-dc-ink mb-3">
                Child Details
              </h3>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-sm text-dc-ink mb-4">

                <p>
                  <strong>Name:</strong>{' '}
                  {en.child?.name || 'Not available'}
                </p>

                <p>
                  <strong>Gender:</strong>{' '}
                  {en.child?.gender || 'Not available'}
                </p>

                <p>
                  <strong>DOB:</strong>{' '}
                  {en.child?.dateOfBirth
                    ? new Date(
                        en.child.dateOfBirth
                      ).toLocaleDateString()
                    : 'Not available'}
                </p>

                <p>
                  <strong>Age Group:</strong>{' '}
                  {en.ageGroup || 'Not available'}
                </p>

              </div>


              <hr className="mb-4 border-dc-border" />


              <h3 className="font-semibold text-dc-ink mb-3">
                Package Details
              </h3>


              <div className="bg-dc-field rounded-2xl p-4 mb-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-dc-ink">

                  <p>
                    <strong>Package:</strong>{' '}

                    {en.package
                      ? en.package === 'daily'
                        ? '1 Day'
                        : en.package === 'weekly'
                        ? '7 Days'
                        : en.package === 'monthly'
                        ? '1 Month'
                        : en.package
                      : 'Not selected'}
                  </p>
     

                  <p>
                    <strong>Amount:</strong>{' '}

                    <span className="font-semibold text-dc-blue">
                      ₹{en.amount || 0}
                    </span>
                  </p>

                   <p>
                      <strong>Start Date:</strong>{' '}
                      {en.startDate
                        ? new Date(en.startDate).toLocaleDateString()
                        : 'Not available'}
                    </p>

                    <p>
                      <strong>End Date:</strong>{' '}
                      {en.endDate
                        ? new Date(en.endDate).toLocaleDateString()
                        : 'Not available'}
                    </p>

                </div>

              </div>


              <hr className="mb-4 border-dc-border" />

              <h3 className="font-semibold text-dc-ink mb-3">
                Enrollment Details
              </h3>


              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm text-dc-ink">

                {/* STATUS */}

                <div className="flex items-center gap-2">

                  <strong>Status:</strong>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      statusStyles[en.enrollmentStatus]
                    }`}
                  >
                    {en.enrollmentStatus}
                  </span>

                </div>


                <div>

                  <strong>Payment:</strong>{' '}

                  <span
                    className={
                      en.paymentStatus === 'paid'
                        ? 'text-dc-green font-semibold'
                        : 'text-amber-600 font-semibold'
                    }
                  >
                    {en.paymentStatus}
                  </span>

                </div>


               <p>

                  <strong>Applied On:</strong>{' '}

                  {en.createdAt
                    ? new Date(
                        en.createdAt
                      ).toLocaleDateString()
                    : 'Not available'}

                </p>

              </div>


              
              {en.enrollmentStatus === 'approved' &&
                en.paymentStatus !== 'paid' && (

                <div className="mt-5 bg-dc-field rounded-2xl p-4">

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                    <div>

                      <p className="font-semibold text-dc-ink">
                        Payment Required
                      </p>

                      <p className="text-xs text-dc-muted mt-1">
                        Complete the payment to confirm your enrollment.
                      </p>

                    </div>


                    <div className="flex items-center gap-4">

                      <div className="text-right">

                        <p className="text-xs text-dc-muted">
                          Amount
                        </p>

                        <p className="text-lg font-bold text-dc-blue">
                          ₹{en.amount}
                        </p>

                      </div>


                      <button
                        onClick={() => handlePayment(en)}
                        className="bg-dc-blue text-white px-5 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition whitespace-nowrap"
                      >
                        Pay Now
                      </button>

                    </div>

                  </div>

                </div>

              )}

             
              {en.paymentStatus === 'paid' && (

                <div className="mt-5 bg-dc-green/10 rounded-2xl p-4">

                  <p className="text-sm text-dc-green font-semibold">
                    ✓ Payment Completed
                  </p>

                  <p className="text-xs text-dc-muted mt-1">
                    Your enrollment payment has been completed successfully.
                  </p>

                </div>

              )}


              {en.enrollmentStatus === 'rejected' && (

                <>

                  <hr className="my-4 border-dc-border" />

                  <div className="bg-dc-error-bg rounded-xl p-4">

                    <p className="text-dc-error-text text-sm">

                      <strong>Reason:</strong>{' '}

                      {en.reason || 'No reason provided'}

                    </p>

                  </div>

                </>

              )}
{(en.enrollmentStatus === 'confirmed' ||
  en.enrollmentStatus === 'expired') && (

  <div className="mt-5 bg-amber-50 rounded-2xl p-4">

    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

      <div>

        <p className="font-semibold text-dc-ink">
          {isEnrollmentExpired(en.endDate)
            ? 'Enrollment Expired'
            : 'Enrollment Renewal'}
        </p>

        <p className="text-xs text-dc-muted mt-1">
          {isEnrollmentExpired(en.endDate)
            ? "Your child's enrollment period has ended. You can renew it now."
            : `Renewal will be available after ${new Date(
                en.endDate
              ).toLocaleDateString()}.`}
        </p>

      </div>

      <button
        type="button"
        disabled={!isEnrollmentExpired(en.endDate)}
        onClick={() => {
          if (isEnrollmentExpired(en.endDate)) {
            setRenewingEnrollment(en)
            setPackageType('')
            setRenewStartDate('')
            setRenewEndDate('')
          }
        }}
        className={`px-5 py-2 rounded-full font-semibold text-sm transition whitespace-nowrap ${
          isEnrollmentExpired(en.endDate)
            ? 'bg-dc-blue text-white hover:opacity-90'
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
        }`}
      >
        Renew Enrollment
      </button>

    </div>

  </div>

)}
              
              {en.enrollmentStatus === 'confirmed' && (

                <div className="mt-5">

                  {reviewingId === en._id ? (

                    <div className="space-y-3">

                      <select
                        value={rating}
                        onChange={(e) =>
                          setRating(Number(e.target.value))
                        }
                        className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                      >

                        <option value={5}>
                          5 - Excellent
                        </option>

                        <option value={4}>
                          4 - Good
                        </option>

                        <option value={3}>
                          3 - Average
                        </option>

                        <option value={2}>
                          2 - Poor
                        </option>

                        <option value={1}>
                          1 - Very Poor
                        </option>

                      </select>


                      <input
                        type="text"
                        placeholder="Write your review..."
                        value={comment}
                        onChange={(e) =>
                          setComment(e.target.value)
                        }
                        className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                      />


                      <div className="flex gap-2">

                        <button
                          onClick={() => {
                            setReviewingId(null)
                            setComment('')
                            setRating(5)
                          }}
                          className="bg-white text-dc-muted px-5 py-2 rounded-full font-semibold text-sm border-[1.5px] border-dc-border hover:bg-dc-hover transition"
                        >
                          Cancel
                        </button>


                        <button
                          onClick={() =>
                            handleAddReview(en)
                          }
                          className="bg-dc-green text-white px-5 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition"
                        >
                          Submit Review
                        </button>

                      </div>

                    </div>

                  ) : (

                    <button
                      onClick={() =>
                        setReviewingId(en._id)
                      }
                      className="bg-amber-500 hover:opacity-90 text-white px-5 py-2 rounded-full font-semibold text-sm transition"
                    >
                      Write Review
                    </button>

                  )}

                </div>

              )}

            </div>

          ))}

        </div>

      )}



    </div>
    {renewingEnrollment && (

  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">

    <div className="bg-white rounded-3xl p-6 w-full max-w-md shadow-xl">

      <h2 className="text-xl font-semibold font-baloo text-dc-ink mb-2">
        Renew Enrollment
      </h2>

      <p className="text-sm text-dc-muted mb-5">
        Renew enrollment for{' '}
        <span className="font-semibold text-dc-ink">
          {renewingEnrollment.child?.name}
        </span>
      </p>


      {/* Package */}

      <div className="mb-4">

        <label className="block text-sm font-semibold text-dc-ink mb-2">
          Package
        </label>

        <select
          value={packageType}
          onChange={(e) => setPackageType(e.target.value)}
          className="w-full rounded-full px-4 py-3 border-[1.5px] border-dc-border bg-white text-sm text-dc-ink outline-none focus:border-dc-blue"
        >

          <option value="">
            Select Package
          </option>

          <option value="daily">
            Daily - ₹300
          </option>

          <option value="weekly">
            Weekly - ₹1000
          </option>

          <option value="monthly">
            Monthly - ₹5500
          </option>

        </select>

      </div>


      {/* Dates */}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">

        <div>

          <label className="block text-sm font-semibold text-dc-ink mb-2">
            Start Date
          </label>

          <input
            type="date"
            value={renewStartDate}
            onChange={(e) => setRenewStartDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="w-full rounded-full px-4 py-3 border-[1.5px] border-dc-border bg-white text-sm text-dc-ink outline-none focus:border-dc-blue"
          />

        </div>


        <div>

          <label className="block text-sm font-semibold text-dc-ink mb-2">
            End Date
          </label>

          <input
            type="date"
            value={renewEndDate}
            onChange={(e) => setRenewEndDate(e.target.value)}
            min={renewStartDate || new Date().toISOString().split('T')[0]}
            className="w-full rounded-full px-4 py-3 border-[1.5px] border-dc-border bg-white text-sm text-dc-ink outline-none focus:border-dc-blue"
          />

        </div>

      </div>


      {/* Buttons */}

      <div className="flex justify-end gap-3">

        <button
          onClick={() => {
            setRenewingEnrollment(null)
            setPackageType('')
            setRenewStartDate('')
            setRenewEndDate('')
          }}
          className="bg-white text-dc-muted px-5 py-2 rounded-full font-semibold text-sm border-[1.5px] border-dc-border hover:bg-dc-hover transition"
        >
          Cancel
        </button>
          <button
            type="button"
            onClick={handleRenewEnrollment}
            className="bg-dc-blue text-white px-5 py-2 rounded-full font-semibold text-sm hover:opacity-90 transition"
          >
            Continue
          </button>
       

      </div>

    </div>

  </div>

)}

  </div>

)
}
export default ParentEnrollments
 