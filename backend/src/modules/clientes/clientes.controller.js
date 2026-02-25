import { registrarClienteMascotaSchema } from './clientes.schemas.js';
import * as clientesService from './clientes.service.js';

export async function registrar(req, res, next) {
  try {
    const payload = registrarClienteMascotaSchema.parse(req.body);
    const result = await clientesService.registrarClienteMascota(payload);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}
