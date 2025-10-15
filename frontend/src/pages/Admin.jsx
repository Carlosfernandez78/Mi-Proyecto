import React, { useEffect, useState } from 'react'
import { API_URL } from '../lib/api'

export default function Admin() {
  const [usuarios, setUsuarios] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [mensaje, setMensaje] = useState('')

  // Formularios
  const [uNombre, setUNombre] = useState('')
  const [uEmail, setUEmail] = useState('')
  const [uPass, setUPass] = useState('')

  const [vMarca, setVMarca] = useState('')
  const [vModelo, setVModelo] = useState('')
  const [vAnio, setVAnio] = useState('')
  const [vDisponible, setVDisponible] = useState(true)
  const [vImagen, setVImagen] = useState('')

  async function cargar() {
    setMensaje('')
    const token = localStorage.getItem('token')
    if (!token) { setMensaje('Debes iniciar sesión como admin'); return }
    try {
      // Usuarios (solo admin)
      const ru = await fetch(`${API_URL}/usuarios`, { headers: { Authorization: `Bearer ${token}` } })
      if (ru.ok) {
        const du = await ru.json(); setUsuarios(Array.isArray(du) ? du : [])
      }
      // Vehículos (público para listar)
      const rv = await fetch(`${API_URL}/vehiculos`)
      if (rv.ok) {
        const dv = await rv.json(); setVehiculos((dv?.data) || [])
      }
    } catch (e) { setMensaje('Error de red al cargar datos') }
  }

  useEffect(() => { cargar() }, [])

  async function crearUsuario(e) {
    e.preventDefault(); setMensaje('')
    const token = localStorage.getItem('token')
    if (!token) { setMensaje('Debes iniciar sesión'); return }
    try {
      const res = await fetch(`${API_URL}/usuarios`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre: uNombre, email: uEmail, contrasena: uPass })
      })
      const data = await res.json()
      if (!res.ok) { setMensaje(data?.message || 'No se pudo crear usuario'); return }
      setUNombre(''); setUEmail(''); setUPass('')
      cargar()
    } catch { setMensaje('Error de red al crear usuario') }
  }

  async function crearVehiculo(e) {
    e.preventDefault(); setMensaje('')
    const token = localStorage.getItem('token')
    if (!token) { setMensaje('Debes iniciar sesión'); return }
    try {
      const payload = { marca: vMarca, modelo: vModelo, anio: Number(vAnio), disponible: Boolean(vDisponible), imagen: vImagen }
      const res = await fetch(`${API_URL}/vehiculos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) { setMensaje(data?.message || 'No se pudo crear vehículo'); return }
      setVMarca(''); setVModelo(''); setVAnio(''); setVDisponible(true); setVImagen('')
      cargar()
    } catch { setMensaje('Error de red al crear vehículo') }
  }

  async function eliminarVehiculo(id) {
    setMensaje('')
    const token = localStorage.getItem('token')
    if (!token) { setMensaje('Debes iniciar sesión'); return }
    try {
      const res = await fetch(`${API_URL}/vehiculos/${id}`, { method:'DELETE', headers:{ Authorization: `Bearer ${token}` } })
      if (!res.ok) { const t = await res.text(); setMensaje(t || 'No se pudo eliminar'); return }
      cargar()
    } catch { setMensaje('Error de red al eliminar') }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Panel de administración</h1>
      {mensaje ? <div style={{ marginBottom: 12 }}>{mensaje}</div> : null}

      <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
        <div style={{ border:'1px solid var(--card-border)', borderRadius:12, padding:16, background:'var(--card-bg)' }}>
          <h2>Usuarios</h2>
          <form onSubmit={crearUsuario} style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <input placeholder="Nombre" value={uNombre} onChange={e=>setUNombre(e.target.value)} required />
            <input placeholder="Email" type="email" value={uEmail} onChange={e=>setUEmail(e.target.value)} required />
            <input placeholder="Contraseña" type="password" value={uPass} onChange={e=>setUPass(e.target.value)} required />
            <button type="submit">Crear usuario</button>
          </form>
          <ul style={{ marginTop:12 }}>
            {usuarios.map(u => (
              <li key={u.id}>{u.id} - {u.nombre} ({u.email})</li>
            ))}
          </ul>
        </div>

        <div style={{ border:'1px solid var(--card-border)', borderRadius:12, padding:16, background:'var(--card-bg)' }}>
          <h2>Vehículos</h2>
          <form onSubmit={crearVehiculo} style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <input placeholder="Marca" value={vMarca} onChange={e=>setVMarca(e.target.value)} required />
            <input placeholder="Modelo" value={vModelo} onChange={e=>setVModelo(e.target.value)} required />
            <input placeholder="Año" type="number" value={vAnio} onChange={e=>setVAnio(e.target.value)} required />
            <label style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="checkbox" checked={vDisponible} onChange={e=>setVDisponible(e.target.checked)} />
              Disponible
            </label>
            <input placeholder="Imagen (archivo en /imagen)" value={vImagen} onChange={e=>setVImagen(e.target.value)} />
            <button type="submit">Crear vehículo</button>
          </form>
          <ul style={{ marginTop:12 }}>
            {vehiculos.map(v => (
              <li key={v.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <span>#{v.id} {v.marca} {v.modelo} ({v.anio})</span>
                <button onClick={() => eliminarVehiculo(v.id)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </div>
  )
}




