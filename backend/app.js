/*import pool from './config/db.js';

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import usuariosRoutes from './src/router/usuarios.routes.js';
import vehiculosRoutes from './src/router/vehiculos.routes.js';
import reservasRoutes from './src/router/reservas.routes.js';
import authRoutes from './src/router/auth.routes.js';

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos (imágenes locales)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/static', express.static(path.join(__dirname, 'public')));

app.use('/usuarios', usuariosRoutes);
app.use('/vehiculos', vehiculosRoutes);
app.use('/reservas', reservasRoutes);
app.use('/auth', authRoutes);
app.use('/resenas', reviewsRoutes);

// (revert) se elimina promoción automática de admin

// Endpoint para verificar conexión a DB (comentado para evitar exposición en producción)
// app.get('/api/test/db', async (req, res) => {
//     try {
//         const [rows] = await pool.query('SELECT NOW() as tiempo_actual, DATABASE() as database_name');
//         
//         res.json({
//             success: true,
//             message: 'Conexión a la base de datos exitosa',
//             data: {
//                 timestamp: rows[0].tiempo_actual,
//                 database: rows[0].database_name,
//                 status: 'connected'
//             }
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error de conexión a la base de datos',
//             error: error.message
//         });
//     }
// });

// Endpoint para obtener información de tablas (comentado para evitar exposición en producción)
// app.get('/api/test/tables', async (req, res) => {
//     try {
//         const [rows] = await pool.query('SHOW TABLES');
//         
//         res.json({
//             success: true,
//             message: 'Tablas en la base de datos',
//             tables: rows.map(row => Object.values(row)[0])
//         });
//     } catch (error) {
//         res.status(500).json({
//             success: false,
//             message: 'Error obteniendo tablas',
//             error: error.message
//         });
//     }
// });


// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Error handler
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  console.error('Error no controlado:', err);
  res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});*/

import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';

// Módulos necesarios para servir archivos estáticos en ES Modules
import { fileURLToPath } from 'url';
import { dirname, join } from 'path'; 

// Importaciones de Rutas
import usuariosRoutes from './src/router/usuarios.routes.js';
import vehiculosRoutes from './src/router/vehiculos.routes.js';
import reservasRoutes from './src/router/reservas.routes.js';
import authRoutes from './src/router/auth.routes.js';

// Configurar variables de entorno
dotenv.config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Servir archivos estáticos (imágenes locales)
// Configuración correcta para obtener __dirname en entornos ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use('/static', express.static(join(__dirname, 'public')));

// Definición de Rutas de la API
// Se recomienda usar un prefijo /api para todas las rutas de la API
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/vehiculos', vehiculosRoutes);
app.use('/api/reservas', reservasRoutes);
app.use('/api/auth', authRoutes);

// Manejador de 404 - Ruta no encontrada
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Ruta no encontrada' });
});

// Manejador de Errores Global (Debe tener los 4 argumentos: err, req, res, next)
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
    console.error('Error no controlado:', err);
    // Para producción, se recomienda enviar un mensaje genérico.
    res.status(500).json({ success: false, message: 'Error interno del servidor' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor corriendo en puerto ${PORT}`);
});

