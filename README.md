# MiProyecto

Aplicación fullstack con backend Express + MySQL y frontend React (Vite).

## Requisitos
- Node.js >= 18
- MySQL >= 8 (o compatible)
- npm (o pnpm/yarn)

## Estructura
- `backend/`: API REST (Express) + autenticación JWT + MySQL
- `frontend/`: SPA React con Vite y React Router

## Variables de entorno
Crea un archivo `.env` en `backend/` con:

```
PORT=3000
DB_HOST=localhost
DB_USER=tu_usuario
DB_PASSWORD=tu_password
DB_NAME=mi_api
JWT_SECRET=un_secreto_seguro
```

Opcionalmente, en `frontend/` puedes crear `.env`:
```
VITE_API_URL=http://localhost:3000
```

## Instalación
### Backend
```bash
cd backend
npm install
npm run migrate
# opcional: crear/actualizar un usuario admin
npm run set:admin -- --email admin@ejemplo.com --password 123456
```

### Frontend
```bash
cd frontend
npm install
```

## Desarrollo
### Levantar backend (con recarga)
```bash
cd backend
npm run dev
```

### Levantar frontend
```bash
cd frontend
npm run dev
```
La app del frontend suele correr en `http://localhost:5173` por defecto.

## Build y producción
### Backend
El backend se ejecuta con:
```bash
cd backend
npm start
```

### Frontend
Generar build:
```bash
cd frontend
npm run build
```
Previsualizar build:
```bash
cd frontend
npm run preview
```

## Base de datos
El esquema SQL de referencia está en `backend/config/mi_api.sql`.
Asegúrate de importar/crear la base de datos y credenciales acordes a tu `.env`.

## Endpoints principales (backend)
Prefijo de API: todas las rutas cuelgan de `/api`.

- Auth
  - `POST /api/auth/register`
  - `POST /api/auth/login`
  - `GET /api/auth/perfil` (requiere `Authorization: Bearer <token>`)
- Vehículos
  - `GET /api/vehiculos`
  - `GET /api/vehiculos/:id`
  - `DELETE /api/vehiculos/:id` (privado admin)
- Usuarios (privado admin)
  - `GET /api/usuarios`
  - `POST /api/usuarios`
  - `PUT /api/usuarios/:id`
  - `DELETE /api/usuarios/:id`
- Reservas (privado)
  - `GET /api/reservas` (admin)
  - `GET /api/reservas/usuario/:id` (autenticado)
  - `POST /api/reservas` (validaciones activas)
  - `PUT /api/reservas/:id` (validaciones activas)
  - `DELETE /api/reservas/:id`
- Reseñas
  - `GET /api/resenas/vehiculo/:id_vehiculo` (pública)
  - `POST /api/resenas` (privada; validaciones activas)

Validaciones con `express-validator` activas en (al menos): auth, reservas, vehículos/usuarios.

## Notas del frontend
- Rutas principales en `frontend/src/App.jsx`.
- Listado de vehículos en `frontend/src/pages/Vehiculos.jsx`.
- Detalle en `frontend/src/pages/VehiculoDetalle.jsx`.
- Cuenta (login/registro) en `frontend/src/pages/Home.jsx`.

Adicional:
- Modo claro/oscuro: alternador en el encabezado (se persiste en `localStorage` y respeta la preferencia del sistema si no hay elección).
- Impresión de reservas: disponible desde “Mis reservas” y panel Admin (abre vista imprimible compatible con PDF).
- Bloqueo de autofill/gestores de contraseñas: inputs aislados para evitar popups y autocompletados no deseados.

## Scripts útiles
### Backend (en `backend/package.json`)
- `npm run dev`: Nodemon para desarrollo
- `npm start`: Ejecuta `node app.js`
- `npm run migrate`: Ejecuta migraciones (agrega columnas faltantes)
- `npm run set:admin -- --email <mail> --password <pass>`: Crea/actualiza un usuario admin

### Frontend (en `frontend/package.json`)
- `npm run dev`: Vite dev server
- `npm run build`: Build de producción
- `npm run preview`: Previsualización de build
- `npm run lint`: Linter

## Despliegue
- Configura `VITE_API_URL` apuntando al backend desplegado
- Expone el backend en el puerto configurado por `PORT`

## Contribución
1. Crea una rama
2. Haz cambios con commits claros
3. Abre un Pull Request

## Licencia
MIT
