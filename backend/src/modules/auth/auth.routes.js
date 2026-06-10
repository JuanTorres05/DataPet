// Rutas del módulo de autenticación
// Por ahora solo tenemos el login, más adelante se puede agregar logout, refresh, etc.

import { Router } from 'express';
import * as authController from './auth.controller.js';
import { requireAuth } from '../../middlewares/auth.middleware.js';

const router = Router();

// POST /api/auth/login → llama al controlador de login
router.post('/login', authController.login);

// GET /api/auth/veterinarios → lista los veterinarios activos
router.get('/veterinarios', requireAuth, authController.listarVets);

export default router;
