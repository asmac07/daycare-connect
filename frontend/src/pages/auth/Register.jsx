

import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { ROLES, ROUTES } from '../../constants'
import { toast } from 'react-toastify'
import { isValidEmail } from '../../utils/validators'


const Register = () => {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [role, setRole] = useState(ROLES.PARENT)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()

  const validateForm = () => {
  setError('')
  setSuccess('')

  if (!name || name.trim().length < 2) {
    toast.error('Name must be at least 2 characters')
    return false
  }

  if (!isValidEmail(email)) {
    toast.error('Please enter a valid email')
    return false
  }

  if (!password || password.length < 6) {
    toast.error('Password must be at least 6 characters')
    return false
  }

  return true
}

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    try {
      await axiosInstance.post('/auth/register', { name, email, password, role })

      toast.success('Registration successful! Please check your email for a verification code.')
      setTimeout(() => navigate(`/verifyOtp?email=${encodeURIComponent(email)}`),1500) //encode is safe special charctres

    }
     catch (error) {
      toast.error(error.response?.data?.message || 'Registration failed')
    }

    finally {
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
            Daycare Connect
          </h1>
          <p className="text-sm mt-1 text-dc-muted">Create your account</p>
        </div>

        {error && (
          <p className="text-sm px-3 py-2 rounded-xl mb-4 text-center font-medium bg-dc-error-bg text-dc-error-text">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm px-3 py-2 rounded-xl mb-4 text-center font-medium bg-green-100 text-green-700">
            {success}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-dc-green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="8" r="4" />
                <path d="M4 20c0-4 3.5-7 8-7s8 3 8 7" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Full name"
              value={name}
              onChange={(e) => { setName(e.target.value); setError('') }}
              required
              className="w-full rounded-full pl-11 pr-4 py-3 text-sm outline-none transition border-[1.5px] border-dc-border text-dc-ink bg-dc-field focus:border-dc-blue"
            />
          </div>

          {/* Email */}
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-dc-green">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none text-dc-blue">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
              minLength={6}
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

          {/* Role */}
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
              <option value={ROLES.PARENT}>Parent</option>
              <option value={ROLES.OWNER}>Daycare owner</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            
            className="w-full text-white py-3 rounded-full font-semibold text-sm tracking-wide transition transform hover:scale-[1.02] active:scale-[0.98] font-baloo bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)]"
          >
            {isSubmitting ? 'Registering...' : 'Register'}
          </button>
        </form>

        <p className="text-center text-sm mt-6 text-dc-muted">
          Already have an account?{' '}
          <Link to={ROUTES.LOGIN} className="font-semibold hover:underline text-dc-blue">
            Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Register