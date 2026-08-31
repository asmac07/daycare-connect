import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'

const OwnerVisitSlots = () => {

  // Create slot states
  const [date, setDate] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')

  // Slot data
  const [slots, setSlots] = useState([])

  // Modal states
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [showRescheduleModal, setShowRescheduleModal] = useState(false)

  // Selected slot
  const [selectedSlot, setSelectedSlot] = useState(null)

  // Reschedule states
  const [rescheduleDate, setRescheduleDate] = useState('')
  const [rescheduleStartTime, setRescheduleStartTime] = useState('')
  const [rescheduleEndTime, setRescheduleEndTime] = useState('')

  const [showCancelModal, setShowCancelModal] = useState(false)
  const [cancelSlot, setCancelSlot] = useState(null)

  const fetchSlots = async () => {
    try {
      const response = await axiosInstance.get('/visitSlots/mySlots')
      setSlots(response.data.data)
    } catch (error) {
      console.log(error)
      toast.error(error.response?.data?.message || 'Failed to fetch visit slots')
    }
  }

  const validateForm = () => {
    if (!date) {
      toast.warning('Date is required')
      return false
    }
    if (!startTime) {
      toast.warning('Start time is required')
      return false
    }
    if (!endTime) {
      toast.warning('End time is required')
      return false
    }

    const selectedDate = new Date(date)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (selectedDate < today) {
      toast.warning('Date cannot be in the past')
      return false
    }
    if (startTime >= endTime) {
      toast.warning('Start time must be before end time')
      return false
    }
    return true
  }

  const createSlot = async () => {
    if (!validateForm()) return

    try {
      await axiosInstance.post('/visitSlots/visitSlot', { date, startTime, endTime })
      toast.success('Visit slot created successfully')
      setDate('')
      setStartTime('')
      setEndTime('')
      setShowCreateModal(false)
      fetchSlots()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create visit slot')
    }
  }

  const handleView = (slot) => {
    setSelectedSlot(slot)
    setShowDetailsModal(true)
  }

  const handleRescheduleOpen = () => {
    if (!selectedSlot) return

    setRescheduleDate(
      selectedSlot.date ? new Date(selectedSlot.date).toISOString().split('T')[0] : ''
    )
    setRescheduleStartTime(selectedSlot.startTime || '')
    setRescheduleEndTime(selectedSlot.endTime || '')
    setShowDetailsModal(false)
    setShowRescheduleModal(true)
  }

  const handleReschedule = async () => {
    if (!rescheduleDate) {
      toast.warning('Date is required')
      return
    }
    if (!rescheduleStartTime || !rescheduleEndTime) {
      toast.warning('Start time and end time are required')
      return
    }
    if (rescheduleStartTime >= rescheduleEndTime) {
      toast.warning('Start time must be before end time')
      return
    }

    try {
      await axiosInstance.put(`/visitSlots/${selectedSlot._id}/reschedule`, {
        date: rescheduleDate,
        startTime: rescheduleStartTime,
        endTime: rescheduleEndTime
      })
      toast.success('Visit rescheduled successfully')
      setShowRescheduleModal(false)
      setSelectedSlot(null)
      fetchSlots()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reschedule visit')
    }
  }

  const handleCancelBooking = async () => {
    if (!selectedSlot) return

    const confirmCancel = window.confirm('Are you sure you want to cancel this booking?')
    if (!confirmCancel) return

    try {
      await axiosInstance.put(`/visitSlots/${selectedSlot._id}/cancel-by-owner`)
      toast.success('Booking cancelled successfully')
      setShowDetailsModal(false)
      setSelectedSlot(null)
      fetchSlots()
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to cancel booking')
    }
  }

  const handleCompleteVisit = async (id) => {
      try {

        await axiosInstance.put(
          `/visitSlots/${id}/complete`
        )

        toast.success('Visit marked as completed')

        fetchSlots()

      } catch (error) {

        toast.error(
          error.response?.data?.message ||
          'Failed to mark visit as completed'
        )
      }
 }

  useEffect(() => {
    fetchSlots()
  }, [])

  return (

    <div className="space-y-8 font-nunito">

      {/* PAGE TITLE */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold font-baloo text-dc-ink">
            Visit Slot Management
          </h1>
          <p className="text-sm text-dc-muted mt-1">
            Create and manage your daycare visit slots.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-gradient-to-br from-dc-blue to-dc-green text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)] transition transform hover:scale-[1.02]"
        >
          + Create Slot
        </button>
      </div>

      
      <div className="bg-white/90 backdrop-blur-sm p-6 rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">
        <h2 className="text-xl font-semibold font-baloo text-dc-ink mb-5">
          My Visit Slots
        </h2>

        {slots.length === 0 ? (
          <p className="text-dc-muted text-sm">No visit slots created.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-dc-border text-left text-dc-muted">
                  <th className="py-3 pr-4 font-semibold">Date</th>
                  <th className="py-3 pr-4 font-semibold">Start</th>
                  <th className="py-3 pr-4 font-semibold">End</th>
                  <th className="py-3 pr-4 font-semibold">Parent</th>
                  <th className="py-3 pr-4 font-semibold">Status</th>
                  <th className="py-3 font-semibold">Action</th>
                </tr>
              </thead>

              <tbody>
                {slots.map((slot) => (
                  <tr key={slot._id} className="border-b border-dc-border/60 last:border-0">
                    <td className="py-4 pr-4 text-dc-ink">

                      {new Date(slot.date).toLocaleDateString()}

                    </td>
                    <td className="py-4 pr-4 text-dc-ink">{slot.startTime}</td>
                    <td className="py-4 pr-4 text-dc-ink">{slot.endTime}</td>
                    <td className="py-4 pr-4 text-dc-ink">

                      {slot.bookedBy?.name || <span className="text-dc-muted">Not booked</span>}

                    </td>
                    <td className="py-4 pr-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          slot.status === 'booked'

                            ? 'bg-dc-blue/15 text-dc-blue'

                            : slot.status === 'cancelled'

                            ? 'bg-dc-error-bg text-dc-error-text'

                            : slot.status === 'completed'

                            ? 'bg-dc-green/15 text-dc-green'
                            
                            : 'bg-dc-hover text-dc-muted'
                        }`}
                      >
                        {slot.status}
                      </span>
                    </td>
                    {/* <td className="py-4">
                      {slot.status === 'booked' ? (
                        <button
                          onClick={() => handleView(slot)}
                          className="bg-dc-blue text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition"
                        >
                          View
                        </button>
                      ) : (
                        <span className="text-dc-muted text-xs">No booking</span>
                      )}
                    </td> */}

                    <td className="py-4">
                          {slot.status === 'booked' ? (
                            <div className="flex items-center gap-2">

                              {/* View Details */}
                              <button
                                onClick={() => handleView(slot)}
                                className="bg-dc-blue text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition"
                              >
                                View
                              </button>

                              {/* Mark Completed */}
                              <button
                                onClick={() => handleCompleteVisit(slot._id)}
                                className="bg-dc-green text-white px-4 py-1.5 rounded-full text-xs font-semibold hover:opacity-90 transition"
                              >
                                Complete
                              </button>

                            </div>
                          ) : slot.status === 'completed' ? (
                            <span className="text-dc-green text-xs font-semibold">
                              Completed
                            </span>
                          ) : (
                            <span className="text-dc-muted text-xs">
                              No booking
                            </span>
                          )}
                        </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* create slot modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dc-ink/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)] p-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold font-baloo text-dc-ink">Create Visit Slot</h2>
                <p className="text-sm text-dc-muted mt-1">Add a date and time for parent visits.</p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-dc-muted hover:text-dc-ink text-xl transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dc-ink mb-2">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full rounded-full border-[1.5px] border-dc-border bg-dc-field px-4 py-2.5 text-sm text-dc-ink outline-none focus:border-dc-blue transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dc-ink mb-2">Start Time</label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full rounded-full border-[1.5px] border-dc-border bg-dc-field px-4 py-2.5 text-sm text-dc-ink outline-none focus:border-dc-blue transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dc-ink mb-2">End Time</label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full rounded-full border-[1.5px] border-dc-border bg-dc-field px-4 py-2.5 text-sm text-dc-ink outline-none focus:border-dc-blue transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-7">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2 rounded-full border-[1.5px] border-dc-border text-dc-muted font-semibold text-sm hover:bg-dc-hover transition"
              >
                Close
              </button>
              <button
                onClick={createSlot}
                className="px-5 py-2 rounded-full bg-gradient-to-br from-dc-blue to-dc-green text-white font-semibold text-sm shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)] transition transform hover:scale-[1.02]"
              >
                Create Slot
              </button>
            </div>
          </div>
        </div>
      )}

      {/* book details modal*/}
      {showDetailsModal && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dc-ink/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-xl rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)] p-6 max-h-[90vh] overflow-y-auto">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-xl font-semibold font-baloo text-dc-ink">Visit Booking Details</h2>
                <p className="text-sm text-dc-muted mt-1">Parent and child information</p>
              </div>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedSlot(null)
                }}
                className="text-dc-muted hover:text-dc-ink text-xl transition"
              >
                ✕
              </button>
            </div>

            {/* parent*/}
            <div className="border-[1.5px] border-dc-border rounded-2xl p-4 mb-4">
              <h3 className="font-semibold font-baloo text-dc-blue mb-3">Parent Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-dc-muted">Name</p>
                  <p className="font-semibold text-dc-ink">{selectedSlot.bookedBy?.name || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-dc-muted">Email</p>
                  <p className="font-semibold text-dc-ink break-all">{selectedSlot.bookedBy?.email || 'Not available'}</p>
                </div>
                <div>
                  <p className="text-dc-muted">Phone</p>
                  <p className="font-semibold text-dc-ink">{selectedSlot.bookedBy?.phone || 'Not provided'}</p>
                </div>
              </div>
            </div>

            {/* child detail*/}
            <div className="border-[1.5px] border-dc-border rounded-2xl p-4 mb-4">
              <h3 className="font-semibold font-baloo text-dc-blue mb-3">Child Details</h3>

              {selectedSlot.child ? (
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-dc-muted">Name</p>
                    <p className="font-semibold text-dc-ink">{selectedSlot.child.name}</p>
                  </div>
                  <div>
                    <p className="text-dc-muted">Gender</p>
                    <p className="font-semibold text-dc-ink">{selectedSlot.child.gender || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-dc-muted">Date of Birth</p>
                    <p className="font-semibold text-dc-ink">
                      {selectedSlot.child.dateOfBirth
                        ? new Date(selectedSlot.child.dateOfBirth).toLocaleDateString()
                        : 'Not provided'}
                    </p>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-dc-muted">Child details are not available for this booking.</p>
              )}
            </div>

            {/* visit details */}
            <div className="border-[1.5px] border-dc-border rounded-2xl p-4 mb-6">
              <h3 className="font-semibold font-baloo text-dc-blue mb-3">Visit Details</h3>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-dc-muted">Date</p>
                  <p className="font-semibold text-dc-ink">{new Date(selectedSlot.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-dc-muted">Time</p>
                  <p className="font-semibold text-dc-ink">{selectedSlot.startTime} - {selectedSlot.endTime}</p>
                </div>
                <div>
                  <p className="text-dc-muted">Status</p>
                  <p className="font-semibold text-dc-ink capitalize">{selectedSlot.status}</p>
                </div>
              </div>
            </div>

            
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancelBooking}
                className="px-4 py-2 rounded-full bg-dc-error-text text-white text-sm font-semibold hover:opacity-90 transition"
              >
                Cancel Booking
              </button>
              <button
                onClick={handleRescheduleOpen}
                className="px-4 py-2 rounded-full bg-amber-500 text-white text-sm font-semibold hover:opacity-90 transition"
              >
                Reschedule
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedSlot(null)
                }}
                className="px-4 py-2 rounded-full border-[1.5px] border-dc-border text-dc-muted text-sm font-semibold hover:bg-dc-hover transition"
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* reschedule modal */}
      {showRescheduleModal && selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dc-ink/50 backdrop-blur-sm p-4">
          <div className="bg-white w-full max-w-md rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)] p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-semibold font-baloo text-dc-ink">Reschedule Visit</h2>
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="text-dc-muted hover:text-dc-ink text-xl transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-dc-ink mb-2">New Date</label>
                <input
                  type="date"
                  value={rescheduleDate}
                  onChange={(e) => setRescheduleDate(e.target.value)}
                  className="w-full rounded-full border-[1.5px] border-dc-border bg-dc-field px-4 py-2.5 text-sm text-dc-ink outline-none focus:border-dc-blue transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dc-ink mb-2">New Start Time</label>
                <input
                  type="time"
                  value={rescheduleStartTime}
                  onChange={(e) => setRescheduleStartTime(e.target.value)}
                  className="w-full rounded-full border-[1.5px] border-dc-border bg-dc-field px-4 py-2.5 text-sm text-dc-ink outline-none focus:border-dc-blue transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-dc-ink mb-2">New End Time</label>
                <input
                  type="time"
                  value={rescheduleEndTime}
                  onChange={(e) => setRescheduleEndTime(e.target.value)}
                  className="w-full rounded-full border-[1.5px] border-dc-border bg-dc-field px-4 py-2.5 text-sm text-dc-ink outline-none focus:border-dc-blue transition"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-7">
              <button
                onClick={() => setShowRescheduleModal(false)}
                className="px-5 py-2 rounded-full border-[1.5px] border-dc-border text-dc-muted font-semibold text-sm hover:bg-dc-hover transition"
              >
                Close
              </button>
              <button
                onClick={handleReschedule}
                className="px-5 py-2 rounded-full bg-amber-500 text-white font-semibold text-sm hover:opacity-90 transition"
              >
                Reschedule
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}

export default OwnerVisitSlots