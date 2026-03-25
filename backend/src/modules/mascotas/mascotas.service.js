import pool from '../../db/pool.js';
import { NotFoundError } from '../../errors/http.errors.js';

/**
 * Lista todas las mascotas de un cliente dado su ID.
 * @param {number} clienteId
 */
export async function listarPorCliente(clienteId) {
    const [mascotas] = await pool.execute(
        `SELECT id, cliente_id, nombre, especie, raza, created_at
     FROM mascotas
     WHERE cliente_id = ?
     ORDER BY nombre ASC`,
        [clienteId]
    );
    return mascotas;
}

/**
 * Devuelve una mascota por su ID junto con los datos del cliente.
 * @param {number} mascotaId
 */
export async function obtenerPorId(mascotaId) {
    const [rows] = await pool.execute(
        `SELECT m.id, m.nombre, m.especie, m.raza, m.created_at,
            c.id AS cliente_id, c.nombre AS cliente_nombre,
            c.telefono AS cliente_telefono, c.correo AS cliente_correo
     FROM mascotas m
     INNER JOIN clientes c ON c.id = m.cliente_id
     WHERE m.id = ?
     LIMIT 1`,
        [mascotaId]
    );

    if (rows.length === 0) {
        throw new NotFoundError('Mascota no encontrada.');
    }

    const row = rows[0];
    return {
        id: row.id,
        nombre: row.nombre,
        especie: row.especie,
        raza: row.raza,
        createdAt: row.created_at,
        cliente: {
            id: row.cliente_id,
            nombre: row.cliente_nombre,
            telefono: row.cliente_telefono,
            correo: row.cliente_correo
        }
    };
}
