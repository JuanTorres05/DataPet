import * as citasService from './citas.service.js';
import { crearCitaSchema, cambiarEstadoSchema } from './citas.schemas.js';

export async function listar(req, res, next) {
  try {
    const { fecha, estado } = req.query;
    const result = await citasService.listarCitas({ fecha, estado });
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

export async function crear(req, res, next) {
  try {
    const payload = crearCitaSchema.parse(req.body);
    const result = await citasService.crearCita(payload);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
}

export async function cambiarEstado(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    const { estado } = cambiarEstadoSchema.parse(req.body);
    const result = await citasService.cambiarEstadoCita(id, estado);
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

export async function eliminar(req, res, next) {
  try {
    const id = parseInt(req.params.id, 10);
    await citasService.eliminarCita(id);
    return res.status(204).end();
  } catch (err) {
    return next(err);
  }
}

export async function dashboardStats(req, res, next) {
  try {
    const result = await citasService.obtenerStatsDashboard();
    return res.json(result);
  } catch (err) {
    return next(err);
  }
}

