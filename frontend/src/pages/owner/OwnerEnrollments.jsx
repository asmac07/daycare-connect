

import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { ENROLLMENT_STATUS } from '../../constants'
import { toast } from 'react-toastify'
import { statusStyles } from '../../constants/statusStyles'
import ConfirmModal from '../../components/common/ConfirmModal'

const OwnerEnrollments = () => {

  const [enrollments, setEnrollments] = useState([])
  const [selectedEnrollment, setSelectedEnrollment] = useState(null)
  const [showRejectModal, setShowRejectModal] = useState(false)

  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [total, setTotal] = useState(0)

  // Staff list
  const [staff, setStaff] = useState([])

  // Selected staff for current enrollment
  const [selectedStaff, setSelectedStaff] = useState('')

  const totalPages = Math.ceil(total / limit)


    const fetchEnrollments = async () => {
    try {

      const response = await axiosInstance.get(
        `/enrollment/getDaycareEnrollments?page=${page}&limit=${limit}`
      )

      setEnrollments(response.data.data)
      setTotal(response.data.total)

    } catch (error) {
      console.log(error)
    }
  }


  const fetchStaff = async () => {
    try {

      const response = await axiosInstance.get('/staff/myStaff')

      setStaff(response.data.data)

    } catch (error) {
      console.log(error)
    }
  }


  useEffect(() => {
    fetchStaff()
  }, [])


  useEffect(() => {
    fetchEnrollments()
  }, [page])


   const handleApprove = async (id) => {

    try {

      await axiosInstance.put(`/enrollment/approve/${id}`)

      toast.success('Enrollment approved successfully')

      fetchEnrollments()

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to approve enrollment'
      )

    }
  }


  const handleReject = async (id, reason) => {

    try {

      await axiosInstance.put(
        `/enrollment/reject/${id}`,
        { reason }
      )

      toast.success('Enrollment rejected')

      fetchEnrollments()

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to reject enrollment'
      )

    }
  }

  const handleDeleteEnrollment = async (id) => {
      const confirmed = window.confirm(
        'Are you sure you want to delete this enrollment? Related payment data will also be deleted.'
      )

      if (!confirmed) return

      try {
        await axiosInstance.delete(`/enrollment/delete/${id}`)

        toast.success('Enrollment deleted successfully')

        setSelectedEnrollment(null)

        fetchEnrollments()

      } catch (error) {
        toast.error(
          error.response?.data?.message ||
          'Failed to delete enrollment'
        )
      }
    }
  

  const handleAssignStaff = async (enrollmentId) => {

    if (!selectedStaff) {

      toast.warning('Please select a staff member')

      return
    }

    try {

      const response = await axiosInstance.put(
        `/enrollment/assignStaff/${enrollmentId}`,
        {
          staffId: selectedStaff
        }
      )

      toast.success(
        response.data.message || 'Staff assigned successfully'
      )

      // Refresh enrollment list
      await fetchEnrollments()

      // Find updated enrollment
      const updatedEnrollment = enrollments.find(
        (en) => en._id === enrollmentId
      )

      // Close modal
      setSelectedEnrollment(null)

      // Clear selected staff
      setSelectedStaff('')

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to assign staff'
      )

    }
  }


    const handleViewDetails = (enrollment) => {

    setSelectedEnrollment(enrollment)

    // If staff already assigned,
    // show that staff in dropdown
    setSelectedStaff(
      enrollment.assignedStaff?._id ||
      enrollment.assignedStaff ||
      ''
    )
  }


  return (

    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">

      <div className="max-w-3xl mx-auto">

        <h1 className="text-2xl font-semibold font-baloo text-dc-ink mb-6">
          Enrollment Requests
        </h1>


        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">

          {enrollments.length === 0 ? (

            <p className="text-dc-muted text-sm">
              No enrollment requests yet.
            </p>

          ) : (

            <div className="overflow-x-auto">

              <p className="text-gray-500 text-sm mb-4">
                Showing page {page} of {totalPages} ({total} enrollments)
              </p>


              <table className="w-full text-sm">

                <thead>

                  <tr className="border-b border-dc-border text-left text-dc-muted">

                    <th className="py-2 pr-4 font-semibold">
                      Child
                    </th>

                    <th className="py-2 pr-4 font-semibold">
                      Parent
                    </th>

                    <th className="py-2 pr-4 font-semibold">
                      Age Group
                    </th>

                    <th className="py-2 pr-4 font-semibold">
                      Status
                    </th>

                    <th className="py-2 pr-4 font-semibold">
                      Payment
                    </th>

                    <th className="py-2 font-semibold">
                      Action
                    </th>

                  </tr>

                </thead>


                <tbody>

                  {enrollments.map((en) => (

                    <tr
                      key={en._id}
                      className="border-b border-dc-border/60 last:border-0"
                    >

                      <td className="py-3 pr-4 font-semibold text-dc-ink">
                        {en.child?.name}
                      </td>


                      <td className="py-3 pr-4 text-dc-muted">
                        {en.parent?.name}
                      </td>


                      <td className="py-3 pr-4 text-dc-ink">
                        {en.ageGroup}
                      </td>


                      <td className="py-3 pr-4">

                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            statusStyles[en.enrollmentStatus] ||
                            "bg-dc-hover text-dc-muted"
                          }`}
                        >
                          {en.enrollmentStatus}
                        </span>

                      </td>


                      <td className="py-3 pr-4 text-dc-ink">
                        {en.paymentStatus}
                      </td>


                      <td className="py-3">

                        <button
                          onClick={() => handleViewDetails(en)}
                          className="bg-dc-blue text-white px-3 py-1.5 rounded-full hover:opacity-90 text-xs font-semibold transition"
                        >
                          View Details
                        </button>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>


              {/* PAGINATION */}

              <div className="flex justify-between items-center mt-6">

                <button
                  onClick={() => setPage(page - 1)}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 rounded disabled:opacity-50"
                >
                  Previous
                </button>


                <span>
                  Page {page} of {totalPages}
                </span>


                <button
                  onClick={() => setPage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>

              </div>

            </div>

          )}

        </div>

      </div>


           {selectedEnrollment && (

        <div className="fixed inset-0 bg-dc-ink/50 backdrop-blur-sm flex items-center justify-center z-50 px-4">

          <div className="bg-white rounded-[2rem] p-6 w-[650px] max-h-[90vh] overflow-y-auto shadow-[0_20px_50px_-12px_rgba(74,144,164,0.35)]">


                      <div className="flex justify-between items-center mb-5">

              <h2 className="text-xl font-semibold font-baloo text-dc-ink">
                Enrollment Details
              </h2>


              <button
                onClick={() => {
                  setSelectedEnrollment(null)
                  setSelectedStaff('')
                }}
                className="text-dc-muted hover:text-dc-ink text-xl transition"
              >
                ✕
              </button>

            </div>


            <div className="space-y-5 text-dc-ink text-sm">


             
              <div>

                <h3 className="font-semibold font-baloo text-dc-blue mb-2">
                  Child Details
                </h3>

                <p>
                  <strong>Name:</strong>{" "}
                  {selectedEnrollment.child?.name}
                </p>

                <p>
                  <strong>Gender:</strong>{" "}
                  {selectedEnrollment.child?.gender}
                </p>

                <p>
                  <strong>DOB:</strong>{" "}
                  {new Date(
                    selectedEnrollment.child?.dateOfBirth
                  ).toLocaleDateString()}
                </p>

                <p>
                  <strong>Medical Notes:</strong>{" "}
                  {selectedEnrollment.child?.medicalNotes || "None"}
                </p>

              </div>


              <hr className="border-dc-border" />


             
              <div>

                <h3 className="font-semibold font-baloo text-dc-blue mb-2">
                  Parent Details
                </h3>

                <p>
                  <strong>Name:</strong>{" "}
                  {selectedEnrollment.parent?.name}
                </p>

                <p>
                  <strong>Email:</strong>{" "}
                  {selectedEnrollment.parent?.email}
                </p>

              </div>


              <hr className="border-dc-border" />

              
              <div>

                <h3 className="font-semibold font-baloo text-dc-blue mb-2">
                  Enrollment Details
                </h3>

                <p>
                  <strong>Age Group:</strong>{" "}
                  {selectedEnrollment.ageGroup}
                </p>

                <p>
                  <strong>Status:</strong>{" "}
                  {selectedEnrollment.enrollmentStatus}
                </p>

                <p>
                  <strong>Payment:</strong>{" "}
                  {selectedEnrollment.paymentStatus}
                </p>


                {selectedEnrollment.enrollmentStatus === 'rejected' && (

                  <p className="text-dc-error-text mt-2">

                    <strong>Reason:</strong>{" "}
                    {selectedEnrollment.reason || 'No reason provided'}

                  </p>

                )}

              </div>

              
              {selectedEnrollment.enrollmentStatus === 'confirmed' && (

                <>

                  <hr className="border-dc-border" />

                  <div>

                    <h3 className="font-semibold font-baloo text-dc-blue mb-2">
                      Staff Assignment
                    </h3>

                    <p className="text-dc-muted text-sm mb-3">
                      Assign a staff member to this child.
                    </p>


                    {staff.length === 0 ? (

                      <p className="text-dc-error-text text-sm">
                        No staff members available.
                      </p>

                    ) : (

                      <div className="flex gap-3">

                        <select
                          value={selectedStaff}
                          onChange={(e) =>
                            setSelectedStaff(e.target.value)
                          }
                          className="flex-1 rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                        >

                          <option value="">
                            Select Staff
                          </option>

                          {staff.map((member) => (

                            <option
                              key={member._id}
                              value={member._id}
                            >
                              {member.name}
                            </option>

                          ))}

                        </select>


                        <button
                          onClick={() =>
                            handleAssignStaff(
                              selectedEnrollment._id
                            )
                          }
                          className="bg-dc-blue text-white px-5 py-2.5 rounded-full font-semibold text-sm hover:opacity-90 transition"
                        >
                          Assign
                        </button>

                      </div>

                    )}


                    {/* SHOW CURRENTLY ASSIGNED STAFF */}

                    {selectedEnrollment.assignedStaff && (

                      <p className="text-dc-green text-sm mt-3">

                        <strong>Currently Assigned:</strong>{" "}

                        {selectedEnrollment.assignedStaff?.name ||
                          "Staff assigned"}

                      </p>

                    )}

                  </div>

                </>

              )}

             
              <div className="flex gap-3 pt-4">

                <button
                  disabled={
                    selectedEnrollment.enrollmentStatus ===
                    ENROLLMENT_STATUS.APPROVED
                  }
                  onClick={() => {

                    handleApprove( selectedEnrollment._id)

                    setSelectedEnrollment(null)

                  }}
                  className={`px-5 py-2 rounded-full font-semibold text-sm text-white transition ${
                    selectedEnrollment.enrollmentStatus ===
                    ENROLLMENT_STATUS.APPROVED

                      ? 'bg-dc-green/40 cursor-not-allowed'

                      : 'bg-dc-green hover:opacity-90'
                  }`}
                >
                  Approve
                </button>


                <button
                  disabled={
                    selectedEnrollment.enrollmentStatus ===
                    ENROLLMENT_STATUS.REJECTED
                  }
                  onClick={() => setShowRejectModal(true)}
                  className={`px-5 py-2 rounded-full font-semibold text-sm text-white transition ${
                    selectedEnrollment.enrollmentStatus ===
                    ENROLLMENT_STATUS.REJECTED

                      ? 'bg-dc-error-text/40 cursor-not-allowed'

                      : 'bg-dc-error-text hover:opacity-90'
                  }`}
                >
                  Reject
                </button>

                 <button
                    onClick={() =>
                      handleDeleteEnrollment(selectedEnrollment._id)
                    }
                    className="px-5 py-2 rounded-full font-semibold text-sm text-white bg-gray-700 hover:bg-gray-800 transition"
                  >
                    Delete
                  </button>

              </div>

            </div>

          </div>

        </div>

      )}

    
      {showRejectModal && (

        <ConfirmModal
          title="Reject Enrollment"
          confirmLabel="Reject"

          onCancel={() =>
            setShowRejectModal(false)
          }

          onConfirm={async (reason) => {

            await handleReject(
              selectedEnrollment._id,
              reason
            )

            setShowRejectModal(false)
            setSelectedEnrollment(null)

          }}
        />

      )}

    </div>

  )
}

export default OwnerEnrollments

