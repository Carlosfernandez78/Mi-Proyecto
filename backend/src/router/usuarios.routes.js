import express from 'express';
import { obtenerUsuarios, crearUsuario } from "../controller/usuarios.controller.js";
import authMiddleware from '../middleware/authmiddleware.js';
import verificarAdmin from '../middleware/admin.js';
import { valCreateUser, valUpdateUser, valUserId } from '../middleware/user.validator.js';
import validateRequest from '../middleware/validateRequest.js';
const router = express.Router();

router.get('/', authMiddleware, verificarAdmin, obtenerUsuarios);
// Restringido: solo administradores pueden crear usuarios desde esta ruta
router.post('/', authMiddleware, verificarAdmin, valCreateUser, validateRequest, crearUsuario);

export default router;
