import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../db/pool.js';
import { env } from '../../config/env.js';

class UnauthorizedError extends Error {
  constructor(message) {
    super(message);
    this.statusCode = 401;
  }
}

export async function login({ cedula, password }) {
  const [rows] = await pool.execute(
    `SELECT u.id, u.nombre, u.password_hash, r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.rol_id
     WHERE u.cedula = ? AND u.activo = 1
     LIMIT 1`,
    [cedula]
  );

  if (rows.length === 0) {
    throw new UnauthorizedError('Credenciales inválidas.');
  }

  const user = rows[0];
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    throw new UnauthorizedError('Credenciales inválidas.');
  }

  const token = jwt.sign(
    {
      sub: user.id,
      nombre: user.nombre,
      rol: user.rol
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );

  return {
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol
    }
  };
}
