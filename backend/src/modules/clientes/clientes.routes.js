// Rutas del módulo clientes
// Solo admin y recepcionista pueden registrar (el veterinario solo atiende, no da de alta)

import { Router } from 'express';
import * as clientesController from './clientes.controller.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// POST /api/clientes/registrar
// Primero pasamos por requireAuth (verifica el token) y luego requireRole (verifica permisos)
router.post(
  '/registrar',
  requireAuth,
  requireRole('admin', 'recepcionista'),
  clientesController.registrar
);

// TODO: agregar rutas de búsqueda y listado en el sprint 2

export default router;
