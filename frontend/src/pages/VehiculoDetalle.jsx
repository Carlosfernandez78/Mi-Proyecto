import React, { useEffect, useState, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { API_URL } from '../lib/api'

 

export default function VehiculoDetalle() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [vehiculo, setVehiculo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const [authRequired, setAuthRequired] = useState(false)
  const [mensaje, setMensaje] = useState('')
  const [fi, setFi] = useState('')
  const [ff, setFf] = useState('')
  const [resenas, setResenas] = useState([])
  const [calificacion, setCalificacion] = useState(5)
  const [showRating, setShowRating] = useState(false)
  const ratingRef = useRef(null)
  const [texto, setTexto] = useState('')
  
  function calcDias(a, b) {
    if (!a || !b) return 0
    const d1 = new Date(a)
    const d2 = new Date(b)
    const ms = d2.getTime() - d1.getTime()
    if (isNaN(ms)) return 0
    const dias = Math.ceil(ms / 86400000)
    return dias > 0 ? dias : 0
  }
  const dias = calcDias(fi, ff)
  const precioDiario = Number(vehiculo?.precio || 0)
  const totalEstimado = dias > 0 && precioDiario > 0 ? Number((dias * precioDiario).toFixed(2)) : 0
  const invalidRange = fi && ff && new Date(fi) > new Date(ff)

  useEffect(() => {
    ;(async () => {
      // Requiere login para ver detalle
      const hasToken = (() => { try { return Boolean(localStorage.getItem('token')) } catch { return false } })()
      if (!hasToken) { setAuthRequired(true); setLoading(false); navigate('/cuenta', { replace: true }); return }
      try {
        const res = await fetch(`${API_URL}/api/vehiculos/${id}`)
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
        const res = await fetch(`${API_URL}/api/resenas/vehiculo/${id}`)
        if (!res.ok) return
        const data = await res.json()
        setResenas(Array.isArray(data) ? data : [])
      } catch {}
    })()
  }, [id])

  // cerrar dropdown al click fuera
  useEffect(() => {
    function onDocClick(e) {
      const el = ratingRef.current
      if (!el) return
      if (showRating && !el.contains(e.target)) setShowRating(false)
    }
    document.addEventListener('mousedown', onDocClick)
    return () => document.removeEventListener('mousedown', onDocClick)
  }, [showRating])

  if (loading) return <div style={{ padding: 16 }}>Cargando...</div>
  if (authRequired) return <div style={{ padding: 16 }}>Inicia sesión para ver el detalle del vehículo.</div>
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
            const res = await fetch(`${API_URL}/api/resenas`, {
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
            <div className="rating-select" ref={ratingRef}>
              <button
                type="button"
                className="rating-trigger"
                onClick={() => setShowRating(v => !v)}
                aria-haspopup="listbox"
                aria-expanded={showRating}
              >
                {calificacion} ★
              </button>
              {showRating ? (
                <ul className="rating-dropdown" role="listbox">
                  {[1,2,3,4,5].map(n => (
                    <li key={n}>
                      <button
                        type="button"
                        className="rating-option"
                        onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); setCalificacion(n); setShowRating(false) }}
                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setCalificacion(n); setShowRating(false) }}
                        role="option"
                        aria-selected={calificacion === n}
                      >
                        {n} ★
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </label>
          <label className="field stretch">
            <span>Tu reseña (opcional)</span>
            <input name="texto_resenia" placeholder="Escribe aquí" value={texto} onChange={e=>setTexto(e.target.value)} />
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
            const res = await fetch(`${API_URL}/api/reservas`, {
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
              const total = typeof data.total !== 'undefined' ? Number(data.total).toLocaleString('es-AR') : undefined
              setMensaje(`Reserva creada (id ${data.id})${total ? ` - Total $${total}` : ''}`)
              setFi('')
              setFf('')
            }
          } catch (e) {
            setMensaje('Error de red al crear la reserva')
          }
        }}>
          <label className="field">
            <span>Desde</span>
            <input name="fecha_inicio" type="date" value={fi} onChange={(e) => setFi(e.target.value)} required />
          </label>
          <label className="field">
            <span>Hasta</span>
            <input name="fecha_fin" type="date" value={ff} onChange={(e) => setFf(e.target.value)} required />
          </label>
          {invalidRange ? (
            <div className="alert alert-error" role="alert" style={{ marginTop: 6 }}>
              La fecha de fin debe ser posterior a la fecha de inicio.
            </div>
          ) : null}
          <div style={{ marginTop: 4 }}>
            {dias > 0 && precioDiario > 0 ? (
              <span><strong>Total estimado:</strong> {dias} {dias === 1 ? 'día' : 'días'} × ${precioDiario.toLocaleString('es-AR')} = ${totalEstimado.toLocaleString('es-AR')}</span>
            ) : (
              <span style={{ opacity: 0.85 }}>Selecciona fechas para ver el total</span>
            )}
          </div>
          <button type="submit" disabled={!fi || !ff || invalidRange}>Reservar</button>
          <span className="detail-message">{mensaje}</span>
        </form>
      </div>
    </div>
  )
}


