import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './AppRouters.jsx'
import { Toaster } from 'react-hot-toast'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
    <Toaster
        position="top-right"
        reverseOrder={false}
        toastOptions={{
          duration: 3000,
          style: {
            background: "#111827",
            color: "#fff",
            border: "1px solid #374151",
          },
        }}
      />
  </StrictMode>,
)
