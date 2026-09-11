
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
      navigate(getDashboardRoute(response.data.data.role))

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to complete signup')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">Almost done!</h1>
          <p className="text-gray-500 text-sm mt-1">
            Hi {name}, tell us how you'll use DayCare Connect
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full border border-gray-300 rounded px-3 py-2"
          >
            <option value={ROLES.PARENT}>I'm a Parent looking for daycare</option>
            <option value={ROLES.OWNER}>I run a Daycare</option>
          </select>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            {isSubmitting ? 'Setting up...' : 'Continue'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default SelectRole