-- Esquema inicial DATAVET

CREATE TABLE IF NOT EXISTS roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(30) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cedula VARCHAR(20) NOT NULL UNIQUE,
  nombre VARCHAR(120) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  rol_id INT NOT NULL,
  activo TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS clientes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  telefono VARCHAR(20) NOT NULL,
  correo VARCHAR(120) NOT NULL UNIQUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS mascotas (
  id INT AUTO_INCREMENT PRIMARY KEY,
  cliente_id INT NOT NULL,
  nombre VARCHAR(120) NOT NULL,
  especie VARCHAR(80) NOT NULL,
  raza VARCHAR(80) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (cliente_id) REFERENCES clientes(id)
);

CREATE TABLE IF NOT EXISTS citas (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  mascota_id  INT NOT NULL,
  usuario_id  INT NOT NULL,
  fecha_hora  DATETIME NOT NULL,
  motivo      VARCHAR(255) NOT NULL,
  estado      ENUM('pendiente','atendida','cancelada') NOT NULL DEFAULT 'pendiente',
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mascota_id) REFERENCES mascotas(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS historial_clinico (
  id           INT AUTO_INCREMENT PRIMARY KEY,
  mascota_id   INT NOT NULL,
  usuario_id   INT NOT NULL,
  fecha        DATETIME NOT NULL,
  motivo       VARCHAR(255) NOT NULL,
  diagnostico  TEXT NOT NULL,
  tratamiento  TEXT NOT NULL,
  notas        TEXT,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (mascota_id) REFERENCES mascotas(id),
  FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

INSERT INTO roles (nombre)
VALUES ('admin'), ('veterinario'), ('recepcionista')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre);

