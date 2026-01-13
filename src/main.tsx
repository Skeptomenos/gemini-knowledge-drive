import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { initializeNetworkListener } from './stores/networkStore'
import { setupGlobalErrorHandlers } from './lib/error-handler'

initializeNetworkListener()
setupGlobalErrorHandlers()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
