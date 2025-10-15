import express from "express";
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

export default router;
