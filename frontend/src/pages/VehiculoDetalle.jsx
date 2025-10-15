import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_URL } from '../lib/api'

 

export default function VehiculoDetalle() {
  const { id } = useParams()
  const [vehiculo, setVehiculo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const [mensaje, setMensaje] = useState('')
  const [fi, setFi] = useState('')
  const [ff, setFf] = useState('')
  const [resenas, setResenas] = useState([])
  const [calificacion, setCalificacion] = useState(5)
  const [texto, setTexto] = useState('')

  useEffect(() => {
    ;(async () => {
      try {
        const res = await fetch(`${API_URL}/vehiculos/${id}`)
        if (!res.ok) throw new Error('No se pudo cargar el vehículo')
        const data = await res.json()
        setVehiculo(data)
      } catch (e) {
        setError(e?.message || 'Error desconocido')
      } finally {
        setLoading(false)
      }
    })()
    ;(async () => {
      try {
        const res = await fetch(`${API_URL}/resenas/vehiculo/${id}`)
        if (!res.ok) return
        const data = await res.json()
        setResenas(Array.isArray(data) ? data : [])
      } catch {}
    })()
  }, [id])

  if (loading) return <div style={{ padding: 16 }}>Cargando...</div>
  if (error) return <div style={{ padding: 16 }}>Error: {error}</div>
  if (!vehiculo) return <div style={{ padding: 16 }}>No encontrado</div>

  return (
    <div className="detail-page">
      <div className="detail-card">
        <Link to="/" className="detail-back">← Volver</Link>
        <h2 className="detail-title">{vehiculo.marca} {vehiculo.modelo}</h2>
        <div className="detail-summary">
          <p><strong>Año:</strong> {vehiculo.anio}</p>
          <p><strong>Disponible:</strong> {vehiculo.disponible ? 'Sí' : 'No'}</p>
        </div>
        <hr />
        <h3>Reseñas</h3>
        <ul>
          {resenas.map(r => (
            <li key={r.id}>⭐ {r.calificacion} - {r.texto_resenia || '(sin texto)'} (usuario {r.id_usuario})</li>
          ))}
        </ul>
        <form className="detail-form" onSubmit={async (e) => {
          e.preventDefault()
          const token = localStorage.getItem('token')
          const usuarioId = localStorage.getItem('userId')
          if (!token || !usuarioId) { setMensaje('Debes iniciar sesión para reseñar'); return }
          try {
            const res = await fetch(`${API_URL}/resenas`, {
              method: 'POST',
              headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
              body: JSON.stringify({ id_usuario: Number(usuarioId), id_vehiculo: Number(id), texto_resenia: texto, calificacion: Number(calificacion) })
            })
            const data = await res.json()
            if (!res.ok) { setMensaje(`Error reseña: ${data?.message || 'No se pudo crear'}`); return }
            setResenas(prev => [{ id: data.id, ...data }, ...prev])
            setTexto('')
            setCalificacion(5)
            setMensaje('Reseña creada')
          } catch { setMensaje('Error de red al crear reseña') }
        }}>
          <label className="field">
            <span>Calificación</span>
            <select value={calificacion} onChange={e => setCalificacion(e.target.value)}>
              {[1,2,3,4,5].map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </label>
          <label className="field stretch">
            <span>Tu reseña (opcional)</span>
            <input placeholder="Escribe aquí" value={texto} onChange={e=>setTexto(e.target.value)} />
          </label>
          <button type="submit">Enviar reseña</button>
        </form>
        <h3>Reservar este vehículo</h3>
        <form className="detail-form" onSubmit={async (e) => {
          e.preventDefault()
          setMensaje('')
          const token = localStorage.getItem('token')
          const usuarioId = localStorage.getItem('userId')
          if (!token || !usuarioId) {
            setMensaje('Debes iniciar sesión para reservar')
            return
          }
          if (!fi || !ff) { setMensaje('Completa ambas fechas'); return }
          if (fi > ff) { setMensaje('La fecha de inicio no puede ser mayor que la de fin'); return }
          try {
            const res = await fetch(`${API_URL}/reservas`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
              },
              body: JSON.stringify({
                usuario_id: Number(usuarioId),
                vehiculo_id: Number(id),
                fecha_inicio: fi,
                fecha_fin: ff
              })
            })
            const data = await res.json()
            if (!res.ok) {
              setMensaje(`Error: ${data?.error || data?.message || 'No se pudo crear la reserva'}`)
            } else {
              setMensaje(`Reserva creada (id ${data.id})`)
              setFi('')
              setFf('')
            }
          } catch (e) {
            setMensaje('Error de red al crear la reserva')
          }
        }}>
          <label className="field">
            <span>Desde</span>
            <input type="date" value={fi} onChange={(e) => setFi(e.target.value)} required />
          </label>
          <label className="field">
            <span>Hasta</span>
            <input type="date" value={ff} onChange={(e) => setFf(e.target.value)} required />
          </label>
          <button type="submit">Reservar</button>
          <span className="detail-message">{mensaje}</span>
        </form>
      </div>
    </div>
  )
}


