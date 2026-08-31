
import { useState } from 'react'
import { Link } from 'react-router-dom'
import axiosInstance from '../../api/axiosInstance'
import { ROUTES } from '../../constants'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (loading) return

    setLoading(true)
    setError('')

    try {
      await axiosInstance.post('/auth/forgotPassword', { email })
      setSubmitted(true)
    } 
    catch (err) {
      setError(err.response?.data?.message || 'Something went wrong')
    }

    finally{
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-blue-600">DayCare Connect</h1>
          <p className="text-gray-500 text-sm mt-1">Reset your password</p>
        </div>

        {submitted ? (
          <p className="bg-green-100 text-green-600 text-sm p-3 rounded text-center">
            If an account exists with this email, a reset link has been sent. Check your inbox.
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <p className="bg-red-100 text-red-600 text-sm p-2 rounded text-center">{error}</p>}
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled= {loading}
              className={`w-full py-2 rounded text-white transition flex items-center justify-center ${
                loading
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {loading ? (
                <>
                  <svg
                    className="animate-spin h-5 w-5 mr-2"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8H4z"
                    />
                  </svg>
                  Sending...
                </>
              ) : (
                'Send Reset Link'
              )}
            </button>
          </form>
        )}

        <p className="text-center text-sm text-gray-600 mt-4">
          <Link to={ROUTES.LOGIN} className="text-blue-600 hover:underline">
            ← Back to Login
          </Link>
        </p>
      </div>
    </div>
  )
}

export default ForgotPassword