import { useEffect, useState } from 'react'
import { API_URL } from '../lib/api'
import IframePasswordInput from '../components/IframePasswordInput'
// const API_URL = window.API_URL || import.meta.env.VITE_API_URL || 'http://localhost:3000'

// Nota: Esta vista mantiene el bloque de autenticación.
// El listado de vehículos se ha movido y unificado en la ruta /vehiculos.
// El código previo de listado permanece comentado para referencia.

export default function Home() {
  // Listado de vehículos movido a /vehiculos; dejamos el código comentado para referencia
  const [perfil, setPerfil] = useState('')
  // estados controlados para limpiar inputs
  const [regNombre, setRegNombre] = useState('')
  const [regEmail, setRegEmail] = useState('')
  const [regPass, setRegPass] = useState('')
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPass, setLoginPass] = useState('')
  const [showLoginPass, setShowLoginPass] = useState(false)
  const [showRegPass, setShowRegPass] = useState(false)

  useEffect(() => {
    // Carga de vehículos comentada; responsabilidad ahora en /vehiculos
    ;(async () => {
      const token = localStorage.getItem('token')
      if (!token) return
      try {
        const perfilRes = await fetch(`${API_URL}/api/auth/perfil`, { headers: { Authorization: `Bearer ${token}` } })
        if (!perfilRes.ok) return
        const p = await perfilRes.json()
        setPerfil(`Usuario: ${p.nombre} (${p.email})`)
        if (p?.id) localStorage.setItem('userId', String(p.id))
        if (p?.rol) localStorage.setItem('role', String(p.rol))
      } catch {}
    })()
  }, [])

  async function onRegister(e) {
    e.preventDefault()
    const nombre = regNombre
    const email = regEmail
    const contrasena = regPass
    const res = await fetch(`${API_URL}/api/auth/register`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ nombre, email, contrasena }) })
    if (!res.ok) {
      setPerfil(`Registro error: ${await res.text()}`)
      return
    }
    const data = await res.json()
    setPerfil(`Registrado: ${data.nombre} (${data.email})`)
    setRegNombre('')
    setRegEmail('')
    setRegPass('')
  }

  async function onLogin(e) {
    e.preventDefault()
    const email = loginEmail
    const contrasena = loginPass
    const res = await fetch(`${API_URL}/api/auth/login`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, contrasena }) })
    if (!res.ok) {
      setPerfil(`Login error: ${await res.text()}`)
      return
    }
    const data = await res.json()
    const token = data.token
    localStorage.setItem('token', token)
    const perfilRes = await fetch(`${API_URL}/api/auth/perfil`, { headers: { Authorization: `Bearer ${token}` } })
    const p = await perfilRes.json()
    setPerfil(`Usuario: ${p.nombre} (${p.email})`)
    if (p?.id) localStorage.setItem('userId', String(p.id))
    if (p?.rol) localStorage.setItem('role', String(p.rol))
    setLoginEmail('')
    setLoginPass('')
  }

  function onLogout() {
    localStorage.removeItem('token')
    localStorage.removeItem('userId')
    localStorage.removeItem('role')
    setPerfil('')
  }

  return (
    <div className="account-page">
      <div className="auth-card">
        <h2 className="auth-title">Tu cuenta</h2>
        <div className="auth">
        {!perfil ? (
          <>
            <form onSubmit={onRegister} className="formRow registration" autoComplete="off" noValidate>
              {/* Campos señuelo (registro) para desactivar sugerencias/gestores */}
              <input type="text" name="fake-user-reg" autoComplete="username" tabIndex={-1} aria-hidden="true" style={{ position:'absolute', left:-9999, width:1, height:1, opacity:0 }} />
              <input type="password" name="fake-pass-reg" autoComplete="current-password" tabIndex={-1} aria-hidden="true" style={{ position:'absolute', left:-9999, width:1, height:1, opacity:0 }} />
            <label className="field-label" htmlFor="register-nombre">Nombre <span className="required-mark">*</span></label>
              <input
                id="register-nombre"
                name="register_nombre"
                type="text"
                placeholder="nombre"
                required
                value={regNombre}
                onChange={e=>setRegNombre(e.target.value)}
                autoComplete="off"
              />
            <label className="field-label" htmlFor="register-email">Email <span className="required-mark">*</span></label>
              <input
                id="register-email"
                name="registration_email"
                type="email"
                placeholder="email"
                required
                value={regEmail}
                onChange={e=>setRegEmail(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
              />
            <label className="field-label" htmlFor="register-password">Contraseña <span className="required-mark">*</span></label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="auth-input-shell" style={{ flex: 1 }}>
                  <IframePasswordInput
                    placeholder="contraseña"
                    required
                    onChange={e=>setRegPass(e.target.value)}
                    inputType={showRegPass ? 'text' : 'password'}
                  />
                </div>
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowRegPass(v => !v)}
                  tabIndex={-1}
                  aria-label={showRegPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showRegPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <span aria-hidden="true">{showRegPass ? '🙈' : '👁️'}</span>
                </button>
              </div>
              <button type="submit">Registrarse</button>
            </form>
            <div className="auth-separator">o</div>
            <form onSubmit={onLogin} className="formRow login" autoComplete="off" noValidate>
              {/* Campos señuelo para desactivar gestores de contraseñas */}
              <input type="text" name="fake-username" autoComplete="username" tabIndex={-1} aria-hidden="true" style={{ position:'absolute', left:-9999, width:1, height:1, opacity:0 }} />
              <input type="password" name="fake-password" autoComplete="current-password" tabIndex={-1} aria-hidden="true" style={{ position:'absolute', left:-9999, width:1, height:1, opacity:0 }} />

              <label className="field-label" htmlFor="login-email">Email <span className="required-mark">*</span></label>
              <input
                id="login-email"
                name="login_email"
                type="email"
                placeholder="email"
                required
                value={loginEmail}
                onChange={e=>setLoginEmail(e.target.value)}
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="none"
                spellCheck={false}
              />
              <label className="field-label" htmlFor="login-password">Contraseña <span className="required-mark">*</span></label>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <div className="auth-input-shell" style={{ flex: 1 }}>
                  <IframePasswordInput
                    placeholder="contraseña"
                    required
                    onChange={e=>setLoginPass(e.target.value)}
                    inputType={showLoginPass ? 'text' : 'password'}
                  />
                </div>
                <button
                  type="button"
                  className="auth-toggle"
                  onClick={() => setShowLoginPass(v => !v)}
                  tabIndex={-1}
                  aria-label={showLoginPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                  title={showLoginPass ? "Ocultar contraseña" : "Mostrar contraseña"}
                >
                  <span aria-hidden="true">{showLoginPass ? '🙈' : '👁️'}</span>
                </button>
              </div>
              <button type="submit">Login</button>
            </form>
          </>
        ) : (
          <div className="formRow">
            <span>{perfil}</span>
            <button className="auth-logout" onClick={onLogout}>Logout</button>
          </div>
        )}
        </div>
      </div>
    </div>
  )
}