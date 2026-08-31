
import { Routes, Route, Navigate } from 'react-router-dom'
import { ROLES } from '../constants'

import Login from '../pages/auth/Login'
import Register from '../pages/auth/Register'
import ForgotPassword from '../pages/auth/ForgotPassword'
import ResetPassword from '../pages/auth/ResetPassword'
import VerifyOtp from '../pages/auth/VerifyOtp'

import Layout from '../layouts/Layout'
import ProtectedRoute from './ProtectedRoute'

import AdminLayout from '../layouts/AdminLayout'
import OwnerLayout from '../layouts/OwnerLayout'
import ParentLayout from '../layouts/ParentLayout'
import StaffLayout from '../layouts/StaffLayout'

import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminPanel from '../pages/admin/AdminPanel'

import OwnerDashboard from '../pages/owner/OwnerDashboard'
import OwnerDaycare from '../pages/owner/OwnerDaycare'
import OwnerEnrollments from '../pages/owner/OwnerEnrollments'
import OwnerStaff from '../pages/owner/OwnerStaff'
import OwnerReviews from '../pages/owner/OwnerReviews'
import OwnerVisitSlots from '../pages/owner/OwnerVisitSlots'
import OwnerMessages from '../pages/owner/OwnerMessages'

import ParentDashboard from '../pages/parent/ParentDashboard'
import ParentChildren from '../pages/parent/ParentChildren'
import ParentSearch from '../pages/parent/ParentSearch'
import ParentEnrollments from '../pages/parent/ParentEnrollments'
import ParentVisitSlots from '../pages/parent/ParentVisitSlots'
import ParentMessages from '../pages/parent/ParentMessages'

import StaffDashboard from '../pages/staff/StaffDashboard'
import StaffAssignedChildren from '../pages/staff/StaffAssignedChildren'
// import StaffDaycare from '../pages/staff/StaffDaycare'
import SelectRole from '../pages/auth/SelectRole'


const AppRoutes = () => {
  return (
    <Routes>

      <Route element={<Layout />}>

        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotPassword" element={<ForgotPassword />} />
        <Route path="/resetPassword/:token" element={<ResetPassword />} />
        <Route path="/verifyOtp" element={<VerifyOtp />} />
        <Route path="/selectRole" element={<SelectRole />} />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={[ROLES.ADMIN]}>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboard />} />
          <Route path="daycares" element={<AdminPanel />} />
        </Route>


        <Route
          path="/owner"
          element={
            <ProtectedRoute allowedRoles={[ROLES.OWNER]}>
              <OwnerLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<OwnerDashboard />} />
          <Route path="daycare" element={<OwnerDaycare />} />
          <Route path="enrollments" element={<OwnerEnrollments />} />
          <Route path="staff" element={<OwnerStaff />} />
          <Route path="reviews" element={<OwnerReviews />} />
          <Route path="visitSlots" element={<OwnerVisitSlots />} />
          <Route path="messages" element={<OwnerMessages />} />
        </Route>


        <Route
          path="/parent"
          element={
            <ProtectedRoute allowedRoles={[ROLES.PARENT]}>
              <ParentLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<ParentDashboard />} />
          <Route path="children" element={<ParentChildren />} />
          <Route path="search" element={<ParentSearch />} />
          <Route path="enrollments" element={<ParentEnrollments />} />
          <Route path="visitSlots" element={<ParentVisitSlots />} />
          <Route path="messages" element={<ParentMessages />} />
        </Route>

        
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={[ROLES.STAFF]}>
              <StaffLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="dashboard" replace />} />

          <Route path="dashboard" element={<StaffDashboard />} />
           <Route path="assigned-children" element={<StaffAssignedChildren />} />
        </Route>

      </Route>

    </Routes>
  )
}

export default AppRoutes