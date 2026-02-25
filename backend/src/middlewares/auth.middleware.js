import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

export function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Token requerido.' });
  }

  const token = auth.slice('Bearer '.length);

  try {
    req.user = jwt.verify(token, env.jwt.secret);
    return next();
  } catch {
    return res.status(401).json({ message: 'Token inválido o expirado.' });
  }
}

export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.rol)) {
      return res.status(403).json({ message: 'No tiene permisos para esta acción.' });
    }

    return next();
  };
}
