// Rutas del módulo de autenticación
// Por ahora solo tenemos el login, más adelante se puede agregar logout, refresh, etc.

import { Router } from 'express';
import * as authController from './auth.controller.js';

const router = Router();

// POST /api/auth/login → llama al controlador de login
router.post('/login', authController.login);

export default router;
