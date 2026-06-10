// Servicio para el registro de clientes y mascotas (HU-02)
// Ahora acepta un array de mascotas — todas se insertan en la misma transacción.
// Si cualquier inserción falla, se hace rollback completo (ningún dato queda a medias).

import pool from '../../db/pool.js';

export async function registrarClienteMascota({ cliente, mascotas }) {
  // Pedimos una conexión dedicada para manejar la transacción nosotros mismos
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Paso 1: insertar el cliente
    const [clienteResult] = await connection.execute(
      'INSERT INTO clientes (nombre, telefono, correo) VALUES (?, ?, ?)',
      [cliente.nombre, cliente.telefono, cliente.correo]
    );

    const clienteId = clienteResult.insertId;

    // Paso 2: insertar cada mascota vinculada al cliente en la misma transacción
    const mascotasInsertadas = [];

    for (const mascota of mascotas) {
      const [mascotaResult] = await connection.execute(
        'INSERT INTO mascotas (cliente_id, nombre, especie, raza) VALUES (?, ?, ?, ?)',
        [clienteId, mascota.nombre, mascota.especie, mascota.raza]
      );

      mascotasInsertadas.push({
        id: mascotaResult.insertId,
        clienteId,
        ...mascota
      });
    }

    // Todo bien — confirmamos cliente + todas las mascotas en un solo commit
    await connection.commit();

    return {
      cliente: {
        id: clienteId,
        ...cliente
      },
      mascotas: mascotasInsertadas
    };

  } catch (err) {
    // Si algo salió mal, deshacemos TODO para no dejar datos incompletos
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}

export async function listarClientes() {
  const [rows] = await pool.execute(
    `SELECT c.id, c.nombre, c.telefono, c.correo, 
            m.id AS mascota_id, m.nombre AS mascota_nombre, m.especie, m.raza 
     FROM clientes c 
     LEFT JOIN mascotas m ON m.cliente_id = c.id 
     ORDER BY c.nombre`
  );

  const clientesMap = new Map();

  for (const row of rows) {
    if (!clientesMap.has(row.id)) {
      clientesMap.set(row.id, {
        id: row.id,
        nombre: row.nombre,
        telefono: row.telefono,
        correo: row.correo,
        mascotas: []
      });
    }

    if (row.mascota_id) {
      clientesMap.get(row.id).mascotas.push({
        id: row.mascota_id,
        nombre: row.mascota_nombre,
        especie: row.especie,
        raza: row.raza
      });
    }
  }

  return Array.from(clientesMap.values());
}

