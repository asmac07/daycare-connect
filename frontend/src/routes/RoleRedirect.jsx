import { useSelector } from 'react-redux'
import { Navigate } from 'react-router-dom'

const RoleRedirect = () => {
  const { isAuthenticated, user } = useSelector(
    (state) => state.auth
  )

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

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

export default RoleRedirect