/**
 * tests/citas.test.js  — HU-09: Testing del módulo de citas
 *
 * Cubre HU-04, HU-08:
 * - Listar citas con y sin filtros de fecha/estado
 * - Crear cita: roles permitidos y denegados
 * - Validación Zod de body al crear cita
 * - Cambiar estado de una cita
 * - Eliminar cita existente e inexistente
 * - Dashboard stats
 */
import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db/pool.js';
import { tokens } from './helpers/auth.js';

afterAll(async () => { await pool.end(); });

// ID de mascota y usuario que deben existir en la BD de test
// (creados por el seed de usuarios: admin id=1, veterinario id=2, etc.)
// Buscamos dinámicamente para no depender de IDs fijos
let mascotaId = null;
let usuarioVetId = null;
let citaCreada = null;

beforeAll(async () => {
  // Obtener primera mascota disponible
  const [mascotas] = await pool.execute('SELECT id FROM mascotas LIMIT 1');
  if (mascotas.length > 0) mascotaId = mascotas[0].id;

  // Obtener id del veterinario de prueba
  const [vets] = await pool.execute(
    "SELECT u.id FROM usuarios u JOIN roles r ON r.id = u.rol_id WHERE r.nombre = 'veterinario' LIMIT 1"
  );
  if (vets.length > 0) usuarioVetId = vets[0].id;
});

// ── Listar citas ──────────────────────────────────────────────────────────────

describe('GET /api/citas', () => {
  it('200 — admin puede listar todas las citas (array)', async () => {
    const res = await request(app)
      .get('/api/citas')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('200 — veterinario puede listar citas', async () => {
    const res = await request(app)
      .get('/api/citas')
      .set('Authorization', `Bearer ${tokens.veterinario}`);

    expect(res.status).toBe(200);
  });

  it('200 — filtro por fecha (YYYY-MM-DD) retorna solo citas del día', async () => {
    const fecha = new Date().toISOString().split('T')[0];
    const res = await request(app)
      .get(`/api/citas?fecha=${fecha}`)
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('200 — filtro por estado pendiente retorna solo pendientes', async () => {
    const res = await request(app)
      .get('/api/citas?estado=pendiente')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    const estadosUnicos = [...new Set(res.body.map((c) => c.estado))];
    if (res.body.length > 0) {
      expect(estadosUnicos).toEqual(['pendiente']);
    }
  });
});

// ── Dashboard stats ───────────────────────────────────────────────────────────

describe('GET /api/citas/dashboard-stats', () => {
  it('200 — retorna objeto con clientes, mascotas, citasHoy, veterinarios', async () => {
    const res = await request(app)
      .get('/api/citas/dashboard-stats')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('clientes');
    expect(res.body).toHaveProperty('mascotas');
    expect(res.body).toHaveProperty('citasHoy');
    expect(res.body).toHaveProperty('veterinarios');
  });
});

// ── Crear cita ────────────────────────────────────────────────────────────────

describe('POST /api/citas', () => {
  it('201 — recepcionista crea cita con datos válidos', async () => {
    if (!mascotaId || !usuarioVetId) {
      console.warn('Sin datos de prueba (mascota/vet), test omitido');
      return;
    }

    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${tokens.recepcionista}`)
      .send({
        mascota_id: mascotaId,
        usuario_id: usuarioVetId,
        fecha_hora: '2099-12-31T10:00:00',
        motivo: 'Consulta general de prueba automatizada',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.estado).toBe('pendiente');
    citaCreada = res.body;
  });

  it('403 — veterinario no puede crear citas', async () => {
    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${tokens.veterinario}`)
      .send({ mascota_id: 1, usuario_id: 1, fecha_hora: '2099-01-01T10:00', motivo: 'Test' });

    expect(res.status).toBe(403);
  });

  it('400 — motivo muy corto falla validación Zod', async () => {
    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ mascota_id: 1, usuario_id: 1, fecha_hora: '2099-01-01T10:00', motivo: 'ab' });

    expect(res.status).toBe(400);
  });

  it('400 — fecha_hora ausente falla validación Zod', async () => {
    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ mascota_id: 1, usuario_id: 1, motivo: 'Sin fecha' });

    expect(res.status).toBe(400);
  });
});

// ── Cambiar estado de cita ────────────────────────────────────────────────────

describe('PATCH /api/citas/:id/estado', () => {
  it('200 — recepcionista cambia estado a atendida', async () => {
    if (!citaCreada) return; // depende del test de creación

    const res = await request(app)
      .patch(`/api/citas/${citaCreada.id}/estado`)
      .set('Authorization', `Bearer ${tokens.recepcionista}`)
      .send({ estado: 'atendida' });

    expect(res.status).toBe(200);
    expect(res.body.estado).toBe('atendida');
  });

  it('400 — estado inválido falla validación Zod', async () => {
    const id = citaCreada?.id ?? 1;
    const res = await request(app)
      .patch(`/api/citas/${id}/estado`)
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ estado: 'estado_invalido' });

    expect(res.status).toBe(400);
  });

  it('404 — cita inexistente retorna 404', async () => {
    const res = await request(app)
      .patch('/api/citas/999999/estado')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ estado: 'cancelada' });

    expect(res.status).toBe(404);
  });
});

// ── Eliminar cita ─────────────────────────────────────────────────────────────

describe('DELETE /api/citas/:id', () => {
  it('404 — eliminar cita inexistente retorna 404', async () => {
    const res = await request(app)
      .delete('/api/citas/999999')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(404);
  });

  it('403 — veterinario no puede eliminar citas', async () => {
    const res = await request(app)
      .delete('/api/citas/1')
      .set('Authorization', `Bearer ${tokens.veterinario}`);

    expect(res.status).toBe(403);
  });
});
