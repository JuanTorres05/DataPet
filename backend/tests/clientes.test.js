/**
 * Tests de integración — HU-02: Registro unificado de cliente y mascota
 *
 * Para ejecutar: npm test (desde el directorio backend/)
 *
 * PREREQUISITOS:
 *  - BD corriendo con el schema aplicado (database/schema.sql)
 *  - Usuario admin de prueba con cedula '0000000001' y password 'test1234'
 *  - Usuario veterinario de prueba con cedula '0000000002' y password 'test1234'
 *  - Archivo .env configurado con DB_* y JWT_SECRET
 *
 * NOTA: Cada corrida puede generar registros en BD (el correo cambia para evitar 409).
 */

import test from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import app from '../src/app.js';

// Helper: obtiene token de login para un usuario dado
async function getToken(cedula, password) {
    const res = await request(app)
        .post('/api/auth/login')
        .send({ cedula, password });
    return res.body.token;
}

// Helper: genera un correo único por timestamp para evitar colisiones en pruebas repetidas
function correoUnico() {
    return `test_${Date.now()}@example.com`;
}

const bodyValido = () => ({
    cliente: {
        nombre: 'Pedro Test',
        telefono: '3001112233',
        correo: correoUnico()
    },
    mascota: {
        nombre: 'Firulais',
        especie: 'Perro',
        raza: 'Labrador'
    }
});

// ─── HU-02: Registro exitoso ─────────────────────────────────────────────────

test('HU-02 | Registro exitoso — administrador puede registrar cliente+mascota (201)', async () => {
    const token = await getToken('0000000001', 'test1234');

    const response = await request(app)
        .post('/api/clientes/registrar')
        .set('Authorization', `Bearer ${token}`)
        .send(bodyValido());

    assert.equal(response.statusCode, 201, 'Debe responder 201 Created');
    assert.ok(response.body.cliente?.id, 'Debe retornar ID del cliente creado');
    assert.ok(response.body.mascota?.id, 'Debe retornar ID de la mascota creada');
    assert.equal(typeof response.body.mascota.clienteId, 'number', 'La mascota debe tener clienteId numérico');
});

test('HU-02 | El correo se guarda en minúsculas (normalización)', async () => {
    const token = await getToken('0000000001', 'test1234');

    const correoOriginal = `MAYUSCULAS_${Date.now()}@EXAMPLE.COM`;
    const response = await request(app)
        .post('/api/clientes/registrar')
        .set('Authorization', `Bearer ${token}`)
        .send({
            ...bodyValido(),
            cliente: {
                nombre: 'Test Mayúsculas',
                telefono: '3009876543',
                correo: correoOriginal
            }
        });

    assert.equal(response.statusCode, 201);
    assert.equal(
        response.body.cliente.correo,
        correoOriginal.toLowerCase(),
        'El correo debe estar en minúsculas'
    );
});

// ─── HU-02: Errores de validación ────────────────────────────────────────────

test('HU-02 | Campos obligatorios faltantes retorna 400', async () => {
    const token = await getToken('0000000001', 'test1234');

    const response = await request(app)
        .post('/api/clientes/registrar')
        .set('Authorization', `Bearer ${token}`)
        .send({ cliente: { nombre: '' }, mascota: {} });

    assert.equal(response.statusCode, 400);
    assert.ok(Array.isArray(response.body.errors), 'Debe traer array de errores Zod');
});

test('HU-02 | Teléfono con formato inválido retorna 400', async () => {
    const token = await getToken('0000000001', 'test1234');

    const body = bodyValido();
    body.cliente.telefono = 'abc'; // no cumple el regex

    const response = await request(app)
        .post('/api/clientes/registrar')
        .set('Authorization', `Bearer ${token}`)
        .send(body);

    assert.equal(response.statusCode, 400);
});

// ─── HU-02: Correo duplicado ──────────────────────────────────────────────────

test('HU-02 | Correo ya registrado retorna 409', async () => {
    const token = await getToken('0000000001', 'test1234');
    const body = bodyValido(); // mismo correo en ambas peticiones

    // Primera inserción (debe pasar)
    const primera = await request(app)
        .post('/api/clientes/registrar')
        .set('Authorization', `Bearer ${token}`)
        .send(body);

    assert.equal(primera.statusCode, 201, 'La primera inserción debe ser 201');

    // Segunda inserción con el mismo correo (debe fallar)
    const segunda = await request(app)
        .post('/api/clientes/registrar')
        .set('Authorization', `Bearer ${token}`)
        .send(body);

    assert.equal(segunda.statusCode, 409, 'El duplicado debe retornar 409');
});

// ─── HU-02: Control de acceso por rol ────────────────────────────────────────

test('HU-02 | Veterinario no puede registrar clientes — retorna 403', async () => {
    const token = await getToken('0000000002', 'test1234');

    const response = await request(app)
        .post('/api/clientes/registrar')
        .set('Authorization', `Bearer ${token}`)
        .send(bodyValido());

    assert.equal(response.statusCode, 403, 'El veterinario debe recibir 403 Forbidden');
});
