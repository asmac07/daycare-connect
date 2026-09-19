

import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { useSelector } from 'react-redux'
import StaffChatWindow from '../../components/StaffChatWindow'

const StaffParentChats = () => {

  const { user } = useSelector((state) => state.auth)

  const [parents, setParents] = useState([])
  const [selectedParent, setSelectedParent] = useState(null)
  const [selectedChild, setSelectedChild] = useState(null)
  const [loading, setLoading] = useState(true)

  // Get parents assigned to this staff
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
      <div className="p-6">
        Loading parents...
      </div>
    )
  }


  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-5">
        Parent Chats
      </h1>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Parent List */}

        <div className="bg-white rounded-2xl shadow p-4">

          <h2 className="font-semibold mb-4">
            Assigned Parents
          </h2>

          {parents.length === 0 ? (

            <p className="text-gray-500 text-sm">
              No parents assigned yet.
            </p>

          ) : (

            <div className="space-y-2">

             {uniqueParentsList.map((item) => (

                <button
                  key={item.enrollmentId}
                  onClick={() => {
                    setSelectedParent(item)
                    setSelectedChild(null)
                  }}
                  
                  className={`w-full text-left p-3 rounded-xl transition ${
                    selectedParent?.enrollmentId === item.enrollmentId
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-100'
                  }`}
                >

                  <p className="font-semibold">
                    {item.parent.name}
                  </p>

                  <div className="mt-2 space-y-1">
                  {item.children.map((child) => (
                    <button
                      key={child._id}
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedParent(item)
                        setSelectedChild(child)
                      }}
                      className={`w-full text-left px-2 py-1 rounded-lg text-xs ${
                        selectedChild?._id === child._id &&
                        selectedParent?.parent._id === item.parent._id
                          ? 'bg-blue-100 text-blue-700'
                          : 'bg-gray-50 hover:bg-gray-100'
                      }`}
                    >
                      Child: {child.name}
                    </button>
                  ))}
                </div>

                </button>

              ))}

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

            <div className="h-[32rem] bg-white rounded-2xl shadow flex items-center justify-center text-gray-500">

              Select a parent to start chatting

            </div>

          )}

        </div>

      </div>

    </div>
  )
}

export default StaffParentChats

