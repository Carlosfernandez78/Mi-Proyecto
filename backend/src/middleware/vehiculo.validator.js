import { check, param, validationResult } from "express-validator";

// Adaptado a vehículos
export const valCreateVehiculo = [
  check("marca").notEmpty().withMessage("La marca es obligatoria"),
  check("modelo").notEmpty().withMessage("El modelo es obligatorio"),
  check("anio").isInt().withMessage("El año debe ser entero"),
  check("disponible").optional().isBoolean().withMessage("Disponible debe ser booleano"),
  // Permitir imagen opcional sin obligarla todavía
  check("imagen").optional().isString().withMessage("imagen debe ser string (URL)"),
  check("precio").optional().isFloat({ min: 0 }).withMessage("precio debe ser un número positivo"),
  check("descripcion").optional().isString(),
  check("combustible").optional().isIn(['nafta','diesel','hibrido','electrico','']).withMessage('combustible inválido'),
  check("transmision").optional().isIn(['manual','automatica','']).withMessage('transmisión inválida'),
  check("puertas").optional().isInt({ min: 2, max: 6 }),
  check("color").optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const valUpdateVehiculo = [
  param("id").isInt().withMessage("El ID del vehículo debe ser entero"),
  check("marca").optional().isString(),
  check("modelo").optional().isString(),
  check("anio").optional().isInt(),
  check("disponible").optional().isBoolean(),
  check("precio").optional().isFloat({ min: 0 }).withMessage("precio debe ser un número positivo"),
  check("descripcion").optional().isString(),
  check("combustible").optional().isIn(['nafta','diesel','hibrido','electrico','']).withMessage('combustible inválido'),
  check("transmision").optional().isIn(['manual','automatica','']).withMessage('transmisión inválida'),
  check("puertas").optional().isInt({ min: 2, max: 6 }),
  check("color").optional().isString(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const valVehiculoId = [
  param("id").isInt().withMessage("El ID del vehículo debe ser entero"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const valVehiculoPathId = [
  param("id").isInt().withMessage("El ID del vehículo debe ser entero"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];


