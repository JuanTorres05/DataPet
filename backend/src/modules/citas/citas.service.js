import pool from '../../db/pool.js';
import { NotFoundError } from '../../errors/http.errors.js';

export async function listarCitas({ fecha, estado }) {
  let query = `
    SELECT 
      c.id, 
      c.fecha_hora, 
      c.motivo, 
      c.estado, 
      c.created_at, 
      m.id AS mascota_id,
      m.nombre AS mascota_nombre, 
      m.especie, 
      c.usuario_id,
      cl.nombre AS cliente_nombre, 
      cl.telefono, 
      u.nombre AS veterinario_nombre
    FROM citas c
    JOIN mascotas m ON m.id = c.mascota_id
    JOIN clientes cl ON cl.id = m.cliente_id
    JOIN usuarios u ON u.id = c.usuario_id
  `;
  
  const conditions = [];
  const params = [];

  if (fecha) {
    conditions.push('DATE(c.fecha_hora) = ?');
    params.push(fecha);
  }

  if (estado) {
    conditions.push('c.estado = ?');
    params.push(estado);
  }

  if (conditions.length > 0) {
    query += ' WHERE ' + conditions.join(' AND ');
  }

  query += ' ORDER BY c.fecha_hora ASC';

  const [rows] = await pool.execute(query, params);
  return rows;
}

export async function crearCita({ mascota_id, usuario_id, fecha_hora, motivo }) {
  const [result] = await pool.execute(
    'INSERT INTO citas (mascota_id, usuario_id, fecha_hora, motivo, estado) VALUES (?, ?, ?, ?, ?)',
    [mascota_id, usuario_id, fecha_hora, motivo, 'pendiente']
  );

  const newId = result.insertId;

  // Devolvemos la cita creada con toda la información necesaria (join)
  const [rows] = await pool.execute(
    `
    SELECT 
      c.id, 
      c.fecha_hora, 
      c.motivo, 
      c.estado, 
      c.created_at, 
      m.id AS mascota_id,
      m.nombre AS mascota_nombre, 
      m.especie, 
      c.usuario_id,
      cl.nombre AS cliente_nombre, 
      cl.telefono, 
      u.nombre AS veterinario_nombre
    FROM citas c
    JOIN mascotas m ON m.id = c.mascota_id
    JOIN clientes cl ON cl.id = m.cliente_id
    JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.id = ?
    `,
    [newId]
  );

  return rows[0];
}

export async function cambiarEstadoCita(id, estado) {
  const [result] = await pool.execute(
    'UPDATE citas SET estado = ? WHERE id = ?',
    [estado, id]
  );

  if (result.affectedRows === 0) {
    throw new NotFoundError('La cita especificada no existe.');
  }

  // Retornar la cita actualizada
  const [rows] = await pool.execute(
    `
    SELECT 
      c.id, 
      c.fecha_hora, 
      c.motivo, 
      c.estado, 
      c.created_at, 
      m.id AS mascota_id,
      m.nombre AS mascota_nombre, 
      m.especie, 
      c.usuario_id,
      cl.nombre AS cliente_nombre, 
      cl.telefono, 
      u.nombre AS veterinario_nombre
    FROM citas c
    JOIN mascotas m ON m.id = c.mascota_id
    JOIN clientes cl ON cl.id = m.cliente_id
    JOIN usuarios u ON u.id = c.usuario_id
    WHERE c.id = ?
    `,
    [id]
  );

  return rows[0];
}

export async function eliminarCita(id) {
  const [result] = await pool.execute(
    'DELETE FROM citas WHERE id = ?',
    [id]
  );

  if (result.affectedRows === 0) {
    throw new NotFoundError('La cita especificada no existe.');
  }

  return true;
}

export async function obtenerStatsDashboard() {
  const [[{ clientes }]] = await pool.execute('SELECT COUNT(*) AS clientes FROM clientes');
  const [[{ mascotas }]] = await pool.execute('SELECT COUNT(*) AS mascotas FROM mascotas');
  const [[{ citasHoy }]] = await pool.execute('SELECT COUNT(*) AS citasHoy FROM citas WHERE DATE(fecha_hora) = CURDATE()');
  const [[{ veterinarios }]] = await pool.execute(
    `SELECT COUNT(*) AS veterinarios FROM usuarios u 
     INNER JOIN roles r ON r.id = u.rol_id 
     WHERE r.nombre = 'veterinario' AND u.activo = 1`
  );
  
  return { clientes, mascotas, citasHoy, veterinarios };
}

