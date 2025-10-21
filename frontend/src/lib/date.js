// Utilidades simples para formateo de fechas legibles en es-AR

export function formatDate(value) {
  if (value == null) return '-';
  const raw = String(value).trim();
  if (!raw) return '-';

  // Intentar extraer solo la parte de fecha si viene con hora ("YYYY-MM-DDTHH:mm:ss" o "YYYY-MM-DD HH:mm:ss")
  let base = raw;
  const tIdx = raw.indexOf('T');
  const sIdx = raw.indexOf(' ');
  if (tIdx !== -1) base = raw.slice(0, tIdx);
  else if (sIdx !== -1) base = raw.slice(0, sIdx);

  // Coincidencia exacta de YYYY-MM-DD para evitar desfasajes por zona horaria
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(base);
  if (m) {
    const [, y, mo, d] = m;
    return `${d}/${mo}/${y}`;
  }

  // Último recurso: objeto Date (podría sufrir TZ); mejor devolver algo legible que crudo
  const d = new Date(raw);
  if (!isNaN(d)) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }
  return raw;
}

export function formatDateTime(value) {
  if (value == null) return '-';
  const raw = String(value).trim();
  if (!raw) return '-';
  const d = new Date(raw);
  if (!isNaN(d)) {
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mi = String(d.getMinutes()).padStart(2, '0');
    return `${dd}/${mm}/${yyyy} ${hh}:${mi}`;
  }
  // Si no parsea, usar solo fecha
  return formatDate(value);
}


