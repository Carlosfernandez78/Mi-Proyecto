// Centralización de API_URL y utilidades de cliente HTTP
// Mantener aquí para evitar repetir en múltiples vistas
export const API_URL = (typeof window !== 'undefined' && window.API_URL) || (import.meta?.env?.VITE_API_URL) || 'http://localhost:3000'

// Helpers opcionales para futuras mejoras (no usados aún)
export function getToken() {
  try {
    return localStorage.getItem('token') || ''
  } catch {
    return ''
  }
}

export function getUserId() {
  try {
    return localStorage.getItem('userId') || ''
  } catch {
    return ''
  }
}

// Generador de URL de imagen sin hardcodear datos de negocio.
// Usa un placeholder configurable por env o window y cae a una imagen pública simple.
export function getVehiculoImageUrl(vehiculo) {
  if (!vehiculo) return ''
  const direct = (vehiculo.imagen && String(vehiculo.imagen).trim()) || ''
  if (direct) return direct
  const marca = vehiculo.marca ? String(vehiculo.marca).trim() : ''
  const modelo = vehiculo.modelo ? String(vehiculo.modelo).trim() : ''
  const titulo = `${marca} ${modelo}`.trim() || 'Vehículo'
  // Imagen local automática: intenta primero el public del frontend y luego backend
  const bases = ['/', '/vehiculos', '/static/vehiculos']
  const normalize = (s) => String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar acentos
    .replace(/[^a-zA-Z0-9\s-_]/g, '') // quitar caracteres extraños
    .trim()
  const M = normalize(marca)
  const D = normalize(modelo)
  const lower = (s) => s.toLowerCase()
  const upperFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()
  const variants = []
  if (M && D) {
    const combos = [
      `${M}_${D}`,
      `${M}-${D}`,
      `${lower(M)}_${lower(D)}`,
      `${lower(M)}-${lower(D)}`,
      `${upperFirst(M)}_${upperFirst(D)}`,
      `${upperFirst(M)}-${upperFirst(D)}`
    ]
    for (const c of combos) {
      // Priorizar variantes con año primero
      if (vehiculo.anio) variants.push(`${c}_${vehiculo.anio}`, `${c}-${vehiculo.anio}`)
      variants.push(c)
    }
  }
  const candidatos = []
  for (const v of variants) {
    for (const b of bases) {
      candidatos.push(`${b}/${v}.png`, `${b}/${v}.jpg`, `${b}/${v}.jpeg`)
    }
  }
  // fallback genérico local en posibles bases
  for (const b of bases) {
    candidatos.push(`${b}/default.png`, `${b}/default.jpg`)
  }
  // Devolvemos el primer candidato; el navegador intentará cargarlo; si 404, la card quedará sin imagen de fondo
  return candidatos[0]
}

// Devuelve todas las rutas candidatas para permitir fallback progresivo en el componente
export function getVehiculoImageCandidates(vehiculo) {
  if (!vehiculo) return []
  const direct = (vehiculo.imagen && String(vehiculo.imagen).trim()) || ''
  const marca = vehiculo.marca ? String(vehiculo.marca).trim() : ''
  const modelo = vehiculo.modelo ? String(vehiculo.modelo).trim() : ''
  const bases = ['/static/vehiculos', '/vehiculos', '/']
  const normalize = (s) => String(s || '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9\s-_]/g, '')
    .trim()
  const M = normalize(marca)
  const D = normalize(modelo)
  const lower = (s) => s.toLowerCase()
  const upperFirst = (s) => s.charAt(0).toUpperCase() + s.slice(1).toLowerCase()

  const variants = []
  if (direct) variants.push(direct)
  if (M && D) {
    const combos = [
      `${M}_${D}`,
      `${M}-${D}`,
      `${lower(M)}_${lower(D)}`,
      `${lower(M)}-${lower(D)}`,
      `${upperFirst(M)}_${upperFirst(D)}`,
      `${upperFirst(M)}-${upperFirst(D)}`
    ]
    for (const c of combos) {
      variants.push(c)
      if (vehiculo.anio) variants.push(`${c}_${vehiculo.anio}`, `${c}-${vehiculo.anio}`)
    }
  }

  const candidatos = []
  for (const v of variants) {
    if (v.startsWith('/')) { candidatos.push(v); continue }
    for (const b of bases) {
      candidatos.push(`${b}/${v}.png`, `${b}/${v}.jpg`, `${b}/${v}.jpeg`)
    }
  }
  for (const b of bases) {
    candidatos.push(`${b}/default.png`, `${b}/default.jpg`)
  }
  return candidatos
}


