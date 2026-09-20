import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { useSelector } from 'react-redux'
import StaffChatWindow from '../../components/StaffChatWindow'
import { Users, Baby, MessageCircle } from 'lucide-react'

const StaffParentChats = () => {

  const { user } = useSelector((state) => state.auth)

  const [parents, setParents] = useState([])
  const [selectedParent, setSelectedParent] = useState(null)
  const [selectedChild, setSelectedChild] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchParents = async () => {
      try {
        const res = await axiosInstance.get('/staff/assigned-parents')
        setParents(res.data.data)
      } catch (error) {
        console.log('Get assigned parents error:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchParents()
  }, [])

  const groupedParents = parents.reduce((acc, item) => {
    const parentId = item.parent._id

    if (!acc[parentId]) {
      acc[parentId] = {
        ...item,
        children: []
      }
    }

    if (item.child) {
      acc[parentId].children.push(item.child)
    }

    return acc
  }, {})

  const uniqueParentsList = Object.values(groupedParents)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito flex items-center justify-center">
        <p className="text-dc-muted">Loading parents...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-6 md:p-8 font-nunito">

      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={20} strokeWidth={2.2} className="text-dc-blue" />
        <h1 className="text-2xl font-semibold font-baloo text-dc-ink">Parent Chats</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Parent List */}
        <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 p-4">

          <div className="flex items-center gap-1.5 mb-4 px-1">
            <Users size={15} strokeWidth={2.2} className="text-dc-blue" />
            <h2 className="font-semibold font-baloo text-dc-ink">Assigned Parents</h2>
          </div>

          {parents.length === 0 ? (
            <p className="text-dc-muted text-sm px-1">No parents assigned yet.</p>
          ) : (
            <div className="space-y-2">
              {uniqueParentsList.map((item) => {
                const isParentSelected = selectedParent?.enrollmentId === item.enrollmentId

                return (
                  <div
                    key={item.enrollmentId}
                    role="button"
                    tabIndex={0}
                    onClick={() => {
                      setSelectedParent(item)
                      setSelectedChild(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        setSelectedParent(item)
                        setSelectedChild(null)
                      }
                    }}
                    className={`w-full text-left p-3 rounded-2xl transition cursor-pointer ${
                      isParentSelected ? 'bg-dc-hover' : 'hover:bg-dc-hover'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                          isParentSelected
                            ? 'bg-gradient-to-br from-dc-blue to-dc-green text-white'
                            : 'bg-dc-mist text-dc-blue'
                        }`}
                      >
                        {item.parent.name?.charAt(0).toUpperCase()}
                      </span>
                      <p className="font-semibold text-dc-ink text-sm">{item.parent.name}</p>
                    </div>

                    {item.children.length > 0 && (
                      <div className="mt-2.5 space-y-1 pl-1">
                        {item.children.map((child) => {
                          const isChildSelected =
                            selectedChild?._id === child._id &&
                            selectedParent?.parent._id === item.parent._id

                          return (
                            <button
                              key={child._id}
                              onClick={(e) => {
                                e.stopPropagation()
                                setSelectedParent(item)
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

        {/* Chat Window */}
        <div className="md:col-span-2">

          {selectedParent && selectedChild ? (
            <StaffChatWindow
              daycareId={selectedParent.daycare._id}
              parentId={selectedParent.parent._id}
              staffId={user.id}
              childId={selectedChild._id}
              otherUserName={selectedParent.parent.name}
              childName={selectedChild.name}
            />
          ) : (
            <div className="h-[32rem] bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 flex flex-col items-center justify-center text-dc-muted text-sm gap-3">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-dc-blue to-dc-green flex items-center justify-center rotate-3 shadow-[0_8px_20px_-6px_rgba(74,144,164,0.5)]">
                <MessageCircle size={24} strokeWidth={2} className="text-white" />
              </div>
              {selectedParent ? 'Select a child to start chatting' : 'Select a parent and child to start chatting'}
            </div>
          )}

        </div>

      </div>

    </div>
  )
}

export default StaffParentChats