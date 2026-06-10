import { Router } from 'express';
import * as citasController from './citas.controller.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// GET /api/citas
// Listar citas con filtros de fecha y/o estado
// Accesible por todos los usuarios autenticados (admin, recepcionista, veterinario)
router.get(
  '/',
  requireAuth,
  citasController.listar
);

// GET /api/citas/dashboard-stats
// Obtener métricas generales para el panel principal
router.get(
  '/dashboard-stats',
  requireAuth,
  citasController.dashboardStats
);


// POST /api/citas
// Crear una nueva cita
// Solo admin y recepcionista pueden agendar
router.post(
  '/',
  requireAuth,
  requireRole('admin', 'recepcionista'),
  citasController.crear
);

// PATCH /api/citas/:id/estado
// Cambiar el estado de una cita (pendiente, atendida, cancelada)
// Cualquier rol autenticado puede actualizar el estado de una cita
router.patch(
  '/:id/estado',
  requireAuth,
  requireRole('admin', 'veterinario', 'recepcionista'),
  citasController.cambiarEstado
);

// DELETE /api/citas/:id
// Eliminar/cancelar por completo una cita de la agenda
// Solo admin y recepcionista pueden eliminar
router.delete(
  '/:id',
  requireAuth,
  requireRole('admin', 'recepcionista'),
  citasController.eliminar
);

export default router;
