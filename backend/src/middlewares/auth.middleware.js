// Middlewares de autenticación y autorización
// Estos se aplican como "capas" antes de llegar al controlador

import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// requireAuth: verifica que la petición traiga un token JWT válido
// Si no tiene token o es inválido devuelve 401 y la petición no sigue
export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;

  // El token debe venir en el header así: "Authorization: Bearer <token>"
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido.' });
  }

  const token = auth.slice('Bearer '.length);

  try {
    // Verificamos que el token sea válido y no haya expirado
    // Si todo está bien, guardamos los datos del usuario en req.user
    // (id, nombre, rol) para que los controladores los puedan usar
    req.user = jwt.verify(token, env.jwt.secret);
    return next();
  } catch {
    // El token puede fallar si está alterado o si ya venció (8 horas)
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
