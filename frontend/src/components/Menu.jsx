import { NavLink } from "react-router-dom";
import "./Menu.css";

function Menu() {
  return (
    <header>
      <nav className="menu-principal">
        <ul>
          <li>
            {/* Enlace actualizado a /vehiculos para unificar listado */}
            <NavLink to="/vehiculos" className={({ isActive }) => (isActive ? 'seleccionado' : undefined)}>Vehículos</NavLink>
          </li>
          <li>
            {/* Acceso a login/registro */}
            <NavLink to="/cuenta" className={({ isActive }) => (isActive ? 'seleccionado' : undefined)}>Cuenta</NavLink>
          </li>
          <li>
            <NavLink to="/reservas" className={({ isActive }) => (isActive ? 'seleccionado' : undefined)}>Reservas</NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Menu;
