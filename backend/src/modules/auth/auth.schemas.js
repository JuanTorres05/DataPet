// Esquemas de validación para el módulo auth
// Usamos Zod para asegurarnos de que el body tenga lo que necesitamos
// Si algo no cumple, Zod lanza un error que el error.middleware.js captura y formatea

import { z } from 'zod';

// Validación del formulario de login
// OJO: la contraseña mínimo 6 chars para cumplir la regla de negocio de HU-01
export const loginSchema = z.object({
  cedula: z.string().min(1, 'La cédula es obligatoria.'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.')
});
