import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { useSelector } from 'react-redux'
import StaffChatWindow from '../../components/StaffChatWindow'
import { Users, Baby, MessageCircle } from 'lucide-react'

const ParentStaffMessages = () => {

  const { user } = useSelector((state) => state.auth)

  const [staffList, setStaffList] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedChild, setSelectedChild] = useState(null)

  useEffect(() => {
    const fetchAssignedStaff = async () => {
      try {
        const res = await axiosInstance.get('/enrollment/my-assigned-staff')
        setStaffList(res.data.data)
      } catch (error) {
        console.log('Get assigned staff error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssignedStaff()
  }, [])

  const groupedStaff = staffList.reduce((acc, item) => {
    const staffId = item.assignedStaff._id

    if (!acc[staffId]) {
      acc[staffId] = {
        ...item,
        children: []
      }
    }

    if (item.child) {
      acc[staffId].children.push(item.child)
    }

    return acc
  }, {})

  const uniqueStaffList = Object.values(groupedStaff)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito flex items-center justify-center">
        <p className="text-dc-muted">Loading staff...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-6 md:p-8 font-nunito">

      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={20} strokeWidth={2.2} className="text-dc-blue" />
        <h1 className="text-2xl font-semibold font-baloo text-dc-ink">Staff Chats</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Staff List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 p-4">

          <div className="flex items-center gap-1.5 mb-4 px-1">
            <Users size={15} strokeWidth={2.2} className="text-dc-blue" />
            <h2 className="font-semibold font-baloo text-dc-ink">My Staff</h2>
          </div>

          {staffList.length === 0 ? (
            <p className="text-dc-muted text-sm px-1">No staff assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {uniqueStaffList.map((item) => {
                const isStaffSelected = selectedStaff?._id === item._id

                return (
                  <div
                    key={item._id}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedStaff(item)
                      setSelectedChild(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedStaff(item)
                        setSelectedChild(null)
                      }
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition cursor-pointer ${
                      isStaffSelected ? 'bg-dc-hover' : 'hover:bg-dc-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isStaffSelected
                            ? 'bg-gradient-to-br from-dc-blue to-dc-green text-white'
                            : 'bg-dc-mist text-dc-blue'
                        }`}
                      >
                        {item.assignedStaff.name?.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-dc-ink text-sm">{item.assignedStaff.name}</p>
                        <p className="text-xs text-dc-muted">{item.assignedStaff.designation || 'Staff'}</p>
                      </div>
                    </div>

                    {item.children.length > 0 && (
                      <div className="mt-2.5 space-y-1 pl-1">
                        {item.children.map((child) => {
                          const isChildSelected =
                            selectedChild?._id === child._id &&
                            selectedStaff?.assignedStaff._id === item.assignedStaff._id

                          return (
                            <button
                              key={child._id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedStaff(item)
                                setSelectedChild(child)
                              }}
                              className={`w-full flex items-center gap-1.5 text-left px-2.5 py-1.5 rounded-full text-xs font-semibold transition ${
                                isChildSelected
                                  ? 'bg-dc-blue text-white'
                                  : 'bg-dc-mist text-dc-ink hover:bg-dc-border/40'
                              }`}
                            >
                              <Baby size={12} strokeWidth={2.4} className={isChildSelected ? 'text-white' : 'text-dc-green'} />
                              {child.name}
                            </button>
                          )
                        })}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

        </div>

        {/* Chat */}
        <div className="md:col-span-2">

          {selectedStaff && selectedChild ? (
            <StaffChatWindow
              daycareId={selectedStaff.daycare._id}
              parentId={user.id}
              staffId={selectedStaff.assignedStaff._id}
              childId={selectedChild?._id}
              otherUserName={selectedStaff.assignedStaff.name}
              designation={selectedStaff.assignedStaff.designation}
              daycareName={selectedStaff.daycare.name}
              childName={selectedChild?.name}
            />
          ) : (
            <div className="h-[32rem] bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 flex flex-col items-center justify-center text-dc-muted text-sm gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center rotate-3 shadow-[0_8px_20px_-6px_rgba(74,144,164,0.5)]">
                <MessageCircle size={24} strokeWidth={2} className="text-white" />
              </div>
              Select a staff member and child to start chatting
            </div>
          )}

        </div>

      </div>

    </div>
  )
}

export default ParentStaffMessages