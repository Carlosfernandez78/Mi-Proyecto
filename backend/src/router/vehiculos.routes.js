import express from "express";
import {
  listarVehiculos,
  verVehiculo,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
  vehiculosDisponibles,
  opcionesVehiculos,
} from "../controller/vehiculos.controller.js";
import authMiddleware from "../middleware/authmiddleware.js";
import verificarAdmin from "../middleware/admin.js";
import { body, query } from "express-validator";
import validateRequest from "../middleware/validateRequest.js";
import { valCreateVehiculo, valUpdateVehiculo, valVehiculoId } from "../middleware/vehiculo.validator.js";

const router = express.Router();

router.get(
  "/",
  [
    query('marca').optional().isString(),
    query('modelo').optional().isString(),
    query('anio').optional().isInt(),
    query('disponible').optional().isBoolean(),
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('sortBy').optional().isIn(['id','marca','modelo','anio','disponible']),
    query('sortDir').optional().isIn(['asc','desc','ASC','DESC'])
  ],
  validateRequest,
  listarVehiculos
);

router.get(
  "/disponibles",
  [
    query('fecha_inicio').optional().isISO8601(),
    query('fecha_fin').optional().isISO8601()
  ],
  validateRequest,
  vehiculosDisponibles
);

// Opciones (marcas y modelos)
router.get('/opciones', opcionesVehiculos);

router.get("/:id", valVehiculoId, validateRequest, verVehiculo);

// Solo admin puede crear, actualizar o eliminar vehículos
router.post(
  "/",
  authMiddleware,
  verificarAdmin,
  valCreateVehiculo,
  validateRequest,
  crearVehiculo
);

router.put(
  "/:id",
  authMiddleware,
  verificarAdmin,
  valUpdateVehiculo,
  validateRequest,
  actualizarVehiculo
);

router.delete(
  "/:id",
  authMiddleware,
  verificarAdmin,
  valVehiculoId,
  validateRequest,
  eliminarVehiculo
);

export default router;


