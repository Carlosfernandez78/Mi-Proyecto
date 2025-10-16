/*import { getByVehiculoId, create as createReview } from "../model/review.model.js";

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
};*/

import { getByVehiculoId, create as createReview } from "../model/review.model.js";

// Listar reseñas por vehículo (se usa req.params.id_vehiculo)
export const listarResenasPorVehiculo = async (req, res) => {
  try {
    const { id_vehiculo } = req.params;
    
    // Verificación básica de que el ID es un número
    const numericId = Number(id_vehiculo);
    if (isNaN(numericId) || numericId <= 0) {
      return res.status(400).json({ message: "ID de vehículo inválido" });
    }

    const reviews = await getByVehiculoId(numericId);
    res.json(reviews);
  } catch (error) {
    console.error("Error al obtener reseñas por vehículo:", error);
    res.status(500).json({ message: "Error interno al obtener reseñas" });
  }
};

// Crear una reseña
export const crearResena = async (req, res) => {
  try {
    const { id_usuario, id_vehiculo, texto_resenia, calificacion } = req.body;

    // Validación básica de campos requeridos (para fines didácticos)
    if (!id_usuario || !id_vehiculo || !calificacion) {
      return res.status(400).json({ message: "Faltan datos obligatorios (usuario, vehículo y calificación)" });
    }
    
    // Asegurar que la calificación sea un número (la base de datos se encargará de los límites)
    const numericCalificacion = Number(calificacion);
    if (isNaN(numericCalificacion)) {
      return res.status(400).json({ message: "La calificación debe ser un número" });
    }

    const nueva = await createReview({ 
        id_usuario, 
        id_vehiculo, 
        texto_resenia, // Puede ser opcional, pero se pasa si existe
        calificacion: numericCalificacion // Se asegura que sea numérico
    });
    
    // La respuesta ahora incluye la calificación numérica
    res.status(201).json({ 
        ...nueva, 
        id_usuario, 
        id_vehiculo, 
        texto_resenia: texto_resenia || null, 
        calificacion: numericCalificacion 
    });
  } catch (error) {
    console.error("Error al crear reseña:", error);
    res.status(500).json({ message: "Error interno al crear reseña" });
  }
};
