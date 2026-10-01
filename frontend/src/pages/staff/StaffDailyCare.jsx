
import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'
import {
  Search,
  ClipboardCheck,
  Coffee,
  UtensilsCrossed,
  Moon,
  Palette,
  CalendarCheck
} from 'lucide-react'

const StaffDailyCare = () => {
  const [children, setChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [careData, setCareData] = useState({})

  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 6

  const fetchChildren = async () => {
    try {
      setLoading(true)

      const response = await axiosInstance.get('/staff/daily-care/children')

      const data = response.data.data || []

      setChildren(data)

      const initialCareData = {}

      data.forEach((enrollment) => {
        //check in backend, the enrollmnt data is alrdy existed
        const savedUpdate = enrollment.dailyCareUpdate

        initialCareData[enrollment._id] = {
          attendance: savedUpdate?.attendance || 'Present',
          breakfast: savedUpdate?.breakfast || 'Not Done',
          lunch: savedUpdate?.lunch || 'Not Done',
          nap: savedUpdate?.nap || 'Not Done',
          activity: savedUpdate?.activity || 'Not Done'
        }
      })

      setCareData(initialCareData)

    } catch (error) {
      console.error('Failed to fetch daily care children:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChildren()
  }, [])

  const handleChange = (enrollmentId, field, value) => {
    setCareData((prev) => ({
      ...prev,
      [enrollmentId]: {
        ...prev[enrollmentId],
        [field]: value
      }
    }))
  }

  const handleSave = async (enrollmentId) => {
    try {
      const care = careData[enrollmentId]

      const response = await axiosInstance.post(
        '/staff/daily-care/update',
        {
          enrollmentId,
          ...care
        }
      )

      toast.success(response.data.message)

    } catch (error) {
      console.error('Failed to save daily care:', error)

      toast.error(
        error.response?.data?.message || 'Failed to save daily care'
      )
    }
  }

  const filteredChildren = children.filter((enrollment) =>
    enrollment.child?.name
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(
    filteredChildren.length / itemsPerPage
  )

  const startIndex = (currentPage - 1) * itemsPerPage

  const currentChildren = filteredChildren.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const careFields = [
    {
      key: 'attendance',
      label: 'Attendance',
      icon: ClipboardCheck,
      options: ['Present', 'Absent']
    },
    {
      key: 'breakfast',
      label: 'Breakfast',
      icon: Coffee,
      options: ['Done', 'Not Done']
    },
    {
      key: 'lunch',
      label: 'Lunch',
      icon: UtensilsCrossed,
      options: ['Done', 'Not Done']
    },
    {
      key: 'nap',
      label: 'Nap',
      icon: Moon,
      options: ['Done', 'Not Done']
    },
    {
      key: 'activity',
      label: 'Activity',
      icon: Palette,
      options: ['Done', 'Not Done']
    }
  ]

  if (loading) {
    return (
      <p className="text-dc-muted">
        Loading...
      </p>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold font-baloo text-dc-ink">
          Daily Care
        </h1>

        <p className="text-sm text-dc-muted mt-1">
          Update today's care activities for assigned children.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-dc-muted">
            <Search size={16} strokeWidth={2.2} />
          </span>

          <input
            type="text"
            value={searchTerm}
            onChange={handleSearch}
            placeholder="Search child by name..."
            className="w-full bg-white/90 border-[1.5px] border-dc-border rounded-full pl-11 pr-4 py-3 text-sm text-dc-ink outline-none focus:border-dc-blue transition"
          />
        </div>
      </div>

      {filteredChildren.length === 0 ? (
        <div className="bg-white/90 rounded-[2rem] p-10 text-center border border-white/60 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center mx-auto mb-3 rotate-3 shadow-[0_8px_20px_-6px_rgba(74,144,164,0.5)]">
            <CalendarCheck
              size={24}
              strokeWidth={2}
              className="text-white"
            />
          </div>

          <p className="text-sm text-dc-muted">
            {searchTerm
              ? 'No child found.'
              : 'No active children assigned to you today.'}
          </p>
        </div>
      ) : (
        <>
          {/* Children Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

            {currentChildren.map((enrollment) => {
              const care = careData[enrollment._id]

              return (
                <div
                  key={enrollment._id}
                  className="bg-white/90 rounded-[1.5rem] p-5 border border-white/60 shadow-[0_15px_40px_-15px_rgba(74,144,164,0.2)]"
                >

                  {/* Child */}
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center flex-shrink-0 text-white font-bold font-baloo text-sm">
                      {enrollment.child?.name?.charAt(0).toUpperCase() || 'C'}
                    </div>

                    <div>
                      <h2 className="text-base font-semibold font-baloo text-dc-ink leading-tight">
                        {enrollment.child?.name}
                      </h2>

                      <p className="text-xs text-dc-muted mt-0.5">
                        {enrollment.child?.gender || 'N/A'}
                      </p>
                    </div>
                  </div>

                  {/* Care fields */}
                  <div className="space-y-3">

                    {careFields.map(
                      ({ key, label, icon: Icon, options }) => (
                        <div key={key}>

                          <label className="flex items-center gap-1.5 text-xs font-semibold text-dc-ink mb-1">
                            <Icon
                              size={13}
                              strokeWidth={2.3}
                              className="text-dc-blue"
                            />
                            {label}
                          </label>

                          <select
                            value={care?.[key] || options[1]}
                            onChange={(e) =>
                              handleChange(
                                enrollment._id,
                                key,
                                e.target.value
                              )
                            }
                            className="w-full rounded-full border-[1.5px] border-dc-border bg-dc-field px-3 py-2 text-sm text-dc-ink outline-none focus:border-dc-blue transition appearance-none"
                          >
                            {options.map((opt) => (
                              <option key={opt} value={opt}>
                                {opt}
                              </option>
                            ))}
                          </select>

                        </div>
                      )
                    )}

                  </div>

                  {/* Save */}
                  <button
                    onClick={() => handleSave(enrollment._id)}
                    className="w-full mt-4 bg-gradient-to-br from-dc-blue to-dc-green text-white py-2.5 rounded-full text-xs font-semibold hover:opacity-90 transition transform hover:scale-[1.02]"
                  >
                    Save Update
                  </button>

                </div>
              )
            })}

          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 mt-8">

              <button
                onClick={() =>
                  setCurrentPage((prev) => prev - 1)
                }
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-white border-[1.5px] border-dc-border text-dc-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dc-hover transition"
              >
                Previous
              </button>

              <span className="text-sm font-semibold text-dc-ink">
                Page {currentPage} of {totalPages}
              </span>

              <button
                onClick={() =>
                  setCurrentPage((prev) => prev + 1)
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-full text-sm font-semibold bg-white border-[1.5px] border-dc-border text-dc-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dc-hover transition"
              >
                Next
              </button>

            </div>
          )}

        </>
      )}

    </div>
  )
}

export default StaffDailyCare

