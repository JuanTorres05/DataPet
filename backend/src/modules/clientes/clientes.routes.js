import { Router } from 'express';
import * as clientesController from './clientes.controller.js';
import { requireAuth, requireRole } from '../../middlewares/auth.middleware.js';

const router = Router();

router.post(
  '/registrar',
  requireAuth,
  requireRole('admin', 'recepcionista'),
  clientesController.registrar
);

export default router;
