/*import pool from "../../config/db.js";
import { obtenerVehiculos, crearVehiculo as crearVehiculoModelo, actualizarImagenPorId } from "../model/vehiculos.model.js";
// import { fetchVehicleImageUrl } from "../services/imageProvider.js"; // Desactivado por defecto: activar con PIXABAY_API_KEY

// Listar todos los vehículos
export const listarVehiculos = async (req, res) => {
  try {
    const {
      marca,
      modelo,
      anio,
      disponible,
      page = 1,
      limit = 20,
      sortBy = 'id',
      sortDir = 'asc'
    } = req.query;

    const allowedSortBy = new Set(['id','marca','modelo','anio','disponible']);
    const orderByColumn = allowedSortBy.has(String(sortBy)) ? String(sortBy) : 'id';
    const orderDirection = String(sortDir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (numericPage - 1) * numericLimit;

    const whereParts = [];
    const whereParams = [];

    if (marca) {
      whereParts.push('marca LIKE ?');
      whereParams.push(`%${marca}%`);
    }
    if (modelo) {
      whereParts.push('modelo LIKE ?');
      whereParams.push(`%${modelo}%`);
    }
    if (anio) {
      whereParts.push('anio = ?');
      whereParams.push(parseInt(anio, 10));
    }
    if (typeof disponible !== 'undefined') {
      const dispo = (String(disponible) === 'true' || String(disponible) === '1') ? 1 : 0;
      whereParts.push('disponible = ?');
      whereParams.push(dispo);
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

    // Total para paginación
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM vehiculos ${whereClause}`,
      whereParams
    );
    const total = countRows[0]?.total || 0;

    // Datos paginados
    const [rows] = await pool.query(
      `SELECT *
       FROM vehiculos
       ${whereClause}
       ORDER BY ${orderByColumn} ${orderDirection}
       LIMIT ? OFFSET ?`,
      [...whereParams, numericLimit, offset]
    );

    const totalPages = Math.ceil(total / numericLimit) || 1;

    res.json({
      data: rows,
      pagination: {
        total,
        page: numericPage,
        limit: numericLimit,
        totalPages
      }
    });
  } catch (error) {
    res.status(500).json({ error: "Error al obtener vehículos" });
  }
};

// Ver un vehículo por ID
export const verVehiculo = async (req, res) => {
  try {
    const id = req.params.id;
    const [vehiculo] = await pool.query("SELECT * FROM vehiculos WHERE id = ?", [id]);
    if (vehiculo.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    res.json(vehiculo[0]);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener el vehículo" });
  }
};

// Crear un vehículo
export const crearVehiculo = async (req, res) => {
  try {
    const body = { ...req.body };
    // Desactivado: autocompletar imagen con Pixabay
    // if (!body.imagen) {
    //   const fetched = await fetchVehicleImageUrl({ marca: body.marca, modelo: body.modelo });
    //   if (fetched) body.imagen = fetched;
    // }
    const id = await crearVehiculoModelo(body);
    res.status(201).json({ id, ...body });
  } catch (error) {
    res.status(500).json({ error: "Error al crear vehículo" });
  }
};

// Backfill de imágenes faltantes (solo admin, se enruta con middlewares en router)
// export const backfillImagenes = async (req, res) => {
//   try {
//     const [rows] = await pool.query("SELECT id, marca, modelo, imagen FROM vehiculos WHERE imagen IS NULL OR imagen = ''");
//     let completados = 0;
//     for (const v of rows) {
//       const url = await fetchVehicleImageUrl({ marca: v.marca, modelo: v.modelo });
//       if (url) {
//         const ok = await actualizarImagenPorId(v.id, url);
//         if (ok) completados++;
//       }
//     }
//     res.json({ mensaje: 'Backfill completado', total: rows.length, completados });
//   } catch (error) {
//     res.status(500).json({ error: 'Error en backfill de imágenes' });
//   }
// };

// Actualizar un vehículo
export const actualizarVehiculo = async (req, res) => {
  try {
    const id = req.params.id;
    const { marca, modelo, anio, disponible } = req.body;
    const [result] = await pool.query(
      "UPDATE vehiculos SET marca = ?, modelo = ?, anio = ?, disponible = ? WHERE id = ?",
      [marca, modelo, anio, disponible, id]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    res.json({ mensaje: "Vehículo actualizado" });
  } catch (error) {
    res.status(500).json({ error: "Error al actualizar vehículo" });
  }
};

// Eliminar un vehículo
export const eliminarVehiculo = async (req, res) => {
  try {
    const id = req.params.id;
    
    // Verificar si el vehículo existe antes de eliminarlo
    const [vehiculoExistente] = await pool.query("SELECT * FROM vehiculos WHERE id = ?", [id]);
    
    if (vehiculoExistente.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: "Vehículo no encontrado" 
      });
    }

    // Eliminar el vehículo
    const [result] = await pool.query("DELETE FROM vehiculos WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false,
        error: "No se pudo eliminar el vehículo" 
      });
    }

    res.json({ 
      success: true,
      mensaje: "Vehículo eliminado correctamente",
      vehiculoEliminado: vehiculoExistente[0]
    });
    
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ 
      success: false,
      error: "Error al eliminar vehículo" 
    });
  }
};

// Vehículos disponibles (lógica pendiente)
export const vehiculosDisponibles = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    // Si no hay rango de fechas, devolver por flag 'disponible'
    if (!fecha_inicio || !fecha_fin) {
      const [rows] = await pool.query("SELECT * FROM vehiculos WHERE disponible = 1");
      return res.json(rows);
    }

    // Consulta que excluye solapamientos con reservas no canceladas
    const [rows] = await pool.query(
      `SELECT v.*
       FROM vehiculos v
       WHERE v.disponible = 1
         AND NOT EXISTS (
           SELECT 1
           FROM reservas r
           WHERE r.vehiculo_id = v.id
             AND r.estado <> 'cancelada'
             AND NOT (r.fecha_fin < ? OR r.fecha_inicio > ?)
         )`,
      [fecha_inicio, fecha_fin]
    );
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: "Error al obtener vehículos disponibles" });
  }
};*/

