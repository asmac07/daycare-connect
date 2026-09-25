import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { ROUTES } from '../../constants'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const validateForm = () => {
    if (!password || password.length < 6) {
      toast.error('Password must be at least 6 characters')
      return false
    }

    setError('')
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      await axiosInstance.put(`/auth/resetPassword/${token}`, { password })
      toast.success('Password reset successful! Redirecting to login...')
      setSuccess('Password reset successful! Redirecting to login...')
      setTimeout(() => navigate(ROUTES.LOGIN), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
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
          <p className="text-sm mt-1 text-dc-muted">Set a new password</p>
        </div>

        {error && (
          <p className="text-sm px-3 py-2 rounded-xl mb-4 text-center font-medium bg-dc-error-bg text-dc-error-text">
            {error}
          </p>
        )}
        {success && (
          <p className="text-sm px-3 py-2 rounded-xl mb-4 text-center font-medium bg-dc-green/15 text-dc-green">
            {success}
          </p>
        )}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4A90A4" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="11" width="14" height="9" rx="2" />
                  <path d="M8 11V7a4 4 0 0 1 8 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="New password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              className="w-full text-white py-3 rounded-full font-semibold text-sm tracking-wide transition transform hover:scale-[1.02] active:scale-[0.98] font-baloo bg-gradient-to-br from-dc-blue to-dc-green shadow-[0_10px_25px_-8px_rgba(74,144,164,0.55)]"
            >
              Reset Password
            </button>
          </form>
        )}
      </div>
    </div>
  )
}

export default ResetPassword