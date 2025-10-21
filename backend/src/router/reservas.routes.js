/*import express from "express";
import {
  listarReservas,
  reservasPorUsuario,
  crearReserva,
  actualizarReserva,
  eliminarReserva
} from "../controller/reservas.controller.js";

import authMiddleware from "../middleware/authmiddleware.js";
import validateRequest from "../middleware/validateRequest.js";
import { valCreateReserva, valUpdateReserva, valReservaId } from "../middleware/reserve.validator.js";

const router = express.Router();

router.get("/", authMiddleware, listarReservas);
router.get("/usuario/:id", authMiddleware, reservasPorUsuario);
router.post(
  "/",
  authMiddleware,
  valCreateReserva,
  validateRequest,
  crearReserva
);
router.put(
  "/:id",
  authMiddleware,
  valUpdateReserva,
  validateRequest,
  actualizarReserva
);
router.delete("/:id", authMiddleware, valReservaId, validateRequest, eliminarReserva);

export default router;*/

import express from "express";
import {
  listarReservas,
  reservasPorUsuario,
  crearReserva,
  actualizarReserva,
  eliminarReserva
} from "../controller/reservas.controller.js";

import authMiddleware from "../middleware/authmiddleware.js";
import verificarAdmin from "../middleware/admin.js";
import validateRequest from "../middleware/validateRequest.js";
import { body, param } from "express-validator";

const router = express.Router();

// Listar todas las reservas (PRIVADA: solo administradores)
router.get("/", authMiddleware, verificarAdmin, listarReservas);

// Obtener reservas por un usuario específico (PRIVADA: para el usuario o admin)
router.get("/usuario/:id", authMiddleware, reservasPorUsuario);

// Crear una nueva reserva (PRIVADA y REQUIERE VALIDACIÓN OBLIGATORIA #3)
router.post(
  "/",
  authMiddleware,
  [
    body('usuario_id').isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    body('vehiculo_id').isInt({ min: 1 }).withMessage('ID de vehículo inválido'),
    body('fecha_inicio').isISO8601().toDate().withMessage('Fecha de inicio inválida (formato YYYY-MM-DD)'),
    body('fecha_fin').isISO8601().toDate().withMessage('Fecha de fin inválida (formato YYYY-MM-DD)'),
    body('estado').optional().isString().isIn(['pendiente', 'confirmada', 'cancelada']).withMessage('Estado inválido')
  ],
  validateRequest,
  crearReserva
);

// Actualizar una reserva existente (PRIVADA)
router.put(
  "/:id",
  authMiddleware,
  [
    param('id').isInt({ min: 1 }).withMessage('ID de reserva inválido'),
    body('usuario_id').optional().isInt({ min: 1 }).withMessage('ID de usuario inválido'),
    body('vehiculo_id').optional().isInt({ min: 1 }).withMessage('ID de vehículo inválido'),
    body('fecha_inicio').optional().isISO8601().toDate().withMessage('Fecha de inicio inválida'),
    body('fecha_fin').optional().isISO8601().toDate().withMessage('Fecha de fin inválida'),
    body('estado').optional().isString().isIn(['pendiente', 'confirmada', 'cancelada']).withMessage('Estado inválido')
  ],
  validateRequest,
  actualizarReserva
);

// Eliminar una reserva (PRIVADA)
router.delete("/:id", authMiddleware, [
    param('id').isInt({ min: 1 }).withMessage('ID de reserva inválido')
], validateRequest, eliminarReserva);

export default router;
