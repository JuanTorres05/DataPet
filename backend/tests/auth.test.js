/**
 * tests/auth.test.js  — HU-09: Testing de autenticación y control de acceso
 *
 * Cubre HU-01, HU-07:
 * - Login válido/inválido por los tres roles
 * - Acceso a rutas protegidas sin/con token inválido
 * - Control de acceso por rol (RBAC) en endpoints críticos
 */
import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db/pool.js';
import { tokens } from './helpers/auth.js';

afterAll(async () => { await pool.end(); });

// ── HU-01: Login ─────────────────────────────────────────────────────────────

describe('POST /api/auth/login', () => {
  it('200 + token con credenciales de admin', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ cedula: '0000000001', password: 'test1234' });
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.rol).toBe('admin');
  });

  it('200 + token con credenciales de veterinario', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ cedula: '0000000002', password: 'test1234' });
    expect(res.status).toBe(200);
    expect(res.body.user.rol).toBe('veterinario');
  });

  it('200 + token con credenciales de recepcionista', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ cedula: '0000000003', password: 'test1234' });
    expect(res.status).toBe(200);
    expect(res.body.user.rol).toBe('recepcionista');
  });

  it('401 con contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ cedula: '0000000001', password: 'mala_clave' });
    expect(res.status).toBe(401);
  });

  it('401 con cédula inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ cedula: '9999999999', password: 'test1234' });
    expect(res.status).toBe(401);
  });

  it('400 cuando falta la cédula (Zod)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ password: 'test1234' });
    expect(res.status).toBe(400);
  });

  it('400 cuando la contraseña es muy corta (Zod)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ cedula: '0000000001', password: 'abc' });
    expect(res.status).toBe(400);
  });
});

// ── HU-07: Protección de rutas ────────────────────────────────────────────────

describe('requireAuth — rutas protegidas', () => {
  it('401 sin token en GET /api/clientes', async () => {
    const res = await request(app).get('/api/clientes');
    expect(res.status).toBe(401);
  });

  it('401 con token malformado', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', 'Bearer token.invalido.xyz');
    expect(res.status).toBe(401);
  });

  it('401 sin prefijo Bearer', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', tokens.admin); // sin "Bearer "
    expect(res.status).toBe(401);
  });

  it('200 con token válido de admin', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${tokens.admin}`);
    expect(res.status).toBe(200);
  });
});

// ── HU-07: Control de acceso por rol (RBAC) ───────────────────────────────────

describe('requireRole — control de acceso por rol', () => {
  it('403 recepcionista → GET /api/reportes/resumen', async () => {
    const res = await request(app)
      .get('/api/reportes/resumen')
      .set('Authorization', `Bearer ${tokens.recepcionista}`);
    expect(res.status).toBe(403);
  });

  it('200 veterinario → GET /api/reportes/resumen', async () => {
    const res = await request(app)
      .get('/api/reportes/resumen')
      .set('Authorization', `Bearer ${tokens.veterinario}`);
    expect(res.status).toBe(200);
  });

  it('403 veterinario → POST /api/citas (solo admin/recepcionista)', async () => {
    const res = await request(app)
      .post('/api/citas')
      .set('Authorization', `Bearer ${tokens.veterinario}`)
      .send({ mascota_id: 1, usuario_id: 1, fecha_hora: '2099-01-01T10:00', motivo: 'Test' });
    expect(res.status).toBe(403);
  });

  it('403 recepcionista → POST /api/mascotas/1/historial (solo admin/veterinario)', async () => {
    const res = await request(app)
      .post('/api/mascotas/1/historial')
      .set('Authorization', `Bearer ${tokens.recepcionista}`)
      .send({ fecha: '2025-01-01', motivo: 'x', diagnostico: 'x', tratamiento: 'x' });
    expect(res.status).toBe(403);
  });

  it('recepcionista puede eliminar una cita (llega al controlador → 404 no 403)', async () => {
    const res = await request(app)
      .delete('/api/citas/999999')
      .set('Authorization', `Bearer ${tokens.recepcionista}`);
    expect(res.status).toBe(404);
  });
});
