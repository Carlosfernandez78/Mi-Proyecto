import "../misEstilos.css"; // Comentado para evitar carga duplicada, ya se importa en main.jsx
import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import VehiculoCard from "../components/VehiculoCard";
import Modal from "../components/Modal";
 import { API_URL, getVehiculoImageCandidates } from '../lib/api' // Comentado: herramientas de depuración
 

 

function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [debug, setDebug] = useState(false); // Comentado: depuración JSON
  const [vehiculoSel, setVehiculoSel] = useState(null);
  const [showDesc, setShowDesc] = useState(false);
  const [showReserva, setShowReserva] = useState(false);
  const [fi, setFi] = useState('');
  const [ff, setFf] = useState('');
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    async function fetchVehiculos() {
      try {
        const res = await fetch(`${API_URL}/api/vehiculos`)
        if (!res.ok) throw new Error('Error cargando vehículos')
        const data = await res.json()
        const archivosPorId = {
          1: 'Toyota_Corolla_2020.png',
          2: 'yaris.jpg',
          3: 'rav4-portada.jpg',
          5: 'images.jfif',
          8: 'Chevrolet_Onix.jpg',
          9: 'Chevrolet_Tracker.jpg',
          10: 'Volkswagen_Gol.JPG',
          11: 'wolks-T-Cross.jpg',
          12: 'corsa_2015.jpg'
        }
        const lista = (data.data || []).map(v => ({
          ...v,
          imagen: (v.imagen && String(v.imagen).trim()) || archivosPorId[v.id] || ''
        }))
        const excluidos = new Set([4, 6, 7])
        const listaFiltrada = lista.filter(v => !excluidos.has(Number(v.id)))
        setVehiculos(listaFiltrada)
      } catch (error) {
        console.error("Error al traer vehículos:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchVehiculos();
  }, []);

  function parseYmd(s){
    if (!s) return null
    const [y,m,d] = s.split('-').map(Number)
    if (!y||!m||!d) return null
    return new Date(y, m-1, d)
  }
  function calcDias(a, b) {
    if (!a || !b) return 0
    const d1 = parseYmd(a)
    const d2 = parseYmd(b)
    if (!d1 || !d2) return 0
    const ms = d2.getTime() - d1.getTime()
    if (isNaN(ms)) return 0
    const dias = Math.ceil(ms / 86400000)
    return dias > 0 ? dias : 0
  }
  const dias = calcDias(fi, ff)
  const precioDiario = Number(vehiculoSel?.precio || 0)
  const totalEstimado = dias > 0 && precioDiario > 0 ? Number((dias * precioDiario).toFixed(2)) : 0
  const invalidRange = fi && ff && parseYmd(fi) > parseYmd(ff)

  if (loading) return <p>Cargando vehículos...</p>;

  return (
    <>
      <Outlet />
      {/* Herramientas de depuración */}
      {import.meta.env.MODE !== 'production' ? (
        <div style={{ display:'flex', alignItems:'center', gap:8, margin:'8px 8px 0 8px' }}>
          <span style={{ opacity:0.8 }}>Vehículos: {vehiculos.length}</span>
        </div>
      ) : null}
      {debug ? (
        <pre style={{
          margin:8,
          padding:8,
          background:'rgba(0,0,0,0.4)',
          border:'1px solid rgba(255,255,255,0.2)',
          borderRadius:8,
          whiteSpace:'pre-wrap'
        }}>
{JSON.stringify(vehiculos.map(v => ({
  id: v.id,
  marca: v.marca,
  modelo: v.modelo,
  anio: v.anio,
  imagen: v.imagen,
  candidatos: getVehiculoImageCandidates(v).slice(0,6)
})), null, 2)}
        </pre>
      ) : null}
      {/* Layout responsive a ancho/alto, con scroll interno si se desborda */}
      <div
        className="vehiculos-container"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
          gridAutoRows: '1fr',
          gap: 16,
          alignContent: 'start',
          alignItems: 'stretch',
          width: '100%',
          flex: 1,
          overflow: 'auto',
          padding: 8,
          boxSizing: 'border-box'
        }}
      >
        {vehiculos.map((v) => (
          <VehiculoCard
            key={v.id}
            vehiculo={v}
            onOpenDescripcion={async (veh) => {
              setVehiculoSel(veh);
              setShowDesc(true);
              try {
                const res = await fetch(`${API_URL}/api/vehiculos/${veh.id}`)
                if (res.ok) {
                  const fresh = await res.json()
                  setVehiculoSel(prev => ({ ...prev, ...fresh }))
                }
              } catch {}
            }}
            onOpenReserva={(veh) => { setVehiculoSel(veh); setShowReserva(true); }}
          />
        ))}
      </div>

      {/* Modal de Descripción (edición para admin) */}
      <Modal open={showDesc} onClose={() => { setShowDesc(false); setVehiculoSel(null); }} title="Descripción del vehículo">
        {vehiculoSel ? (
          <div style={{ display:'grid', gap:12 }}>
            <div style={{ display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
              {vehiculoSel.imagen ? (
                <img src={`/imagen/${vehiculoSel.imagen}`} alt="vehículo" style={{ width:128, height:80, objectFit:'cover', borderRadius:8, flex:'0 0 auto' }} />
              ) : null}
              <div>
                <div><strong>{vehiculoSel.marca} {vehiculoSel.modelo}</strong></div>
                <div>Año: {vehiculoSel.anio}</div>
                <div>Disponible: {vehiculoSel.disponible ? 'Sí' : 'No'}</div>
                {typeof vehiculoSel.precio !== 'undefined' ? (
                  <div>Precio diario: ${Number(vehiculoSel.precio || 0).toLocaleString('es-AR')}</div>
                ) : null}
              </div>
            </div>
            {/* Si admin: edición en línea translúcida */}
            {(() => { try { return localStorage.getItem('role') === 'admin' } catch { return false } })() ? (
              <AdminVehiculoEditor vehiculo={vehiculoSel} onSaved={(v)=>setVehiculoSel(v)} />
            ) : (
              <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))', gap:8 }}>
                <div>Combustible: {vehiculoSel.combustible || '—'}</div>
                <div>Transmisión: {vehiculoSel.transmision || '—'}</div>
                <div>Puertas: {vehiculoSel.puertas ?? '—'}</div>
                <div>Color: {vehiculoSel.color || '—'}</div>
                <div style={{ gridColumn:'1 / -1' }}>
                  <div><strong>Descripción</strong></div>
                  <div style={{ opacity:0.9 }}>{vehiculoSel.descripcion || '—'}</div>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </Modal>

      {/* Modal de Reserva */}
      <Modal open={showReserva} onClose={() => { setShowReserva(false); setVehiculoSel(null); }} title="Reserva">
        {vehiculoSel ? (
          <div style={{ display:'grid', gap:12 }}>
            <div style={{ display:'flex', gap:12, alignItems:'center' }}>
              {vehiculoSel.imagen ? (
                <img src={`/imagen/${vehiculoSel.imagen}`} alt="vehículo" style={{ width:96, height:60, objectFit:'cover', borderRadius:8 }} />
              ) : null}
              <div>
                <div><strong>{vehiculoSel.marca} {vehiculoSel.modelo}</strong></div>
                <div>Año: {vehiculoSel.anio} · Disponible: {vehiculoSel.disponible ? 'Sí' : 'No'}</div>
                {typeof vehiculoSel.precio !== 'undefined' ? (
                  <div>Precio diario: ${Number(vehiculoSel.precio || 0).toLocaleString('es-AR')}</div>
                ) : null}
              </div>
            </div>

            {/* Reseñas eliminadas */}

            {/* Formulario reserva */}
            <form className="detail-form" onSubmit={async (e) => {
              e.preventDefault()
              setMensaje('')
              const token = localStorage.getItem('token')
              const usuarioId = localStorage.getItem('userId')
              if (!token || !usuarioId) { setMensaje('Debes iniciar sesión para reservar'); return }
              if (!fi || !ff) { setMensaje('Completa ambas fechas'); return }
              if (fi > ff) { setMensaje('La fecha de inicio no puede ser mayor que la de fin'); return }
              try {
                const res = await fetch(`${API_URL}/api/reservas`, {
                  method: 'POST',
                  headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ usuario_id: Number(usuarioId), vehiculo_id: Number(vehiculoSel.id), fecha_inicio: fi, fecha_fin: ff })
                })
                const data = await res.json()
                if (!res.ok) { setMensaje(`Error: ${data?.error || data?.message || 'No se pudo crear la reserva'}`) }
                else { setMensaje(`Reserva creada (id ${data.id})`); setFi(''); setFf('') }
              } catch { setMensaje('Error de red al crear reserva') }
            }}>
              <div className="field" style={{ display:'flex', gap:8, alignItems:'center', width: '100%' }}>
                <label className="field" style={{ width: '100%' }}>
                  <span style={{ display:'block' }}>Desde</span>
                  <input name="fecha_inicio" type="date" value={fi} onChange={(e) => setFi(e.target.value)} required />
                </label>
                <label className="field" style={{ width: '100%' }}>
                  <span style={{ display:'block' }}>Hasta</span>
                  <input name="fecha_fin" type="date" value={ff} onChange={(e) => setFf(e.target.value)} required />
                </label>
                <button type="submit" disabled={!fi || !ff || invalidRange}>Reservar</button>
              </div>
              <div>
                {dias > 0 && precioDiario > 0 ? (
                  <span><strong>Total estimado:</strong> {dias} {dias === 1 ? 'día' : 'días'} × ${precioDiario.toLocaleString('es-AR')} = ${totalEstimado.toLocaleString('es-AR')}</span>
                ) : (
                  <span style={{ opacity: 0.85 }}>Selecciona fechas para ver el total</span>
                )}
              </div>
              {invalidRange ? (
                <div className="alert alert-error" role="alert" style={{ marginTop: 6 }}>
                  La fecha de fin debe ser posterior a la fecha de inicio.
                </div>
              ) : null}
              <span className="detail-message">{mensaje}</span>
            </form>
          </div>
        ) : null}
      </Modal>
    </>
  );
}

