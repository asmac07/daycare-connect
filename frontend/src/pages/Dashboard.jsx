
import { useDispatch, useSelector } from 'react-redux'
import { Link, useNavigate } from 'react-router-dom'
import { logout } from '../store/slices/authSlice'
import { ROLES } from '../constants'

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth)

    const dispatch = useDispatch()
    const navigate= useNavigate()

    const handleLogout = () => {
        dispatch(logout())
        navigate('/login')
    }

  return (
       <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-3xl font-bold text-gray-800">
            Welcome, {user?.name}
          </h2>
          <button
            onClick={handleLogout}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition"
          >
            Logout
          </button>
        </div>

        {user?.role === ROLES.PARENT &&  (
            <div>
                <span className="inline-block bg-blue-100 text-blue-600 text-sm px-3 py-1 rounded-full mb-4">
                Parent Dashboard
                </span>
                <p className="text-gray-600 mb-4">Search daycares, manage your children, and track enrollments here.</p>
                <Link
                to="/parent/children"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
                >
                Go to My Dashboard →
                </Link>
            </div>
         )}
        

        {user?.role === ROLES.OWNER && (
          <div>
            <span className="inline-block bg-green-100 text-green-600 text-sm px-3 py-1 rounded-full mb-4">
              Daycare Owner Dashboard
            </span>
            <p className="text-gray-600">Manage your daycare, seats, and enrollment requests here.</p>
             <Link
                to="/owner/daycare"
                 className="inline-block bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition"
                 >
                    Go to My Daycare →
            </Link>
          </div>
        )}

        {user?.role === ROLES.STAFF && (
          <div>
            <span className="inline-block bg-yellow-100 text-yellow-600 text-sm px-3 py-1 rounded-full mb-4">
              Staff Dashboard
            </span>
            <p className="text-gray-600">View assigned children and communicate with parents here.</p>
          </div>
        )}

        {user?.role === ROLES.ADMIN &&  (
          <div>
            <span className="inline-block bg-purple-100 text-purple-600 text-sm px-3 py-1 rounded-full mb-4">
              Super Admin Dashboard
            </span>
            <p className="text-gray-600 mb-4">Review and manage daycare listings and users.</p>
            <Link
              to="/admin"
              className="inline-block bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 transition"
            >
              Go to Admin Panel →
            </Link>
          </div>
        )}

        {user?.role === ROLES.STAFF && (
            <div>
              <span className="inline-block bg-yellow-100 text-yellow-600 text-sm px-3 py-1 rounded-full mb-4">
                Staff Dashboard
              </span>
              <p className="text-gray-600 mb-4">View your assigned daycare here.</p>
              <Link
                to="/staffDashboard"
                className="inline-block bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition"
              >
                Go to My Dashboard →
              </Link>
            </div>
          )}
      </div>
    </div>
  )
}

export default Dashboard