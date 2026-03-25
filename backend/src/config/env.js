// Configuración de variables de entorno
// Usamos dotenv para leer el archivo .env y centralizar todo en un objeto

import dotenv from 'dotenv';

dotenv.config();

// Lista de secretos que no son seguros para producción
const INSECURE_SECRETS = new Set(['', 'replace_me', 'dev_secret_change_me']);

const jwtSecret = process.env.JWT_SECRET ?? '';

// Si estamos en producción y el secreto es débil, cortamos el arranque del servidor
// Esto evita subir a producción con credenciales de desarrollo por descuido
if (process.env.NODE_ENV === 'production' && INSECURE_SECRETS.has(jwtSecret)) {
  throw new Error(
    '[config] JWT_SECRET no está definido o usa un valor inseguro. ' +
    'Define la variable de entorno JWT_SECRET antes de arrancar en producción.'
  );
}

// Exportamos todo en un solo objeto para acceder desde cualquier parte del proyecto
// En vez de process.env.DB_HOST en cada archivo, usamos env.db.host
export const env = {
  port: Number(process.env.PORT || 3000),
  nodeEnv: process.env.NODE_ENV || 'development',
  db: {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'datavet'
  },
  jwt: {
    secret: jwtSecret || 'dev_secret_change_me',
    expiresIn: process.env.JWT_EXPIRES_IN || '8h'
  }
};
