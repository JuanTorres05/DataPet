import { Router } from 'express';
import * as mascotasController from './mascotas.controller.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

// GET /api/mascotas/cliente/:clienteId — Lista mascotas de un cliente
router.get('/cliente/:clienteId', requireAuth, mascotasController.listarPorCliente);

// GET /api/mascotas/:id — Detalle de una mascota con datos del cliente, historial y citas
router.get('/:id', requireAuth, mascotasController.obtenerPorId);

// POST /api/mascotas/:id/historial — Registrar una entrada en el historial clínico
router.post(
  '/:id/historial',
  requireAuth,
  requireRole('admin', 'veterinario'),
  mascotasController.registrarHistorial
);

export default router;
