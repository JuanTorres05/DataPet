import { Router } from 'express';
import * as reportesController from './reportes.controller.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// GET /api/reportes/resumen
// Resumen estadístico general — solo admin y veterinario
router.get(
  '/resumen',
  requireAuth,
  requireRole('admin', 'veterinario'),
  reportesController.resumen
);

// GET /api/reportes/citas-por-dia?dias=30
// Citas agrupadas por día (para gráfica de barras temporal) — solo admin y veterinario
router.get(
  '/citas-por-dia',
  requireAuth,
  requireRole('admin', 'veterinario'),
  reportesController.citasPorDia
);

// GET /api/reportes/citas-por-dia-semana
// Distribución de citas por día de la semana — solo admin y veterinario
router.get(
  '/citas-por-dia-semana',
  requireAuth,
  requireRole('admin', 'veterinario'),
  reportesController.citasPorDiaSemana
);

export default router;
