/**
 * helpers/auth.js
 * Genera tokens JWT válidos para tests sin realizar login real a la BD.
 * Los IDs corresponden a los usuarios seed (cedula 000...1=admin, 000...2=vet, 000...3=recepc).
 */
import jwt from 'jsonwebtoken';
import pool from '../../src/db/pool.js';

const SECRET = process.env.JWT_SECRET || 'dev_secret_change_me';

/**
 * Genera un token de prueba firmado con el secreto real del servidor.
 * @param {number} id - ID real del usuario en BD
 * @param {'admin'|'veterinario'|'recepcionista'} rol
 * @param {string} nombre
 */
export function makeToken(id, rol, nombre) {
  return jwt.sign({ id, nombre, rol }, SECRET, { expiresIn: '1h' });
}

/**
 * Resuelve IDs reales de la BD para los usuarios de prueba y retorna tokens.
 * Se llama una sola vez en beforeAll de los tests.
 */
export async function resolveTokens() {
  const [rows] = await pool.execute(
    `SELECT u.id, r.nombre AS rol
     FROM usuarios u
     JOIN roles r ON r.id = u.rol_id
     WHERE u.cedula IN ('0000000001', '0000000002', '0000000003')
     ORDER BY u.cedula`
  );

  const byRol = {};
  for (const row of rows) {
    byRol[row.rol] = makeToken(row.id, row.rol, `Test ${row.rol}`);
  }

  return {
    admin: byRol['admin'] ?? makeToken(1, 'admin', 'Test admin'),
    veterinario: byRol['veterinario'] ?? makeToken(2, 'veterinario', 'Test veterinario'),
    recepcionista: byRol['recepcionista'] ?? makeToken(3, 'recepcionista', 'Test recepcionista'),
  };
}

// Tokens estáticos con IDs del seed (para tests que no necesitan BD)
export const tokens = {
  admin: makeToken(1, 'admin', 'Test admin'),
  veterinario: makeToken(2, 'veterinario', 'Test veterinario'),
  recepcionista: makeToken(3, 'recepcionista', 'Test recepcionista'),
};
