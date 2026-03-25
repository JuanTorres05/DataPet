-- Seed de datos de prueba para tests de integración
-- Ejecutar DESPUÉS de haber aplicado database/schema.sql
-- SOLO para entornos de desarrollo/test, NUNCA en producción

-- Contraseña para ambos usuarios: 'test1234'
-- Hash generado con bcrypt (12 rounds)
-- $2a$12$dBXFtewvvD5ukBxJ0dUayuxkIYJEZbhWAuBAGBshOxg9A.ZOwdDiS

INSERT INTO usuarios (cedula, nombre, password_hash, rol_id, activo)
VALUES
  ('0000000001', 'Admin Test',
   '$2a$12$dBXFtewvvD5ukBxJ0dUayuxkIYJEZbhWAuBAGBshOxg9A.ZOwdDiS',
   (SELECT id FROM roles WHERE nombre = 'admin'), 1),

  ('0000000002', 'Veterinario Test',
   '$2a$12$dBXFtewvvD5ukBxJ0dUayuxkIYJEZbhWAuBAGBshOxg9A.ZOwdDiS',
   (SELECT id FROM roles WHERE nombre = 'veterinario'), 1),

  ('0000000003', 'Recepcionista Test',
   '$2a$12$dBXFtewvvD5ukBxJ0dUayuxkIYJEZbhWAuBAGBshOxg9A.ZOwdDiS',
   (SELECT id FROM roles WHERE nombre = 'recepcionista'), 1)

ON DUPLICATE KEY UPDATE
  nombre = VALUES(nombre),
  password_hash = VALUES(password_hash),
  rol_id = VALUES(rol_id),
  activo = VALUES(activo);
