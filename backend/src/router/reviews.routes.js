import express from 'express';
import { listarResenasPorVehiculo, crearResena } from '../controller/reviews.controller.js';
import { valCreateReview, valVehiculoIdReview } from '../middleware/review.validator.js';
import validateRequest from '../middleware/validateRequest.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// públicas: listar reseñas por vehículo
router.get('/vehiculo/:id_vehiculo', valVehiculoIdReview, validateRequest, listarResenasPorVehiculo);

// privadas: crear reseña
router.post('/', authMiddleware, valCreateReview, validateRequest, crearResena);

export default router;


