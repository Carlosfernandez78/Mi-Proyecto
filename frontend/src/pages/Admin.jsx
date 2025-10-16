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
  const [showAdminPass, setShowAdminPass] = useState(false)

  // Bengala (spark burst) sin dependencias
  function triggerSparkAtPoint(x, y, count = 100) {
    let root = document.getElementById('spark-root')
    if (!root) {
      root = document.createElement('div')
      root.id = 'spark-root'
      root.className = 'spark-container'
      document.body.appendChild(root)
    }
    for (let i = 0; i < count; i++) {
      const piece = document.createElement('div')
      piece.className = 'spark-piece'
      const angle = Math.random() * Math.PI * 2
      const dist = 80 + Math.random() * 220
      const dx = Math.cos(angle) * dist
      const dy = Math.sin(angle) * dist
      const size = 4 + Math.random() * 8
      const dur = 700 + Math.floor(Math.random() * 700)
      piece.style.left = `${x}px`
      piece.style.top = `${y}px`
      piece.style.width = `${size}px`
      piece.style.height = `${size}px`
      piece.style.setProperty('--dx', `${dx}px`)
      piece.style.setProperty('--dy', `${dy}px`)
      piece.style.animationDuration = `${dur}ms`
      root.appendChild(piece)
      setTimeout(() => piece.remove(), dur + 200)
    }
    setTimeout(() => {
      if (root && root.childElementCount === 0) root.remove()
    }, 1500)
  }

  function triggerSparkFromButton(btn) {
    try {
      const rect = btn.getBoundingClientRect()
      const cx = Math.round(rect.left + rect.width / 2)
      const cy = Math.round(rect.top + rect.height / 2)
      // Ajuste a coordenadas de viewport -> documento (scroll)
      const scrollX = window.scrollX || window.pageXOffset || 0
      const scrollY = window.scrollY || window.pageYOffset || 0
      triggerSparkAtPoint(cx + scrollX, cy + scrollY)
    } catch {}
  }

  const [vMarca, setVMarca] = useState('')
  const [vModelo, setVModelo] = useState('')
  const [vAnio, setVAnio] = useState('')
  const [vDisponible, setVDisponible] = useState(true)
  const [vImagen, setVImagen] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)

  async function cargar() {
    setMensaje('')
    const token = localStorage.getItem('token')
    if (!token) { setMensaje('Debes iniciar sesión como admin'); return }
    try {
      // Usuarios (solo admin)
      const ru = await fetch(`${API_URL}/api/usuarios`, { headers: { Authorization: `Bearer ${token}` } })
      if (ru.ok) {
        const du = await ru.json(); setUsuarios(Array.isArray(du) ? du : [])
      }
      // Vehículos (público para listar)
      const rv = await fetch(`${API_URL}/api/vehiculos`)
      if (rv.ok) {
        const dv = await rv.json(); setVehiculos((dv?.data) || [])
      }
    } catch (e) { setMensaje('Error de red al cargar datos') }
  }

  useEffect(() => {
    (async () => {
      const token = localStorage.getItem('token')
      if (!token) { setMensaje('Debes iniciar sesión como admin'); setAuthChecked(true); return }
      try {
        const pr = await fetch(`${API_URL}/api/auth/perfil`, { headers: { Authorization: `Bearer ${token}` } })
        if (!pr.ok) { setMensaje('Acceso restringido'); return }
        const perfil = await pr.json()
        if (perfil?.rol === 'admin') {
          setIsAdmin(true)
          await cargar()
        } else {
          setMensaje('Acceso restringido a administradores')
        }
      } catch {
        setMensaje('Error de autenticación')
      } finally {
        setAuthChecked(true)
      }
    })()
  }, [])

  async function crearUsuario(e) {
    e.preventDefault(); setMensaje('')
    const token = localStorage.getItem('token')
    if (!token) { setMensaje('Debes iniciar sesión'); return }
    try {
      const res = await fetch(`${API_URL}/api/usuarios`, {
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
      const res = await fetch(`${API_URL}/api/vehiculos`, {
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

  async function eliminarUsuario(id, btnEl) {
    setMensaje('')
    const token = localStorage.getItem('token')
    if (!token) { setMensaje('Debes iniciar sesión'); return }
    const confirmar = window.confirm('¿Está seguro de realizar esta acción?')
    if (!confirmar) return
    try {
      const res = await fetch(`${API_URL}/api/usuarios/${id}`, { method:'DELETE', headers:{ Authorization: `Bearer ${token}` } })
      if (!res.ok) { const t = await res.text(); setMensaje(t || 'No se pudo eliminar usuario'); return }
      if (btnEl) triggerSparkFromButton(btnEl)
      cargar()
    } catch { setMensaje('Error de red al eliminar usuario') }
  }

  async function eliminarVehiculo(id, btnEl) {
    setMensaje('')
    const token = localStorage.getItem('token')
    if (!token) { setMensaje('Debes iniciar sesión'); return }
    const confirmar = window.confirm('¿Está seguro de realizar esta acción?')
    if (!confirmar) return
    try {
      const res = await fetch(`${API_URL}/api/vehiculos/${id}`, { method:'DELETE', headers:{ Authorization: `Bearer ${token}` } })
      if (!res.ok) { const t = await res.text(); setMensaje(t || 'No se pudo eliminar'); return }
      if (btnEl) triggerSparkFromButton(btnEl)
      cargar()
    } catch { setMensaje('Error de red al eliminar') }
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Panel de administración</h1>
      {mensaje ? <div style={{ marginBottom: 12 }}>{mensaje}</div> : null}
      {!authChecked ? (
        <div style={{ marginTop: 12 }}>Verificando permisos...</div>
      ) : !isAdmin ? (
        <div style={{ marginTop: 12 }}>Acceso restringido</div>
      ) : null}

      {isAdmin ? (
      <section style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:16 }}>
        <div style={{ border:'1px solid var(--card-border)', borderRadius:12, padding:16, background:'var(--card-bg)' }}>
          <h2>Usuarios</h2>
          <form onSubmit={crearUsuario} className="admin-form" style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <input placeholder="Nombre" value={uNombre} onChange={e=>setUNombre(e.target.value)} required />
            <input placeholder="Email" type="email" value={uEmail} onChange={e=>setUEmail(e.target.value)} required />
            <div style={{ display:'flex', alignItems:'center' }}>
              <input
                placeholder="Contraseña"
                type={showAdminPass ? 'text' : 'password'}
                value={uPass}
                onChange={e=>setUPass(e.target.value)}
                required
                style={{ flex:1 }}
              />
              <button
                type="button"
                className="auth-toggle"
                onClick={() => setShowAdminPass(v => !v)}
                tabIndex={-1}
                aria-label={showAdminPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                title={showAdminPass ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                <span aria-hidden="true">{showAdminPass ? '🙈' : '👁️'}</span>
              </button>
            </div>
            <button type="submit">Crear usuario</button>
          </form>
          <ul style={{ marginTop:12 }}>
            {usuarios.map(u => (
              <li key={u.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <span>#{u.id} {u.nombre} ({u.email})</span>
                <button className="btn-danger" onClick={(e) => eliminarUsuario(u.id, e.currentTarget)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border:'1px solid var(--card-border)', borderRadius:12, padding:16, background:'var(--card-bg)' }}>
          <h2>Vehículos</h2>
          <form onSubmit={crearVehiculo} className="admin-form" style={{ display:'flex', flexDirection:'column', gap:8 }}>
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
                <button className="btn-danger" onClick={(e) => eliminarVehiculo(v.id, e.currentTarget)}>Eliminar</button>
              </li>
            ))}
          </ul>
        </div>
      </section>
      ) : null}
    </div>
  )
}




