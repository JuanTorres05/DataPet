// Controlador de clientes
// Por ahora solo tenemos el registro unificado (HU-02)
// TODO: agregar más endpoints cuando avancemos en el sprint 2 (listar, editar, etc.)

import { registrarClienteMascotaSchema } from './clientes.schemas.js';
import * as clientesService from './clientes.service.js';

export async function registrar(req, res, next) {
  try {
    // Validamos el body antes de tocar la BD - si algo falla Zod lanza error 400
    const payload = registrarClienteMascotaSchema.parse(req.body);

    // Mandamos al servicio que hace la inserción en BD con transacción
    const result = await clientesService.registrarClienteMascota(payload);

    // 201 Created con los datos del cliente y mascota recién creados
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}
