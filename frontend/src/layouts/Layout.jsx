
// import { Outlet, Link, useNavigate } from 'react-router-dom'
// import { useSelector, useDispatch } from 'react-redux'
// import { logout } from '../store/slices/authSlice'
// import { ROUTES } from '../constants'

// const Layout = () => {
//   const { user, isAuthenticated } = useSelector((state) => state.auth)
//   const dispatch = useDispatch()
//   const navigate = useNavigate()

//   const handleLogout = () => {
//     dispatch(logout())
//     navigate(ROUTES.LOGIN)
//   }

//   return (
//     <div>
//       <nav className="bg-white shadow-sm px-6 py-4 flex justify-between items-center">
//         <Link to={ROUTES.DASHBOARD} className="text-xl font-bold text-blue-600">
//           DayCare Connect
//         </Link>

//         <div className="flex items-center gap-4">
//           {isAuthenticated ? (
//             <>
//               <span className="text-gray-600 text-sm">{user?.name}</span>
//               <button
//                 onClick={handleLogout}
//                 className="bg-gray-200 text-gray-700 px-3 py-1.5 rounded hover:bg-gray-300 transition text-sm"
//               >
//                 Logout
//               </button>
//             </>
//           ) : (
//             <>
//               <Link to={ROUTES.LOGIN} className="text-sm text-gray-600 hover:text-blue-600">
//                 Login
//               </Link>
//               <Link
//                 to={ROUTES.REGISTER}
//                 className="bg-blue-600 text-white px-3 py-1.5 rounded hover:bg-blue-700 transition text-sm"
//               >
//                 Sign Up
//               </Link>
//             </>
//           )}
//         </div>
//       </nav>

//       <Outlet />
//     </div>
//   )
// }

// export default Layout

import { Outlet, Link, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { logout } from '../store/slices/authSlice'
import { ROUTES } from '../constants'

const Layout = () => {
  const { user, isAuthenticated } = useSelector((state) => state.auth)
  const dispatch = useDispatch()
  const navigate = useNavigate()

  
  const handleLogout = async () => {
  try {

    await axiosInstance.post('/auth/logout')

  } catch (error) {

    console.log('Logout error:', error)

  } finally {

    dispatch(logout())

    navigate('/login')
  }
}
  const initials = user?.name
    ? user.name.split(' ').map((part) => part[0]).slice(0, 2).join('').toUpperCase()
    : ''

  return (
    <div className="font-nunito">
      <nav className="px-6 py-3 flex justify-between items-center sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-dc-border shadow-[0_4px_20px_-8px_rgba(74,144,164,0.15)]">

        <Link to={ROUTES.DASHBOARD} className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_4px_10px_-3px_rgba(74,144,164,0.5)]">
            <svg width="19" height="19" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 20L20 8L34 20" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 18V31C10 31.5523 10.4477 32 11 32H29C29.5523 32 30 31.5523 30 31V18" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 27.5C20 27.5 15.5 24.8 15.5 21.7C15.5 20.1 16.7 19 18.1 19C19 19 19.7 19.4 20 20.1C20.3 19.4 21 19 21.9 19C23.3 19 24.5 20.1 24.5 21.7C24.5 24.8 20 27.5 20 27.5Z" fill="white" />
            </svg>
          </div>
          <span className="text-lg font-semibold tracking-tight font-baloo text-dc-ink">
            Daycare Connect
          </span>
        </Link>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <div className="flex items-center gap-2.5 pl-1 pr-3 py-1 rounded-full bg-dc-hover">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 text-white bg-gradient-to-br from-dc-green to-dc-blue">
                  {initials || '?'}
                </div>
                <span className="text-sm font-semibold hidden sm:inline text-dc-ink">
                  {user?.name}
                </span>
              </div>
              <button
                onClick={handleLogout}
                className="px-4 py-1.5 rounded-full text-sm font-semibold transition border-[1.5px] border-dc-border text-dc-blue bg-white hover:bg-dc-hover"
              >
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to={ROUTES.LOGIN} className="text-sm font-semibold text-dc-muted">
                Log in
              </Link>
              <Link
                to={ROUTES.REGISTER}
                className="px-4 py-1.5 rounded-full text-sm font-semibold text-white transition transform hover:scale-[1.03] font-baloo bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_6px_16px_-6px_rgba(74,144,164,0.55)]"
              >
                Sign up
              </Link>
            </>
          )}
        </div>
      </nav>

      <Outlet />
    </div>
  )
}

export default Layout