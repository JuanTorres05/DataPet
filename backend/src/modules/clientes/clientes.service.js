import pool from '../../db/pool.js';

export async function registrarClienteMascota({ cliente, mascota }) {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const [clienteResult] = await connection.execute(
      'INSERT INTO clientes (nombre, telefono, correo) VALUES (?, ?, ?)',
      [cliente.nombre, cliente.telefono, cliente.correo]
    );

    const clienteId = clienteResult.insertId;

    const [mascotaResult] = await connection.execute(
      'INSERT INTO mascotas (cliente_id, nombre, especie, raza) VALUES (?, ?, ?, ?)',
      [clienteId, mascota.nombre, mascota.especie, mascota.raza]
    );

    await connection.commit();

    return {
      cliente: {
        id: clienteId,
        ...cliente
      },
      mascota: {
        id: mascotaResult.insertId,
        clienteId,
        ...mascota
      }
    };
  } catch (err) {
    await connection.rollback();
    throw err;
  } finally {
    connection.release();
  }
}
