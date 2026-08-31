

import { useState } from 'react'
import { useDispatch } from 'react-redux'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { loginSuccess } from '../../store/slices/authSlice'
import { ROUTES } from '../../constants'
import { GoogleLogin } from '@react-oauth/google'
import { toast } from 'react-toastify'
import { isValidEmail } from '../../utils/validators'
import { getDashboardRoute } from '../../constants'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const dispatch = useDispatch()
  const navigate = useNavigate()

  const redirectByRole = (role) => {
        switch (role) {
          case 'admin':
            return '/admin/dashboard'

          case 'owner':
            return '/owner/dashboard'

          case 'parent':
            return '/parent/dashboard'

          case 'staff':
            return '/staff/dashboard'

          default:
            return '/login'
        }}
  const validateForm = () => {
  setError('')

        if (!isValidEmail(email.trim())) {
          toast.warning('Please enter a valid email')
          return false
        }
        if (!password) {
          toast.warning('Password is required')
          return false
        }
  return true
}

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const response = await axiosInstance.post('/auth/login', {
        email: email.trim(),
        password,
      })

      dispatch(loginSuccess({
        user: response.data.data,
        token: response.data.accessToken,
        
      }))

        navigate(redirectByRole(response.data.data.role))
      }

     catch (error) {
      toast.error(error.response?.data?.message || 'Login failed')
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
            Daycare Connect
          </h1>
          <p className="text-sm mt-1 text-dc-muted">Good to see you again</p>
        </div>

        {error && (
          <p className="text-sm px-3 py-2 rounded-xl mb-4 text-center font-medium bg-dc-error-bg text-dc-error-text">
            {error}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Email */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#7FB685" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
                <path d="M3 6l9 7 9-7" />
              </svg>
            </span>
            <input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError('') }}
              required
              className="w-full rounded-full pl-11 pr-4 py-3 text-sm outline-none transition border-[1.5px] border-dc-border text-dc-ink bg-dc-field focus:border-dc-blue"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A90A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="5" y="11" width="14" height="9" rx="2" />
                <path d="M8 11V7a4 4 0 0 1 8 0v4" />
              </svg>
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError('') }}
              required
              className="w-full rounded-full pl-11 pr-16 py-3 text-sm outline-none transition border-[1.5px] border-dc-border text-dc-ink bg-dc-field focus:border-dc-blue"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-dc-blue"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>

          <div className="text-right">
            <Link to="/forgotPassword" className="text-xs font-semibold hover:underline text-dc-green">
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            className="w-full text-white py-3 rounded-full font-semibold text-sm tracking-wide transition transform hover:scale-[1.02] active:scale-[0.98] font-baloo bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)]"
          >
            Log In
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-dc-muted">
          Don&apos;t have an account?{' '}
          <Link to={ROUTES.REGISTER} className="font-semibold hover:underline text-dc-blue">
            Register
          </Link>
        </p>
    
<div className="mt-4">
  <GoogleLogin
    onSuccess={async (credentialResponse) => {
      try {
        const response = await axiosInstance.post('/auth/google', {
          token: credentialResponse.credential
        })

        if (response.data.isNewUser) {
        // New user — send to role selection, carrying the token + basic info
        navigate('/selectRole', {
          state: {
            token: credentialResponse.credential,
            name: response.data.data.name,
            email: response.data.data.email
          }
        })
        return
      }

        dispatch(loginSuccess({
          user: response.data.data,
          token: response.data.accessToken,
        }))
      
        navigate(getDashboardRoute(response.data.data.role))

      }
       catch (error) {
          console.log('Google login error:', error)
           console.log('Response:', error.response?.data)

        toast.error(error.response?.data?.message || 'Google login failed')
      }
    }}
    onError={() => setError('Google login failed')}
  />
</div>
      </div>


      
    </div>
  )
}

export default Login