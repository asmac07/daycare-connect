import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import ChatWindow from '../../components/ChatWindow'
import { useSelector } from 'react-redux'

const OwnerMessages = () => {
  const { user } = useSelector((state) => state.auth)

  const [parents, setParents] = useState([])
  const [selectedParent, setSelectedParent] = useState(null)
  const [daycareId, setDaycareId] = useState(null)

  const fetchParents = async () => {
    try {
      const response = await axiosInstance.get('/enrollment/getDaycareEnrollments')
      const enrollments = response.data.data

      const uniqueParents = []
      const seenIds = new Set()

      enrollments.forEach((en) => {
        if (en.parent && !seenIds.has(en.parent._id)) {
          seenIds.add(en.parent._id)
          uniqueParents.push(en.parent)
        }
        if (en.daycare && !daycareId) {
          setDaycareId(en.daycare._id || en.daycare)
        }
      })

      setParents(uniqueParents)
    } catch (error) {
      console.log(error)
    }
  }

  useEffect(() => {
    fetchParents()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold font-baloo text-dc-ink mb-6">Messages</h1>

        <div className="flex gap-6">
          <div className="w-64 bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 p-4">
            <h2 className="font-semibold font-baloo text-dc-ink mb-3 px-1">Parents</h2>

            {parents.length === 0 ? (
              <p className="text-sm text-dc-muted px-1">No conversations yet.</p>
            ) : (
              <div className="space-y-1.5">
                {parents.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => setSelectedParent(p)}
                    className={`w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      selectedParent?._id === p._id
                        ? 'bg-gradient-to-br from-dc-blue to-dc-green text-white shadow-[0_6px_16px_-6px_rgba(74,144,164,0.55)]'
                        : 'text-dc-ink hover:bg-dc-hover'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        selectedParent?._id === p._id
                          ? 'bg-white/25 text-white'
                          : 'bg-dc-hover text-dc-blue'
                      }`}
                    >
                      {p.name?.charAt(0).toUpperCase()}
                    </span>
                    <span className="truncate">{p.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex-1">
            {selectedParent && daycareId ? (
              <ChatWindow
                daycareId={daycareId}
                parentId={selectedParent._id}
                ownerId={user.id}
                otherUserName={selectedParent.name}
              />
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 p-10 text-center text-dc-muted text-sm h-[32rem] flex items-center justify-center">
                Select a parent to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default OwnerMessages