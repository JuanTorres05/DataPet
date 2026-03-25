// Servicio para el registro de clientes y mascotas (HU-02)
// Lo más importante acá es la TRANSACCIÓN: si falla algo, no queda nada a medias

import pool from '../../db/pool.js';

export async function registrarClienteMascota({ cliente, mascota }) {
  // Pedimos una conexión dedicada para poder manejar la transacción nosotros mismos
  const connection = await pool.getConnection();

  try {
    // Iniciamos la transacción - a partir de acá ningún cambio queda guardado hasta el commit
    await connection.beginTransaction();

    // Paso 1: insertar el cliente en su tabla
    const [clienteResult] = await connection.execute(
      'INSERT INTO clientes (nombre, telefono, correo) VALUES (?, ?, ?)',
      [cliente.nombre, cliente.telefono, cliente.correo]
    );

    // El insertId nos da el id que se le asignó al cliente recién creado
    const clienteId = clienteResult.insertId;

    // Paso 2: insertar la mascota ya vinculada al cliente
    // Si esto falla, el rollback también deshace la inserción del cliente
    const [mascotaResult] = await connection.execute(
      'INSERT INTO mascotas (cliente_id, nombre, especie, raza) VALUES (?, ?, ?, ?)',
      [clienteId, mascota.nombre, mascota.especie, mascota.raza]
    );

    // Todo bien, confirmamos los dos cambios en BD
    await connection.commit();

    // Devolvemos los datos creados para que el frontend pueda mostrar confirmación
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
    // Si algo salió mal, deshacemos TODO (cliente + mascota) para no dejar datos incompletos
    await connection.rollback();
    throw err; // re-lanzamos el error para que lo maneje el error.middleware.js
  } finally {
    // Siempre devolvemos la conexión al pool, con o sin error
    connection.release();
  }
}
