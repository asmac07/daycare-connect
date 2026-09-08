import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'
import { statusStyles } from '../../constants/statusStyles'
import {
  ClipboardList,
  Calendar,
  Wallet,
  Star,
  User,
  Building2,
  RefreshCw,
  X,
  CreditCard
} from 'lucide-react'

const ParentEnrollments = () => {

  const [enrollments, setEnrollments] = useState([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const limit = 6

  const [selectedEnrollment, setSelectedEnrollment] = useState(null)

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
      const response = await axiosInstance.get(
        `/enrollment/getMyEnrollments?page=${page}&limit=${limit}`
      )
      setEnrollments(response.data.data)
      setTotalPages(response.data.pagination.totalPages)
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Failed to load enrollments')
    }
  }

  useEffect(() => {
    fetchMyEnrollments()
  }, [page])

  const isEnrollmentExpired = (endDate) => {
    if (!endDate) return false
    const today = new Date()
    const expiryDate = new Date(endDate)
    today.setHours(0, 0, 0, 0)
    expiryDate.setHours(0, 0, 0, 0)
    return expiryDate < today
  }

  const handleAddReview = async (enrollment) => {
    try {
      await axiosInstance.post('/review/add', {
        daycare: enrollment.daycare?._id || enrollment.daycare,
        enrollment: enrollment._id,
        rating,
        comment
      })
      toast.success('Review submitted successfully!')
      setReviewingId(null)
      setComment('')
      setRating(5)
      setReviewMessage('')
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

      const { orderId, amount, currency, keyId } = response.data.data

      const options = {
        key: keyId,
        amount: amount,
        currency: currency,
        name: 'DayCare Connect',
        description: 'Daycare Enrollment Payment',
        order_id: orderId,

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await axiosInstance.post('/payment/verifyPayment', {
              razorpay_order_id: paymentResponse.razorpay_order_id,
              razorpay_payment_id: paymentResponse.razorpay_payment_id,
              razorpay_signature: paymentResponse.razorpay_signature
            })

            if (verifyResponse.data.success) {
              toast.success('Payment successful!')
              fetchMyEnrollments()
            }
          } catch (error) {
            toast.error(error.response?.data?.message || 'Payment verification failed')
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

      const razorpay = new window.Razorpay(options)
      razorpay.open()

    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Unable to start payment')
    }
  }

  const handleRenewEnrollment = async () => {
    if (!renewingEnrollment) return

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

      await handlePayment(newEnrollment)

      fetchMyEnrollments()

    } catch (error) {
      console.error('Renewal error:', error)
      toast.error(error.response?.data?.message || 'Failed to renew enrollment')
    }
  }

  const openRenewalModal = (enrollment) => {
    setSelectedEnrollment(null)
    setRenewingEnrollment(enrollment)
    setPackageType('')
    setRenewStartDate('')
    setRenewEndDate('')
  }

  const packageLabel = (pkg) =>
    pkg === 'daily' ? '1 Day' : pkg === 'weekly' ? '7 Days' : pkg === 'monthly' ? '1 Month' : pkg || 'Not selected'

  return (
    <div>

      <div className="mb-6">
        <h1 className="text-2xl font-semibold font-baloo text-dc-ink">My Enrollments</h1>
        <p className="text-sm text-dc-muted mt-1">View and manage your child's daycare enrollments.</p>
      </div>

      <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">

        {reviewMessage && (
          <p className="text-sm text-dc-error-text font-semibold mb-4">{reviewMessage}</p>
        )}

        {enrollments.length === 0 ? (
          <div className="text-center py-14">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center mx-auto mb-4 shadow-[0_8px_20px_-6px_rgba(74,144,164,0.5)] rotate-3">
              <ClipboardList size={28} strokeWidth={2} className="text-white" />
            </div>
            <h2 className="text-lg font-semibold font-baloo text-dc-ink">No Enrollments Yet</h2>
            <p className="text-sm text-dc-muted mt-1">You haven't enrolled your child in a daycare yet.</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {enrollments.map((en) => (
                <div
                  key={en._id}
                  onClick={() => setSelectedEnrollment(en)}
                  className="bg-white border-[1.5px] border-dc-border rounded-3xl p-5 cursor-pointer hover:shadow-[0_15px_40px_-15px_rgba(74,144,164,0.3)] hover:border-dc-blue/40 hover:-translate-y-1 transition duration-200"
                >

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center flex-shrink-0 text-white font-bold font-baloo">
                        {en.child?.name?.charAt(0).toUpperCase() || 'C'}
                      </div>
                      <div>
                        <h2 className="text-lg font-semibold font-baloo text-dc-ink leading-tight">
                          {en.child?.name || 'Child'}
                        </h2>
                        <p className="text-sm text-dc-muted flex items-center gap-1 mt-0.5">
                          <Building2 size={13} strokeWidth={2.2} />
                          {en.daycare?.name || 'Daycare'}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${statusStyles[en.enrollmentStatus]}`}
                    >
                      {en.enrollmentStatus}
                    </span>
                  </div>

                  <hr className="my-4 border-dc-border" />

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-dc-muted flex items-center gap-1">
                        <ClipboardList size={12} strokeWidth={2.4} /> Package
                      </p>
                      <p className="font-semibold text-dc-ink mt-1">{packageLabel(en.package)}</p>
                    </div>

                    <div>
                      <p className="text-xs text-dc-muted flex items-center gap-1">
                        <Wallet size={12} strokeWidth={2.4} /> Amount
                      </p>
                      <p className="font-semibold text-dc-blue mt-1">₹{en.amount || 0}</p>
                    </div>

                    <div>
                      <p className="text-xs text-dc-muted flex items-center gap-1">
                        <Calendar size={12} strokeWidth={2.4} /> Start Date
                      </p>
                      <p className="font-semibold text-dc-ink mt-1">
                        {en.startDate ? new Date(en.startDate).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>

                    <div>
                      <p className="text-xs text-dc-muted flex items-center gap-1">
                        <Calendar size={12} strokeWidth={2.4} /> End Date
                      </p>
                      <p className="font-semibold text-dc-ink mt-1">
                        {en.endDate ? new Date(en.endDate).toLocaleDateString() : 'Not available'}
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-dc-border flex items-center justify-between">
                    <div>
                      <span className="text-xs text-dc-muted">Payment</span>
                      <p className={en.paymentStatus === 'paid' ? 'text-dc-green font-semibold text-sm' : 'text-amber-600 font-semibold text-sm'}>
                        {en.paymentStatus}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedEnrollment(en)
                      }}
                      className="text-dc-blue font-semibold text-sm hover:underline"
                    >
                      View Details →
                    </button>
                  </div>

                </div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 rounded-full border border-dc-border text-sm text-dc-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dc-hover transition"
                >
                  ←
                </button>

                {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => setPage(pageNumber)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold transition ${
                      page === pageNumber ? 'bg-dc-blue text-white' : 'border border-dc-border text-dc-ink hover:bg-dc-hover'
                    }`}
                  >
                    {pageNumber}
                  </button>
                ))}

                <button
                  type="button"
                  disabled={page === totalPages}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 rounded-full border border-dc-border text-sm text-dc-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dc-hover transition"
                >
                  →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* DETAILS MODAL */}
      {selectedEnrollment && (
        <div
          className="fixed inset-0 bg-dc-ink/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setSelectedEnrollment(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)] max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >

            <div className="flex items-start justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center flex-shrink-0 text-white font-bold font-baloo">
                  {selectedEnrollment.child?.name?.charAt(0).toUpperCase() || 'C'}
                </div>
                <div>
                  <h2 className="text-xl font-semibold font-baloo text-dc-ink">
                    {selectedEnrollment.child?.name || 'Child'}
                  </h2>
                  <p className="text-sm text-dc-muted flex items-center gap-1 mt-0.5">
                    <Building2 size={13} strokeWidth={2.2} />
                    {selectedEnrollment.daycare?.name || 'Daycare'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setSelectedEnrollment(null)}
                className="text-dc-muted hover:text-dc-ink transition"
              >
                <X size={20} strokeWidth={2.2} />
              </button>
            </div>

            <div className="bg-dc-field rounded-2xl p-4 mb-4">
              <h3 className="font-semibold font-baloo text-dc-blue mb-3 flex items-center gap-1.5">
                <User size={15} strokeWidth={2.2} /> Child Details
              </h3>

              <div className="grid grid-cols-2 gap-3 text-sm text-dc-ink">
                <p><strong>Name:</strong> {selectedEnrollment.child?.name || 'Not available'}</p>
                <p><strong>Gender:</strong> {selectedEnrollment.child?.gender || 'Not available'}</p>
                <p>
                  <strong>DOB:</strong>{' '}
                  {selectedEnrollment.child?.dateOfBirth
                    ? new Date(selectedEnrollment.child.dateOfBirth).toLocaleDateString()
                    : 'Not available'}
                </p>
                <p><strong>Age Group:</strong> {selectedEnrollment.ageGroup || 'Not available'}</p>
              </div>
            </div>

            <div className="bg-dc-field rounded-2xl p-4 mb-4">
              <h3 className="font-semibold font-baloo text-dc-blue mb-3 flex items-center gap-1.5">
                <Building2 size={15} strokeWidth={2.2} /> Daycare Details
              </h3>
              <p className="text-sm text-dc-ink"><strong>Name:</strong> {selectedEnrollment.daycare?.name || 'Not available'}</p>
              <p className="text-sm text-dc-ink mt-2"><strong>Address:</strong> {selectedEnrollment.daycare?.address || 'Not available'}</p>
            </div>

            <div className="bg-dc-field rounded-2xl p-4 mb-4">
              <h3 className="font-semibold font-baloo text-dc-blue mb-3 flex items-center gap-1.5">
                <ClipboardList size={15} strokeWidth={2.2} /> Enrollment Details
              </h3>

              <div className="grid grid-cols-2 gap-3 text-sm text-dc-ink">
                <p><strong>Package:</strong> {selectedEnrollment.package || 'Not available'}</p>
                <p><strong>Amount:</strong> ₹{selectedEnrollment.amount || 0}</p>
                <p>
                  <strong>Start:</strong>{' '}
                  {selectedEnrollment.startDate ? new Date(selectedEnrollment.startDate).toLocaleDateString() : 'Not available'}
                </p>
                <p>
                  <strong>End:</strong>{' '}
                  {selectedEnrollment.endDate ? new Date(selectedEnrollment.endDate).toLocaleDateString() : 'Not available'}
                </p>
                <p>
                  <strong>Status:</strong>{' '}
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyles[selectedEnrollment.enrollmentStatus]}`}>
                    {selectedEnrollment.enrollmentStatus}
                  </span>
                </p>
                <p>
                  <strong>Payment:</strong>{' '}
                  <span className={selectedEnrollment.paymentStatus === 'paid' ? 'text-dc-green font-semibold' : 'text-amber-600 font-semibold'}>
                    {selectedEnrollment.paymentStatus}
                  </span>
                </p>
                <p>
                  <strong>Applied:</strong>{' '}
                  {selectedEnrollment.createdAt ? new Date(selectedEnrollment.createdAt).toLocaleDateString() : 'Not available'}
                </p>
              </div>
            </div>

            {selectedEnrollment.assignedStaff && (
              <div className="bg-dc-field rounded-2xl p-4 mb-4">
                <h3 className="font-semibold font-baloo text-dc-blue mb-3 flex items-center gap-1.5">
                  <User size={15} strokeWidth={2.2} /> Assigned Staff
                </h3>
                <p className="text-sm text-dc-ink"><strong>Name:</strong> {selectedEnrollment.assignedStaff.name || 'Not available'}</p>
                <p className="text-sm text-dc-ink mt-2"><strong>Email:</strong> {selectedEnrollment.assignedStaff.email || 'Not available'}</p>
                <p className="text-sm text-dc-ink mt-2"><strong>Designation:</strong> {selectedEnrollment.assignedStaff.designation || 'Not available'}</p>
              </div>
            )}

            {selectedEnrollment.enrollmentStatus === 'rejected' && (
              <div className="bg-dc-error-bg rounded-2xl p-4 mb-4">
                <p className="text-sm text-dc-error-text">
                  <strong>Reason:</strong> {selectedEnrollment.reason || 'No reason provided'}
                </p>
              </div>
            )}

            {selectedEnrollment.enrollmentStatus === 'approved' && selectedEnrollment.paymentStatus !== 'paid' && (
              <button
                type="button"
                onClick={() => {
                  setSelectedEnrollment(null)
                  handlePayment(selectedEnrollment)
                }}
                className="w-full bg-dc-blue text-white py-3 rounded-full font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <CreditCard size={16} strokeWidth={2.2} />
                Pay ₹{selectedEnrollment.amount}
              </button>
            )}

            {(selectedEnrollment.enrollmentStatus === 'expired' ||
              (selectedEnrollment.enrollmentStatus === 'confirmed' && isEnrollmentExpired(selectedEnrollment.endDate))) && (
              <button
                type="button"
                onClick={() => openRenewalModal(selectedEnrollment)}
                className="w-full mt-3 bg-dc-blue text-white py-3 rounded-full font-semibold hover:opacity-90 transition flex items-center justify-center gap-2"
              >
                <RefreshCw size={16} strokeWidth={2.2} />
                Renew Enrollment
              </button>
            )}

            {selectedEnrollment.enrollmentStatus === 'confirmed' && (
              <div className="mt-3">
                {reviewingId === selectedEnrollment._id ? (
                  <div className="space-y-3">
                    <select
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                      className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue"
                    >
                      <option value={5}>5 - Excellent</option>
                      <option value={4}>4 - Good</option>
                      <option value={3}>3 - Average</option>
                      <option value={2}>2 - Poor</option>
                      <option value={1}>1 - Very Poor</option>
                    </select>

                    <input
                      type="text"
                      placeholder="Write your review..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue"
                    />

                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setReviewingId(null)
                          setComment('')
                          setRating(5)
                        }}
                        className="flex-1 bg-white text-dc-muted px-5 py-2 rounded-full font-semibold text-sm border-[1.5px] border-dc-border"
                      >
                        Cancel
                      </button>

                      <button
                        type="button"
                        onClick={() => handleAddReview(selectedEnrollment)}
                        className="flex-1 bg-dc-green text-white px-5 py-2 rounded-full font-semibold text-sm"
                      >
                        Submit Review
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setReviewingId(selectedEnrollment._id)}
                    className="w-full bg-amber-500 text-white py-3 rounded-full font-semibold text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
                  >
                    <Star size={16} strokeWidth={2.2} />
                    Write Review
                  </button>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* RENEWAL MODAL */}
      {renewingEnrollment && (
        <div
          className="fixed inset-0 bg-dc-ink/50 backdrop-blur-sm flex items-center justify-center z-50 px-4"
          onClick={() => setRenewingEnrollment(null)}
        >
          <div
            className="bg-white rounded-3xl p-6 w-full max-w-md shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-xl font-semibold font-baloo text-dc-ink mb-2 flex items-center gap-2">
              <RefreshCw size={18} strokeWidth={2.2} className="text-dc-blue" />
              Renew Enrollment
            </h2>

            <p className="text-sm text-dc-muted mb-5">
              Renew enrollment for <span className="font-semibold text-dc-ink">{renewingEnrollment.child?.name}</span>
            </p>

            <div className="mb-4">
              <label className="block text-sm font-semibold text-dc-ink mb-2">Package</label>
              <select
                value={packageType}
                onChange={(e) => setPackageType(e.target.value)}
                className="w-full rounded-full px-4 py-3 border-[1.5px] border-dc-border bg-white text-sm text-dc-ink outline-none focus:border-dc-blue"
              >
                <option value="">Select Package</option>
                <option value="daily">Daily - ₹300</option>
                <option value="weekly">Weekly - ₹1000</option>
                <option value="monthly">Monthly - ₹5500</option>
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
              <div>
                <label className="block text-sm font-semibold text-dc-ink mb-2">Start Date</label>
                <input
                  type="date"
                  value={renewStartDate}
                  onChange={(e) => setRenewStartDate(e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full rounded-full px-4 py-3 border-[1.5px] border-dc-border bg-white text-sm text-dc-ink outline-none focus:border-dc-blue"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dc-ink mb-2">End Date</label>
                <input
                  type="date"
                  value={renewEndDate}
                  onChange={(e) => setRenewEndDate(e.target.value)}
                  min={renewStartDate || new Date().toISOString().split('T')[0]}
                  className="w-full rounded-full px-4 py-3 border-[1.5px] border-dc-border bg-white text-sm text-dc-ink outline-none focus:border-dc-blue"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
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