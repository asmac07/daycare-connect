
export const ROLES = {
  PARENT: 'parent',
  OWNER: 'owner',
  STAFF: 'staff',
  ADMIN: 'admin'
}

export const ENROLLMENT_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CONFIRMED: 'confirmed'
}

export const DAYCARE_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  SUSPENDED: 'suspended'
}

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  ADMIN: '/admin',
  
}

export const getDashboardRoute = (role) => {
  switch (role) {
    case ROLES.ADMIN: return '/admin/dashboard'
    case ROLES.OWNER: return '/owner/dashboard'
    case ROLES.PARENT: return '/parent/dashboard'
    case ROLES.STAFF: return '/staff/dashboard'
    default: return '/login'
  }
}