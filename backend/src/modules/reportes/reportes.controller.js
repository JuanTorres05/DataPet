import * as reportesService from './reportes.service.js';

export async function resumen(req, res, next) {
  try {
    const data = await reportesService.obtenerResumen();
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function citasPorDia(req, res, next) {
  try {
    const dias = parseInt(req.query.dias, 10) || 30;
    const data = await reportesService.obtenerCitasPorDia(dias);
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}

export async function citasPorDiaSemana(req, res, next) {
  try {
    const data = await reportesService.obtenerCitasPorDiaSemana();
    return res.json(data);
  } catch (err) {
    return next(err);
  }
}
