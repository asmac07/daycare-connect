import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'

const StaffAssignedChildren = () => {
  const [daycare, setDaycare] = useState(null)
  const [assignedChildren, setAssignedChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState(null)

  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const limit = 6

  const fetchData = async (page = 1) => {
    try {
      setLoading(true)

      const [daycareResponse, childrenResponse] = await Promise.all([
        axiosInstance.get('/staff/myDaycare'),
        axiosInstance.get(
          `/staff/assignedChildren?page=${page}&limit=${limit}`
        )
      ])

      setDaycare(daycareResponse.data.data)
      setAssignedChildren(childrenResponse.data.data)

      setCurrentPage(
        childrenResponse.data.pagination?.currentPage || page
      )

      setTotalPages(
        childrenResponse.data.pagination?.totalPages || 1
      )

    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData(currentPage)
  }, [currentPage])

  const formatDate = (date) => {
    if (!date) return 'N/A'

    return new Date(date).toLocaleDateString()
  }

  if (loading) {
    return (
      <div className="p-8 text-dc-muted">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-6 md:p-8 font-nunito">

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold font-baloo text-dc-ink">
            Assigned Children
          </h1>

          <p className="text-sm text-dc-muted mt-1">
            Children assigned to you
          </p>
        </div>

        {/* Assigned Daycare */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_15px_40px_-12px_rgba(74,144,164,0.15)] border border-white/60 p-5 md:p-6 mb-6">

          <h2 className="text-lg font-semibold font-baloo text-dc-ink mb-3">
            Assigned Daycare
          </h2>

          {daycare ? (
            <div>
              <h3 className="text-xl font-semibold font-baloo text-dc-blue">
                {daycare.name}
              </h3>

              <p className="text-sm text-dc-muted mt-1">
                {daycare.address}
              </p>
            </div>
          ) : (
            <p className="text-sm text-dc-muted">
              No daycare assigned yet.
            </p>
          )}

        </div>

        {/* Assigned Children */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_15px_40px_-12px_rgba(74,144,164,0.15)] border border-white/60 p-5 md:p-6">

          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-lg font-semibold font-baloo text-dc-ink">
                My Assigned Children
              </h2>

              <p className="text-xs text-dc-muted mt-1">
                {assignedChildren.length} children on this page
              </p>
            </div>
          </div>

          {assignedChildren.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-sm text-dc-muted">
                No children assigned yet.
              </p>
            </div>
          ) : (
            <>
              {/* Children Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">

                {assignedChildren.map((enrollment) => {
                  const isExpired =
                    enrollment.enrollmentStatus === 'expired'

                  return (
                    <div
                      key={enrollment.enrollmentId}
                      className="bg-white border border-dc-border rounded-2xl p-4 shadow-sm hover:shadow-md transition"
                    >

                      {/* Child Header */}
                      <div className="flex items-start justify-between gap-3">

                        <div className="min-w-0">
                          <h3 className="font-semibold font-baloo text-dc-ink truncate">
                            {enrollment.child?.name}
                          </h3>

                          <p className="text-xs text-dc-muted mt-1">
                            {enrollment.child?.gender || 'N/A'}
                          </p>
                        </div>

                        {/* Status */}
                        <span
                          className={`shrink-0 px-2.5 py-1 rounded-full text-[11px] font-semibold ${
                            isExpired
                              ? 'bg-red-50 text-red-600'
                              : 'bg-green-50 text-dc-green'
                          }`}
                        >
                          {isExpired ? 'Expired' : 'Active'}
                        </span>

                      </div>

                      {/* Basic Details */}
                      <div className="mt-4 space-y-1.5">

                        <p className="text-xs text-dc-muted">
                          <span className="font-semibold text-dc-ink">
                            DOB:
                          </span>{' '}
                          {formatDate(enrollment.child?.dateOfBirth)}
                        </p>

                        <p className="text-xs text-dc-muted">
                          <span className="font-semibold text-dc-ink">
                            End Date:
                          </span>{' '}
                          {formatDate(enrollment.endDate)}
                        </p>

                      </div>

                      {/* View Details */}
                      <button
                        onClick={() => setSelectedChild(enrollment)}
                        className="mt-4 w-full bg-dc-blue text-white px-4 py-2 rounded-full text-xs font-semibold hover:opacity-90 transition"
                      >
                        View Details
                      </button>

                    </div>
                  )
                })}

              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-7 flex-wrap">

                  <button
                    onClick={() => setCurrentPage((prev) => prev - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 rounded-full text-xs font-semibold border border-dc-border text-dc-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dc-mist transition"
                  >
                    Previous
                  </button>

                  {Array.from(
                    { length: totalPages },
                    (_, index) => index + 1
                  ).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-9 h-9 rounded-full text-xs font-semibold transition ${
                        currentPage === page
                          ? 'bg-dc-blue text-white'
                          : 'border border-dc-border text-dc-ink hover:bg-dc-mist'
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => prev + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 rounded-full text-xs font-semibold border border-dc-border text-dc-ink disabled:opacity-40 disabled:cursor-not-allowed hover:bg-dc-mist transition"
                  >
                    Next
                  </button>

                </div>
              )}

            </>
          )}

        </div>

      </div>

      {/* View Details Modal */}
      {selectedChild && (
        <div className="fixed inset-0 bg-dc-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)]">

            {/* Modal Header */}
            <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-semibold font-baloo text-dc-ink">
                Child Details
              </h2>

              <button
                onClick={() => setSelectedChild(null)}
                className="text-dc-muted hover:text-dc-ink text-xl transition"
              >
                ✕
              </button>

            </div>

            {/* Child Information */}
            <div className="mb-5">

              <h3 className="font-semibold font-baloo text-dc-blue mb-3">
                Child Information
              </h3>

              <div className="space-y-2">

                <p className="text-sm text-dc-ink">
                  <strong>Name:</strong>{' '}
                  {selectedChild.child?.name}
                </p>

                <p className="text-sm text-dc-ink">
                  <strong>DOB:</strong>{' '}
                  {formatDate(selectedChild.child?.dateOfBirth)}
                </p>

                <p className="text-sm text-dc-ink">
                  <strong>Gender:</strong>{' '}
                  {selectedChild.child?.gender || 'N/A'}
                </p>

                {selectedChild.child?.medicalNotes && (
                  <p className="text-sm text-dc-ink">
                    <strong>Medical Notes:</strong>{' '}
                    {selectedChild.child.medicalNotes}
                  </p>
                )}

              </div>

            </div>

            {/* Enrollment Information */}
            <div className="border-t border-dc-border pt-4 mb-5">

              <h3 className="font-semibold font-baloo text-dc-blue mb-3">
                Enrollment Information
              </h3>

              <div className="space-y-2">

                <p className="text-sm text-dc-ink">
                  <strong>Status:</strong>{' '}
                  <span
                    className={
                      selectedChild.enrollmentStatus === 'expired'
                        ? 'text-red-600 font-semibold'
                        : 'text-dc-green font-semibold'
                    }
                  >
                    {selectedChild.enrollmentStatus === 'expired'
                      ? 'Expired'
                      : 'Active'}
                  </span>
                </p>

                <p className="text-sm text-dc-ink">
                  <strong>Start Date:</strong>{' '}
                  {formatDate(selectedChild.startDate)}
                </p>

                <p className="text-sm text-dc-ink">
                  <strong>End Date:</strong>{' '}
                  {formatDate(selectedChild.endDate)}
                </p>

              </div>

            </div>

            {/* Parent Information */}
            <div className="border-t border-dc-border pt-4">

              <h3 className="font-semibold font-baloo text-dc-blue mb-3">
                Parent Information
              </h3>

              <div className="space-y-2">

                <p className="text-sm text-dc-ink">
                  <strong>Name:</strong>{' '}
                  {selectedChild.parent?.name}
                </p>

                <p className="text-sm text-dc-ink">
                  <strong>Email:</strong>{' '}
                  {selectedChild.parent?.email}
                </p>

                {selectedChild.parent?.phone && (
                  <p className="text-sm text-dc-ink">
                    <strong>Phone:</strong>{' '}
                    {selectedChild.parent.phone}
                  </p>
                )}

              </div>

            </div>

            {/* Close */}
            <button
              onClick={() => setSelectedChild(null)}
              className="mt-6 w-full bg-dc-ink text-white py-2.5 rounded-full text-sm font-semibold hover:opacity-90 transition"
            >
              Close
            </button>

          </div>

        </div>
      )}

    </div>
  )
}

export default StaffAssignedChildren