import { check, param, validationResult } from "express-validator";

// Si se usan reseñas para vehículos
export const valCreateReview = [
  check("id_usuario").isInt().withMessage("id_usuario debe ser entero"),
  check("id_vehiculo").isInt().withMessage("id_vehiculo debe ser entero"),
  check("texto_resenia").optional().isString(),
  check("calificacion").isInt({ min:1, max:5 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const valUpdateReview = [
  param("id").isInt().withMessage("El ID de la reseña debe ser entero"),
  check("id_usuario").optional().isInt(),
  check("id_vehiculo").optional().isInt(),
  check("texto_resenia").optional().isString(),
  check("calificacion").optional().isInt({ min:1, max:5 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const valReviewId = [
  param("id").isInt().withMessage("El ID de la reseña debe ser entero"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const valVehiculoIdReview = [
  param("id_vehiculo").isInt().withMessage("El ID del vehículo debe ser entero"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];
