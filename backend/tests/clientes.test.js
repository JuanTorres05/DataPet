/**
 * tests/clientes.test.js  — HU-09: Testing de registro y listado de clientes
 *
 * Cubre HU-02, HU-03:
 * - Registro exitoso con una o varias mascotas
 * - Correo normalizado a minúsculas
 * - Validaciones Zod (campos obligatorios, formato teléfono)
 * - Correo duplicado → 409
 * - Control de acceso por rol (veterinario no puede registrar)
 * - Listado de clientes con todos los roles
 */
import { describe, it, expect, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import pool from '../src/db/pool.js';
import { tokens } from './helpers/auth.js';

afterAll(async () => { await pool.end(); });

const correoUnico = () => `test_${Date.now()}_${Math.random().toString(36).slice(2)}@example.com`;

const bodyValido = () => ({
  cliente: { nombre: 'Pedro Test', telefono: '3001112233', correo: correoUnico() },
  mascotas: [{ nombre: 'Firulais', especie: 'Perro', raza: 'Labrador' }],
});

// ── HU-02: Registro ───────────────────────────────────────────────────────────

describe('POST /api/clientes/registrar', () => {
  it('201 — admin registra cliente con una mascota', async () => {
    const res = await request(app)
      .post('/api/clientes/registrar')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send(bodyValido());

    expect(res.status).toBe(201);
    expect(res.body.cliente).toHaveProperty('id');
    expect(res.body.mascotas).toHaveLength(1);
    expect(res.body.mascotas[0]).toHaveProperty('id');
  });

  it('201 — recepcionista registra cliente con múltiples mascotas', async () => {
    const body = {
      cliente: { nombre: 'Ana Prueba', telefono: '3119876543', correo: correoUnico() },
      mascotas: [
        { nombre: 'Luna', especie: 'Gato', raza: 'Siamés' },
        { nombre: 'Toby', especie: 'Perro', raza: 'Beagle' },
      ],
    };
    const res = await request(app)
      .post('/api/clientes/registrar')
      .set('Authorization', `Bearer ${tokens.recepcionista}`)
      .send(body);

    expect(res.status).toBe(201);
    expect(res.body.mascotas).toHaveLength(2);
  });

  it('correo guardado en minúsculas (normalización)', async () => {
    const correoMayus = `MAYUSC_${Date.now()}@EXAMPLE.COM`;
    const res = await request(app)
      .post('/api/clientes/registrar')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({
        cliente: { nombre: 'Test Mayús', telefono: '3001234567', correo: correoMayus },
        mascotas: [{ nombre: 'Max', especie: 'Perro', raza: 'Poodle' }],
      });

    expect(res.status).toBe(201);
    expect(res.body.cliente.correo).toBe(correoMayus.toLowerCase());
  });

  it('400 — campos obligatorios faltantes (Zod)', async () => {
    const res = await request(app)
      .post('/api/clientes/registrar')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send({ cliente: { nombre: '' }, mascotas: [] });

    expect(res.status).toBe(400);
  });

  it('400 — teléfono con formato inválido (Zod)', async () => {
    const body = bodyValido();
    body.cliente.telefono = 'noestelefono';
    const res = await request(app)
      .post('/api/clientes/registrar')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send(body);

    expect(res.status).toBe(400);
  });

  it('400 — array mascotas vacío (Zod: min 1)', async () => {
    const body = bodyValido();
    body.mascotas = [];
    const res = await request(app)
      .post('/api/clientes/registrar')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send(body);

    expect(res.status).toBe(400);
  });

  it('409 — correo ya registrado (duplicado MySQL)', async () => {
    const body = bodyValido();

    const primera = await request(app)
      .post('/api/clientes/registrar')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send(body);
    expect(primera.status).toBe(201);

    const segunda = await request(app)
      .post('/api/clientes/registrar')
      .set('Authorization', `Bearer ${tokens.admin}`)
      .send(body); // mismo correo
    expect(segunda.status).toBe(409);
  });

  it('403 — veterinario no puede registrar clientes', async () => {
    const res = await request(app)
      .post('/api/clientes/registrar')
      .set('Authorization', `Bearer ${tokens.veterinario}`)
      .send(bodyValido());

    expect(res.status).toBe(403);
  });
});

// ── HU-03: Listado ────────────────────────────────────────────────────────────

describe('GET /api/clientes', () => {
  it('200 — admin puede listar clientes y recibe array', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('200 — veterinario puede listar clientes', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${tokens.veterinario}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('200 — recepcionista puede listar clientes', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${tokens.recepcionista}`);

    expect(res.status).toBe(200);
  });

  it('cada cliente tiene mascotas como array', async () => {
    const res = await request(app)
      .get('/api/clientes')
      .set('Authorization', `Bearer ${tokens.admin}`);

    expect(res.status).toBe(200);
    if (res.body.length > 0) {
      expect(Array.isArray(res.body[0].mascotas)).toBe(true);
    }
  });
});
