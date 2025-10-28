import React, { useEffect, useState } from 'react'
import { API_URL } from '../lib/api'
import { formatDate } from '../lib/date'
import Modal from '../components/Modal'
import PasswordToggleInput from '../components/PasswordToggleInput'

export default function Admin() {
  const [usuarios, setUsuarios] = useState([])
  const [vehiculos, setVehiculos] = useState([])
  const [reservas, setReservas] = useState([])
  const [mensaje, setMensaje] = useState('')
  const [fDesde, setFDesde] = useState('')
  const [fHasta, setFHasta] = useState('')

  // Formularios
  const [uNombre, setUNombre] = useState('')
  const [uEmail, setUEmail] = useState('')
  const [uPass, setUPass] = useState('')
  const [showAdminPass, setShowAdminPass] = useState(false)
  const [createUserErrors, setCreateUserErrors] = useState({})

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
  const [vPrecio, setVPrecio] = useState('')
  const [authChecked, setAuthChecked] = useState(false)
  const [isAdmin, setIsAdmin] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [editVehiculo, setEditVehiculo] = useState(null)
  const [editDisponible, setEditDisponible] = useState(false)
  const [userEditOpen, setUserEditOpen] = useState(false)
  const [editUsuario, setEditUsuario] = useState(null)
  const [userErrors, setUserErrors] = useState({})

  function parsePrecio(input) {
    if (input == null) return undefined
    let s = String(input).trim()
    if (!s) return undefined
    // Convertir formatos comunes: "25.000" -> 25000, "25.000,50" -> 25000.50, "25,000.50" -> 25000.50
    const hasComma = s.includes(',')
    const hasDot = s.includes('.')
    if (hasComma && hasDot) {
      // Asumir que la coma es decimal en es-AR: quitar puntos y reemplazar coma por punto
      s = s.replace(/\./g, '').replace(',', '.')
    } else if (hasComma && !hasDot) {
      // Solo coma: tratar coma como decimal
      s = s.replace(',', '.')
    } else if (hasDot && !hasComma) {
      // Supongamos notación es-AR con separador de miles: quitar puntos
      s = s.replace(/\./g, '')
      // Si realmente querías decimal con punto (25.50), también funciona: Number('2550') no es correcto,
      // pero en nuestro flujo usaremos coma para decimales en UI. Si se desea soportar ambos, se puede
      // agregar una heurística más avanzada aquí.
    }
    const num = Number(s)
    return Number.isFinite(num) && num >= 0 ? num : undefined
  }

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
      // Reservas (solo admin)
      const rr = await fetch(`${API_URL}/api/reservas`, { headers: { Authorization: `Bearer ${token}` } })
      if (rr.ok) {
        const dr = await rr.json(); setReservas(Array.isArray(dr) ? dr : [])
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
          // Limpiar formularios al ingresar al panel
          setUNombre('')
          setUEmail('')
          setUPass('')
          setVMarca('')
          setVModelo('')
          setVAnio('')
          setVDisponible(true)
          setVImagen('')
          setVPrecio('')
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
    setCreateUserErrors({})
    const token = localStorage.getItem('token')
    if (!token) { setMensaje('Debes iniciar sesión'); return }
    try {
      const form = e.currentTarget
      const nombreVal = uNombre
      const emailVal = uEmail
      const passVal = uPass
      const errs = {}
      if (!nombreVal || String(nombreVal).trim().length < 2) errs.nombre = 'Nombre requerido'
      if (!emailVal || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailVal)) errs.email = 'Email inválido'
      if (!passVal || String(passVal).length < 6) errs.contrasena = 'La contraseña debe tener al menos 6 caracteres'
      if (Object.keys(errs).length) { setCreateUserErrors(errs); return }
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
      if (vPrecio !== '') {
        const num = parsePrecio(vPrecio)
        if (typeof num !== 'undefined') payload.precio = num
      }
      const res = await fetch(`${API_URL}/api/vehiculos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(payload)
      })
      const data = await res.json()
      if (!res.ok) { setMensaje(data?.message || 'No se pudo crear vehículo'); return }
      setVMarca(''); setVModelo(''); setVAnio(''); setVDisponible(true); setVImagen(''); setVPrecio('')
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

  function imprimirTodasLasReservas() {
    try {
      const rows = Array.isArray(reservas) ? reservas : []
      const trs = rows.map(r => {
        const total = typeof r.total !== 'undefined' ? Number(r.total).toLocaleString('es-AR') : '-'
        const precio = typeof r.precio_diario !== 'undefined' ? Number(r.precio_diario).toLocaleString('es-AR') : '-'
        return `<tr>
          <td>#${r.id}</td>
          <td>${r.usuario_id}</td>
          <td>${r.vehiculo_id}</td>
          <td>${formatDate(r.fecha_inicio)}</td>
          <td>${formatDate(r.fecha_fin)}</td>
          <td>${r.estado}</td>
          <td>$${precio}</td>
          <td>$${total}</td>
        </tr>`
      }).join('')
      const html = `<!doctype html><html><head><meta charset="utf-8"><title>Todas las reservas</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;padding:16px;color:#111}
        h1{margin:0 0 12px 0}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #ddd;padding:6px;font-size:12px}
        thead th{background:rgba(255,140,0,0.15)}
        tfoot td{font-weight:700;background:rgba(0,0,0,0.03)}
      </style>
      </head><body>
        <h1>MiProyecto - Listado de reservas</h1>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Vehículo</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Estado</th>
              <th>Precio diario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            ${trs}
          </tbody>
        </table>
        <script>window.onload = () => window.print();</script>
      </body></html>`
      const w = window.open('', '_print_all_reservas', 'width=1000,height=700')
      if (w) { w.document.write(html); w.document.close(); }
    } catch {}
  }

  function reservasFiltradas() {
    try {
      return (Array.isArray(reservas) ? reservas : []).filter(r => {
        const okDesde = !fDesde || String(r.fecha_inicio) >= fDesde
        const okHasta = !fHasta || String(r.fecha_fin) <= fHasta
        return okDesde && okHasta
      })
    } catch { return reservas }
  }

  function imprimirVisibles() {
    const rows = reservasFiltradas()
    try {
      const trs = rows.map(r => {
        const total = typeof r.total !== 'undefined' ? Number(r.total).toLocaleString('es-AR') : '-'
        const precio = typeof r.precio_diario !== 'undefined' ? Number(r.precio_diario).toLocaleString('es-AR') : '-'
        return `<tr>
          <td>#${r.id}</td>
          <td>${r.usuario_id}</td>
          <td>${r.vehiculo_id}</td>
          <td>${formatDate(r.fecha_inicio)}</td>
          <td>${formatDate(r.fecha_fin)}</td>
          <td>${r.estado}</td>
          <td>$${precio}</td>
          <td>$${total}</td>
        </tr>`
      }).join('')
      const html = `<!doctype html><html><head><meta charset=\"utf-8\"><title>Reservas filtradas</title>
      <style>
        body{font-family:Arial,Helvetica,sans-serif;padding:16px;color:#111}
        h1{margin:0 0 12px 0}
        table{width:100%;border-collapse:collapse}
        th,td{border:1px solid #ddd;padding:6px;font-size:12px}
        thead th{background:rgba(255,140,0,0.15)}
        tfoot td{font-weight:700;background:rgba(0,0,0,0.03)}
      </style>
      </head><body>
        <h1>MiProyecto - Reservas filtradas</h1>
        <div>Desde: ${fDesde || '—'} • Hasta: ${fHasta || '—'}</div>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Usuario</th>
              <th>Vehículo</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Estado</th>
              <th>Precio diario</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>${trs}</tbody>
        </table>
        <script>window.onload = () => window.print();</script>
      </body></html>`
      const w = window.open('', '_print_reservas_filtradas', 'width=1000,height=700')
      if (w) { w.document.write(html); w.document.close(); }
    } catch {}
  }

  async function actualizarEstadoReserva(id, estado) {
    setMensaje('')
    const token = localStorage.getItem('token')
    if (!token) { setMensaje('Debes iniciar sesión'); return }
    try {
      const res = await fetch(`${API_URL}/api/reservas/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado })
      })
      const data = await res.json()
      if (!res.ok) { setMensaje(data?.error || 'No se pudo actualizar la reserva'); return }
      await cargar()
    } catch { setMensaje('Error de red al actualizar reserva') }
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
          <form onSubmit={crearUsuario} className="admin-form" style={{ display:'flex', flexDirection:'column', gap:8 }} autoComplete="new-password">
            {/* Campos señuelo para mitigar autocompletar */}
            <input type="text" name="fake-username" autoComplete="username" tabIndex={-1} aria-hidden="true" style={{ position:'absolute', left:-9999, width:1, height:1, opacity:0 }} />
            <input type="password" name="fake-password" autoComplete="current-password" tabIndex={-1} aria-hidden="true" style={{ position:'absolute', left:-9999, width:1, height:1, opacity:0 }} />
            <input name="no-autofill-nombre" placeholder="Nombre" value={uNombre} onChange={e=>setUNombre(e.target.value)} required autoComplete="off" autoCapitalize="none" spellCheck={false} aria-autocomplete="none" className={createUserErrors.nombre ? 'input-invalid' : ''} />
            {createUserErrors.nombre ? <div className="field-error">{createUserErrors.nombre}</div> : null}
            <input name="no-autofill-email" placeholder="Email" type="email" value={uEmail} onChange={e=>setUEmail(e.target.value)} required autoComplete="off" autoCapitalize="none" spellCheck={false} aria-autocomplete="none" className={createUserErrors.email ? 'input-invalid' : ''} />
            {createUserErrors.email ? <div className="field-error">{createUserErrors.email}</div> : null}
            <PasswordToggleInput
              value={uPass}
              onChange={e=>setUPass(e.target.value)}
              name="new-password"
              autoComplete="new-password"
              className={createUserErrors.contrasena ? 'input-invalid' : ''}
            />
            {createUserErrors.contrasena ? <div className="field-error">{createUserErrors.contrasena}</div> : null}
            <button type="submit">Crear usuario</button>
          </form>
          <ul style={{ marginTop:12 }}>
            {usuarios.map(u => (
              <li key={u.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <span>#{u.id} {u.nombre} ({u.email})</span>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn-success" onClick={() => { setEditUsuario(u); setUserEditOpen(true) }}>Editar</button>
                  <button className="btn-danger" onClick={(e) => eliminarUsuario(u.id, e.currentTarget)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border:'1px solid var(--card-border)', borderRadius:12, padding:16, background:'var(--card-bg)' }}>
          <h2>Vehículos</h2>
          <form onSubmit={crearVehiculo} className="admin-form" style={{ display:'flex', flexDirection:'column', gap:8 }} autoComplete="off">
            <input placeholder="Marca" value={vMarca} onChange={e=>setVMarca(e.target.value)} required autoComplete="off" />
            <input placeholder="Modelo" value={vModelo} onChange={e=>setVModelo(e.target.value)} required autoComplete="off" />
            <input placeholder="Año" type="number" value={vAnio} onChange={e=>setVAnio(e.target.value)} required autoComplete="off" />
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span className="field-label">Disponible</span>
              <button
                type="button"
                className={vDisponible ? 'btn-success' : 'btn-danger'}
                onClick={() => setVDisponible(v => !v)}
              >
                {vDisponible ? 'Disponible ✓' : 'No disponible ✖'}
              </button>
            </div>
            {/* Precio opcional */}
            <input placeholder="Precio (opcional)" type="number" step="0.01" value={vPrecio} onChange={(e)=> setVPrecio(e.target.value)} autoComplete="off" />
            <input placeholder="Imagen (archivo en /imagen)" value={vImagen} onChange={e=>setVImagen(e.target.value)} autoComplete="off" />
            <button type="submit">Crear vehículo</button>
          </form>
          <ul style={{ marginTop:12 }}>
            {vehiculos.map(v => (
              <li key={v.id} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8 }}>
                <span>#{v.id} {v.marca} {v.modelo} ({v.anio})</span>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn-success" onClick={() => { setEditVehiculo(v); setEditDisponible(!!v.disponible); setEditOpen(true) }}>Editar</button>
                  <button className="btn-danger" onClick={(e) => eliminarVehiculo(v.id, e.currentTarget)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div style={{ border:'1px solid var(--card-border)', borderRadius:12, padding:16, background:'var(--card-bg)' }}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:8, flexWrap:'wrap' }}>
            <h2 style={{ margin:0 }}>Reservas</h2>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <label className="field" style={{ margin:0 }}>
                <span>Desde</span>
                <input type="date" value={fDesde} onChange={e=>setFDesde(e.target.value)} />
              </label>
              <label className="field" style={{ margin:0 }}>
                <span>Hasta</span>
                <input type="date" value={fHasta} onChange={e=>setFHasta(e.target.value)} />
              </label>
              <button className="btn-success" onClick={imprimirVisibles}>🖨 Imprimir visibles</button>
              <button className="btn-success" onClick={imprimirTodasLasReservas}>🖨 Imprimir todas</button>
            </div>
          </div>
          <ul style={{ marginTop:12 }}>
            {reservasFiltradas().map(r => (
              <li key={r.id} style={{ display:'grid', gridTemplateColumns:'1fr auto', alignItems:'center', gap:8 }}>
                <span>
                  #{r.id} • Usuario {r.usuario_id} • Vehículo {r.vehiculo_id} • {formatDate(r.fecha_inicio)} → {formatDate(r.fecha_fin)} • {r.estado}
                  {typeof r.total !== 'undefined' ? ` • Total $${Number(r.total).toLocaleString('es-AR')}` : ''}
                </span>
                <div style={{ display:'flex', gap:8 }}>
                  <button className="btn-success" onClick={() => actualizarEstadoReserva(r.id, 'confirmada')}>Confirmar</button>
                  <button className="btn-danger" onClick={() => actualizarEstadoReserva(r.id, 'cancelada')}>Cancelar</button>
                  <button className="btn-danger" onClick={(e) => eliminarVehiculo(r.id, e.currentTarget)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>
      ) : null}

      {/* Modal edición vehículo */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Editar vehículo">
        {editVehiculo ? (
          <form className="admin-form" autoComplete="off" onSubmit={async (e) => {
            e.preventDefault(); setMensaje('')
            const token = localStorage.getItem('token')
            if (!token) { setMensaje('Debes iniciar sesión'); return }
            const formData = new FormData(e.currentTarget)
            const payload = {
              marca: formData.get('marca') || undefined,
              modelo: formData.get('modelo') || undefined,
              anio: formData.get('anio') ? Number(formData.get('anio')) : undefined,
              disponible: editDisponible,
              precio: formData.get('precio') ? parsePrecio(formData.get('precio')) : undefined,
              imagen: formData.get('imagen') || undefined,
            }
            try {
              const res = await fetch(`${API_URL}/api/vehiculos/${editVehiculo.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
              })
              const data = await res.json()
              if (!res.ok) { setMensaje(data?.error || 'No se pudo actualizar vehículo'); return }
              setMensaje('Vehículo actualizado')
              setEditOpen(false)
              setEditVehiculo(null)
              cargar()
            } catch {
              setMensaje('Error de red al actualizar vehículo')
            }
          }}>
            <label className="field-label">Marca <span className="required-mark">*</span></label>
            <input name="marca" placeholder="Marca" defaultValue={editVehiculo.marca || ''} required />
            <label className="field-label">Modelo <span className="required-mark">*</span></label>
            <input name="modelo" placeholder="Modelo" defaultValue={editVehiculo.modelo || ''} required />
            <label className="field-label">Año <span className="required-mark">*</span></label>
            <input name="anio" type="number" placeholder="Año" defaultValue={editVehiculo.anio || ''} required />
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span className="field-label">Disponible</span>
              <button
                type="button"
                className={editDisponible ? 'btn-success' : 'btn-danger'}
                onClick={() => setEditDisponible(v => !v)}
              >
                {editDisponible ? 'Disponible ✓' : 'No disponible ✖'}
              </button>
            </div>
            <input name="precio" type="number" step="0.01" placeholder="Precio" defaultValue={editVehiculo.precio ?? ''} />
            <input name="imagen" placeholder="Imagen (archivo en /imagen o URL)" defaultValue={editVehiculo.imagen || ''} style={{ marginTop: 12 }} />
            <div className="modal-actions">
              <button type="button" className="btn-danger" onClick={() => setEditOpen(false)}>✖ Cancelar</button>
              <button type="submit" className="btn-success">✓ Guardar</button>
            </div>
          </form>
        ) : null}
      </Modal>

      {/* Modal edición usuario */}
      <Modal open={userEditOpen} onClose={() => { setUserErrors({}); setUserEditOpen(false) }} title="Editar usuario">
        {editUsuario ? (
          <form className="admin-form" autoComplete="off" onSubmit={async (e) => {
            e.preventDefault(); setMensaje('')
            setUserErrors({})
            const token = localStorage.getItem('token')
            if (!token) { setMensaje('Debes iniciar sesión'); return }
            const formData = new FormData(e.currentTarget)
            const payload = {
              nombre: formData.get('nombre') || undefined,
              email: formData.get('email') || undefined,
              contrasena: formData.get('contrasena') ? String(formData.get('contrasena')) : undefined,
              rol: formData.get('rol') || undefined,
            }
            // Validación frontend básica
            const errs = {}
            if (!payload.nombre || String(payload.nombre).trim().length < 2) errs.nombre = 'Nombre requerido'
            const email = String(payload.email || '')
            if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Email inválido'
            if (payload.contrasena && String(payload.contrasena).length < 6) errs.contrasena = 'Mínimo 6 caracteres'
            if (Object.keys(errs).length) { setUserErrors(errs); return }
            try {
              const res = await fetch(`${API_URL}/api/usuarios/${editUsuario.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                body: JSON.stringify(payload)
              })
              const data = await res.json()
              if (!res.ok) { setMensaje(data?.error || 'No se pudo actualizar usuario'); return }
              setMensaje('Usuario actualizado')
              setUserEditOpen(false)
              setEditUsuario(null)
              cargar()
            } catch {
              setMensaje('Error de red al actualizar usuario')
            }
          }}>
            <label className="field-label">Nombre <span className="required-mark">*</span></label>
            <input name="nombre" placeholder="Nombre" defaultValue={editUsuario.nombre || ''} className={userErrors.nombre ? 'input-invalid' : ''} />
            {userErrors.nombre ? <div className="field-error">{userErrors.nombre}</div> : null}
            <label className="field-label">Email <span className="required-mark">*</span></label>
            <input name="email" type="email" placeholder="Email" defaultValue={editUsuario.email || ''} className={userErrors.email ? 'input-invalid' : ''} />
            {userErrors.email ? <div className="field-error">{userErrors.email}</div> : null}
            <label className="field-label">Contraseña (opcional)</label>
            <input name="contrasena" type="password" placeholder="Nueva contraseña (opcional)" autoComplete="new-password" className={userErrors.contrasena ? 'input-invalid' : ''} />
            {userErrors.contrasena ? <div className="field-error">{userErrors.contrasena}</div> : null}
            <label className="field-label">Rol</label>
            <select name="rol" defaultValue={editUsuario.rol || 'cliente'} className="translucent-select">
              <option value="cliente">cliente</option>
              <option value="admin">admin</option>
            </select>
            <div className="modal-actions">
              <button type="button" className="btn-danger" onClick={() => setUserEditOpen(false)}>✖ Cancelar</button>
              <button type="submit" className="btn-success">✓ Guardar</button>
            </div>
          </form>
        ) : null}
      </Modal>
    </div>
  )
}




