import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { API_URL } from '../lib/api'

 

export default function VehiculoDetalle() {
  const { id } = useParams()
  const [vehiculo, setVehiculo] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState()
  const [mensaje, setMensaje] = useState('')
  
  function calcDias(a, b) {
    if (!a || !b) return 0
    const d1 = new Date(a)
    const d2 = new Date(b)
    const ms = d2.getTime() - d1.getTime()
    if (isNaN(ms)) return 0
    const dias = Math.ceil(ms / 86400000)
    return dias > 0 ? dias : 0
  }
  const precioDiario = Number(vehiculo?.precio || 0)

  useEffect(() => {
    ;(async () => {
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
        {/* Reseñas eliminadas */}
        {/* Sección de reserva removida para vista solo informativa */}
      </div>
    </div>
  )
}


