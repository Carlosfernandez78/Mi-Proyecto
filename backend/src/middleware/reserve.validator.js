import { check, param, validationResult } from "express-validator";

export const valCreateReserva = [
  check("usuario_id").isInt().withMessage("usuario_id debe ser entero"),
  check("vehiculo_id").isInt().withMessage("vehiculo_id debe ser entero"),
  check("fecha_inicio").isISO8601().withMessage("fecha_inicio inválida"),
  check("fecha_fin").isISO8601().withMessage("fecha_fin inválida"),
  check("estado").optional().isIn(['pendiente','confirmada','cancelada']).withMessage("estado inválido"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const valUpdateReserva = [
  param("id").isInt().withMessage("El ID de la reserva debe ser entero"),
  check("usuario_id").optional().isInt(),
  check("vehiculo_id").optional().isInt(),
  check("fecha_inicio").optional().isISO8601(),
  check("fecha_fin").optional().isISO8601(),
  check("estado").optional().isIn(['pendiente','confirmada','cancelada']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const valReservaId = [
  param("id").isInt().withMessage("El ID de la reserva debe ser entero"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const valUsuarioId = [
  param("id_usuario").isInt().withMessage("El ID del usuario debe ser entero"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const valVehiculoIdParam = [
  param("vehiculo_id").isInt().withMessage("El ID del vehículo debe ser entero"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
