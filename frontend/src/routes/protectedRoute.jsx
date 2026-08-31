
import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const ProtectedRoute = ({ children, allowedRoles }) => {

  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  )

  // Not logged in
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  // User doesn't have permission for this route
  if (allowedRoles && !allowedRoles.includes(user.role)) {

    switch (user.role) {

      case 'admin':
        return <Navigate to="/admin/dashboard" replace />

      case 'owner':
        return <Navigate to="/owner/dashboard" replace />

      case 'parent':
        return <Navigate to="/parent/dashboard" replace />

      case 'staff':
        return <Navigate to="/staff/dashboard" replace />

      default:
        return <Navigate to="/login" replace />
    }
  }

  return children
}

export default ProtectedRoute