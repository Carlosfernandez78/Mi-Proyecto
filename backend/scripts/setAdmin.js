import 'dotenv/config'
import pool from '../config/db.js'
import bcrypt from 'bcryptjs'

function parseArgs(argv) {
  const args = {}
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i]
    if (a.startsWith('--')) {
      const [k, v] = a.replace(/^--/, '').split('=')
      if (v !== undefined) args[k] = v
      else if (i + 1 < argv.length && !argv[i + 1].startsWith('--')) {
        args[k] = argv[++i]
      } else {
        args[k] = true
      }
    }
  }
  return args
}

async function main() {
  const { email, password } = parseArgs(process.argv)
  if (!email || !password) {
    console.error('Uso: node scripts/setAdmin.js --email <email> --password <password>')
    process.exit(1)
  }
  try {
    const hash = await bcrypt.hash(password, 10)
    const [rows] = await pool.query('SELECT id FROM usuarios WHERE email = ? LIMIT 1', [email])
    if (rows.length > 0) {
      await pool.query('UPDATE usuarios SET contrasena = ?, rol = \'admin\', nombre = COALESCE(nombre, \'admin\') WHERE email = ?', [hash, email])
      console.log(`Usuario actualizado como admin: ${email}`)
    } else {
      await pool.query('INSERT INTO usuarios (nombre, email, contrasena, rol) VALUES (?,?,?,?)', ['admin', email, hash, 'admin'])
      console.log(`Usuario creado como admin: ${email}`)
    }
  } catch (e) {
    console.error('Error configurando admin:', e?.message || e)
    process.exit(1)
  } finally {
    try { await pool.end() } catch {}
  }
}

main()




