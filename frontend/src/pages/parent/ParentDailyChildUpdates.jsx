
import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'

import {
  Search,
  ClipboardCheck,
  Coffee,
  UtensilsCrossed,
  Moon,
  Palette,
  User,
  CalendarDays
} from 'lucide-react'

const ParentDailyChildUpdates = () => {
  const [updates, setUpdates] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  const itemsPerPage = 6

  const fetchUpdates = async () => {
    try {
      setLoading(true)

      const response = await axiosInstance.get(
        '/child/daily-care-updates'
      )

      setUpdates(response.data.data || [])
    } catch (error) {
      console.error(
        'Failed to fetch daily care updates:',
        error
      )
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUpdates()
  }, [])

  const filteredUpdates = updates.filter(
    (update) =>
      update.child?.name
        ?.toLowerCase()
        .includes(searchTerm.toLowerCase())
  )

  const totalPages = Math.ceil(
    filteredUpdates.length / itemsPerPage
  )

  const startIndex =
    (currentPage - 1) * itemsPerPage

  const currentUpdates = filteredUpdates.slice(
    startIndex,
    startIndex + itemsPerPage
  )

  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const isPositive = (value) => {
    return value === 'Done' || value === 'Present'
  }

  const careFields = [
    {
      key: 'attendance',
      label: 'Attendance',
      icon: ClipboardCheck
    },
    {
      key: 'breakfast',
      label: 'Breakfast',
      icon: Coffee
    },
    {
      key: 'lunch',
      label: 'Lunch',
      icon: UtensilsCrossed
    },
    {
      key: 'nap',
      label: 'Nap',
      icon: Moon
    },
    {
      key: 'activity',
      label: 'Activity',
      icon: Palette
    }
  ]

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <p className="text-dc-muted">
          Loading...
        </p>
      </div>
    )
  }

  if (filteredUpdates.length === 0) {
    return (
      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold font-baloo text-dc-ink">
            Daily Child Updates
          </h1>

          <p className="text-sm text-dc-muted mt-1">
            View your children's latest daily care updates.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">

            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-dc-muted">
              <Search
                size={16}
                strokeWidth={2.2}
              />
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

        {/* Empty State */}
        <div className="bg-white/90 rounded-[2rem] p-10 text-center border border-white/60 shadow-sm">

          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center mx-auto mb-3 rotate-3">
            <CalendarDays
              size={24}
              strokeWidth={2}
              className="text-white"
            />
          </div>

          <p className="text-sm text-dc-muted">
            {searchTerm
              ? 'No updates found for this child.'
              : 'No daily care updates available yet.'}
          </p>

        </div>

      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-semibold font-baloo text-dc-ink">
          Daily Child Updates
        </h1>

        <p className="text-sm text-dc-muted mt-1">
          View your children's latest daily care updates.
        </p>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative max-w-md">

          <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-dc-muted">
            <Search
              size={16}
              strokeWidth={2.2}
            />
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

      {/* Child Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

        {currentUpdates.map((update) => {
          const childName =
            update.child?.name || 'Child'

          /*
           * If date exists, an actual daily care update exists.
           * If date is null, the child is active but
           * staff has not submitted today's update yet.
           */
          const hasDailyUpdate = Boolean(update.date)

          return (
            <div
              key={
                update.enrollment?._id ||
                update.child?._id
              }
              className="bg-white/90 rounded-[1.5rem] p-5 border border-white/60 shadow-[0_15px_40px_-15px_rgba(74,144,164,0.2)] hover:shadow-[0_15px_40px_-15px_rgba(74,144,164,0.35)] transition"
            >

              {/* Child Header */}
              <div className="flex items-center gap-3 mb-4">

                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center flex-shrink-0 text-white font-bold font-baloo text-sm">
                  {childName
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <div>

                  <h2 className="text-base font-semibold font-baloo text-dc-ink leading-tight">
                    {childName}
                  </h2>

                  <p className="text-xs text-dc-muted flex items-center gap-1 mt-0.5">

                    <CalendarDays
                      size={11}
                      strokeWidth={2.4}
                    />

                    {update.date
                      ? new Date(
                          update.date
                        ).toLocaleDateString()
                      : 'No update yet'}

                  </p>

                </div>

              </div>

              {/* No Update Yet */}
              {!hasDailyUpdate && (
                <div className="bg-dc-mist rounded-2xl p-4 mb-4">

                  <p className="text-sm text-dc-ink font-semibold">
                    No daily update yet.
                  </p>

                  <p className="text-xs text-dc-muted mt-1">
                    Today's care update has not been added yet.
                  </p>

                </div>
              )}

              {/* Latest Update */}
              {hasDailyUpdate && (
                <>
                  <div className="mb-3">
                    <p className="text-xs font-semibold text-dc-ink">
                      Latest Update
                    </p>
                  </div>

                  {/* Care Details */}
                  <div className="space-y-2">

                    {careFields.map(
                      ({ key, label, icon: Icon }) => {
                        const value = update[key]

                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between text-sm"
                          >

                            <span className="flex items-center gap-1.5 text-dc-muted">

                              <Icon
                                size={13}
                                strokeWidth={2.3}
                                className="text-dc-blue"
                              />

                              {label}

                            </span>

                            <span
                              className={
                                isPositive(value)
                                  ? 'text-xs font-semibold px-2 py-0.5 rounded-full bg-dc-green/15 text-dc-green'
                                  : 'text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-600'
                              }
                            >
                              {value}
                            </span>

                          </div>
                        )
                      }
                    )}

                  </div>

                  {/* Updated By */}
                  <div className="border-t border-dc-border mt-4 pt-3 flex items-center gap-2">

                    <div className="w-7 h-7 rounded-full bg-dc-mist flex items-center justify-center flex-shrink-0">

                      <User
                        size={13}
                        strokeWidth={2.3}
                        className="text-dc-blue"
                      />

                    </div>

                    <div>

                      <p className="text-xs text-dc-muted leading-tight">
                        Updated by
                      </p>

                      <p className="text-sm font-semibold text-dc-ink leading-tight">

                        {update.staff?.name || 'Staff'}

                        {update.staff?.designation && (
                          <span className="text-xs text-dc-muted font-normal">
                            {' · '}
                            {update.staff.designation}
                          </span>
                        )}

                      </p>

                    </div>

                  </div>
                </>
              )}

            </div>
          )
        })}

      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 mt-8">

          <button
            type="button"
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
            type="button"
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

    </div>
  )
}

export default ParentDailyChildUpdates

