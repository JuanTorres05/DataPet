// Servicio de autenticación - acá va toda la lógica de login
// Usamos bcryptjs para comparar contraseñas y jsonwebtoken para generar el token

import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../../db/pool.js';
import { env } from '../../config/env.js';
import { UnauthorizedError } from '../../errors/http.errors.js';

export async function login({ cedula, password }) {
  console.log(`[authService.login] Intentando login para cédula: "${cedula}"`);
  // Buscamos al usuario uniendo con la tabla de roles para saber qué puede hacer
  // La condición activo = 1 evita que usuarios desactivados entren al sistema
  const [rows] = await pool.execute(
    `SELECT u.id, u.nombre, u.password_hash, r.nombre AS rol
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.rol_id
     WHERE u.cedula = ? AND u.activo = 1
     LIMIT 1`,
    [cedula]
  );

  // Si no encontramos el usuario, lanzamos error genérico
  // (no decimos si fue la cédula o la contraseña por seguridad)
  if (rows.length === 0) {
    console.log(`[authService.login] Cédula no encontrada o usuario inactivo: "${cedula}"`);
    throw new UnauthorizedError('Credenciales inválidas.');
  }

  const user = rows[0];
  console.log(`[authService.login] Cédula encontrada. Nombre: "${user.nombre}". Rol: "${user.rol}". Comparando contraseña...`);

  // Comparamos la contraseña que mandó el usuario con el hash guardado en BD
  const isValidPassword = await bcrypt.compare(password, user.password_hash);

  if (!isValidPassword) {
    console.log(`[authService.login] Contraseña incorrecta para usuario: "${user.nombre}"`);
    throw new UnauthorizedError('Credenciales inválidas.');
  }

  console.log(`[authService.login] Login exitoso para usuario: "${user.nombre}"`);

  // Todo bien, generamos el token con los datos que el frontend necesita saber
  // sub = subject (el id del usuario), rol lo usamos para mostrar/ocultar cosas
  const token = jwt.sign(
    {
      sub: user.id,
      nombre: user.nombre,
      rol: user.rol
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn } // por defecto 8 horas
  );

  // Retornamos el token y los datos básicos del usuario (sin contraseña!)
  return {
    token,
    user: {
      id: user.id,
      nombre: user.nombre,
      rol: user.rol
    }
  };
}

export async function listarVeterinarios() {
  const [rows] = await pool.execute(
    `SELECT u.id, u.nombre 
     FROM usuarios u
     INNER JOIN roles r ON r.id = u.rol_id
     WHERE r.nombre = 'veterinario' AND u.activo = 1
     ORDER BY u.nombre`
  );
  return rows;
}

