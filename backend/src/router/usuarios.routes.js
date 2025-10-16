/*import express from 'express';
import { obtenerUsuarios, crearUsuario } from "../controller/usuarios.controller.js";
import authMiddleware from '../middleware/authmiddleware.js';
import verificarAdmin from '../middleware/admin.js';
import { valCreateUser, valUpdateUser, valUserId } from '../middleware/user.validator.js';
import validateRequest from '../middleware/validateRequest.js';
const router = express.Router();

router.get('/', authMiddleware, verificarAdmin, obtenerUsuarios);
// Restringido: solo administradores pueden crear usuarios desde esta ruta
router.post('/', authMiddleware, verificarAdmin, valCreateUser, validateRequest, crearUsuario);

export default router;*/

/*import express from 'express';
// Importamos las funciones del controlador
import { listarUsuarios, crearUsuario } from "../controller/usuarios.controller.js"; 
// Eliminamos todas las importaciones de middleware de seguridad y validación
// import authMiddleware from '../middleware/authmiddleware.js';
// import verificarAdmin from '../middleware/admin.js';
// import { valCreateUser } from '../middleware/user.validator.js'; 
// import validateRequest from '../middleware/validateRequest.js';

const router = express.Router();

// GET /api/usuarios
// Acceso abierto: lista los usuarios sin verificar si es Admin o si está logueado.
router.get('/', listarUsuarios);

// POST /api/usuarios
// Acceso abierto: permite crear usuarios sin validación de campos complejos. 
// OJO: La validación de campos (nombre, email, contraseña) SÍ se mantiene en el controlador.
router.post('/', crearUsuario);

export default router;*/

import express from 'express';
import { listarUsuarios, crearUsuario, actualizarUsuario, eliminarUsuario } from "../controller/usuarios.controller.js";
import authMiddleware from '../middleware/authmiddleware.js';
import verificarAdmin from '../middleware/admin.js';
import { valCreateUser, valUpdateUser, valUserId } from '../middleware/user.validator.js';
import validateRequest from '../middleware/validateRequest.js';
const router = express.Router();

// GET /api/usuarios
// RUTA PRIVADA: Solo accesible por usuarios autenticados con rol de administrador
router.get('/', authMiddleware, verificarAdmin, listarUsuarios);

// POST /api/usuarios
// RUTA PRIVADA: Solo accesible por usuarios autenticados con rol de administrador,
// y requiere validación de campos.
router.post('/', authMiddleware, verificarAdmin, valCreateUser, validateRequest, crearUsuario);

// UPDATE y DELETE simples (privados admin) con validación mínima de ID
router.put('/:id', authMiddleware, verificarAdmin, valUpdateUser, validateRequest, actualizarUsuario);
router.delete('/:id', authMiddleware, verificarAdmin, valUserId, validateRequest, eliminarUsuario);

export default router;