// src/controllers/vehiculos.controller.js
import pool from "../../config/db.js";
import { 
  obtenerVehiculos, 
  crearVehiculo as crearVehiculoModelo, 
  actualizarImagenPorId 
} from "../model/vehiculos.model.js";
// import { fetchVehicleImageUrl } from "../services/imageProvider.js"; // Desactivado por defecto: activar con PIXABAY_API_KEY

// Listar todos los vehículos
export const listarVehiculos = async (req, res) => {
  try {
    const {
      marca,
      modelo,
      anio,
      disponible,
      page = 1,
      limit = 20,
      sortBy = 'id',
      sortDir = 'asc'
    } = req.query;

    const allowedSortBy = new Set(['id','marca','modelo','anio','disponible']);
    const orderByColumn = allowedSortBy.has(String(sortBy)) ? String(sortBy) : 'id';
    const orderDirection = String(sortDir).toLowerCase() === 'desc' ? 'DESC' : 'ASC';

    const numericLimit = Math.min(Math.max(parseInt(limit, 10) || 20, 1), 100);
    const numericPage = Math.max(parseInt(page, 10) || 1, 1);
    const offset = (numericPage - 1) * numericLimit;

    const whereParts = [];
    const whereParams = [];

    if (marca) {
      whereParts.push('marca LIKE ?');
      whereParams.push(`%${marca}%`);
    }
    if (modelo) {
      whereParts.push('modelo LIKE ?');
      whereParams.push(`%${modelo}%`);
    }
    if (anio) {
      whereParts.push('anio = ?');
      whereParams.push(parseInt(anio, 10));
    }
    if (typeof disponible !== 'undefined') {
      const dispo = (String(disponible) === 'true' || String(disponible) === '1') ? 1 : 0;
      whereParts.push('disponible = ?');
      whereParams.push(dispo);
    }

    const whereClause = whereParts.length ? `WHERE ${whereParts.join(' AND ')}` : '';

    // Total para paginación
    const [countRows] = await pool.query(
      `SELECT COUNT(*) AS total FROM vehiculos ${whereClause}`,
      whereParams
    );
    const total = countRows[0]?.total || 0;

    // Datos paginados
    const [rows] = await pool.query(
      `SELECT *
        FROM vehiculos
        ${whereClause}
        ORDER BY ${orderByColumn} ${orderDirection}
        LIMIT ? OFFSET ?`,
      [...whereParams, numericLimit, offset]
    );

    const totalPages = Math.ceil(total / numericLimit) || 1;

    res.json({
      data: rows,
      pagination: {
        total,
        page: numericPage,
        limit: numericLimit,
        totalPages
      }
    });
  } catch (error) {
    console.error('Error al listar vehículos:', error);
    res.status(500).json({ error: "Error interno al obtener vehículos" });
  }
};

// Ver un vehículo por ID
export const verVehiculo = async (req, res) => {
  try {
    const id = req.params.id;
    // OJO: Esta lógica también podría ir al modelo para una mejor separación.
    const [vehiculo] = await pool.query("SELECT * FROM vehiculos WHERE id = ?", [id]);
    if (vehiculo.length === 0) {
      return res.status(404).json({ error: "Vehículo no encontrado" });
    }
    res.json(vehiculo[0]);
  } catch (error) {
    console.error('Error al obtener vehículo:', error);
    res.status(500).json({ error: "Error interno al obtener el vehículo" });
  }
};

