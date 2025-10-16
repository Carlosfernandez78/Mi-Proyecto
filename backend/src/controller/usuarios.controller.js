/*// controllers/usuariosController.js
import pool from "../../config/db.js";

export const listarUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};

export const obtenerUsuarios = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre, email, rol FROM usuarios");
    res.json(rows);
  } catch (error) {
    res.status(500).json({ message: "Error al obtener usuarios", error: error.message });
  }
};


export const crearUsuario = async (req, res) => {
  const { nombre, email, contrasena, rol } = req.body;

  if (!nombre || !email || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos requeridos' });
  }

  try {
    // Evitar duplicados por email
    const [existentes] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existentes.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hash de contraseña
    const bcrypt = await import('bcryptjs');
    const hashed = await bcrypt.default.hash(contrasena, 10);

    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashed, rol || 'cliente']
    );

    res.status(201).json({
      id: resultado.insertId,
      nombre,
      email,
      rol: rol || 'cliente',
      mensaje: "Usuario creado exitosamente"
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};*/
// src/controllers/usuarios.controller.js
import pool from "../../config/db.js";
import bcrypt from 'bcryptjs'; // Importación estática y única para mejor rendimiento

/**
 * @description Lista todos los usuarios, excluyendo campos sensibles como la contraseña.
 */
export const listarUsuarios = async (req, res) => {
  try {
    // Se elimina la función 'obtenerUsuarios' y se usa esta como la única y segura opción.
    // Se listan solo los campos no sensibles (ID, nombre, email, rol).
    const [rows] = await pool.query("SELECT id, nombre, email, rol FROM usuarios");
    
    // Si no hay usuarios, devuelve un array vacío en lugar de un error.
    if (rows.length === 0) {
      return res.status(200).json({ message: "No se encontraron usuarios", data: [] });
    }

    res.json(rows);
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ message: "Error interno al obtener usuarios", error: error.message });
  }
};

/**
 * @description Actualiza campos de un usuario existente. Solo actualiza los campos provistos.
 */
export const actualizarUsuario = async (req, res) => {
  const id = req.params.id;
  const { nombre, email, contrasena, rol } = req.body || {};

  try {
    const updates = [];
    const params = [];

    if (typeof nombre !== 'undefined') { updates.push('nombre = ?'); params.push(nombre); }
    if (typeof email !== 'undefined') { updates.push('email = ?'); params.push(email); }
    if (typeof rol !== 'undefined') { updates.push('rol = ?'); params.push(rol); }
    if (typeof contrasena !== 'undefined') {
      const hashed = await bcrypt.hash(contrasena, 10);
      updates.push('contrasena = ?');
      params.push(hashed);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    params.push(id);
    const [result] = await pool.query(`UPDATE usuarios SET ${updates.join(', ')} WHERE id = ?`, params);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario actualizado' });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({ error: 'Error interno al actualizar usuario' });
  }
};

/**
 * @description Elimina un usuario por ID.
 */
export const eliminarUsuario = async (req, res) => {
  const id = req.params.id;
  try {
    const [result] = await pool.query('DELETE FROM usuarios WHERE id = ?', [id]);
    if (result.affectedRows === 0) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json({ mensaje: 'Usuario eliminado' });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({ error: 'Error interno al eliminar usuario' });
  }
};


/**
 * @description Crea un nuevo usuario, valida campos y hashea la contraseña.
 */
export const crearUsuario = async (req, res) => {
  const { nombre, email, contrasena, rol } = req.body;

  // 1. Validación de campos requeridos
  if (!nombre || !email || !contrasena) {
    return res.status(400).json({ error: 'Faltan campos requeridos (nombre, email y contraseña son obligatorios)' });
  }

  try {
    // 2. Evitar duplicados por email
    const [existentes] = await pool.query("SELECT id FROM usuarios WHERE email = ?", [email]);
    if (existentes.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // 3. Hash de contraseña (usando la importación estática de bcrypt)
    const hashed = await bcrypt.hash(contrasena, 10);

    // 4. Inserción en la base de datos
    const [resultado] = await pool.query(
      "INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashed, rol || 'cliente'] // El rol por defecto es 'cliente'
    );

    // 5. Respuesta exitosa
    res.status(201).json({
      id: resultado.insertId,
      nombre,
      email,
      rol: rol || 'cliente',
      mensaje: "Usuario creado exitosamente"
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error interno del servidor al registrar usuario' });
  }
};