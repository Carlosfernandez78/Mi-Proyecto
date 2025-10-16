/*import pool from '../../config/db.js';

// Obtener reservas por usuario
export const reservasPorUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.id;
    const [rows] = await pool.query('SELECT * FROM reservas WHERE usuario_id = ?', [usuarioId]);
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reservas del usuario' });
  }
};

// Listar todas las reservas
export const listarReservas = async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM reservas');
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener reservas' });
  }
};

// Crear una reserva
export const crearReserva = async (req, res) => {
  const { usuario_id, vehiculo_id, fecha_inicio, fecha_fin, estado } = req.body;
  try {
    // Validar que el vehículo exista y esté disponible por flag
    const [vehiculoRows] = await pool.query('SELECT * FROM vehiculos WHERE id = ?', [vehiculo_id]);
    if (vehiculoRows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });

    // Verificar solapamiento de fechas con reservas no canceladas
    const [solapes] = await pool.query(
      `SELECT 1 FROM reservas
       WHERE vehiculo_id = ?
         AND estado <> 'cancelada'
         AND NOT (fecha_fin < ? OR fecha_inicio > ?)
       LIMIT 1`,
      [vehiculo_id, fecha_inicio, fecha_fin]
    );
    if (solapes.length > 0) {
      return res.status(409).json({ error: 'El vehículo no está disponible en el rango solicitado' });
    }

    const [result] = await pool.query(
      'INSERT INTO reservas (usuario_id, vehiculo_id, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, vehiculo_id, fecha_inicio, fecha_fin, estado || 'pendiente']
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: 'Error al crear reserva' });
  }
};

// Actualizar una reserva
export const actualizarReserva = async (req, res) => {
  const { usuario_id, vehiculo_id, fecha_inicio, fecha_fin, estado } = req.body;
  try {
    // Verificar solapamiento si cambian fechas o vehículo
    if (vehiculo_id && fecha_inicio && fecha_fin) {
      const [solapes] = await pool.query(
        `SELECT 1 FROM reservas
         WHERE vehiculo_id = ?
           AND id <> ?
           AND estado <> 'cancelada'
           AND NOT (fecha_fin < ? OR fecha_inicio > ?)
         LIMIT 1`,
        [vehiculo_id, req.params.id, fecha_inicio, fecha_fin]
      );
      if (solapes.length > 0) {
        return res.status(409).json({ error: 'El vehículo no está disponible en el nuevo rango' });
      }
    }
    const [result] = await pool.query(
      'UPDATE reservas SET usuario_id=?, vehiculo_id=?, fecha_inicio=?, fecha_fin=?, estado=? WHERE id=?',
      [usuario_id, vehiculo_id, fecha_inicio, fecha_fin, estado, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json({ mensaje: 'Reserva actualizada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la reserva' });
  }
};

// Eliminar una reserva
export const eliminarReserva = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM reservas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json({ mensaje: 'Reserva eliminada' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la reserva' });
  }
};*/

import pool from '../../config/db.js';

// Obtener reservas por usuario
export const reservasPorUsuario = async (req, res) => {
  try {
    const usuarioId = req.params.id;
    // OJO: Se recomienda no usar SELECT * por temas de seguridad. 
    // Si la tabla reservas contiene campos sensibles, deberían excluirse.
    const [rows] = await pool.query('SELECT * FROM reservas WHERE usuario_id = ?', [usuarioId]);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener reservas por usuario:', error);
    res.status(500).json({ error: 'Error interno al obtener reservas del usuario' });
  }
};

// Listar todas las reservas
export const listarReservas = async (req, res) => {
  try {
    // OJO: Se recomienda no usar SELECT *
    const [rows] = await pool.query('SELECT * FROM reservas');
    res.json(rows);
  } catch (error) {
    console.error('Error al listar reservas:', error);
    res.status(500).json({ error: 'Error interno al obtener reservas' });
  }
};

// Crear una reserva
export const crearReserva = async (req, res) => {
  const { usuario_id, vehiculo_id, fecha_inicio, fecha_fin, estado } = req.body;
  try {
    // OPTIMIZACIÓN MENOR: Usamos SELECT 1 en lugar de SELECT * para verificar existencia.
    const [vehiculoRows] = await pool.query('SELECT 1 FROM vehiculos WHERE id = ? LIMIT 1', [vehiculo_id]);
    if (vehiculoRows.length === 0) return res.status(404).json({ error: 'Vehículo no encontrado' });

    // Verificar solapamiento de fechas con reservas no canceladas
    const [solapes] = await pool.query(
      `SELECT 1 FROM reservas
        WHERE vehiculo_id = ?
          AND estado <> 'cancelada'
          AND NOT (fecha_fin <= ? OR fecha_inicio >= ?)
        LIMIT 1`,
      [vehiculo_id, fecha_inicio, fecha_fin]
    );
    
    // CORRECCIÓN LÓGICA: Se cambió < y > por <= y >= en el solapamiento 
    // para asegurar que las reservas terminen estrictamente antes de que inicie la nueva.
    // Aunque el original (r.fecha_fin < ? OR r.fecha_inicio > ?) es común, esta versión
    // es más precisa si las horas no se especifican.

    if (solapes.length > 0) {
      return res.status(409).json({ error: 'El vehículo no está disponible en el rango solicitado' });
    }

    const [result] = await pool.query(
      'INSERT INTO reservas (usuario_id, vehiculo_id, fecha_inicio, fecha_fin, estado) VALUES (?, ?, ?, ?, ?)',
      [usuario_id, vehiculo_id, fecha_inicio, fecha_fin, estado || 'pendiente']
    );
    res.status(201).json({ id: result.insertId, ...req.body });
  } catch (error) {
    console.error('Error al crear reserva:', error); // Mejor registro de error
    res.status(500).json({ error: 'Error interno al crear reserva' });
  }
};

// Actualizar una reserva
export const actualizarReserva = async (req, res) => {
  const { usuario_id, vehiculo_id, fecha_inicio, fecha_fin, estado } = req.body;
  try {
    // Verificar solapamiento si cambian fechas o vehículo
    if (vehiculo_id && fecha_inicio && fecha_fin) {
      const [solapes] = await pool.query(
        `SELECT 1 FROM reservas
          WHERE vehiculo_id = ?
            AND id <> ?
            AND estado <> 'cancelada'
            AND NOT (fecha_fin <= ? OR fecha_inicio >= ?)
          LIMIT 1`,
        [vehiculo_id, req.params.id, fecha_inicio, fecha_fin]
      );
      if (solapes.length > 0) {
        return res.status(409).json({ error: 'El vehículo no está disponible en el nuevo rango' });
      }
    }
    const [result] = await pool.query(
      'UPDATE reservas SET usuario_id=?, vehiculo_id=?, fecha_inicio=?, fecha_fin=?, estado=? WHERE id=?',
      [usuario_id, vehiculo_id, fecha_inicio, fecha_fin, estado, req.params.id]
    );
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json({ mensaje: 'Reserva actualizada' });
  } catch (error) {
    console.error('Error al actualizar reserva:', error); // Mejor registro de error
    res.status(500).json({ error: 'Error interno al actualizar la reserva' });
  }
};

// Eliminar una reserva
export const eliminarReserva = async (req, res) => {
  try {
    const [result] = await pool.query('DELETE FROM reservas WHERE id = ?', [req.params.id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Reserva no encontrada' });
    res.json({ mensaje: 'Reserva eliminada' });
  } catch (error) {
    console.error('Error al eliminar reserva:', error); // Mejor registro de error
    res.status(500).json({ error: 'Error interno al eliminar la reserva' });
  }
};