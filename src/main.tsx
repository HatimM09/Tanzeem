import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

// Clear old cache for fresh start
if (!localStorage.getItem('tanzeem_v2')) {
  localStorage.clear();
  localStorage.setItem('tanzeem_v2', 'true');
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
