import { NavLink } from "react-router-dom";
import "./Menu.css";

function Menu() {
  const { hasToken, isAdmin } = (() => {
    try {
      const t = Boolean(localStorage.getItem('token'))
      const r = String(localStorage.getItem('role') || '').toLowerCase() === 'admin'
      return { hasToken: t, isAdmin: r }
    } catch { return { hasToken: false, isAdmin: false } }
  })();
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
          {hasToken ? (
            <li>
              <NavLink to="/reservas" className={({ isActive }) => (isActive ? 'seleccionado' : undefined)}>Reservas</NavLink>
            </li>
          ) : null}
          {isAdmin ? (
            <li>
              <NavLink to="/admin" className={({ isActive }) => (isActive ? 'seleccionado' : undefined)}>Admin</NavLink>
            </li>
          ) : null}
        </ul>
      </nav>
    </header>
  );
}

export default Menu;
