import { NavLink } from "react-router-dom";
import "./Menu.css";
import { BRAND_NAME } from "../lib/constants";
import { useEffect, useState } from "react";

function Menu() {
  const { hasToken, isAdmin } = (() => {
    try {
      const t = Boolean(localStorage.getItem('token'))
      const r = String(localStorage.getItem('role') || '').toLowerCase() === 'admin'
      return { hasToken: t, isAdmin: r }
    } catch { return { hasToken: false, isAdmin: false } }
  })();

  const [theme, setTheme] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved;
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      return prefersDark ? 'dark' : 'light';
    } catch { return 'dark' }
  });

  useEffect(() => {
    try {
      const root = document.documentElement;
      root.setAttribute('data-theme', theme);
      localStorage.setItem('theme', theme);
    } catch {}
  }, [theme]);

  return (
    <header>
      <nav className="menu-principal">
        <div className="brand">{BRAND_NAME}</div>
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
          <li>
            <button className="theme-toggle" onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? '🌞' : '🌙'}
            </button>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Menu;
