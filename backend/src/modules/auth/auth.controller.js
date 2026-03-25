// Controlador de autenticación
// Su trabajo es recibir la petición, pasarla al servicio y devolver la respuesta
// Si hay error lo manda al manejador global (error.middleware.js)

import { loginSchema } from './auth.schemas.js';
import * as authService from './auth.service.js';

export async function login(req, res, next) {
  try {
    // Primero validamos que el body tenga cédula y contraseña con Zod
    const payload = loginSchema.parse(req.body);

    // Le pasamos los datos al servicio que hace la lógica real
    const result = await authService.login(payload);

    return res.status(200).json(result);
  } catch (err) {
    // Si algo falla (validación, credenciales, BD) lo manda al error handler
    return next(err);
  }
}
