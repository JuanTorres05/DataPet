/**
 * Tests de integración — HU-01: Login del sistema
 *
 * Para ejecutar: npm test (desde el directorio backend/)
 *
 * PREREQUISITOS:
 *  - BD corriendo con el schema aplicado (database/schema.sql)
 *  - Usuario de prueba (ver seed-test.sql o crearlo manualmente):
 *      cedula: '0000000001', password: 'test1234', rol: 'admin', activo: 1
 *      cedula: '0000000002', password: 'test1234', rol: 'veterinario', activo: 1
 *  - Archivo .env configurado con DB_* y JWT_SECRET
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

// ─── HU-01: Login ───────────────────────────────────────────────────────────

test('HU-01 | Login exitoso — devuelve token y datos del usuario', async () => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ cedula: '0000000001', password: 'test1234' });

    assert.equal(response.statusCode, 200, 'Debe responder 200');
    assert.ok(response.body.token, 'Debe incluir token JWT');
    assert.ok(response.body.user, 'Debe incluir objeto user');
    assert.ok(response.body.user.id, 'User debe tener id');
    assert.ok(response.body.user.nombre, 'User debe tener nombre');
    assert.ok(response.body.user.rol, 'User debe tener rol');
});

test('HU-01 | Login fallido — contraseña incorrecta retorna 401', async () => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ cedula: '0000000001', password: 'incorrecta' });

    assert.equal(response.statusCode, 401);
    assert.ok(response.body.message);
});

test('HU-01 | Login fallido — cédula inexistente retorna 401', async () => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ cedula: '9999999999', password: 'cualquiera' });

    assert.equal(response.statusCode, 401);
});

test('HU-01 | Login fallido — contraseña muy corta retorna 400 (Zod)', async () => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ cedula: '0000000001', password: 'abc' });

    assert.equal(response.statusCode, 400);
    assert.ok(Array.isArray(response.body.errors), 'Debe traer array de errores Zod');
});

test('HU-01 | Login fallido — cédula ausente retorna 400 (Zod)', async () => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({ password: 'test1234' });

    assert.equal(response.statusCode, 400);
});

// ─── HU-01: Protección de rutas ─────────────────────────────────────────────

test('HU-01 | Ruta protegida sin token retorna 401', async () => {
    const response = await request(app)
        .post('/api/clientes/registrar')
        .send({});

    assert.equal(response.statusCode, 401);
});

test('HU-01 | Ruta protegida con token inválido retorna 401', async () => {
    const response = await request(app)
        .post('/api/clientes/registrar')
        .set('Authorization', 'Bearer token.falso.invalido')
        .send({});

    assert.equal(response.statusCode, 401);
});
