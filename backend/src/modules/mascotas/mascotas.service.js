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

    // Obtener historial clínico de la mascota
    const [historial] = await pool.execute(
        `SELECT h.id, h.fecha, h.motivo, h.diagnostico, h.tratamiento, h.notas, h.created_at,
                u.nombre AS veterinario_nombre
         FROM historial_clinico h
         INNER JOIN usuarios u ON u.id = h.usuario_id
         WHERE h.mascota_id = ?
         ORDER BY h.fecha DESC`,
        [mascotaId]
    );

    // Obtener citas de la mascota
    const [citas] = await pool.execute(
        `SELECT id, fecha_hora, motivo, estado 
         FROM citas 
         WHERE mascota_id = ? 
         ORDER BY fecha_hora DESC`,
        [mascotaId]
    );

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
        },
        historial,
        citas
    };
}

export async function crearHistorial({ mascota_id, usuario_id, fecha, motivo, diagnostico, tratamiento, notas }) {
    const [result] = await pool.execute(
        `INSERT INTO historial_clinico (mascota_id, usuario_id, fecha, motivo, diagnostico, tratamiento, notas)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [mascota_id, usuario_id, fecha, motivo, diagnostico, tratamiento, notas || null]
    );

    const newId = result.insertId;

    const [rows] = await pool.execute(
        `SELECT h.id, h.fecha, h.motivo, h.diagnostico, h.tratamiento, h.notas, h.created_at,
                u.nombre AS veterinario_nombre
         FROM historial_clinico h
         INNER JOIN usuarios u ON u.id = h.usuario_id
         WHERE h.id = ?
         LIMIT 1`,
        [newId]
    );

    return rows[0];
}

