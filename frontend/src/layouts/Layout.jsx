import { useState } from 'react'
import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { Menu } from 'lucide-react'
import { logout } from '../store/slices/authSlice'
import { ROUTES } from '../constants'
import axiosInstance from '../api/axiosInstance'
import Sidebar from '../components/Sidebar'

const Layout = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleLogout = async () => {
    try {
      await axiosInstance.post('/auth/logout')
    } catch (error) {
      console.log('Logout error:', error)
    } finally {
      window.dispatchEvent(new Event('logout'))
      dispatch(logout())
      navigate('/login')
    }
  }

  const initials = user?.name
    ? user.name
        .split(' ')
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : ''

  return (
    <div className="min-h-screen font-nunito bg-white">

      {/* ================= TOPBAR ================= */}
      <nav className="sticky top-0 z-50 w-full bg-white/95 backdrop-blur-sm border-b border-dc-border shadow-[0_4px_20px_-8px_rgba(74,144,164,0.15)]">
        <div className="px-3 sm:px-6 py-3 flex items-center justify-between gap-3">

          {/* Left Section */}
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">

            {/* Mobile Menu Button */}
            {isAuthenticated && (
              <button
                type="button"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden flex-shrink-0 w-11 h-11 flex items-center justify-center rounded-xl bg-dc-hover text-dc-blue hover:bg-dc-border active:scale-95 transition"
                aria-label="Open menu"
              >
                <Menu size={26} strokeWidth={2.5} />
              </button>
            )}

            {/* Logo */}
            <Link
              to={ROUTES.DASHBOARD}
              className="flex items-center gap-2 sm:gap-2.5 min-w-0"
            >
              {/* Logo Icon — tilted like the Login card icon */}
              <div className="w-9 h-9 sm:w-10 sm:h-10 flex-shrink-0 rounded-xl flex items-center justify-center rotate-3 bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_8px_20px_-6px_rgba(74,144,164,0.5)]">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 40 40"
                  fill="none"
                >
                  <path
                    d="M6 20L20 8L34 20"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <path
                    d="M10 18V31H30V18"
                    stroke="white"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />

                  <path
                    d="M20 27.5C20 27.5 15.5 24.8 15.5 21.7C15.5 20.1 16.7 19 18.1 19C19 19 19.7 19.4 20 20.1C20.3 19.4 21 19 21.9 19C23.3 19 24.5 20.1 24.5 21.7C24.5 24.8 20 27.5 20 27.5Z"
                    fill="white"
                  />
                </svg>
              </div>

              {/* App Name */}
              <span className="text-base sm:text-lg font-semibold tracking-tight font-baloo text-dc-ink truncate">
                Daycare Connect
              </span>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

            {isAuthenticated ? (
              <>
                {/* User */}
                <div className="flex items-center gap-2 pl-1 pr-1.5 sm:pr-3 py-1 rounded-full bg-dc-hover">

                  {/* Avatar */}
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-dc-blue to-dc-green text-white flex items-center justify-center text-xs sm:text-sm font-bold">
                    {initials || '?'}
                  </div>

                  {/* Name - hidden on mobile */}
                  <span className="text-sm font-semibold hidden sm:inline text-dc-ink max-w-[160px] truncate">
                    {user?.name}
                  </span>
                </div>

                {/* Logout — now gradient + hover lift, matches Login's button */}
                <button
                  type="button"
                  onClick={handleLogout}
                  className="px-3 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-dc-blue to-dc-green shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)] transition transform hover:scale-[1.02] active:scale-[0.98] whitespace-nowrap"
                >
                  Log out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r from-dc-blue to-dc-green shadow-sm hover:opacity-95 transition"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* ================= PAGE AREA ================= */}
      {isAuthenticated ? (
        <div className="flex min-h-[calc(100vh-65px)]">

          {/* Sidebar */}
          <Sidebar
            isOpen={sidebarOpen}
            onClose={() => setSidebarOpen(false)}
          />

          {/* Main Content / Outlet */}
          <main className="relative flex-1 min-w-0 overflow-hidden bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist">

            {/* Decorative Background Shapes — punchier, like Login's blobs */}
            <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-40 blur-2xl pointer-events-none bg-teal-300" />

            <div className="absolute top-1/3 -left-32 w-80 h-80 rounded-full opacity-40 blur-2xl pointer-events-none bg-lime-300" />

            <div className="absolute bottom-[-100px] right-1/4 w-72 h-72 rounded-full opacity-30 blur-xl pointer-events-none hidden sm:block bg-dc-blue" />

            {/* Page Content */}
            <div className="relative z-10 w-full min-h-[calc(100vh-65px)] p-4 sm:p-6 lg:p-8">
              <Outlet />
            </div>
          </main>
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  )
}

export default Layout