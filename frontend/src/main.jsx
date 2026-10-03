import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import ErrorBoundary from './components/ErrorBoundary.jsx'
import { initAnalytics } from './analytics.js'

// Surface errors that happen outside React (timers, promises) in the console
window.addEventListener('error', (e) => console.error('Uncaught error:', e.error || e.message))
window.addEventListener('unhandledrejection', (e) => console.error('Unhandled promise rejection:', e.reason))

initAnalytics()

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)
