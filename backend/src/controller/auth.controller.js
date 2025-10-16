/*import pool from "../../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { validationResult } from 'express-validator';

// Registro de usuario
export const register = async (req, res) => {
  const { nombre, email, contrasena, rol } = req.body;
  if (!nombre || !email || !contrasena) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }
  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashedPassword, rol || "cliente"]
    );
    res.status(201).json({ id: result.insertId, nombre, email, rol: rol || "cliente" });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al registrar usuario", error: error.message });
  }
};

// Login de usuario
export const login = async (req, res) => {
  // Validaciones ya se realizan en la ruta con express-validator + validateRequest
  // const errors = validationResult(req);
  // if (!errors.isEmpty()) {
  //   return res.status(400).json({ errores: errors.array() });
  // }
  const { email, contrasena } = req.body;
  // if (!email || !contrasena) {
  //   return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  // }
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ mensaje: "Usuario no encontrado" });

    const usuario = rows[0];
    const passwordOk = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!passwordOk) return res.status(401).json({ mensaje: "Contraseña incorrecta" });

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: "8h" }
    );
    res.json({ token });
  } catch (error) {
    res.status(500).json({ mensaje: "Error al iniciar sesión", error: error.message });
  }
};

// Perfil del usuario autenticado
export const perfil = async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT id, nombre, email, rol FROM usuarios WHERE id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    res.status(500).json({ mensaje: "Error al obtener perfil", error: error.message });
  }
};*/

import pool from "../../config/db.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
// Eliminada importación de 'express-validator' que no se usaba

// Registro de usuario
export const register = async (req, res) => {
  const { nombre, email, contrasena, rol } = req.body;
  
  // Validación básica (necesaria si la validación por middleware se eliminó)
  if (!nombre || !email || !contrasena) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios" });
  }

  try {
    const hashedPassword = await bcrypt.hash(contrasena, 10);
    const [result] = await pool.query(
      "INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES (?, ?, ?, ?)",
      [nombre, email, hashedPassword, rol || "cliente"]
    );
    res.status(201).json({ id: result.insertId, nombre, email, rol: rol || "cliente" });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ mensaje: "Error interno al registrar usuario" });
  }
};

// Login de usuario
export const login = async (req, res) => {
  const { email, contrasena } = req.body;
  
  // Se restaura esta validación básica si se quitó el middleware de ruta.
  if (!email || !contrasena) {
    return res.status(400).json({ mensaje: "Faltan datos obligatorios (email y contraseña)" });
  }
  
  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" }); // No revelar si es el usuario o la contraseña

    const usuario = rows[0];
    const passwordOk = await bcrypt.compare(contrasena, usuario.contrasena);
    // Usamos el mismo mensaje de error para evitar ataques de enumeración de usuarios
    if (!passwordOk) return res.status(401).json({ mensaje: "Usuario o contraseña incorrectos" }); 

    const token = jwt.sign(
      { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol },
      process.env.JWT_SECRET || 'devsecret',
      { expiresIn: "8h" }
    );
    res.json({ token });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ mensaje: "Error interno al iniciar sesión" });
  }
};

// Perfil del usuario autenticado
// Nota: Esta función asume que existe un middleware que ya verificó el JWT y adjuntó req.user
export const perfil = async (req, res) => {
  // Para fines de prueba y si se elimina el middleware, se podría usar un ID fijo aquí, 
  // pero mantendremos la estructura original.
  
  // La línea siguiente fallará si el authMiddleware se elimina de la ruta, 
  // ya que req.user no estará definido. Esto se manejará en el router.
  const userId = req.user?.id; 

  if (!userId) {
    return res.status(401).json({ mensaje: "No autenticado. ID de usuario faltante en la solicitud." });
  }

  try {
    const [rows] = await pool.query("SELECT id, nombre, email, rol FROM usuarios WHERE id = ?", [userId]);
    if (rows.length === 0) return res.status(404).json({ mensaje: "Usuario no encontrado" });
    res.json(rows[0]);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: "Error interno al obtener perfil" });
  }
};

