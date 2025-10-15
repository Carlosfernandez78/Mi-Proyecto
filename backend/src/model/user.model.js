import pool from "../../config/db.js";
import bcrypt from "bcryptjs";

const userModel = {
  getAll: async () => {
    try {
      const [rows] = await pool.query("SELECT id, nombre, email, rol FROM usuarios");
      return rows;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw new Error("Could not fetch users from the database.");
    }
  },

  getById: async (id) => {
    try {
      const [rows] = await pool.query("SELECT id, nombre, email, rol FROM usuarios WHERE id = ?", [id]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error fetching user with id ${id}:`, error);
      throw new Error(`Could not fetch user with id ${id} from the database.`);
    }
  },

  create: async ({ nombre, email, contrasena, rol = 'cliente' }) => {
    try {
      const hashedPassword = await bcrypt.hash(contrasena, 10);
      const [result] = await pool.query(
        "INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES (?, ?, ?, ?)",
        [nombre, email, hashedPassword, rol]
      );
      return { id: result.insertId, nombre, email, rol };
    } catch (error) {
      console.error("Error creating user:", error);
      throw new Error("Could not create user in the database.");
    }
  },

  findByEmail: async (email) => {
    try {
      const [rows] = await pool.query("SELECT * FROM usuarios WHERE email = ?", [email]);
      return rows[0] || null;
    } catch (error) {
      console.error(`Error fetching user with email ${email}:`, error);
      throw new Error(`Could not fetch user with email ${email} from the database.`);
    }
  },

  updateById: async (id, updates) => {
    try {
      const fields = [];
      const values = [];

      if (typeof updates.nombre !== 'undefined') { fields.push('nombre = ?'); values.push(updates.nombre); }
      if (typeof updates.email !== 'undefined') { fields.push('email = ?'); values.push(updates.email); }
      if (typeof updates.contrasena !== 'undefined') {
        const hashed = await bcrypt.hash(updates.contrasena, 10);
        fields.push('contrasena = ?'); values.push(hashed);
      }
      if (typeof updates.rol !== 'undefined') { fields.push('rol = ?'); values.push(updates.rol); }

      if (fields.length === 0) return false;

      const sql = `UPDATE usuarios SET ${fields.join(', ')} WHERE id = ?`;
      values.push(id);
      const [result] = await pool.query(sql, values);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error updating user with id ${id}:`, error);
      throw new Error(`Could not update user with id ${id} in the database.`);
    }
  },

  deleteById: async (id) => {
    try {
      const [result] = await pool.query("DELETE FROM usuarios WHERE id = ?", [id]);
      return result.affectedRows > 0;
    } catch (error) {
      console.error(`Error deleting user with id ${id}:`, error);
      throw new Error(`Could not delete user with id ${id} from the database.`);
    }
  }
};

export default userModel;