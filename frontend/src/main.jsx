
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { store } from './store/store.js'
import { GoogleOAuthProvider } from '@react-oauth/google'

import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      
      <GoogleOAuthProvider clientId="980651264261-hu1s30iqn9r79akhoc4jocdqremhg4mf.apps.googleusercontent.com">
        <App />
      </GoogleOAuthProvider>

    </Provider>
  </StrictMode>,
)

