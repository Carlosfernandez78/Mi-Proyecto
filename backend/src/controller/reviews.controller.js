import { getByVehiculoId, create as createReview } from "../model/review.model.js";

export const listarResenasPorVehiculo = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;
    const reviews = await getByVehiculoId(Number(id_vehiculo));
    res.json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener reseñas", error: error.message });
  }
};

export const crearResena = async (req, res) => {
  try {
    const { id_usuario, id_vehiculo, texto_resenia, calificacion } = req.body;
    const nueva = await createReview({ id_usuario, id_vehiculo, texto_resenia, calificacion });
    res.status(201).json(nueva);
  } catch (error) {
    res.status(500).json({ message: "Error al crear reseña", error: error.message });
  }
};


