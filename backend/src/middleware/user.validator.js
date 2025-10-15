import { check, param, validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import 'dotenv/config';

export const valCreateUser = [
 
  check("nombre")
    .isString()
    .withMessage("El nombre debe ser un texto.")
    .notEmpty()
    .withMessage("El nombre es un campo requerido."),

  check("email")
    .isEmail()
    .withMessage("El email debe ser un correo electrónico válido.")
    .notEmpty()
    .withMessage("El email es un campo requerido."),

  check("contrasena")
    .isString()
    .isLength({ min: 6 })
    .withMessage("La contraseña debe tener al menos 6 caracteres."),

  check("rol")
    .optional()
    .isIn(['cliente','admin'])
    .withMessage("El rol debe ser 'cliente' o 'admin'."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const valUpdateUser = [
  param("id")
    .isInt()
    .withMessage("El ID del usuario debe ser un número entero."),

  check("nombre").optional().isString().withMessage("El nombre debe ser un texto."),
  check("email").optional().isEmail().withMessage("Email inválido."),
  check("contrasena").optional().isString().isLength({ min: 6 }).withMessage("La contraseña debe tener al menos 6 caracteres."),
  check("rol").optional().isIn(['cliente','admin']).withMessage("El rol debe ser 'cliente' o 'admin'."),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

export const valUserId = [
  param("id").isInt().withMessage("El ID del usuario debe ser un número entero."),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Duplicado de authmiddleware.js — se comenta para evitar confusiones. Usar authmiddleware.js.
// export const isAutenticated = (req, res, next) => {
//   const authHeader = req.headers["authorization"] || '';
//   const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : authHeader || null;
//   if (!token) {
//     return res.status(403).json({ message: "No tienes token de autenticación, vuelve a loguear" });
//   }
//   try {
//     const claveSecreta = process.env.JWT_SECRET || 'devsecret';
//     const verified = jwt.verify(token, claveSecreta);
//     req.user = verified;
//     next();
//   } catch (error) {
//     res.status(403).json({ message: "token invalido" });
//   }
// };

// alternativa eliminada; usar isAutenticated