// Crear un vehículo
export const crearVehiculo = async (req, res) => {
  try {
    const body = { ...req.body };
    // Desactivado: autocompletar imagen con Pixabay
    // if (!body.imagen) {
    //   const fetched = await fetchVehicleImageUrl({ marca: body.marca, modelo: body.modelo });
    //   if (fetched) body.imagen = fetched;
    // }
    // Asume que el modelo se encarga de las validaciones de datos (tipo, requerido)
    const id = await crearVehiculoModelo(body); 
    res.status(201).json({ id, ...body });
  } catch (error) {
    console.error('Error al crear vehículo:', error);
    res.status(500).json({ error: "Error interno al crear vehículo" });
  }
};

// Actualizar un vehículo
export const actualizarVehiculo = async (req, res) => {
  try {
    const id = req.params.id;
    const { marca, modelo, anio, disponible, imagen, precio } = req.body || {};

    const sets = [];
    const params = [];
    if (typeof marca !== 'undefined') { sets.push('marca = ?'); params.push(marca); }
    if (typeof modelo !== 'undefined') { sets.push('modelo = ?'); params.push(modelo); }
    if (typeof anio !== 'undefined') { sets.push('anio = ?'); params.push(anio); }
    if (typeof disponible !== 'undefined') { sets.push('disponible = ?'); params.push(disponible ? 1 : 0); }
    if (typeof imagen !== 'undefined') { sets.push('imagen = ?'); params.push(imagen); }
    if (typeof precio !== 'undefined') { sets.push('precio = ?'); params.push(precio); }

    if (sets.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    params.push(id);
    const [result] = await pool.query(`UPDATE vehiculos SET ${sets.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) {
      return res.status(404).json({ error: 'Vehículo no encontrado' });
    }
    res.json({ mensaje: 'Vehículo actualizado' });
  } catch (error) {
    console.error('Error al actualizar vehículo:', error);
    res.status(500).json({ error: 'Error interno al actualizar vehículo' });
  }
};

// Eliminar un vehículo
export const eliminarVehiculo = async (req, res) => {
  try {
    const id = req.params.id;
    
    // OPTIMIZACIÓN: Eliminamos el SELECT previo. Dependemos solo de affectedRows.
    const [result] = await pool.query("DELETE FROM vehiculos WHERE id = ?", [id]);
    
    if (result.affectedRows === 0) {
      // Si no se afectó ninguna fila, es porque el ID no existía.
      return res.status(404).json({ 
        success: false,
        error: "Vehículo no encontrado o ya eliminado" 
      });
    }

    // Ya no podemos devolver el objeto del vehículo, pero ganamos rendimiento.
    res.json({ 
      success: true,
      mensaje: "Vehículo eliminado correctamente"
    });
    
  } catch (error) {
    console.error('Error al eliminar vehículo:', error);
    res.status(500).json({ 
      success: false,
      error: "Error interno al eliminar vehículo" 
    });
  }
};

// Vehículos disponibles (lógica pendiente)
export const vehiculosDisponibles = async (req, res) => {
  try {
    const { fecha_inicio, fecha_fin } = req.query;

    // Si no hay rango de fechas, devolver por flag 'disponible'
    if (!fecha_inicio || !fecha_fin) {
      const [rows] = await pool.query("SELECT * FROM vehiculos WHERE disponible = 1");
      return res.json(rows);
    }

    // Consulta que excluye solapamientos con reservas no canceladas
    const [rows] = await pool.query(
      `SELECT v.*
        FROM vehiculos v
        WHERE v.disponible = 1
          AND NOT EXISTS (
            SELECT 1
            FROM reservas r
            WHERE r.vehiculo_id = v.id
              AND r.estado <> 'cancelada'
              AND NOT (r.fecha_fin < ? OR r.fecha_inicio > ?)
          )`,
      [fecha_inicio, fecha_fin]
    );
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener vehículos disponibles:', error);
    res.status(500).json({ error: "Error interno al obtener vehículos disponibles" });
  }
};

// Opciones de vehículos (marcas y modelos). Soporta marca para filtrar modelos.
export const opcionesVehiculos = async (req, res) => {
  try {
    const { marca } = req.query;
    const [marcasRows] = await pool.query(
      `SELECT DISTINCT marca FROM vehiculos WHERE marca IS NOT NULL AND marca <> '' ORDER BY marca`
    );
    let modelosRows;
    if (marca) {
      [modelosRows] = await pool.query(
        `SELECT DISTINCT modelo FROM vehiculos WHERE marca = ? AND modelo IS NOT NULL AND modelo <> '' ORDER BY modelo`,
        [marca]
      );
    } else {
      [modelosRows] = await pool.query(
        `SELECT DISTINCT modelo FROM vehiculos WHERE modelo IS NOT NULL AND modelo <> '' ORDER BY modelo`
      );
    }
    const marcas = marcasRows.map(r => r.marca).filter(Boolean);
    const modelos = modelosRows.map(r => r.modelo).filter(Boolean);
    res.json({ marcas, modelos });
  } catch (error) {
    console.error('Error al obtener opciones de vehículos:', error);
    res.status(500).json({ error: 'Error interno al obtener opciones' });
  }
};