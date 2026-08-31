import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'

const StaffDashboard = () => {
  const [daycare, setDaycare] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance
      .get('/staff/myDaycare')
      .then((res) => setDaycare(res.data.data))
      .catch((err) => console.log(err))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <p className="p-8 text-dc-muted">Loading...</p>
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">
      <div className="max-w-3xl mx-auto">

        {/* Welcome */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold font-baloo text-dc-ink">
            Welcome to Staff Dashboard
          </h1>

          <p className="text-dc-muted mt-2 text-sm">
            Manage your assigned children and daycare activities.
          </p>
        </div>

        {/* Daycare */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] border border-white/60 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] p-6">

          <div className="flex items-start justify-between mb-6">

            <div className="flex items-center gap-4">

              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center flex-shrink-0 shadow-[0_8px_20px_-6px_rgba(74,144,164,0.5)]">
                <svg width="22" height="22" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 20L20 8L34 20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M10 18V31C10 31.5523 10.4477 32 11 32H29C29.5523 32 30 31.5523 30 31V18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M20 27.5C20 27.5 15.5 24.8 15.5 21.7C15.5 20.1 16.7 19 18.1 19C19 19 19.7 19.4 20 20.1C20.3 19.4 21 19 21.9 19C23.3 19 24.5 20.1 24.5 21.7C24.5 24.8 20 27.5 20 27.5Z" fill="white" />
                </svg>
              </div>

              <div>
                <h2 className="text-xl font-semibold font-baloo text-dc-ink">
                  {daycare?.name}
                </h2>

                <p className="text-sm text-dc-muted mt-1">
                  Your assigned daycare
                </p>
              </div>

            </div>

            <span className="bg-dc-green/15 text-dc-green px-3 py-1 rounded-full text-xs font-semibold">
              {daycare?.verificationStatus}
            </span>

          </div>

          <div className="border-t border-dc-border pt-5">
            <p className="text-sm text-dc-muted mb-1">Location</p>
            <p className="text-sm font-semibold text-dc-ink">{daycare?.address}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-5">

            <div className="bg-dc-hover rounded-xl p-4">
              <p className="text-xs text-dc-muted">Available Seats</p>
              <p className="text-xl font-bold text-dc-blue mt-1">{daycare?.seatsAvailable}</p>
            </div>

            <div className="bg-dc-hover rounded-xl p-4">
              <p className="text-xs text-dc-muted">Total Seats</p>
              <p className="text-xl font-bold text-dc-ink mt-1">{daycare?.seatCapacity}</p>
            </div>

          </div>

          {daycare?.facilities?.length > 0 && (
            <div className="mt-5">
              <p className="text-xs text-dc-muted mb-2">Facilities</p>
              <div className="flex flex-wrap gap-2">
                {daycare.facilities.map((facility, index) => (
                  <span
                    key={index}
                    className="bg-dc-field border-[1.5px] border-dc-border text-dc-ink px-3 py-1.5 rounded-full text-xs font-medium"
                  >
                    {facility}
                  </span>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

export default StaffDashboard