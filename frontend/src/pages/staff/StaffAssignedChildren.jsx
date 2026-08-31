
import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'

const StaffAssignedChildren = () => {
  const [daycare, setDaycare] = useState(null)
  const [assignedChildren, setAssignedChildren] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState(null)

  const fetchData = async () => {
    try {
      const [daycareResponse, childrenResponse] = await Promise.all([
        axiosInstance.get('/staff/myDaycare'),
        axiosInstance.get('/staff/assignedChildren')
      ])

      setDaycare(daycareResponse.data.data)
      setAssignedChildren(childrenResponse.data.data)

    } catch (error) {
      console.log(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-8 text-dc-muted">
        Loading...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-semibold font-baloo text-dc-ink">
          Assigned Children
        </h1>

        <p className="text-sm text-dc-muted mt-1 mb-6">
          Children assigned to you
        </p>

        {/* Assigned Daycare */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 p-6 mb-6">

          <h2 className="text-lg font-semibold font-baloo text-dc-ink mb-4">
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
        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 p-6">

          <h2 className="text-lg font-semibold font-baloo text-dc-ink mb-4">
            My Assigned Children
          </h2>

          {assignedChildren.length === 0 ? (
            <p className="text-sm text-dc-muted">
              No children assigned yet.
            </p>
          ) : (
            <div className="space-y-3">
              {assignedChildren.map((enrollment) => (
                <div
                  key={enrollment.enrollmentId}
                  className="border-[1.5px] border-dc-border rounded-2xl p-4"
                >

                  <p className="font-semibold text-dc-ink">
                    {enrollment.child?.name}
                  </p>

                  <p className="text-sm text-dc-muted mt-1">
                    DOB: {new Date(enrollment.child?.dateOfBirth).toLocaleDateString()}
                  </p>

                  <p className="text-sm text-dc-muted">
                    Gender: {enrollment.child?.gender}
                  </p>

                  <div className="mt-3">
                    <p className="text-sm font-semibold text-dc-ink">
                      Parent
                    </p>

                    <p className="text-sm text-dc-muted">
                      {enrollment.parent?.name}
                    </p>

                    <p className="text-sm text-dc-muted">
                      {enrollment.parent?.email}
                    </p>
                  </div>

                  <button
                    onClick={() => setSelectedChild(enrollment)}
                    className="mt-3 bg-dc-blue text-white px-4 py-2 rounded-full text-xs font-semibold hover:opacity-90 transition"
                  >
                    View Details
                  </button>

                </div>
              ))}
            </div>
          )}

        </div>

      </div>

      {/* View Details Modal */}
      {selectedChild && (
        <div className="fixed inset-0 bg-dc-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">

          <div className="bg-white rounded-[2rem] p-6 w-full max-w-md shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)]">

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

            <div className="mb-5">
              <h3 className="font-semibold font-baloo text-dc-blue mb-2">
                Child Information
              </h3>

              <p className="text-sm text-dc-ink">
                <strong>Name:</strong> {selectedChild.child?.name}
              </p>

              <p className="text-sm text-dc-ink">
                <strong>DOB:</strong> {new Date(selectedChild.child?.dateOfBirth).toLocaleDateString()}
              </p>

              <p className="text-sm text-dc-ink">
                <strong>Gender:</strong> {selectedChild.child?.gender}
              </p>

              {selectedChild.child?.medicalNotes && (
                <p className="text-sm text-dc-ink">
                  <strong>Medical Notes:</strong> {selectedChild.child.medicalNotes}
                </p>
              )}
            </div>

            <div className="border-t border-dc-border pt-4">
              <h3 className="font-semibold font-baloo text-dc-blue mb-2">
                Parent Information
              </h3>

              <p className="text-sm text-dc-ink">
                <strong>Name:</strong> {selectedChild.parent?.name}
              </p>

              <p className="text-sm text-dc-ink">
                <strong>Email:</strong> {selectedChild.parent?.email}
              </p>

              {selectedChild.parent?.phone && (
                <p className="text-sm text-dc-ink">
                  <strong>Phone:</strong> {selectedChild.parent.phone}
                </p>
              )}
            </div>

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