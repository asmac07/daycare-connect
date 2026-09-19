import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import ChatWindow from '../../components/ChatWindow'
import { useSelector } from 'react-redux'
import { Baby } from 'lucide-react'

const OwnerMessages = () => {

  const { user } = useSelector((state) => state.auth)

  const [parents, setParents] = useState([])
  const [selectedParent, setSelectedParent] = useState(null)
  const [daycareId, setDaycareId] = useState(null)

  const [enrollments, setEnrollments] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)

  const fetchParents = async () => {
    try {
      const response = await axiosInstance.get('/enrollment/getDaycareEnrollments')

      const enrollments = response.data.data
      setEnrollments(enrollments)

      const uniqueParents = []
      const seenIds = new Set()

      enrollments.forEach((en) => {
        if (en.parent && !seenIds.has(en.parent._id)) {
          seenIds.add(en.parent._id)
          uniqueParents.push(en.parent)
        }
      })

      setParents(uniqueParents)

      if (enrollments.length > 0 && enrollments[0].daycare) {
        const id = enrollments[0].daycare._id || enrollments[0].daycare
        setDaycareId(id)
      }

    } catch (error) {
      console.error('Fetch parents error:', error)
    }
  }

  useEffect(() => {
    fetchParents()
  }, [])

  const selectedChildren = []
  const seenChildIds = new Set()

  enrollments.forEach((enrollment) => {
    if (
      String(enrollment.parent?._id) === String(selectedParent?._id) &&
      enrollment.child &&
      !seenChildIds.has(enrollment.child._id)
    ) {
      seenChildIds.add(enrollment.child._id)
      selectedChildren.push(enrollment.child)
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist p-8 font-nunito">

      <div className="max-w-4xl mx-auto">

        <h1 className="text-2xl font-semibold font-baloo text-dc-ink mb-6">Messages</h1>

        <div className="flex gap-6">

          {/* Parents List */}
          <div className="w-64 bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 p-4 flex-shrink-0">

            <h2 className="font-semibold font-baloo text-dc-ink mb-3 px-1">Parents</h2>

            {parents.length === 0 ? (
              <p className="text-sm text-dc-muted px-1">No conversations yet.</p>
            ) : (
              <div className="space-y-1.5">
                {parents.map((p) => (
                  <button
                    key={p._id}
                    onClick={() => {
                      setSelectedParent(p)
                      setSelectedChild(null)
                    }}
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

          {/* Chat side: child selector + chat window */}
          <div className="flex-1 flex flex-col gap-4">

            {selectedParent && selectedChildren.length > 0 && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-white/60 shadow-[0_10px_30px_-12px_rgba(74,144,164,0.15)] p-4">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-dc-muted mb-2 uppercase tracking-wide">
                  <Baby size={13} strokeWidth={2.4} />
                  Select Child
                </label>

                <select
                  value={selectedChild?._id || ''}
                  onChange={(e) => {
                    const child = selectedChildren.find(
                      (c) => String(c._id) === String(e.target.value)
                    )
                    setSelectedChild(child || null)
                  }}
                  className="w-full rounded-full px-4 py-2.5 text-sm border-[1.5px] border-dc-border bg-dc-field text-dc-ink outline-none focus:border-dc-blue transition appearance-none"
                >
                  <option value="">Select a child</option>
                  {selectedChildren.map((child) => (
                    <option key={child._id} value={child._id}>{child.name}</option>
                  ))}
                </select>
              </div>
            )}

            {selectedParent && selectedChild && daycareId ? (
              <ChatWindow
                daycareId={daycareId}
                parentId={selectedParent._id}
                childId={selectedChild._id}
                ownerId={user.id}
                otherUserName={selectedParent.name}
              />
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 p-10 text-center text-dc-muted text-sm h-[32rem] flex items-center justify-center">
                {selectedParent ? 'Select a child to start chatting' : 'Select a parent to start chatting'}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}

export default OwnerMessages