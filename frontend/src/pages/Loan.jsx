import React, { useEffect, useState } from 'react'
import { API_URL } from '../lib/api'
import { formatDate } from '../lib/date'

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
      const res = await fetch(`${API_URL}/api/reservas/usuario/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
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
    const confirmar = window.confirm('¿Estás seguro de cancelar esta reserva?')
    if (!confirmar) return
    try {
      const res = await fetch(`${API_URL}/api/reservas/${id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ estado: 'cancelada' })
      })
      if (!res.ok) {
        const t = await res.text(); setMensaje(`Error al cancelar: ${t}`); return
      }
      setMensaje('Reserva marcada como cancelada')
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
            {reservas.map(r => {
              const estado = String(r.estado || '').toLowerCase()
              const isCancelada = estado === 'cancelada'
              const estadoClass = estado === 'confirmada'
                ? 'estado-confirmada'
                : estado === 'pendiente'
                ? 'estado-pendiente'
                : 'estado-cancelada'
              return (
                <li
                  key={r.id}
                  style={{
                    opacity: isCancelada ? 0.6 : 1,
                    filter: isCancelada ? 'grayscale(0.2)' : 'none'
                  }}
                >
                  #{r.id} - Vehículo {r.vehiculo_id} - {formatDate(r.fecha_inicio)} → {formatDate(r.fecha_fin)}
                  <span className={`reserva-badge ${estadoClass}`}>{r.estado}</span>
                  {!isCancelada ? (
                    <button style={{ marginLeft: 8 }} onClick={() => cancelar(r.id)}>Cancelar</button>
                  ) : null}
                  <button className="btn-success" style={{ marginLeft: 8 }} onClick={() => {
                    const total = typeof r.total !== 'undefined' ? Number(r.total).toLocaleString('es-AR') : '-'
                    const precio = typeof r.precio_diario !== 'undefined' ? Number(r.precio_diario).toLocaleString('es-AR') : '-'
                    const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Reserva #${r.id}</title>
                    <style>
                      :root{--brand:#ff8c00;--accent:#2a9d8f}
                      body{font-family:Arial,Helvetica,sans-serif;padding:16px;color:#111}
                      .brand{display:flex;align-items:center;gap:12px;margin-bottom:10px}
                      .logo{width:28px;height:28px}
                      .title{font-size:18px;margin:0}
                      .muted{opacity:0.75;font-size:12px}
                      table{width:100%;border-collapse:collapse;margin-top:8px}
                      td{border:1px solid #ddd;padding:6px}
                      .total td{background:rgba(255,140,0,0.08);font-weight:700}
                    </style>
                    </head><body>
                      <div class=\"brand\">
                        <svg class=\"logo\" viewBox=\"0 0 24 24\" xmlns=\"http://www.w3.org/2000/svg\"><circle cx=\"12\" cy=\"12\" r=\"10\" fill=\"var(--brand)\"/><path d=\"M7 13h10l-2 4H9l-2-4Zm1.5-2a3.5 3.5 0 1 1 7 0H8.5Z\" fill=\"#fff\"/></svg>
                        <div>
                          <h1 class=\"title\">MiProyecto - Comprobante de Reserva</h1>
                          <div class=\"muted\">Reserva #${r.id}</div>
                        </div>
                      </div>
                      <table>
                        <tr><td><strong>Usuario</strong></td><td>${r.usuario_id}</td></tr>
                        <tr><td><strong>Vehículo</strong></td><td>${r.vehiculo_id}</td></tr>
                        <tr><td><strong>Desde</strong></td><td>${formatDate(r.fecha_inicio)}</td></tr>
                        <tr><td><strong>Hasta</strong></td><td>${formatDate(r.fecha_fin)}</td></tr>
                        <tr><td><strong>Estado</strong></td><td>${r.estado}</td></tr>
                        <tr><td><strong>Precio diario</strong></td><td>$${precio}</td></tr>
                        <tr class=\"total\"><td><strong>Total</strong></td><td>$${total}</td></tr>
                      </table>
                      <script>window.onload = () => window.print();</script>
                    </body></html>`
                    const w = window.open('', `_print_reserva_${r.id}`, 'width=800,height=600')
                    if (w) { w.document.write(html); w.document.close(); }
                  }}>🖨 Imprimir</button>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}
