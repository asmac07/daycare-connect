
import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'
import { useSelector } from 'react-redux'
import StaffChatWindow from '../../components/StaffChatWindow'

const ParentStaffMessages = () => {

  const { user } = useSelector((state) => state.auth)

  const [staffList, setStaffList] = useState([])
  const [selectedStaff, setSelectedStaff] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {

    const fetchAssignedStaff = async () => {

      try {

        const res = await axiosInstance.get(
          '/enrollment/my-assigned-staff'
        )

        setStaffList(res.data.data)

      } catch (error) {

        console.log('Get assigned staff error:', error)

      } finally {

        setLoading(false)

      }

    }

    fetchAssignedStaff()

  }, [])


  if (loading) {
    return (
      <div className="p-6">
        Loading staff...
      </div>
    )
  }


  return (
    <div className="p-6">

      <h1 className="text-2xl font-bold mb-5">
        Staff Chats
      </h1>


      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">

        {/* Staff List */}

        <div className="bg-white rounded-2xl shadow p-4">

          <h2 className="font-semibold mb-4">
            My Staff
          </h2>

          {staffList.length === 0 ? (

            <p className="text-gray-500 text-sm">
              No staff assigned yet.
            </p>

          ) : (

            <div className="space-y-2">

              {staffList.map((item) => (

                <button
                  key={item._id}
                  onClick={() => setSelectedStaff(item)}
                  className={`w-full text-left p-3 rounded-xl transition ${
                    selectedStaff?._id === item._id
                      ? 'bg-blue-100'
                      : 'hover:bg-gray-100'
                  }`}
                >

                  <p className="font-semibold">
                    {item.assignedStaff.name}
                  </p>

                  <p className="text-xs text-gray-500">
                    {item.assignedStaff.designation || 'Staff'}
                  </p>

                  <p className="text-xs text-gray-400">
                    Child: {item.child?.name || 'Child'}
                  </p>

                </button>

              ))}

            </div>

          )}

        </div>


        {/* Chat */}

        <div className="md:col-span-2">

          {selectedStaff ? (

     <StaffChatWindow
            daycareId={selectedStaff.daycare._id}
            parentId={user.id}
            staffId={selectedStaff.assignedStaff._id}
            otherUserName={selectedStaff.assignedStaff.name}
            designation={selectedStaff.assignedStaff.designation}
            daycareName={selectedStaff.daycare.name}
            childName={selectedStaff.child?.name}
            />
            

          ) : (

            <div className="h-[32rem] bg-white rounded-2xl shadow flex items-center justify-center text-gray-500">

              Select a staff member to start chatting

            </div>

          )}

        </div>

      </div>

    </div>
  )
}

export default ParentStaffMessages