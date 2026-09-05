
import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'

const ParentSearch = () => {
  // Enrollment states
  const [selectedDaycare, setSelectedDaycare] = useState(null)
  const [children, setChildren] = useState([])
  const [selectedChild, setSelectedChild] = useState('')
  const [ageGroup, setAgeGroup] = useState('')
  const [packageType, setPackageType] = useState('')
  const [enrolling, setEnrolling] = useState(false)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  // Daycare states
  const [daycares, setDaycares] = useState([])
  const [loading, setLoading] = useState(false)

  // Pagination
  const [page, setPage] = useState(1)
  const limit = 5
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)

  // Location
  const [location, setLocation] = useState(null)

  const getUserLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser')
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude
        })
      },
      (error) => {
        console.error('Location error:', error)
        toast.error('Please allow location access to find nearby daycares')
      }
    )
  }

  const fetchNearbyDaycares = async () => {
    if (!location) return

    try {
      setLoading(true)

      const response = await axiosInstance.get('/daycare/search', {
        params: { lat: location.lat, lng: location.lng, page, limit }
      })

      const data = response.data
      setDaycares(data.data || [])
      setTotal(data.total || 0)
      setTotalPages(data.totalPages || 1)

    } catch (error) {
      console.error('Failed to fetch nearby daycares:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch nearby daycares')
    } finally {
      setLoading(false)
    }
  }

  const fetchChildren = async () => {
    try {
      const response = await axiosInstance.get('/child/myChildren')
      setChildren(response.data.data || [])
    } catch (error) {
      console.error('Failed to fetch children:', error)
      toast.error(error.response?.data?.message || 'Failed to fetch children')
    }
  }

  useEffect(() => {
    getUserLocation()
    fetchChildren()
  }, [])

  useEffect(() => {
    fetchNearbyDaycares()
  }, [location, page])

  const getGoogleMapsLink = (daycare) => {
    if (!daycare.location?.coordinates) return '#'
    const [lng, lat] = daycare.location.coordinates
    return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  }

  const handleEnroll = (daycare) => {
    setSelectedDaycare(daycare)
    setSelectedChild('')
    setAgeGroup('')
    setPackageType('')
  }

  const closeEnrollmentModal = () => {
    if (enrolling) return
    setSelectedDaycare(null)
    setSelectedChild('')
    setAgeGroup('')
    setPackageType('')
  }

  const handleEnrollmentSubmit = async (e) => {
    e.preventDefault()

    if (!selectedDaycare) {
      toast.error('Please select a daycare')
      return
    }
    if (!selectedChild) {
      toast.warning('Please select a child')
      return
    }
    if (!ageGroup) {
      toast.warning('Please select age group')
      return
    }
    if (!packageType) {
      toast.warning('Please select a package')
      return
    }

      if (!startDate) {
        toast.warning('Please select a start date')
        return
      }

      if (!endDate) {
        toast.warning('Please select an end date')
        return
      }

      if (new Date(endDate) < new Date(startDate)) {
        toast.warning('End date cannot be before start date')
        return
      }

    try {
      setEnrolling(true)

      const response = await axiosInstance.post('/enrollment/enrollmentRequest', {
        child: selectedChild,
        daycare: selectedDaycare._id,
        ageGroup,
        package: packageType,
        startDate,
        endDate
      })

      toast.success(response.data.message || 'Enrollment request submitted successfully')

      setSelectedDaycare(null)
      setSelectedChild('')
      setAgeGroup('')
      setPackageType('')
      setStartDate('')
      setEndDate('')

    } catch (error) {
      console.error('Enrollment request error:', error)
      toast.error(error.response?.data?.message || 'Failed to submit enrollment request')
    } finally {
      setEnrolling(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">
      <div className="max-w-6xl mx-auto">

        {/* HEADER */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold font-baloo text-dc-ink">Nearby Daycares</h1>
          <p className="text-sm text-dc-muted mt-1">Find approved daycares near your location.</p>
        </div>

        {location && (
          <div className="bg-white/90 rounded-2xl p-4 mb-6 shadow-sm">
            <div className="text-sm text-dc-muted">📍 Location detected</div>
          </div>
        )}

        {/* lOADING */}
        {loading && (
          <div className="text-center py-10">
            <p className="text-dc-muted">Finding nearby daycares...</p>
          </div>
        )}

        {/* NO DATA */}
        {!loading && daycares.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center">
            <p className="text-dc-muted">No nearby daycares found.</p>
          </div>
        )}

        {/* DAYCARE LIST */}
        {!loading && daycares.length > 0 && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {daycares.map((daycare) => (
                <div
                  key={daycare._id}
                  className="bg-white rounded-[2rem] p-6 shadow-[0_15px_40px_-15px_rgba(74,144,164,0.2)] border border-white"
                >
                  <div className="mb-4">
                    <h2 className="text-xl font-semibold font-baloo text-dc-ink">{daycare.name}</h2>
                    <p className="text-sm text-dc-muted">
                      {daycare.location?.address || daycare.location?.city || 'Location not available'}
                    </p>
                  </div>

                  <div className="flex items-center gap-2 mb-4">
                    <span className="text-yellow-500">⭐</span>
                    <span className="font-semibold text-dc-ink">
                      {daycare.averageRating ? Number(daycare.averageRating).toFixed(1) : 'No rating'}
                    </span>
                    {daycare.totalReviews !== undefined && (
                      <span className="text-sm text-dc-muted">({daycare.totalReviews} reviews)</span>
                    )}
                  </div>

                  <div className="space-y-2 text-sm text-dc-muted mb-5">
                    {daycare.description && (
                      <p><strong className="text-dc-ink">About:</strong> {daycare.description}</p>
                    )}
                    {daycare.phone && (
                      <p><strong className="text-dc-ink">Phone:</strong> {daycare.phone}</p>
                    )}
                    {daycare.email && (
                      <p><strong className="text-dc-ink">Email:</strong> {daycare.email}</p>
                    )}
                    {daycare.capacity !== undefined && (
                      <p><strong className="text-dc-ink">Capacity:</strong> {daycare.capacity}</p>
                    )}
                    {daycare.availableSeats !== undefined && (
                      <p><strong className="text-dc-ink">Available Seats:</strong> {daycare.availableSeats}</p>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-3">
                    
                    <a href={getGoogleMapsLink(daycare)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-full bg-dc-hover text-dc-ink text-sm font-semibold hover:bg-dc-border/40 transition"
                    >
                      📍 View on Map
                    </a>

                    <button
                      type="button"
                      onClick={() => handleEnroll(daycare)}
                      className="px-5 py-2 rounded-full bg-gradient-to-br from-dc-blue to-dc-green text-white text-sm font-semibold hover:opacity-90 transition"
                    >
                      Enroll
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* PAGINATION */}
            <div className="flex justify-between items-center mt-8 bg-white rounded-2xl p-4">
              <button
                type="button"
                onClick={() => setPage((prev) => prev - 1)}
                disabled={page === 1}
                className="px-5 py-2 rounded-full bg-dc-hover text-dc-ink text-sm font-semibold disabled:opacity-40 transition"
              >
                ← Previous
              </button>

              <div className="text-sm text-dc-muted">
                Page <strong className="text-dc-ink">{page}</strong> of <strong className="text-dc-ink">{totalPages}</strong>
                <span className="ml-2">({total} daycares)</span>
              </div>

              <button
                type="button"
                onClick={() => setPage((prev) => prev + 1)}
                disabled={page >= totalPages}
                className="px-5 py-2 rounded-full bg-dc-blue text-white text-sm font-semibold disabled:opacity-40 transition"
              >
                Next →
              </button>
            </div>
          </>
        )}
      </div>

      {/* ENROLLMENT MODAL */}
      {selectedDaycare && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-dc-ink/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-lg bg-white rounded-[2rem] p-6 shadow-2xl">

            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="text-xl font-semibold font-baloo text-dc-ink">Enroll Your Child</h2>
                <p className="text-sm text-dc-muted mt-1">{selectedDaycare.name}</p>
              </div>

              <button
                type="button"
                onClick={closeEnrollmentModal}
                disabled={enrolling}
                className="w-9 h-9 rounded-full bg-dc-hover text-dc-muted hover:bg-dc-border/40 disabled:opacity-50 transition"
              >
                ✕
              </button>
            </div>

            <div className="bg-dc-field rounded-2xl p-4 mb-5 text-dc-ink">
              <p className="text-sm"><strong>Daycare:</strong> {selectedDaycare.name}</p>
              <p className="text-sm mt-1">
                <strong>Rating:</strong> ⭐ {selectedDaycare.averageRating ? Number(selectedDaycare.averageRating).toFixed(1) : 'No rating'}
              </p>
              <p className="text-sm mt-1">
                <strong>Available Seats:</strong> {selectedDaycare.availableSeats ?? selectedDaycare.seatsAvailable ?? 'Not available'}
              </p>
            </div>

            <form onSubmit={handleEnrollmentSubmit} className="space-y-4">

              <div>
                <label className="block text-sm font-semibold text-dc-ink mb-2">Select Child</label>
                <select
                  value={selectedChild}
                  onChange={(e) => setSelectedChild(e.target.value)}
                  disabled={enrolling}
                  className="w-full rounded-full px-4 py-3 border-[1.5px] border-dc-border bg-white text-sm text-dc-ink outline-none focus:border-dc-blue disabled:bg-dc-hover transition"
                >
                  <option value="">Select your child</option>
                  {children.map((child) => (
                    <option key={child._id} value={child._id}>{child.name}</option>
                  ))}
                </select>

                {children.length === 0 && (
                  <p className="text-xs text-dc-error-text mt-2">
                    No children found. Please add a child first.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-dc-ink mb-2">Age Group</label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  disabled={enrolling}
                  className="w-full rounded-full px-4 py-3 border-[1.5px] border-dc-border bg-white text-sm text-dc-ink outline-none focus:border-dc-blue disabled:bg-dc-hover transition"
                >
                  <option value="">Select age group</option>
                  <option value="Infant">Infant</option>
                  <option value="Toddler">Toddler</option>
                  <option value="Preschool">Preschool</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-dc-ink mb-2">Select Package</label>
                <select
                  value={packageType}
                  onChange={(e) => setPackageType(e.target.value)}
                  disabled={enrolling}
                  className="w-full rounded-full px-4 py-3 border-[1.5px] border-dc-border bg-white text-sm text-dc-ink outline-none focus:border-dc-blue disabled:bg-dc-hover transition"
                >
                  <option value="">Select package</option>
                  <option value="daily">1 Day - ₹300</option>
                  <option value="weekly">1 Week - ₹1000</option>
                  <option value="monthly">1 Month - ₹5500</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

                {/* Start Date */}
                <div>
                  <label className="block text-sm font-semibold text-dc-ink mb-2">
                    Start Date
                  </label>

                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={enrolling}
                    className="w-full rounded-full px-4 py-3 border-[1.5px] border-dc-border bg-white text-sm text-dc-ink outline-none focus:border-dc-blue disabled:bg-dc-hover transition"
                  />
                </div>


                {/* End Date */}
                <div>
                  <label className="block text-sm font-semibold text-dc-ink mb-2">
                    End Date
                  </label>

                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || new Date().toISOString().split('T')[0]}
                    disabled={enrolling}
                    className="w-full rounded-full px-4 py-3 border-[1.5px] border-dc-border bg-white text-sm text-dc-ink outline-none focus:border-dc-blue disabled:bg-dc-hover transition"
                  />
                </div>

              </div>

              <div className="flex justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={closeEnrollmentModal}
                  disabled={enrolling}
                  className="px-5 py-2 rounded-full border-[1.5px] border-dc-border text-sm font-semibold text-dc-muted disabled:opacity-50 hover:bg-dc-hover transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={enrolling || children.length === 0}
                  className="px-6 py-2 rounded-full bg-gradient-to-br from-dc-blue to-dc-green text-white text-sm font-semibold disabled:opacity-50 transition"
                >
                  {enrolling ? 'Submitting...' : 'Submit Enrollment'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default ParentSearch