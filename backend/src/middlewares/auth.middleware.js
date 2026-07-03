// Middlewares de autenticación y autorización
// Estos se aplican como "capas" antes de llegar al controlador

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// requireAuth: verifica que la petición traiga un token JWT válido
// Si no tiene token o es inválido devuelve 401 y la petición no sigue
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  console.log(`[requireAuth] ${req.method} ${req.originalUrl} - Header Authorization recibido:`, auth ? `${auth.slice(0, 20)}...` : 'Ninguno');

  // El token debe venir en el header así: "Authorization: Bearer <token>"
  if (!auth || !auth.startsWith('Bearer ')) {
    console.log('[requireAuth] Denegado: Token requerido o formato inválido.');
    return res.status(401).json({ message: 'Token requerido.' });
  }

  const token = auth.slice('Bearer '.length);

  try {
    // Verificamos que el token sea válido y no haya expirado
    // Si todo está bien, guardamos los datos del usuario en req.user
    // (id, nombre, rol) para que los controladores los puedan usar
    req.user = jwt.verify(token, env.jwt.secret);
    console.log('[requireAuth] Token verificado correctamente para usuario:', req.user.nombre, 'con rol:', req.user.rol);
    return next();
  } catch (err) {
    // El token puede fallar si está alterado o si ya venció (8 horas)
    console.log('[requireAuth] Falló la verificación del token. Error:', err.message);
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
}

// requireRole: se usa DESPUÉS de requireAuth para filtrar por rol
// Recibe los roles permitidos y devuelve una función middleware
// Ejemplo de uso: requireRole('admin', 'recepcionista')
export function requireRole(...roles) {
  return (req, res, next) => {
    // req.user lo llenó requireAuth, si el rol no está en la lista: 403
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tiene permisos para esta acción.' });
    }

    return next();
  };
}
