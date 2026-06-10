/**
 * tests/mascotas.test.js  — HU-09: Testing del módulo de mascotas e historial
 *
 * Cubre HU-05:
 * - Obtener ficha completa de mascota (con historial y citas)
 * - Mascota inexistente → 404
 * - Crear entrada de historial clínico (veterinario/admin)
 * - Validaciones Zod del historial
 * - Recepcionista no puede crear historial (403)
 */
import { describe, it, expect, afterAll, beforeAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db/pool.js';
import { tokens } from './helpers/auth.js';

afterAll(async () => { await pool.end(); });

let mascotaId = null;

beforeAll(async () => {
  const [rows] = await pool.execute('SELECT id FROM mascotas LIMIT 1');
  if (rows.length > 0) mascotaId = rows[0].id;
});

// ── GET /api/mascotas/:id ─────────────────────────────────────────────────────

describe('GET /api/mascotas/:id', () => {
  it('200 — retorna ficha completa de mascota existente', async () => {
    if (!mascotaId) return;

    const res = await request(app)
      .get(`/api/mascotas/${mascotaId}`)
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id', mascotaId);
    expect(res.body).toHaveProperty('nombre');
    expect(res.body).toHaveProperty('especie');
    expect(res.body).toHaveProperty('cliente');
    expect(Array.isArray(res.body.historial)).toBe(true);
    expect(Array.isArray(res.body.citas)).toBe(true);
  });

  it('200 — veterinario puede ver ficha de mascota', async () => {
    if (!mascotaId) return;

    const res = await request(app)
      .get(`/api/mascotas/${mascotaId}`)
      .set('Authorization', `Bearer ${tokens.veterinario}`);

    expect(res.status).toBe(200);
  });

  it('404 — mascota con ID inexistente', async () => {
    const res = await request(app)
      .get('/api/mascotas/999999')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(404);
  });
});

// ── POST /api/mascotas/:id/historial ─────────────────────────────────────────

describe('POST /api/mascotas/:id/historial', () => {
  const historialValido = {
    fecha: '2025-06-01T10:00:00',
    motivo: 'Consulta de revisión general',
    diagnostico: 'El animal se encuentra en buen estado de salud.',
    tratamiento: 'Vitaminas y desparasitación preventiva.',
    notas: 'Próxima revisión en 6 meses.',
  };

  it('201 — veterinario puede registrar historial clínico', async () => {
    if (!mascotaId) return;

    const res = await request(app)
      .post(`/api/mascotas/${mascotaId}/historial`)
      .set('Authorization', `Bearer ${tokens.veterinario}`)
      .send(historialValido);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body).toHaveProperty('diagnostico');
    expect(res.body).toHaveProperty('tratamiento');
    expect(res.body).toHaveProperty('veterinario_nombre');
  });

  it('201 — admin puede registrar historial clínico', async () => {
    if (!mascotaId) return;

    const res = await request(app)
      .post(`/api/mascotas/${mascotaId}/historial`)
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ ...historialValido, notas: null });

    expect(res.status).toBe(201);
  });

  it('403 — recepcionista no puede registrar historial', async () => {
    if (!mascotaId) return;

    const res = await request(app)
      .post(`/api/mascotas/${mascotaId}/historial`)
      .set('Authorization', `Bearer ${tokens.recepcionista}`)
      .send(historialValido);

    expect(res.status).toBe(403);
  });

  it('400 — diagnostico faltante falla Zod', async () => {
    if (!mascotaId) return;

    const res = await request(app)
      .post(`/api/mascotas/${mascotaId}/historial`)
      .set('Authorization', `Bearer ${tokens.veterinario}`)
      .send({ fecha: '2025-06-01', motivo: 'Test', tratamiento: 'Test' }); // sin diagnostico

    expect(res.status).toBe(400);
  });

  it('400 — motivo muy corto falla Zod', async () => {
    if (!mascotaId) return;

    const res = await request(app)
      .post(`/api/mascotas/${mascotaId}/historial`)
      .set('Authorization', `Bearer ${tokens.veterinario}`)
      .send({ ...historialValido, motivo: 'ab' });

    expect(res.status).toBe(400);
  });
});

// ── GET /api/mascotas/cliente/:clienteId ─────────────────────────────────────

describe('GET /api/mascotas/cliente/:clienteId', () => {
  it('200 — retorna array de mascotas del cliente', async () => {
    const res = await request(app)
      .get('/api/mascotas/cliente/1')
      .set('Authorization', `Bearer ${tokens.admin}`);

    // 200 aunque esté vacío, 404 si el cliente no existe (BD puede variar)
    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(Array.isArray(res.body)).toBe(true);
    }
  });
});
