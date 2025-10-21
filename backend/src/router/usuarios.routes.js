// Limpiado: se removieron variantes legacy comentadas

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
