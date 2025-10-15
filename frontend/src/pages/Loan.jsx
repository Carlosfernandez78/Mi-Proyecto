import React, { useEffect, useState } from 'react'
import { API_URL } from '../lib/api'

// const API_URL = window.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'

export default function Loan() {
  const [reservas, setReservas] = useState([])
  const [loading, setLoading] = useState(true)
  const [mensaje, setMensaje] = useState('')

  async function cargar() {
    setMensaje('')
    const token = localStorage.getItem('token')
    const userId = localStorage.getItem('userId')
    if (!token || !userId) { setMensaje('Debes iniciar sesión'); setLoading(false); return }
    try {
      const res = await fetch(`${API_URL}/reservas/usuario/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
      if (!res.ok) throw new Error('No se pudieron cargar las reservas')
      const data = await res.json()
      setReservas(Array.isArray(data) ? data : [])
    } catch (e) {
      setMensaje(e?.message || 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { cargar() }, [])

  async function cancelar(id) {
    setMensaje('')
    const token = localStorage.getItem('token')
    if (!token) { setMensaje('Sin token'); return }
    try {
      const res = await fetch(`${API_URL}/reservas/${id}`, { method:'DELETE', headers:{ Authorization: `Bearer ${token}` } })
      if (!res.ok) {
        const t = await res.text(); setMensaje(`Error al cancelar: ${t}`); return
      }
      setMensaje('Reserva cancelada')
      cargar()
    } catch { setMensaje('Error de red al cancelar') }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Mis reservas</h1>
      {loading ? (
        <div>Cargando...</div>
      ) : (
        <>
          {mensaje && <div style={{ marginBottom: 8 }}>{mensaje}</div>}
          <ul>
            {reservas.map(r => (
              <li key={r.id}>
                #{r.id} - Vehículo {r.vehiculo_id} - {r.fecha_inicio} → {r.fecha_fin} - {r.estado}
                <button style={{ marginLeft: 8 }} onClick={() => cancelar(r.id)}>Cancelar</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  )
}
