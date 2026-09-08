
import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { Link } from 'react-router-dom'
import { DAYCARE_STATUS } from '../../constants'
import { toast } from 'react-toastify'
import { statusStyles } from '../../constants/statusStyles'

const OwnerDaycare = () => {
  const [daycare, setDaycare] = useState(null)
  const [loading, setLoading] = useState(true)

  const [name, setName] = useState('')
  const [address, setAddress] = useState('')
  const [seatCapacity, setSeatCapacity] = useState('')
  const [facilities, setFacilities] = useState('')
  const [lng, setLng] = useState('')
  const [lat, setLat] = useState('')
  const [error, setError] = useState('')

  const [isEditing, setIsEditing] = useState(false)

  const fetchMyDaycare = async () => {
    try {
      const response = await axiosInstance.get('/daycare/getMyDaycare')

      const data = response.data.data

      setDaycare(data)

      setName(data.name)
      setAddress(data.address)
      setSeatCapacity(data.seatCapacity)
      setFacilities(data.facilities?.join(', ') || '')
      setLng(data.location.coordinates[0])
      setLat(data.location.coordinates[1])

    }
    catch (error) {
      console.log(error)
    }
    finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMyDaycare()
  }, [])

  const validateForm = () => {
    if (!name.trim()) {
      toast.warning('Daycare name is required')
      return false
    }
    if (name.trim().length < 3) {
      toast.warning('Daycare name must be at least 3 characters')
      return false
    }
    if (!address.trim()) {
      toast.warning('Address is required')
      return false
    }
    const seats = Number(seatCapacity)
    if (isNaN(seats)) {
      toast.warning('Seat capacity must be a number')
      return false
    }
    if (seats <= 0) {
      toast.warning('Seat capacity must be greater than 0')
      return false
    }
    if (lng === '' || lng === undefined || lat === '' || lat === undefined) {
      toast.warning('Location is required')
      return false
    }
    setError('')
    return true
  }

  const handleCreateDaycare = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await axiosInstance.post('/daycare/create', {
        name,
        address,
        seatCapacity: Number(seatCapacity),
        facilities: facilities.split(',').map((f) => f.trim()),
        location: { type: 'Point', coordinates: [Number(lng), Number(lat)] }
      })
      fetchMyDaycare()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create daycare')
    }
  }

  const handleUpdateDaycare = async () => {
    if (!validateForm()) return

    try {
      await axiosInstance.put('/daycare/update', {
        name,
        address,
        seatCapacity: Number(seatCapacity),
        facilities: facilities.split(',').map(f => f.trim()),
        location: {
          type: 'Point',
          coordinates: [Number(lng), Number(lat)]
        }
      })

      fetchMyDaycare()
      setIsEditing(false)

    }
    catch (error) {
      setError(error.response?.data?.message || 'Failed to update daycare')
    }
  }

  if (loading) return <p className="p-8 text-dc-muted">Loading...</p>

  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">
      <div className="max-w-3xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-semibold font-baloo text-dc-ink">My Daycare</h1>
          <p className="text-dc-muted text-sm mt-1">Manage your daycare profile</p>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 mb-6 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">
          {daycare ? (

            isEditing ? (
              <div>
                <h2 className="text-lg font-semibold font-baloo text-dc-ink mb-4">Edit Daycare</h2>

                {error && (
                  <p className="bg-dc-error-bg text-dc-error-text text-sm p-3 rounded-xl mb-4">
                    {error}
                  </p>
                )}

                <div className="space-y-3">
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                  />

                  <input
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                  />

                 <label className="block">
                      <span className="text-sm font-semibold text-dc-ink ml-2">
                        Seat Capacity
                      </span>

                      <input
                        type="number"
                        min="1"
                        value={seatCapacity}
                        onChange={(e) => setSeatCapacity(e.target.value)}
                        className="mt-1 w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                      />

                      {daycare && (
                        <span className="block text-xs text-dc-muted mt-1 ml-2">
                          {daycare.occupiedSeats} seats are currently occupied.
                        </span>
                      )}
                    </label>

                  <input
                    type="text"
                    value={facilities}
                    onChange={(e) => setFacilities(e.target.value)}
                    className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                  />

                  <div className="flex gap-2">
                    <input
                      type="number"
                      step="any"
                      value={lng}
                      onChange={(e) => setLng(e.target.value)}
                      className="w-1/2 rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                    />

                    <input
                      type="number"
                      step="any"
                      value={lat}
                      onChange={(e) => setLat(e.target.value)}
                      className="w-1/2 rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                    />
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleUpdateDaycare}
                      className="bg-gradient-to-br from-dc-blue to-dc-green text-white px-5 py-2 rounded-full font-semibold text-sm shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)] transition transform hover:scale-[1.02]"
                    >
                      Save Changes
                    </button>

                    <button
                      onClick={() => setIsEditing(false)}
                      className="bg-white text-dc-muted px-5 py-2 rounded-full font-semibold text-sm border-[1.5px] border-dc-border hover:bg-dc-hover transition"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-start mb-3">
                  <h2 className="text-lg font-semibold font-baloo text-dc-ink">
                    {daycare.name}
                  </h2>

                  <button
                    onClick={() => setIsEditing(true)}
                    className="bg-dc-blue text-white px-4 py-2 rounded-full text-sm font-semibold hover:opacity-90 transition"
                  >
                    Edit Profile
                  </button>
                </div>

                <span
                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    statusStyles[daycare.verificationStatus]
                  }`}
                >
                  {daycare.verificationStatus}
                </span>

                <p className="mt-3 text-dc-ink">{daycare.address}</p>

             <div className="mt-5 p-5 rounded-2xl bg-dc-mist border border-dc-border">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-dc-ink">
                      Seat Capacity
                    </p>

                    <p className="text-xs text-dc-muted mt-1">
                      Current daycare availability
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-2xl font-bold font-baloo text-dc-ink">
                      {daycare.availableSeats} / {daycare.seatCapacity}
                    </p>

                    <p className="text-xs text-dc-muted">
                      seats available
                    </p>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="w-full h-2 bg-white rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-dc-blue to-dc-green rounded-full"
                      style={{
                        width: `${Math.min(
                          100,
                          (daycare.availableSeats / daycare.seatCapacity) * 100
                        )}%`
                      }}
                    />
                  </div>
                </div>

                {daycare.availableSeats === 0 ? (
                  <p className="mt-3 text-sm font-semibold text-dc-error-text">
                    ⚠️ All seats are currently occupied
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-dc-muted">
                    {daycare.availableSeats} seat
                    {daycare.availableSeats !== 1 ? 's' : ''} currently available
                  </p>
                )}
              </div>
                <p className="text-dc-muted text-sm">
                  Facilities: {daycare.facilities?.join(', ')}
                </p>

                {daycare.totalReviews > 0 && (
                  <p className="text-dc-muted text-sm mt-1">
                    ⭐ {daycare.averageRating?.toFixed(1)} ({daycare.totalReviews} reviews)
                  </p>
                )}

                {daycare.verificationStatus === DAYCARE_STATUS.REJECTED && (
                  <div className="mt-4 bg-dc-error-bg border border-dc-error-text/30 p-4 rounded-2xl">
                    <h3 className="font-semibold text-dc-error-text">
                      Daycare Rejected
                    </h3>

                    <p className="text-sm mt-2 text-dc-ink">
                      {daycare.reason}
                    </p>
                  </div>
                )}
              </div>
            )
          ) : (
            <div>
              <h2 className="text-lg font-semibold font-baloo text-dc-ink mb-1">Create your daycare</h2>
              <p className="text-sm text-dc-muted mb-4">You haven't registered a daycare yet.</p>

              {error && <p className="bg-dc-error-bg text-dc-error-text text-sm p-3 rounded-xl mb-4">{error}</p>}

              <form onSubmit={handleCreateDaycare} className="space-y-3">
                <input
                  type="text"
                  placeholder="Daycare Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                />
                <input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                />
                <input
                  type="number"
                  placeholder="Seat Capacity"
                  value={seatCapacity}
                  onChange={(e) => setSeatCapacity(e.target.value)}
                  required
                  className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                />
                <input
                  type="text"
                  placeholder="Facilities (comma separated)"
                  value={facilities}
                  onChange={(e) => setFacilities(e.target.value)}
                  className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                />
                <div className="flex gap-2">
                  <input
                    type="number"
                    step="any"
                    placeholder="Longitude"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    required
                    className="w-1/2 rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                  />
                  <input
                    type="number"
                    step="any"
                    placeholder="Latitude"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    required
                    className="w-1/2 rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full text-white py-2.5 rounded-full font-semibold text-sm bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)] transition transform hover:scale-[1.02]"
                >
                  Create Daycare
                </button>
              </form>
            </div>
          )}
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">
          <h2 className="text-lg font-semibold font-baloo text-dc-ink">Visit Slot Management</h2>
          <p className="text-sm text-dc-muted mt-2">Create and manage daycare visit slots for parents.</p>
          <Link
            to="/owner/visitSlots"
            className="inline-block mt-4 bg-gradient-to-br from-dc-blue to-dc-green text-white px-5 py-2.5 rounded-full font-semibold text-sm shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)] transition transform hover:scale-[1.02]"
          >
            Manage Visit Slots
          </Link>
        </div>
      </div>
    </div>
  )
}

export default OwnerDaycare