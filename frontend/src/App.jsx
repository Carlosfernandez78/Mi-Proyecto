import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Menu from './components/Menu'
import Footer from './components/Footer'
import Loan from './pages/Loan'
import NotFound from './pages/NotFound'
import Vehiculos from './pages/Vehiculos'
// Removed unused demo/components imports for simplicity
import VehiculoDetalle from './pages/VehiculoDetalle'
import Home from './pages/Home'
import Admin from './pages/Admin'
// Removed unused API_URL (centralizado en lib/api.js)

export default function App() {
  return (
    <>
      <Menu />
      <main className="main-content">
      <Routes>
        <Route path="/" element={<Navigate to="/vehiculos" replace />} />
        <Route path="/cuenta" element={<Home />} />
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/vehiculos/:id" element={<VehiculoDetalle />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reservas" element={<Loan />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </main>
      <Footer />
    </>
  )
}
