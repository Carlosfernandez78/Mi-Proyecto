/*import express from 'express';
import { listarResenasPorVehiculo, crearResena } from '../controller/reviews.controller.js';
import { valCreateReview, valVehiculoIdReview } from '../middleware/review.validator.js';
import validateRequest from '../middleware/validateRequest.js';
import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// públicas: listar reseñas por vehículo
router.get('/vehiculo/:id_vehiculo', valVehiculoIdReview, validateRequest, listarResenasPorVehiculo);

// privadas: crear reseña
router.post('/', authMiddleware, valCreateReview, validateRequest, crearResena);

export default router;*/

/*import express from 'express';
import { listarResenasPorVehiculo, crearResena } from '../controller/reviews.controller.js';
// Se eliminan las importaciones de middleware de seguridad y validación avanzada:
// import { valCreateReview, valVehiculoIdReview } from '../middleware/review.validator.js';
// import validateRequest from '../middleware/validateRequest.js';
// import authMiddleware from '../middleware/authmiddleware.js';

const router = express.Router();

// Públicas: listar reseñas por vehículo (acceso directo)
router.get('/vehiculo/:id_vehiculo', listarResenasPorVehiculo);

// Crear reseña (acceso directo)
router.post('/', crearResena);

export default router;*/

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