export default Vehiculos;



// Editor en línea para administradores en el modal de descripción
import { useState as _useState, useEffect as _useEffect, useRef as _useRef } from 'react'
function AdminVehiculoEditor({ vehiculo, onSaved }) {
  const [descripcion, setDescripcion] = _useState(vehiculo.descripcion || '')
  const [combustible, setCombustible] = _useState(vehiculo.combustible || '')
  const [transmision, setTransmision] = _useState(vehiculo.transmision || '')
  const [puertas, setPuertas] = _useState(vehiculo.puertas ?? '')
  const [color, setColor] = _useState(vehiculo.color || '')
  const [precio, setPrecio] = _useState(vehiculo.precio ?? '')
  const [msg, setMsg] = _useState('')
  const [errors, setErrors] = _useState({})
  const [showComb, setShowComb] = _useState(false)
  const [showTrans, setShowTrans] = _useState(false)
  const combRef = _useRef(null)
  const transRef = _useRef(null)

  function validate() {
    const err = {}
    if (descripcion && descripcion.length > 500) err.descripcion = 'Máximo 500 caracteres'
    const fuelOk = ['', 'nafta','diesel','hibrido','electrico']
    if (combustible && !fuelOk.includes(combustible)) err.combustible = 'Valor inválido'
    const transOk = ['', 'manual','automatica']
    if (transmision && !transOk.includes(transmision)) err.transmision = 'Valor inválido'
    if (puertas !== '' ) {
      const n = Number(puertas)
      if (!Number.isInteger(n) || n < 2 || n > 6) err.puertas = 'Debe ser entero entre 2 y 6'
    }
    if (color && color.length > 30) err.color = 'Máximo 30 caracteres'
    if (precio !== '') {
      const p = Number(precio)
      if (Number.isNaN(p) || p < 0) err.precio = 'Debe ser un número ≥ 0'
    }
    return err
  }

  _useEffect(() => {
    setErrors(validate())
  }, [descripcion, combustible, transmision, puertas, color, precio])

  _useEffect(() => {
    function onDoc(e) {
      if (showComb && combRef.current && !combRef.current.contains(e.target)) setShowComb(false)
      if (showTrans && transRef.current && !transRef.current.contains(e.target)) setShowTrans(false)
    }
    document.addEventListener('click', onDoc, true)
    return () => document.removeEventListener('click', onDoc, true)
  }, [showComb, showTrans])

  const isValid = Object.keys(errors).length === 0

  async function onSave(e) {
    e.preventDefault()
    setMsg('')
    try {
      const token = localStorage.getItem('token')
      if (!token) { setMsg('No autenticado'); return }
      if (!isValid) { setMsg('Corrige los errores antes de guardar'); return }
      const res = await fetch(`${API_URL}/api/vehiculos/${vehiculo.id}`, {
        method: 'PUT',
        headers: { 'Content-Type':'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ descripcion, combustible, transmision, puertas: puertas ? Number(puertas) : null, color, precio: precio === '' ? null : Number(precio) })
      })
      if (!res.ok) {
        const t = await res.text(); setMsg(t || 'No se pudo guardar'); return
      }
      onSaved && onSaved({ ...vehiculo, descripcion, combustible, transmision, puertas: puertas ? Number(puertas) : null, color, precio })
      setMsg('Guardado')
    } catch {
      setMsg('Error de red')
    }
  }

  return (
    <form className="detail-form" onSubmit={onSave} style={{ alignItems:'stretch' }}>
      <div className="field">
        <span>Descripción</span>
        <input className={errors.descripcion ? 'input-invalid' : ''} placeholder="Descripción" value={descripcion} onChange={e=>setDescripcion(e.target.value)} />
        {errors.descripcion ? <div className="field-error">{errors.descripcion}</div> : null}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:20 }}>
        <label className="field" ref={combRef}>
          <span>Combustible</span>
          <div className="rating-select">
            <button type="button" className={`rating-trigger ${errors.combustible ? 'input-invalid' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowComb(v=>!v) }}>
              {({"":'—', nafta:'Nafta', diesel:'Diésel', hibrido:'Híbrido', electrico:'Eléctrico'})[combustible || ""]}
            </button>
            {showComb ? (
              <ul className="rating-dropdown" role="listbox">
                {["", "nafta", "diesel", "hibrido", "electrico"].map(val => (
                  <li key={val || 'none'}>
                    <button
                      type="button"
                      className="rating-option"
                      onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setCombustible(val); setShowComb(false) }}
                      role="option"
                      aria-selected={(combustible || '') === val}
                    >
                      {({"":'—', nafta:'Nafta', diesel:'Diésel', hibrido:'Híbrido', electrico:'Eléctrico'})[val || ""]}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {errors.combustible ? <div className="field-error">{errors.combustible}</div> : null}
        </label>
        <label className="field" style={{ width:'100%' }} ref={transRef}>
          <span>Transmisión</span>
          <div className="rating-select">
            <button type="button" className={`rating-trigger ${errors.transmision ? 'input-invalid' : ''}`} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setShowTrans(v=>!v) }}>
              {({"":'—', manual:'Manual', automatica:'Automática'})[transmision || ""]}
            </button>
            {showTrans ? (
              <ul className="rating-dropdown" role="listbox">
                {["", "manual", "automatica"].map(val => (
                  <li key={val || 'none'}>
                    <button
                      type="button"
                      className="rating-option"
                      onClick={(e)=>{ e.preventDefault(); e.stopPropagation(); setTransmision(val); setShowTrans(false) }}
                      role="option"
                      aria-selected={(transmision || '') === val}
                    >
                      {({"":'—', manual:'Manual', automatica:'Automática'})[val || ""]}
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          {errors.transmision ? <div className="field-error">{errors.transmision}</div> : null}
        </label>
        <label className="field" style={{ width:'100%' }}>
          <span>Puertas</span>
          <input className={errors.puertas ? 'input-invalid' : ''} type="number" min="2" max="6" placeholder="Puertas" value={puertas} onChange={e=>setPuertas(e.target.value)} />
          {errors.puertas ? <div className="field-error">{errors.puertas}</div> : null}
        </label>
        <label className="field" style={{ width:'100%' }}>
          <span>Color</span>
          <input className={errors.color ? 'input-invalid' : ''} placeholder="Color" value={color} onChange={e=>setColor(e.target.value)} />
          {errors.color ? <div className="field-error">{errors.color}</div> : null}
        </label>
        <label className="field" style={{ width:'100%' }}>
          <span>Precio diario</span>
          <input className={errors.precio ? 'input-invalid' : ''} type="number" step="0.01" min="0" placeholder="Precio" value={precio} onChange={e=>setPrecio(e.target.value)} />
          {errors.precio ? <div className="field-error">{errors.precio}</div> : null}
        </label>
      </div>
      <button type="submit" disabled={!isValid}>Guardar</button>
      <span className="detail-message">{msg}</span>
    </form>
  )
}