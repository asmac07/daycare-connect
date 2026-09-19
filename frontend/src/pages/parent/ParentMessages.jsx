
import { useState, useEffect } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { useSelector } from 'react-redux'
import ChatWindow from '../../components/ChatWindow'
import { Baby } from 'lucide-react'

const ParentMessages = () => {

  const { user } = useSelector((state) => state.auth)

  const [daycares, setDaycares] = useState([])
  const [selectedDaycare, setSelectedDaycare] = useState(null)

  const [enrollments, setEnrollments] = useState([])
  const [selectedChild, setSelectedChild] = useState(null)

  const fetchDaycares = async () => {
    try {
      const response = await axiosInstance.get('/enrollment/getMyEnrollments')

      const enrollments = response.data.data
      setEnrollments(enrollments)

      const uniqueDaycares = []
      const seenIds = new Set()

      enrollments.forEach((en) => {
        const daycare = en.daycare

        if (daycare && !seenIds.has(daycare._id)) {
          seenIds.add(daycare._id)
          uniqueDaycares.push(daycare)
        }
      })

      setDaycares(uniqueDaycares)

    } catch (error) {
      console.error('Fetch daycares error:', error)
    }
  }

  useEffect(() => {
    fetchDaycares()
  }, [])

  const selectedChildren = []
  const seenChildIds = new Set()

  enrollments.forEach((enrollment) => {
    if (
      String(enrollment.daycare?._id) === String(selectedDaycare?._id) &&
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

          {/* Daycares List */}
          <div className="w-64 bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 p-4 flex-shrink-0">

            <h2 className="font-semibold font-baloo text-dc-ink mb-3 px-1">Daycares</h2>

            {daycares.length === 0 ? (
              <p className="text-sm text-dc-muted px-1">No conversations yet.</p>
            ) : (
              <div className="space-y-1.5">
                {daycares.map((d) => (
                  <button
                    key={d._id}
                    onClick={() => {
                      setSelectedDaycare(d)
                      setSelectedChild(null)
                    }}
                    className={`w-full flex items-center gap-2.5 text-left px-3 py-2.5 rounded-xl text-sm font-semibold transition ${
                      selectedDaycare?._id === d._id
                        ? 'bg-gradient-to-br from-dc-blue to-dc-green text-white shadow-[0_6px_16px_-6px_rgba(74,144,164,0.55)]'
                        : 'text-dc-ink hover:bg-dc-hover'
                    }`}
                  >
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                        selectedDaycare?._id === d._id
                          ? 'bg-white/25 text-white'
                          : 'bg-dc-hover text-dc-blue'
                      }`}
                    >
                      {d.name?.charAt(0).toUpperCase()}
                    </span>

                    <span className="truncate">{d.name}</span>
                  </button>
                ))}
              </div>
            )}

          </div>

          {/* Chat side: child selector + chat window */}
          <div className="flex-1 flex flex-col gap-4">

            {selectedDaycare && selectedChildren.length > 0 && (
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

            {selectedDaycare && selectedChild ? (
              <ChatWindow
                daycareId={selectedDaycare._id}
                parentId={user.id}
                childId={selectedChild._id}
                ownerId={selectedDaycare.owner?._id || selectedDaycare.owner}
                otherUserName={selectedDaycare.owner?.name || 'Daycare Owner'}
              />
            ) : (
              <div className="bg-white/90 backdrop-blur-sm rounded-[2rem] shadow-[0_20px_50px_-12px_rgba(74,144,164,0.15)] border border-white/60 p-10 text-center text-dc-muted text-sm h-[32rem] flex items-center justify-center">
                {selectedDaycare ? 'Select a child to start chatting' : 'Select a daycare to start chatting'}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  )
}

export default ParentMessages