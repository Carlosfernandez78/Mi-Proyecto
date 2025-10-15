import { useNavigate } from "react-router-dom";
import "./VehiculoCard.css";

export default function VehiculoCard({ vehiculo }) {
  const { id, marca, modelo, anio, imagen, precio, nombre } = vehiculo || {};
  const navigate = useNavigate();

  const handleClic = () => {
    if (id) navigate(`/vehiculos/${id}`);
  };

  const titulo = (nombre && String(nombre).trim()) || [marca, modelo].filter(Boolean).join(' ').trim() || 'Vehículo';
  const imagenSrc = typeof imagen === 'string' && imagen.trim() ? `/imagen/${imagen.trim()}` : undefined;
  
  // Define un objeto de estilo para la imagen de fondo
  const cardStyle = imagenSrc ? { backgroundImage: `url(${imagenSrc})` } : {};

  return (
    <div
      className="vehiculo-card"
      style={cardStyle} // Aplica el estilo dinámico aquí
      onClick={handleClic}
    >
      {/* Puedes eliminar el <img> con clase "vehiculo-fondo" */}
      
      <h3 className="vehiculo-titulo">{titulo}</h3>
      {anio ? <p className="vehiculo-detalle">Año: {anio}</p> : null}
      {typeof precio !== 'undefined' ? (
        <p className="vehiculo-precio">${precio}</p>
      ) : null}
      <button className="vehiculo-boton">Ver detalle</button>
    </div>
  );
}
