import { loginSchema } from './auth.schemas.js';
import * as authService from './auth.service.js';

export async function login(req, res, next) {
  try {
    const payload = loginSchema.parse(req.body);
    const result = await authService.login(payload);
    return res.status(200).json(result);
  } catch (err) {
    return next(err);
  }
}
