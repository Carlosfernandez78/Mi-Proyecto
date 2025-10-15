import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { BrowserRouter } from 'react-router-dom'
import './misEstilos.css'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Elemento raíz #root no encontrado')
}

createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)


