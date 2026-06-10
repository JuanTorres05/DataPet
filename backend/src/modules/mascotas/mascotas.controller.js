import * as mascotasService from './mascotas.service.js';
import { crearHistorialSchema } from './mascotas.schemas.js';

export async function listarPorCliente(req, res, next) {
    try {
        const clienteId = Number(req.params.clienteId);
        if (!Number.isInteger(clienteId) || clienteId < 1) {
            return res.status(400).json({ message: 'El ID de cliente no es válido.' });
        }
        const mascotas = await mascotasService.listarPorCliente(clienteId);
        return res.status(200).json(mascotas);
    } catch (err) {
        return next(err);
    }
}

export async function obtenerPorId(req, res, next) {
    try {
        const mascotaId = Number(req.params.id);
        if (!Number.isInteger(mascotaId) || mascotaId < 1) {
            return res.status(400).json({ message: 'El ID de mascota no es válido.' });
        }
        const mascota = await mascotasService.obtenerPorId(mascotaId);
        return res.status(200).json(mascota);
    } catch (err) {
        return next(err);
    }
}

export async function registrarHistorial(req, res, next) {
    try {
        const mascotaId = Number(req.params.id);
        if (!Number.isInteger(mascotaId) || mascotaId < 1) {
            return res.status(400).json({ message: 'El ID de mascota no es válido.' });
        }

        // Validamos el body con Zod
        const payload = crearHistorialSchema.parse(req.body);

        // Obtener ID del veterinario (usuario logueado) del middleware de autenticación
        const usuarioId = req.user.id;

        const result = await mascotasService.crearHistorial({
            mascota_id: mascotaId,
            usuario_id: usuarioId,
            ...payload
        });

        return res.status(201).json(result);
    } catch (err) {
        return next(err);
    }
}

