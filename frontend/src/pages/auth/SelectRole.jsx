import { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import axiosInstance from '../../api/axiosInstance'
import { loginSuccess } from '../../store/slices/authSlice'
import { ROLES, ROUTES } from '../../constants'
import { toast } from 'react-toastify'
import { getDashboardRoute } from '../../constants'

const SelectRole = () => {
  const [role, setRole] = useState(ROLES.PARENT)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const { token, name, email } = location.state || {}

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!token) {
      toast.error('Session expired, please try signing in with Google again')
      navigate('/login')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await axiosInstance.post('/auth/google/complete', { token, role })

      dispatch(loginSuccess({
        user: response.data.data,
        token: response.data.accessToken,

      }))

      toast.success('Account created successfully!')
      navigate(getDashboardRoute(response.data.data.role), { replace: true })

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete signup')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden px-4 bg-gradient-to-br from-dc-mist via-dc-mist-2 to-dc-mist font-nunito">

      {/* Background blobs */}
      <div className="absolute -top-24 -left-20 w-72 h-72 rounded-full opacity-40 blur-2xl pointer-events-none bg-teal-300" />
      <div className="absolute -bottom-28 -right-16 w-80 h-80 rounded-full opacity-40 blur-2xl pointer-events-none bg-lime-300" />
      <div className="absolute top-1/3 right-10 w-24 h-24 rounded-full opacity-30 blur-xl pointer-events-none hidden sm:block bg-dc-blue" />

      {/* Card */}
      <div className="relative bg-white/90 backdrop-blur-sm w-full max-w-sm rounded-[2rem] p-8 pt-10 shadow-[0_20px_50px_-12px_rgba(74,144,164,0.25)] border border-white/60">

        {/* Logo */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-3 rotate-3 bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_8px_20px_-6px_rgba(74,144,164,0.5)]">
            <svg width="34" height="34" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M6 20L20 8L34 20" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M10 18V31C10 31.5523 10.4477 32 11 32H29C29.5523 32 30 31.5523 30 31V18" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M20 27.5C20 27.5 15.5 24.8 15.5 21.7C15.5 20.1 16.7 19 18.1 19C19 19 19.7 19.4 20 20.1C20.3 19.4 21 19 21.9 19C23.3 19 24.5 20.1 24.5 21.7C24.5 24.8 20 27.5 20 27.5Z" fill="white" />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold tracking-tight font-baloo text-dc-ink">
            Almost done!
          </h1>
          <p className="text-sm mt-1 text-dc-muted text-center">
            Hi {name}, tell us how you'll use Daycare Connect
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-dc-green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="7" width="18" height="13" rx="2" />
                <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
              </svg>
            </span>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full rounded-full pl-11 pr-4 py-3 text-sm outline-none transition border-[1.5px] border-dc-border text-dc-ink bg-dc-field focus:border-dc-blue appearance-none"
            >
              <option value={ROLES.PARENT}>I'm a Parent looking for daycare</option>
              <option value={ROLES.OWNER}>I run a Daycare</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full text-white py-3 rounded-full font-semibold text-sm tracking-wide transition transform hover:scale-[1.02] active:scale-[0.98] font-baloo bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)] disabled:opacity-60"
          >
            {isSubmitting ? 'Setting up...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SelectRole