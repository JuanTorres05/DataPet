import { Router } from 'express';
import authRoutes from '../modules/auth/auth.routes.js';
import clientesRoutes from '../modules/clientes/clientes.routes.js';

const router = Router();

router.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

router.use('/auth', authRoutes);
router.use('/clientes', clientesRoutes);

export default router;
