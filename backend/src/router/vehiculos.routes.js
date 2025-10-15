import express from "express";
import {
  listarVehiculos,
  verVehiculo,
  crearVehiculo,
  actualizarVehiculo,
  eliminarVehiculo,
  vehiculosDisponibles,
  // backfillImagenes
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
router.get("/:id", valVehiculoId, validateRequest, verVehiculo);

// Solo admin puede crear, actualizar o eliminar vehículos
router.post(
  "/",
  // Reactivado: proteger creación de vehículos en producción
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
router.delete("/:id", authMiddleware, verificarAdmin, valVehiculoId, validateRequest, eliminarVehiculo);

// Endpoint para completar imágenes faltantes (desactivado)
// router.post(
//   "/backfill-imagenes",
//   authMiddleware,
//   verificarAdmin,
//   async (req, res, next) => next(),
//   backfillImagenes
// );

export default router;
