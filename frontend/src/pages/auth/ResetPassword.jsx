
import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { ROUTES } from '../../constants'
import { toast } from 'react-toastify'

const ResetPassword = () => {
  const { token } = useParams()
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
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
      setTimeout(() => navigate(ROUTES.LOGIN), 2000)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">DayCare Connect</h1>
          <p className="text-gray-500 text-sm mt-1">Set a new password</p>
        </div>

        {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded mb-4 text-center">{error}</p>}
        {success && <p className="bg-green-100 text-green-600 text-sm p-2 rounded mb-4 text-center">{success}</p>}

        {!success && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              type="password"
              placeholder="New password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
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