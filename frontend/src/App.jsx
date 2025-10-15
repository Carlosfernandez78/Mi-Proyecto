import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import Menu from './components/Menu'
import Footer from './components/Footer'
import Loan from './pages/Loan'
import NotFound from './pages/NotFound'
import Vehiculos from './pages/Vehiculos'
import Gancho from './pruebas/Gancho'
import VehiculosDemo from './pruebas/map'
import VehiculoCard from './components/VehiculoCard'
import VehiculoDetalle from './pages/VehiculoDetalle'
import Home from './pages/Home'
import Admin from './pages/Admin'
const API_URL = window.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function App() {
  return (
    <>
      <Menu />
      <main className="main-content">
      <Routes>
        {/* Redirección desde / hacia /vehiculos */}
        <Route path="/" element={<Home />} />
        <Route path="/cuenta" element={<Home />} />
        <Route path="/vehiculos" element={<Vehiculos />} />
        <Route path="/vehiculos/:id" element={<VehiculoDetalle />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/reservas" element={<Loan />} />
        {/* Rutas de desarrollo */}
        <Route path="/pruebas/gancho" element={<Gancho />} />
        <Route path="/pruebas/map" element={<VehiculosDemo />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
      </main>
      <Footer />
    </>
  )
}


