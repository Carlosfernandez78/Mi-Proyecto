import "./VehiculoCard.css";

export default function VehiculoCard({ vehiculo, onOpenDescripcion, onOpenReserva }) {
  const { id, marca, modelo, anio, imagen, precio, nombre } = vehiculo || {};
  
  const handleOpenReserva = () => {
    onOpenReserva && onOpenReserva(vehiculo);
  };
  const handleOpenDescripcion = (e) => {
    e?.stopPropagation?.();
    onOpenDescripcion && onOpenDescripcion(vehiculo);
  };

  const titulo = (nombre && String(nombre).trim()) || [marca, modelo].filter(Boolean).join(' ').trim() || 'Vehículo';
  const imagenSrc = typeof imagen === 'string' && imagen.trim() ? `/imagen/${imagen.trim()}` : undefined;
  
  // Define un objeto de estilo para la imagen de fondo
  const cardStyle = imagenSrc ? { backgroundImage: `url(${imagenSrc})` } : {};

  return (
    <div
      className="vehiculo-card"
      style={cardStyle} // Aplica el estilo dinámico aquí
      onClick={handleOpenReserva}
    >
      {/* Puedes eliminar el <img> con clase "vehiculo-fondo" */}
      
      <h3 className="vehiculo-titulo">{titulo}</h3>
      {typeof precio !== 'undefined' ? (
        <p className="vehiculo-precio">${Number(precio).toLocaleString('es-AR')}</p>
      ) : null}
      {anio ? <p className="vehiculo-detalle">Año: {anio}</p> : null}
      <button className="vehiculo-boton" onClick={handleOpenDescripcion}>Ver detalle</button>
    </div>
  );
}
