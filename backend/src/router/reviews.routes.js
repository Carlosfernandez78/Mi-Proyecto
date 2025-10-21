// Limpiado: se removieron variantes legacy comentadas

import express from 'express';
import { listarResenasPorVehiculo, crearResena } from '../controller/reviews.controller.js';
import { valCreateReview, valVehiculoIdReview } from '../middleware/review.validator.js';
import validateRequest from '../middleware/validateRequest.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// Rutas públicas: cualquiera puede listar las reseñas de un vehículo
router.get(
  '/vehiculo/:id_vehiculo', 
  valVehiculoIdReview, 
  validateRequest, 
  listarResenasPorVehiculo
);

// Rutas privadas: solo usuarios autenticados pueden crear una reseña
router.post(
  '/', 
  authMiddleware, 
  valCreateReview, 
  validateRequest, 
  crearResena
);

export default router;


