import { Link } from "react-router-dom";
import travolta from '../assets/travolta.gif'

function NotFound() {
  return (
    <div className="not-found-container">
      <h1>Parece que te has perdido...</h1>

      {/* Imagen de fallback segura del template de Vite */}
      {/* Uso de import para evitar rutas frágiles en build */}
      <img src={travolta} alt="404 Not Found" className="not-found-image" style={{ width: 120, height: 120, opacity: 0.6 }} />

      <div className="back-home">
        <Link to="/">Volver al inicio</Link>
      </div>
    </div>
  );
}

export default NotFound;
