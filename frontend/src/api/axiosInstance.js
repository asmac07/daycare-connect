import axios from 'axios'

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true
})

axiosInstance.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem('token')

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    return config
  },

  (error) => {
    return Promise.reject(error)
  }
)


axiosInstance.interceptors.response.use(

  // SUCCESS
  (response) => {
    return response
  },

  // ERROR
  async (error) => {

    const originalRequest = error.config

    if (
      error.response?.status === 401 &&
      !originalRequest._retry
    ) {

      originalRequest._retry = true

      try {

        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          {
            withCredentials: true
          }
        )

        const newAccessToken =
          response.data.accessToken

        localStorage.setItem(
          'token',
          newAccessToken
        )

        originalRequest.headers.Authorization =
          `Bearer ${newAccessToken}`

        return axiosInstance(originalRequest)

      } catch (refreshError) {

        localStorage.removeItem('token')
        localStorage.removeItem('user')

        window.location.href = '/login'

        return Promise.reject(refreshError)
      }
    }

    return Promise.reject(error)
  }
)

export default axiosInstance