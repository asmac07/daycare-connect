
import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { toast } from 'react-toastify'
import { statusStyles } from '../../constants/statusStyles'
import ConfirmModal from '../../components/common/ConfirmModal'

const AdminPanel = () => {

 
  const [activeTab, setActiveTab] = useState('daycares')

  const [daycares, setDaycares] = useState([])
  const [loading, setLoading] = useState(true)

  const [filter, setFilter] = useState('all')

  const [showRejectModal, setShowRejectModal] = useState(false)
  const [selectedDaycareId, setSelectedDaycareId] = useState(null)

  const [page, setPage] = useState(1)
  const [limit] = useState(5)
  const [total, setTotal] = useState(0)

  const totalPages = Math.ceil(total / limit)


  const [users, setUsers] = useState([])
  const [userLoading, setUserLoading] = useState(false)

  const [userPage, setUserPage] = useState(1)
  const [userLimit] = useState(5)
  const [userTotal, setUserTotal] = useState(0)

  const [userSearch, setUserSearch] = useState('')
  const [userRole, setUserRole] = useState('all')

  const userTotalPages = Math.ceil(userTotal / userLimit)


    const fetchDaycares = async () => {
    try {

      setLoading(true)

      const response = await axiosInstance.get(
        `/admin/allDaycares?page=${page}&limit=${limit}`
      )

      setDaycares(response.data.data)
      setTotal(response.data.total)

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to fetch daycares'
      )

    } finally {

      setLoading(false)

    }
  }

  const fetchUsers = async () => {
    try {

      setUserLoading(true)

      const response = await axiosInstance.get(
        `/admin/users?page=${userPage}&limit=${userLimit}&search=${encodeURIComponent(userSearch)}&role=${userRole}`
      )

      setUsers(response.data.data)
      setUserTotal(response.data.total)

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to fetch users'
      )

    } finally {

      setUserLoading(false)

    }
  }


  useEffect(() => {

    if (activeTab === 'daycares') {
      fetchDaycares()
    }

  }, [activeTab, page])


    useEffect(() => {

    if (activeTab === 'users') {
      fetchUsers()
    }

  }, [activeTab, userPage, userRole])


  const approveDaycare = async (id) => {

    try {

      await axiosInstance.put(
        `/admin/daycares/${id}/approve`
      )

      toast.success('Daycare approved successfully')

      fetchDaycares()

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to approve daycare'
      )

    }
  }


  const rejectDaycare = async (reason) => {

    if (!selectedDaycareId) return

    try {

      await axiosInstance.put(
        `/admin/daycares/${selectedDaycareId}/reject`,
        { reason }
      )

      toast.success('Daycare rejected successfully')

      setShowRejectModal(false)
      setSelectedDaycareId(null)

      fetchDaycares()

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to reject daycare'
      )

    }
  }


  const suspendDaycare = async (id) => {

    try {

      await axiosInstance.put(
        `/admin/daycares/${id}/suspend`
      )

      toast.success('Daycare suspended successfully')

      fetchDaycares()

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to suspend daycare'
      )

    }
  }


  const blockDaycare = async (id) => {

    try {

      await axiosInstance.put(
        `/admin/daycares/${id}/block`
      )

      toast.success('Daycare blocked successfully')

      fetchDaycares()

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to block daycare'
      )

    }
  }


  const unblockDaycare = async (id) => {

    try {

      await axiosInstance.put(
        `/admin/daycares/${id}/unblock`
      )

      toast.success('Daycare unblocked successfully')

      fetchDaycares()

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to unblock daycare'
      )

    }
  }


  const handleBlockUser = async (id) => {

    try {

      await axiosInstance.put(
        `/admin/users/${id}/block`
      )

      toast.success('User blocked successfully')

      fetchUsers()

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to block user'
      )

    }
  }


  const handleUnblockUser = async (id) => {

    try {

      await axiosInstance.put(
        `/admin/users/${id}/unblock`
      )

      toast.success('User unblocked successfully')

      fetchUsers()

    } catch (error) {

      toast.error(
        error.response?.data?.message ||
        'Failed to unblock user'
      )

    }
  }


    const filteredDaycares =
    filter === 'all'
      ? daycares
      : daycares.filter(
          (d) =>
            d.verificationStatus === filter
        )


  const counts = {

    all: daycares.length,

    pending:
      daycares.filter(
        (d) =>
          d.verificationStatus === 'pending'
      ).length,

    approved:
      daycares.filter(
        (d) =>
          d.verificationStatus === 'approved'
      ).length,

    rejected:
      daycares.filter(
        (d) =>
          d.verificationStatus === 'rejected'
      ).length

  }

  const handleUserSearch = (e) => {

    e.preventDefault()

    setUserPage(1)

    fetchUsers()

  }

  
  return (

    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">

      <div className="max-w-6xl mx-auto">

        <div className="mb-6">

          <h1 className="text-2xl font-semibold font-baloo text-dc-ink">
            Admin Panel
          </h1>

          <p className="text-dc-muted text-sm mt-1">
            Manage users and daycare listings
          </p>

        </div>




        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] p-6 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60">


          {/* tabs */}

          <div className="flex gap-2 mb-6 border-b border-dc-border pb-4">

            <button
              onClick={() => {
                setActiveTab('daycares')
                setPage(1)
              }}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                activeTab === 'daycares'
                  ? 'bg-gradient-to-br from-dc-blue to-dc-green text-white shadow-[0_6px_16px_-6px_rgba(74,144,164,0.55)]'
                  : 'bg-dc-hover text-dc-muted hover:bg-dc-border/60'
              }`}
            >
              Daycares
            </button>


            <button
              onClick={() => {
                setActiveTab('users')
                setUserPage(1)
              }}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition ${
                activeTab === 'users'
                  ? 'bg-gradient-to-br from-dc-blue to-dc-green text-white shadow-[0_6px_16px_-6px_rgba(74,144,164,0.55)]'
                  : 'bg-dc-hover text-dc-muted hover:bg-dc-border/60'
              }`}
            >
              Users
            </button>

          </div>


         {/* daycare tab */}

          {activeTab === 'daycares' && (

            <>

        
              <div className="flex gap-2 mb-5 flex-wrap">

                {[
                  'all',
                  'pending',
                  'approved',
                  'rejected'
                ].map((tab) => (

                  <button
                    key={tab}
                    onClick={() => setFilter(tab)}
                    className={`px-4 py-1.5 rounded-full text-sm font-semibold capitalize transition ${
                      filter === tab
                        ? 'bg-gradient-to-br from-dc-blue to-dc-green text-white shadow-[0_6px_16px_-6px_rgba(74,144,164,0.55)]'
                        : 'bg-dc-hover text-dc-muted hover:bg-dc-border/60'
                    }`}
                  >

                    {tab} ({counts[tab]})

                  </button>

                ))}

              </div>


              {/* DAYCARE TABLE */}

              {loading ? (

                <p className="text-dc-muted text-sm">
                  Loading daycares...
                </p>

              ) : filteredDaycares.length === 0 ? (

                <p className="text-dc-muted text-sm">
                  No daycares in this category.
                </p>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full text-sm">

                    <thead>

                      <tr className="border-b border-dc-border text-left text-dc-muted">

                        <th className="py-2 pr-4 font-semibold">
                          Name
                        </th>

                        <th className="py-2 pr-4 font-semibold">
                          Address
                        </th>

                        <th className="py-2 pr-4 font-semibold">
                          Capacity
                        </th>

                        <th className="py-2 pr-4 font-semibold">
                          Facilities
                        </th>

                        <th className="py-2 pr-4 font-semibold">
                          Rating
                        </th>

                        <th className="py-2 pr-4 font-semibold">
                          Status
                        </th>

                        <th className="py-2 font-semibold">
                          Action
                        </th>

                      </tr>

                    </thead>


                    <tbody>

                      {filteredDaycares.map(
                        (daycare) => (

                          <tr
                            key={daycare._id}
                            className="border-b border-dc-border/60 last:border-0"
                          >

                            <td className="py-3 pr-4 font-semibold text-dc-ink">
                              {daycare.name}
                            </td>


                            <td className="py-3 pr-4 text-dc-muted">
                              {daycare.address}
                            </td>


                            <td className="py-3 pr-4 text-dc-muted">
                              {daycare.seatCapacity}
                            </td>


                            <td className="py-3 pr-4 text-dc-muted">
                              {daycare.facilities?.join(', ') || '—'}
                            </td>


                            <td className="py-3 pr-4 text-dc-muted">

                              {daycare.totalReviews > 0
                                ? `⭐ ${daycare.averageRating?.toFixed(1)} (${daycare.totalReviews})`
                                : '—'}

                            </td>


                            <td className="py-3 pr-4">

                              <div className="flex flex-wrap gap-1">

                                <span
                                  className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                    statusStyles[
                                      daycare.verificationStatus
                                    ] ||
                                    'bg-dc-hover text-dc-muted'
                                  }`}
                                >
                                  {daycare.verificationStatus}
                                </span>


                                {daycare.isBlocked && (

                                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-dc-ink text-white">
                                    blocked
                                  </span>

                                )}

                              </div>

                            </td>


                            <td className="py-3 space-x-1 whitespace-nowrap">


                                {daycare.verificationStatus === 'pending' && (

                                <>

                                  <button
                                    onClick={() =>
                                      approveDaycare(
                                        daycare._id
                                      )
                                    }
                                    className="bg-dc-green text-white px-3 py-1.5 rounded-full hover:opacity-90 text-xs font-semibold transition"
                                  >
                                    Approve
                                  </button>


                                  <button
                                    onClick={() => {
                                      setSelectedDaycareId(
                                        daycare._id
                                      )

                                      setShowRejectModal(
                                        true
                                      )
                                    }}
                                    className="bg-dc-error-text text-white px-3 py-1.5 rounded-full hover:opacity-90 text-xs font-semibold transition"
                                  >
                                    Reject
                                  </button>

                                </>

                              )}


                            
                              {daycare.verificationStatus === 'approved' &&
                                !daycare.isBlocked && (

                                  <>

                                    <button
                                      onClick={() =>
                                        suspendDaycare(
                                          daycare._id
                                        )
                                      }
                                      className="bg-amber-500 text-white px-3 py-1.5 rounded-full hover:opacity-90 text-xs font-semibold transition"
                                    >
                                      Suspend
                                    </button>


                                    <button
                                      onClick={() =>
                                        blockDaycare(
                                          daycare._id
                                        )
                                      }
                                      className="bg-dc-ink text-white px-3 py-1.5 rounded-full hover:opacity-90 text-xs font-semibold transition"
                                    >
                                      Block
                                    </button>

                                  </>

                              )}

                              
                              {daycare.verificationStatus === 'suspended' && (

                                <button
                                  onClick={() =>
                                    approveDaycare(
                                      daycare._id
                                    )
                                  }
                                  className="bg-dc-green text-white px-3 py-1.5 rounded-full hover:opacity-90 text-xs font-semibold transition"
                                >
                                  Unsuspend
                                </button>

                              )}


                            
                              {daycare.isBlocked && (

                                <button
                                  onClick={() =>
                                    unblockDaycare(
                                      daycare._id
                                    )
                                  }
                                  className="bg-dc-blue text-white px-3 py-1.5 rounded-full hover:opacity-90 text-xs font-semibold transition"
                                >
                                  Unblock
                                </button>

                              )}

                            </td>

                          </tr>

                        )
                      )}

                    </tbody>

                  </table>

                </div>

              )}


              {/* daycare pagination*/}

              <div className="flex justify-between items-center mt-6">

                <button
                  onClick={() =>
                    setPage((prev) => prev - 1)
                  }
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>


                <span className="text-sm text-dc-muted">
                  Page {page} of {totalPages || 1}
                </span>


                <button
                  onClick={() =>
                    setPage((prev) => prev + 1)
                  }
                  disabled={
                    page >= totalPages
                  }
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>

              </div>

            </>

          )}

          {/* users tab */}

          {activeTab === 'users' && (

            <>

              {/* USERS HEADER */}

              <div className="flex justify-between items-center mb-5">

                <div>

                  <h2 className="text-lg font-semibold font-baloo text-dc-ink">
                    User Management
                  </h2>

                  <p className="text-sm text-dc-muted mt-1">
                    View and manage all registered users
                  </p>

                </div>

              </div>


              {/* SEARCH + ROLE */}

              <div className="flex flex-col md:flex-row gap-3 mb-6">


                <form
                  onSubmit={handleUserSearch}
                  className="flex flex-1 gap-2"
                >

                  <input
                    type="text"
                    value={userSearch}
                    onChange={(e) =>
                      setUserSearch(e.target.value)
                    }
                    placeholder="Search by name or email"
                    className="flex-1 rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition"
                  />


                  <button
                    type="submit"
                    className="px-5 py-2.5 rounded-full text-sm font-semibold text-white bg-gradient-to-br from-dc-blue to-dc-green hover:opacity-90 transition"
                  >
                    Search
                  </button>

                </form>


                <select
                  value={userRole}
                  onChange={(e) => {

                    setUserRole(e.target.value)
                    setUserPage(1)

                  }}
                  className="rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-white text-dc-ink outline-none focus:border-dc-blue"
                >

                  <option value="all">
                    All Users
                  </option>

                  <option value="parent">
                    Parents
                  </option>

                  <option value="owner">
                    Owners
                  </option>

                  <option value="staff">
                    Staff
                  </option>

                </select>

              </div>


              {/* USERS TABLE */}

              {userLoading ? (

                <p className="text-dc-muted text-sm">
                  Loading users...
                </p>

              ) : users.length === 0 ? (

                <div className="text-center py-10">

                  <p className="text-dc-muted text-sm">
                    No users found.
                  </p>

                </div>

              ) : (

                <div className="overflow-x-auto">

                  <table className="w-full text-sm">

                    <thead>

                      <tr className="border-b border-dc-border text-left text-dc-muted">

                        <th className="py-3 pr-4 font-semibold">
                          Name
                        </th>

                        <th className="py-3 pr-4 font-semibold">
                          Email
                        </th>

                        <th className="py-3 pr-4 font-semibold">
                          Role
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

                      {users.map((user) => (

                        <tr
                          key={user._id}
                          className="border-b border-dc-border/60 last:border-0"
                        >


                          {/* NAME */}

                          <td className="py-3 pr-4">

                            <div className="font-semibold text-dc-ink">
                              {user.name}
                            </div>

                          </td>


                          {/* EMAIL */}

                          <td className="py-3 pr-4 text-dc-muted">
                            {user.email}
                          </td>


                          {/* ROLE */}

                          <td className="py-3 pr-4">

                            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-dc-hover text-dc-muted capitalize">
                              {user.role}
                            </span>

                          </td>


                          {/* STATUS */}

                          <td className="py-3 pr-4">

                            {user.isBlocked ? (

                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-dc-ink text-white">
                                Blocked
                              </span>

                            ) : (

                              <span className="px-3 py-1 rounded-full text-xs font-semibold bg-dc-green text-white">
                                Active
                              </span>

                            )}

                          </td>


                          {/* ACTION */}

                          <td className="py-3">

                            {user.isBlocked ? (

                              <button
                                onClick={() =>
                                  handleUnblockUser(
                                    user._id
                                  )
                                }
                                className="bg-dc-blue text-white px-4 py-1.5 rounded-full hover:opacity-90 text-xs font-semibold transition"
                              >
                                Unblock
                              </button>

                            ) : (

                              <button
                                onClick={() =>
                                  handleBlockUser(
                                    user._id
                                  )
                                }
                                className="bg-dc-ink text-white px-4 py-1.5 rounded-full hover:opacity-90 text-xs font-semibold transition"
                              >
                                Block
                              </button>

                            )}

                          </td>

                        </tr>

                      ))}

                    </tbody>

                  </table>

                </div>

              )}


              {/* USER PAGINATION */}

              <div className="flex justify-between items-center mt-6">

                <button
                  onClick={() =>
                    setUserPage(
                      (prev) => prev - 1
                    )
                  }
                  disabled={userPage === 1}
                  className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
                >
                  Previous
                </button>


                <span className="text-sm text-dc-muted">
                  Page {userPage} of {userTotalPages || 1}
                </span>


                <button
                  onClick={() =>
                    setUserPage(
                      (prev) => prev + 1
                    )
                  }
                  disabled={
                    userPage >= userTotalPages
                  }
                  className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
                >
                  Next
                </button>

              </div>

            </>

          )}


          {/* ================= REJECT MODAL ================= */}

          {showRejectModal && (

            <ConfirmModal
              title="Reject Daycare"
              confirmLabel="Reject"

              onCancel={() => {

                setShowRejectModal(false)
                setSelectedDaycareId(null)

              }}

              onConfirm={(reason) => {
                rejectDaycare(reason)
              }}

            />

          )}

        </div>

      </div>

    </div>

  )
}

export default AdminPanel