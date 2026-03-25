import { Router } from 'express';
import * as mascotasController from './mascotas.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// GET /api/mascotas/cliente/:clienteId — Lista mascotas de un cliente
router.get('/cliente/:clienteId', requireAuth, mascotasController.listarPorCliente);

// GET /api/mascotas/:id — Detalle de una mascota con datos del cliente
router.get('/:id', requireAuth, mascotasController.obtenerPorId);

export default router;
