
import { useEffect } from 'react'
import { BrowserRouter } from 'react-router-dom'
import { useSelector } from 'react-redux'
import AppRoutes from './routes/AppRoutes'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import socket from './socket/socket'

function App() {
  const token = useSelector((state) => state.auth.token)

  useEffect(() => {
    if (token) {
      socket.auth = {
        token
      }

      if (!socket.connected) {
        socket.connect()
      }
    } else {
      if (socket.connected) {
        socket.disconnect()
      }
    }
  }, [token])

  return (
    <BrowserRouter>
      <AppRoutes />

      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="colored"
      />
    </BrowserRouter>
  )
}

export default App

