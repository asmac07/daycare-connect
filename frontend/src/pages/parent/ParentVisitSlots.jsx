
import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'

const ParentVisitSlots = () => {

  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState('')
  const [selectedSlot, setSelectedSlot] = useState(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  const [daycares, setDaycares] = useState([])
  const [selectedDaycare, setSelectedDaycare] = useState('')
  const [slots, setSlots] = useState([])

  const [myBookings, setMyBookings] = useState([])

  const [selectedBooking, setSelectedBooking] = useState(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const [showCancelModal, setShowCancelModal] = useState(false)

  
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)
  const [availableSlots, setAvailableSlots] = useState([])
  const [selectedNewSlot, setSelectedNewSlot] = useState('')


  
  const fetchDaycares = async () => {
    try {
      const response = await axiosInstance.get('/daycare/approved')
      setDaycares(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }


  const fetchChildren = async () => {
    try {
      const response = await axiosInstance.get('/child/myChildren')
      setChildren(response.data.data)
    } catch (error) {
      console.log(error)
    }
  }


  
  const fetchSlots = async (daycareId) => {
    try {
      const response = await axiosInstance.get(
        `/visitSlots/daycare/${daycareId}`
      )

      // Remove past dates
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const futureSlots = response.data.data.filter((slot) => {
        const slotDate = new Date(slot.date)
        slotDate.setHours(0, 0, 0, 0)

        return slotDate >= today && slot.status === 'available'
      })

      // Latest date first
      futureSlots.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )

      setSlots(futureSlots)

    } catch (error) {
      console.log(error)
    }
  }


  const fetchMyBookings = async () => {
    try {
      const response = await axiosInstance.get('/visitSlots/myBookings')

      // Optional frontend safety:
      // remove bookings whose visit date has already passed
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const futureBookings = response.data.data.filter((booking) => {
        const bookingDate = new Date(booking.date)
        bookingDate.setHours(0, 0, 0, 0)

        return bookingDate >= today
      })

      // Latest updated booking first
      futureBookings.sort((a, b) => {
        const dateA = new Date(a.updatedAt || a.createdAt)
        const dateB = new Date(b.updatedAt || b.createdAt)

        return dateB - dateA
      })

      setMyBookings(futureBookings)

    } catch (error) {
      console.log(error)
    }
  }


  const handleBook = async () => {

    if (!selectedSlot) return

    if (!selectedChild) {
      toast.warning('Please select a child')
      return
    }

    try {

      await axiosInstance.put(
        `/visitSlots/${selectedSlot._id}/book`,
        {
          childId: selectedChild
        }
      )

      toast.success('Visit booked successfully')

      setShowBookingModal(false)
      setSelectedSlot(null)
      setSelectedChild('')

      fetchSlots(selectedDaycare)
      fetchMyBookings()

    } catch (error) {

      console.log('BOOK ERROR:', error.response?.data)

      toast.error(
        error.response?.data?.message ||
        'Failed to book visit'
      )
    }
  }


  const handleCancelBooking = async () => {

    if (!selectedBooking) return

    try {

      await axiosInstance.put(
        `/visitSlots/${selectedBooking._id}/cancel`
      )

      toast.success(
        'Visit booking cancelled successfully'
      )

      setShowCancelModal(false)
      setShowDetailsModal(false)
      setSelectedBooking(null)

      fetchMyBookings()

      if (selectedDaycare) {
        fetchSlots(selectedDaycare)
      }

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to cancel booking'
      )
    }
  }


  
  const openRescheduleModal = async () => {

    if (!selectedBooking) return

    try {

      // Get all slots for the same daycare
      const response = await axiosInstance.get(
        `/visitSlots/daycare/${selectedBooking.daycare?._id || selectedBooking.daycare}`
      )

      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Only future and available slots
      const futureAvailableSlots = response.data.data.filter((slot) => {

        const slotDate = new Date(slot.date)
        slotDate.setHours(0, 0, 0, 0)

        return (
          slotDate >= today &&
          slot.status === 'available' &&
          slot._id !== selectedBooking._id
        )
      })

      // Latest date first
      futureAvailableSlots.sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      )

      setAvailableSlots(futureAvailableSlots)

      setSelectedNewSlot('')

      setShowDetailsModal(false)
      setShowRescheduleModal(true)

    } catch (error) {

      console.log(error)

      toast.error(
        error.response?.data?.message ||
        'Failed to load available slots'
      )
    }
  }


  
  const handleReschedule = async () => {

    if (!selectedNewSlot) {
      toast.warning('Please select a new slot')
      return
    }

    if (!selectedBooking) return

    try {

      await axiosInstance.patch(
        `/visitSlots/${selectedBooking._id}/reschedule`,
        {
          newSlotId: selectedNewSlot
        }
      )

      toast.success(
        'Visit rescheduled successfully'
      )

      setShowRescheduleModal(false)
      setSelectedBooking(null)
      setSelectedNewSlot('')

      

      if (selectedDaycare) {
        fetchSlots(selectedDaycare)
      }

    } catch (error) {

      console.log('RESCHEDULE ERROR:', error.response?.data)

      toast.error(
        error.response?.data?.message ||
        'Failed to reschedule visit'
      )
    }
  }


  useEffect(() => {

    fetchDaycares()
    fetchChildren()
    fetchMyBookings()

  }, [])


  
  useEffect(() => {

    if (selectedDaycare) {
      fetchSlots(selectedDaycare)
    } else {
      setSlots([])
    }

  }, [selectedDaycare])


  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">

      <div className="max-w-6xl mx-auto">

        {/* PAGE HEADER */}
        <div className="mb-8">
          <h1 className="text-2xl font-semibold font-baloo text-dc-ink">
            My Visits
          </h1>

          <p className="text-dc-muted mt-1 text-sm">
            Book and manage your daycare visits.
          </p>
        </div>


      

        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 mb-8 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">

          <h2 className="text-xl font-semibold font-baloo text-dc-ink mb-1">
            Available Visit Slots
          </h2>

          <p className="text-dc-muted mb-6 text-sm">
            Select a daycare to view available visit slots.
          </p>


          <div className="mb-6">

            <label className="block text-sm font-semibold text-dc-ink mb-2">
              Select Daycare
            </label>

            <select
              value={selectedDaycare}
              onChange={(e) => setSelectedDaycare(e.target.value)}
              className="w-full rounded-full border-[1.5px] border-dc-border bg-dc-field px-4 py-2.5 text-sm text-dc-ink outline-none focus:border-dc-blue transition appearance-none"
            >

              <option value="">
                Choose a daycare
              </option>

              {daycares.map((daycare) => (

                <option
                  key={daycare._id}
                  value={daycare._id}
                >
                  {daycare.name}
                </option>

              ))}

            </select>

          </div>


          {!selectedDaycare ? (

            <p className="text-dc-muted text-sm">
              Please select a daycare first.
            </p>

          ) : slots.length === 0 ? (

            <p className="text-dc-muted text-sm">
              No future slots available.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>

                  <tr className="border-b border-dc-border text-left text-dc-muted">

                    <th className="py-3 pr-4 font-semibold">
                      Date
                    </th>

                    <th className="py-3 pr-4 font-semibold">
                      Start Time
                    </th>

                    <th className="py-3 pr-4 font-semibold">
                      End Time
                    </th>

                    <th className="py-3 font-semibold">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {slots.map((slot) => (

                    <tr
                      key={slot._id}
                      className="border-b border-dc-border/60 last:border-0"
                    >

                      <td className="py-3 pr-4 text-dc-ink">

                        {new Date(slot.date).toLocaleDateString('en-GB')}

                      </td>

                      <td className="py-3 pr-4 text-dc-ink">
                        {slot.startTime}
                      </td>

                      <td className="py-3 pr-4 text-dc-ink">
                        {slot.endTime}
                      </td>

                      <td className="py-3">

                        <button
                          onClick={() => {

                            setSelectedSlot(slot)
                            setSelectedChild('')
                            setShowBookingModal(true)

                          }}
                          className="bg-dc-blue text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition"
                        >
                          Book
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =====================================================
            BOOKING MODAL
        ===================================================== */}

        {showBookingModal && selectedSlot && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-dc-ink/50 backdrop-blur-sm p-4">

            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)] w-full max-w-md">

              <div className="flex items-center justify-between p-6 border-b border-dc-border">

                <h2 className="text-xl font-semibold font-baloo text-dc-ink">
                  Book Visit
                </h2>

                <button
                  onClick={() => {

                    setShowBookingModal(false)
                    setSelectedSlot(null)
                    setSelectedChild('')

                  }}
                  className="text-dc-muted hover:text-dc-ink text-xl transition"
                >
                  ✕
                </button>

              </div>


              <div className="p-6 space-y-5">

                <div>

                  <h3 className="font-semibold font-baloo text-dc-blue mb-2">
                    Visit Details
                  </h3>

                  <div className="bg-dc-hover rounded-2xl p-4 space-y-2 text-sm text-dc-ink">

                    <p>
                      <strong>Date:</strong>{' '}
                      {new Date(selectedSlot.date).toLocaleDateString('en-GB')}
                    </p>

                    <p>
                      <strong>Time:</strong>{' '}
                      {selectedSlot.startTime} - {selectedSlot.endTime}
                    </p>

                  </div>

                </div>


                <div>

                  <label className="block text-sm font-semibold text-dc-ink mb-2">
                    Select Child
                  </label>

                  <select
                    value={selectedChild}
                    onChange={(e) => setSelectedChild(e.target.value)}
                    className="w-full rounded-full border-[1.5px] border-dc-border bg-dc-field px-4 py-2.5 text-sm text-dc-ink outline-none focus:border-dc-blue transition appearance-none"
                  >

                    <option value="">
                      Choose a child
                    </option>

                    {children.map((child) => (

                      <option
                        key={child._id}
                        value={child._id}
                      >
                        {child.name}
                      </option>

                    ))}

                  </select>

                </div>


                <div className="flex justify-end gap-3">

                  <button
                    onClick={() => {

                      setShowBookingModal(false)
                      setSelectedSlot(null)
                      setSelectedChild('')

                    }}
                    className="px-4 py-2 rounded-full border-[1.5px] border-dc-border text-dc-muted font-semibold text-sm hover:bg-dc-hover transition"
                  >
                    Cancel
                  </button>


                  <button
                    onClick={handleBook}
                    disabled={!selectedChild}
                    className="px-4 py-2 rounded-full bg-dc-blue text-white font-semibold text-sm hover:opacity-90 transition disabled:bg-dc-border disabled:text-dc-muted disabled:cursor-not-allowed"
                  >
                    Confirm Booking
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}


        {/* =====================================================
            MY BOOKINGS
        ===================================================== */}

        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">

          <div className="mb-6">

            <h2 className="text-xl font-semibold font-baloo text-dc-ink">
              My Booked Visits
            </h2>

            <p className="text-dc-muted mt-1 text-sm">
              View and manage your booked daycare visits.
            </p>

          </div>


          {myBookings.length === 0 ? (

            <div className="text-center py-8">

              <p className="text-dc-muted text-sm">
                You have no booked visits.
              </p>

            </div>

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-sm">

                <thead>

                  <tr className="border-b border-dc-border text-left text-dc-muted">

                    <th className="py-3 pr-4 font-semibold">
                      Daycare
                    </th>

                    <th className="py-3 pr-4 font-semibold">
                      Date
                    </th>

                    <th className="py-3 pr-4 font-semibold">
                      Start Time
                    </th>

                    <th className="py-3 pr-4 font-semibold">
                      End Time
                    </th>

                    <th className="py-3 pr-4 font-semibold">
                      Status
                    </th>

                    <th className="py-3 font-semibold">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {myBookings.map((booking) => (

                    <tr
                      key={booking._id}
                      className="border-b border-dc-border/60 last:border-0"
                    >

                      <td className="py-3 pr-4 text-dc-ink">
                        {booking.daycare?.name || 'Daycare'}
                      </td>

                      <td className="py-3 pr-4 text-dc-ink">
                        {new Date(booking.date).toLocaleDateString('en-GB')}
                      </td>

                      <td className="py-3 pr-4 text-dc-ink">
                        {booking.startTime}
                      </td>

                      <td className="py-3 pr-4 text-dc-ink">
                        {booking.endTime}
                      </td>


                      <td className="py-3 pr-4">

                        {booking.status === 'booked' && (

                          <span className="px-3 py-1 rounded-full bg-dc-green/15 text-dc-green text-xs font-semibold">
                            Booked
                          </span>

                        )}


                        {booking.status === 'reschedule_requested' && (

                          <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-semibold">
                            Reschedule Requested
                          </span>

                        )}


                        {booking.status === 'cancelled' && (

                          <span className="px-3 py-1 rounded-full bg-dc-error-bg text-dc-error-text text-xs font-semibold">
                            Cancelled
                          </span>

                        )}


                        {booking.status === 'completed' && (

                          <span className="px-3 py-1 rounded-full bg-dc-blue/15 text-dc-blue text-xs font-semibold">
                            Completed
                          </span>

                        )}

                      </td>


                      <td className="py-3">

                        <button
                          onClick={() => {

                            setSelectedBooking(booking)
                            setShowDetailsModal(true)

                          }}
                          className="bg-dc-blue text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition"
                        >
                          View
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </div>


        {/* =====================================================
            DETAILS MODAL
        ===================================================== */}

        {showDetailsModal && selectedBooking && (

          <div className="fixed inset-0 z-50 flex items-center justify-center bg-dc-ink/50 backdrop-blur-sm p-4">

            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)] w-full max-w-lg max-h-[90vh] overflow-y-auto">


              <div className="flex items-center justify-between p-6 border-b border-dc-border">

                <h2 className="text-xl font-semibold font-baloo text-dc-ink">
                  Visit Details
                </h2>

                <button
                  onClick={() => {

                    setShowDetailsModal(false)
                    setSelectedBooking(null)

                  }}
                  className="text-dc-muted hover:text-dc-ink text-xl transition"
                >
                  ✕
                </button>

              </div>


              <div className="p-6 space-y-6">


                {/* DAYCARE */}

                <div>

                  <h3 className="font-semibold font-baloo text-dc-blue mb-3">
                    Daycare Details
                  </h3>

                  <div className="bg-dc-hover rounded-2xl p-4 space-y-2 text-sm text-dc-ink">

                    <p>
                      <strong>Name:</strong>{' '}
                      {selectedBooking.daycare?.name || 'Not available'}
                    </p>

                    <p>
                      <strong>Address:</strong>{' '}
                      {selectedBooking.daycare?.address || 'Not available'}
                    </p>

                  </div>

                </div>


                {/* CHILD */}

                <div>

                  <h3 className="font-semibold font-baloo text-dc-blue mb-3">
                    Child Details
                  </h3>

                  <div className="bg-dc-hover rounded-2xl p-4 space-y-2 text-sm text-dc-ink">

                    <p>
                      <strong>Name:</strong>{' '}
                      {selectedBooking.child?.name || 'Not available'}
                    </p>

                    <p>
                      <strong>Date of Birth:</strong>{' '}

                      {selectedBooking.child?.dateOfBirth
                        ? new Date(
                            selectedBooking.child.dateOfBirth
                          ).toLocaleDateString('en-GB')
                        : 'Not available'}
                    </p>

                    <p>
                      <strong>Gender:</strong>{' '}
                      {selectedBooking.child?.gender || 'Not available'}
                    </p>

                  </div>

                </div>


                {/* VISIT */}

                <div>

                  <h3 className="font-semibold font-baloo text-dc-blue mb-3">
                    Visit Details
                  </h3>

                  <div className="bg-dc-hover rounded-2xl p-4 space-y-2 text-sm text-dc-ink">

                    <p>
                      <strong>Date:</strong>{' '}
                      {new Date(
                        selectedBooking.date
                      ).toLocaleDateString('en-GB')}
                    </p>

                    <p>
                      <strong>Time:</strong>{' '}
                      {selectedBooking.startTime} - {selectedBooking.endTime}
                    </p>

                    <p>
                      <strong>Status:</strong>{' '}

                      {selectedBooking.status === 'reschedule_requested'
                        ? 'Reschedule Requested'
                        : selectedBooking.status}

                    </p>

                  </div>

                </div>


                {/* ACTIONS */}

                <div className="flex justify-end gap-3 pt-2 flex-wrap">


                  {/* RESCHEDULE */}

                  {selectedBooking.status === 'reschedule_requested' && (

                    <button
                      onClick={openRescheduleModal}
                      className="bg-amber-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition"
                    >
                      Choose New Slot
                    </button>

                  )}


                  {/* CANCEL */}

                  {selectedBooking.status === 'booked' && (

                    <button
                      onClick={() => setShowCancelModal(true)}
                      className="bg-dc-error-text text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition"
                    >
                      Cancel Booking
                    </button>

                  )}


                  <button
                    onClick={() => {

                      setShowDetailsModal(false)
                      setSelectedBooking(null)

                    }}
                    className="border-[1.5px] border-dc-border text-dc-muted px-4 py-2 rounded-full text-sm font-semibold hover:bg-dc-hover transition"
                  >
                    Close
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}


        {/* =====================================================
            RESCHEDULE MODAL
        ===================================================== */}

        {showRescheduleModal && selectedBooking && (

          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-dc-ink/60 backdrop-blur-sm p-4">

            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)] w-full max-w-lg max-h-[90vh] overflow-y-auto">

              <div className="flex items-center justify-between p-6 border-b border-dc-border">

                <div>

                  <h2 className="text-xl font-semibold font-baloo text-dc-ink">
                    Select New Visit Slot
                  </h2>

                  <p className="text-sm text-dc-muted mt-1">
                    Choose a future available slot.
                  </p>

                </div>

                <button
                  onClick={() => {

                    setShowRescheduleModal(false)
                    setSelectedNewSlot('')

                  }}
                  className="text-dc-muted hover:text-dc-ink text-xl transition"
                >
                  ✕
                </button>

              </div>


              <div className="p-6">

                {availableSlots.length === 0 ? (

                  <p className="text-dc-muted text-sm text-center py-6">
                    No future slots are available for rescheduling.
                  </p>

                ) : (

                  <div className="space-y-3">

                    {availableSlots.map((slot) => (

                      <label
                        key={slot._id}
                        className={`flex items-center justify-between p-4 rounded-2xl border cursor-pointer transition ${
                          selectedNewSlot === slot._id
                            ? 'border-dc-blue bg-dc-blue/5'
                            : 'border-dc-border hover:bg-dc-hover'
                        }`}
                      >

                        <div>

                          <p className="font-semibold text-dc-ink">

                            {new Date(
                              slot.date
                            ).toLocaleDateString('en-GB')}

                          </p>

                          <p className="text-sm text-dc-muted">

                            {slot.startTime} - {slot.endTime}

                          </p>

                        </div>


                        <input
                          type="radio"
                          name="newSlot"
                          value={slot._id}
                          checked={selectedNewSlot === slot._id}
                          onChange={() =>
                            setSelectedNewSlot(slot._id)
                          }
                        />

                      </label>

                    ))}

                  </div>

                )}


                <div className="flex justify-end gap-3 mt-6">

                  <button
                    onClick={() => {

                      setShowRescheduleModal(false)
                      setSelectedNewSlot('')

                    }}
                    className="px-4 py-2 rounded-full border-[1.5px] border-dc-border text-dc-muted font-semibold text-sm hover:bg-dc-hover transition"
                  >
                    Cancel
                  </button>


                  <button
                    onClick={handleReschedule}
                    disabled={!selectedNewSlot}
                    className="px-4 py-2 rounded-full bg-dc-blue text-white font-semibold text-sm hover:opacity-90 transition disabled:bg-dc-border disabled:text-dc-muted disabled:cursor-not-allowed"
                  >
                    Confirm Reschedule
                  </button>

                </div>

              </div>

            </div>

          </div>

        )}


        {/* =====================================================
            CANCEL MODAL
        ===================================================== */}

        {showCancelModal && selectedBooking && (

          <div className="fixed inset-0 z-[70] flex items-center justify-center bg-dc-ink/60 backdrop-blur-sm p-4">

            <div className="bg-white rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)] w-full max-w-md p-6">

              <h2 className="text-xl font-semibold font-baloo text-dc-ink mb-3">
                Cancel Visit Booking?
              </h2>

              <p className="text-dc-muted mb-6 text-sm">
                Are you sure you want to cancel this visit booking?
              </p>


              <div className="flex justify-end gap-3">

                <button
                  onClick={() => setShowCancelModal(false)}
                  className="px-4 py-2 rounded-full border-[1.5px] border-dc-border text-dc-muted font-semibold text-sm hover:bg-dc-hover transition"
                >
                  Keep Booking
                </button>


                <button
                  onClick={handleCancelBooking}
                  className="px-4 py-2 rounded-full bg-dc-error-text text-white font-semibold text-sm hover:opacity-90 transition"
                >
                  Cancel Booking
                </button>

              </div>

            </div>

          </div>

        )}

      </div>

    </div>
  )
}

export default ParentVisitSlots