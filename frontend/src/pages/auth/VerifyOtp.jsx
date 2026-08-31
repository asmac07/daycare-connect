

import { useState } from 'react'
import { useNavigate, useLocation , useSearchParams } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { ROUTES } from '../../constants'
import { toast } from 'react-toastify'


const VerifyOtp = () => {
  const [otp, setOtp] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const navigate = useNavigate()

  const [searchParams] = useSearchParams()
  const email = searchParams.get('email')

  const validateForm = () => {
    setError('')
    if (!otp || otp.trim().length !== 6) {
      toast.error('Please enter the 6-digit code')
      return false
    }
    return true
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      await axiosInstance.post('/auth/verifyOtp', { email, otp: otp.trim() })
      toast.success('Email verified! Redirecting to login...')
      setTimeout(() => navigate(ROUTES.LOGIN), 1500)
    } 
    catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Verify Your Email</h1>
          <p className="text-gray-500 text-sm mt-1">
            Enter the 6-digit code sent to {email || 'your email'}
          </p>
        </div>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4 text-center">{error}</p>}
        {success && <p className="bg-green-100 text-green-600 text-sm p-2 rounded mb-4 text-center">{success}</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            maxLength={6}
            required
            className="w-full border border-gray-300 rounded px-3 py-2 text-center tracking-widest text-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            Verify
          </button>
        </form>
      </div>
    </div>
  )
}

export default VerifyOtp