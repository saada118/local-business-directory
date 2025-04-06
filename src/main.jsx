import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import * as bootstrap from 'bootstrap';        // ✅ Import Bootstrap as object
window.bootstrap = bootstrap;                 // ✅ Make it globally available

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
