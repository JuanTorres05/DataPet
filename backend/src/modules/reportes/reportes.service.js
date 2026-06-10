import pool from '../../db/pool.js';

/**
 * Resumen general del sistema para reportes administrativos.
 * Devuelve: total clientes, mascotas, citas (todas), citas atendidas, pendientes, canceladas,
 * top 5 especies más frecuentes, y el veterinario con más citas atendidas.
 */
export async function obtenerResumen() {
  const [[{ totalClientes }]] = await pool.execute(
    'SELECT COUNT(*) AS totalClientes FROM clientes'
  );
  const [[{ totalMascotas }]] = await pool.execute(
    'SELECT COUNT(*) AS totalMascotas FROM mascotas'
  );
  const [[{ totalCitas }]] = await pool.execute(
    'SELECT COUNT(*) AS totalCitas FROM citas'
  );
  const [[{ citasAtendidas }]] = await pool.execute(
    "SELECT COUNT(*) AS citasAtendidas FROM citas WHERE estado = 'atendida'"
  );
  const [[{ citasPendientes }]] = await pool.execute(
    "SELECT COUNT(*) AS citasPendientes FROM citas WHERE estado = 'pendiente'"
  );
  const [[{ citasCanceladas }]] = await pool.execute(
    "SELECT COUNT(*) AS citasCanceladas FROM citas WHERE estado = 'cancelada'"
  );
  const [[{ totalHistorial }]] = await pool.execute(
    'SELECT COUNT(*) AS totalHistorial FROM historial_clinico'
  );

  // Top 5 especies
  const [topEspecies] = await pool.execute(
    `SELECT especie, COUNT(*) AS total
     FROM mascotas
     GROUP BY especie
     ORDER BY total DESC
     LIMIT 5`
  );

  // Veterinario con más citas atendidas
  const [topVet] = await pool.execute(
    `SELECT u.nombre AS veterinario, COUNT(*) AS totalAtendidas
     FROM citas c
     JOIN usuarios u ON u.id = c.usuario_id
     WHERE c.estado = 'atendida'
     GROUP BY c.usuario_id
     ORDER BY totalAtendidas DESC
     LIMIT 1`
  );

  return {
    totalClientes,
    totalMascotas,
    totalCitas,
    citasAtendidas,
    citasPendientes,
    citasCanceladas,
    totalHistorial,
    topEspecies,
    topVeterinario: topVet[0] || null,
  };
}

/**
 * Citas agrupadas por día para los últimos N días (default 30).
 * Útil para gráfica de barras temporal.
 */
export async function obtenerCitasPorDia(dias = 30) {
  const [rows] = await pool.execute(
    `SELECT
       DATE(fecha_hora) AS fecha,
       COUNT(*) AS total,
       SUM(estado = 'atendida')   AS atendidas,
       SUM(estado = 'pendiente')  AS pendientes,
       SUM(estado = 'cancelada')  AS canceladas
     FROM citas
     WHERE fecha_hora >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
     GROUP BY DATE(fecha_hora)
     ORDER BY fecha ASC`,
    [dias]
  );
  return rows;
}

/**
 * Distribución de citas por día de la semana (Lunes–Domingo).
 * Permite identificar los días más concurridos.
 */
export async function obtenerCitasPorDiaSemana() {
  const [rows] = await pool.execute(
    `SELECT
       DAYOFWEEK(fecha_hora) AS diaSemana,
       COUNT(*) AS total
     FROM citas
     GROUP BY DAYOFWEEK(fecha_hora)
     ORDER BY diaSemana ASC`
  );

  const diasNombres = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
  return rows.map(r => ({
    dia: diasNombres[r.diaSemana - 1] ?? `Día ${r.diaSemana}`,
    total: r.total
  }));
}
