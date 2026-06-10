# Reporte de Pruebas — DataVet (HU-09)

**Fecha:** 2026-06-09  
**Framework:** Vitest 4.1.8 + Supertest  
**Resultado global:** ✅ **52 / 52 tests pasaron** · 5 archivos de test · ~2s de ejecución

---

## Resumen por módulo

| Archivo | Tests | Estado |
|---|---|---|
| `tests/health.test.js` | 1 | ✅ Todos pasan |
| `tests/auth.test.js` | 16 | ✅ Todos pasan |
| `tests/clientes.test.js` | 12 | ✅ Todos pasan |
| `tests/citas.test.js` | 14 | ✅ Todos pasan |
| `tests/mascotas.test.js` | 9 | ✅ Todos pasan |

---

## Cobertura de Historias de Usuario

### HU-01 — Login del sistema (auth.test.js)
| Escenario | Resultado |
|---|---|
| Login exitoso como admin | ✅ 200 + token JWT |
| Login exitoso como veterinario | ✅ 200 + token JWT |
| Login exitoso como recepcionista | ✅ 200 + token JWT |
| Contraseña incorrecta | ✅ 401 Unauthorized |
| Cédula inexistente | ✅ 401 Unauthorized |
| Contraseña muy corta (Zod) | ✅ 400 Bad Request |
| Cédula ausente (Zod) | ✅ 400 Bad Request |

### HU-07 — Protección de rutas y control de acceso (auth.test.js)
| Escenario | Resultado |
|---|---|
| GET /api/clientes sin token | ✅ 401 |
| GET /api/clientes con token malformado | ✅ 401 |
| GET /api/clientes sin prefijo Bearer | ✅ 401 |
| GET /api/clientes con token válido (admin) | ✅ 200 |
| Recepcionista → GET /api/reportes/resumen | ✅ 403 Forbidden |
| Veterinario → GET /api/reportes/resumen | ✅ 200 OK |
| Veterinario → POST /api/citas | ✅ 403 Forbidden |
| Recepcionista → POST /api/mascotas/:id/historial | ✅ 403 Forbidden |
| Recepcionista → DELETE /api/citas/inexistente | ✅ 404 (tiene permiso, pero no existe) |

### HU-02 — Registro unificado cliente-mascota (clientes.test.js)
| Escenario | Resultado |
|---|---|
| Admin registra cliente con 1 mascota | ✅ 201 |
| Recepcionista registra cliente con 2 mascotas | ✅ 201 |
| Correo normalizado a minúsculas | ✅ OK |
| Campos obligatorios faltantes (Zod) | ✅ 400 |
| Teléfono con formato inválido (Zod) | ✅ 400 |
| Array mascotas vacío (Zod: min 1) | ✅ 400 |
| Correo duplicado (MySQL) | ✅ 409 Conflict |
| Veterinario intenta registrar | ✅ 403 Forbidden |

### HU-03 — Listado de clientes (clientes.test.js)
| Escenario | Resultado |
|---|---|
| Admin lista clientes | ✅ 200 + array |
| Veterinario lista clientes | ✅ 200 |
| Recepcionista lista clientes | ✅ 200 |
| Cada cliente tiene campo `mascotas[]` | ✅ OK |

### HU-04 — Agenda / citas (citas.test.js)
| Escenario | Resultado |
|---|---|
| Admin lista todas las citas | ✅ 200 + array |
| Veterinario lista citas | ✅ 200 |
| Filtro por fecha retorna solo citas del día | ✅ OK |
| Filtro por estado=pendiente retorna solo pendientes | ✅ OK |
| Dashboard stats con contadores correctos | ✅ 200 + {clientes, mascotas, citasHoy, veterinarios} |
| Recepcionista crea cita con datos válidos | ✅ 201 |
| Veterinario no puede crear citas (403) | ✅ OK |
| Motivo muy corto falla Zod | ✅ 400 |
| fecha_hora ausente falla Zod | ✅ 400 |
| Recepcionista cambia estado a atendida | ✅ 200 |
| Estado inválido falla Zod | ✅ 400 |
| Cita inexistente retorna 404 | ✅ 404 |
| Eliminar cita inexistente retorna 404 | ✅ 404 |
| Veterinario no puede eliminar citas (403) | ✅ OK |

### HU-05 — Historial clínico (mascotas.test.js)
| Escenario | Resultado |
|---|---|
| Ficha completa de mascota (id, nombre, especie, cliente, historial[], citas[]) | ✅ 200 |
| Veterinario puede ver ficha de mascota | ✅ 200 |
| Mascota con ID inexistente | ✅ 404 |
| Veterinario registra historial clínico | ✅ 201 |
| Admin registra historial clínico | ✅ 201 |
| Recepcionista no puede registrar historial | ✅ 403 |
| Diagnóstico faltante falla Zod | ✅ 400 |
| Motivo muy corto falla Zod | ✅ 400 |
| Listar mascotas de cliente | ✅ 200 |

---

## Bugs detectados y corregidos durante testing

| Bug | Archivo | Corrección |
|---|---|---|
| `req.user.sub` incorrecto (debería ser `req.user.id`) | `mascotas.controller.js` | Corregido a `req.user.id` |
| Tokens de prueba usaban `id: 999` que no existe en BD | `tests/helpers/auth.js` | Cambiado a IDs reales del seed (1/2/3) |
| Opción `poolOptions` deprecada en Vitest 4 | `vitest.config.js` | Movida a `singleFork` a nivel raíz |

---

## Cómo ejecutar los tests

```bash
cd DataPet/backend
npm test              # Ejecutar todos los tests una vez
npm run test:watch    # Modo watch (re-ejecuta en cambios)
npm run test:coverage # Con reporte de cobertura
```

> **Prerequisitos:** MySQL corriendo con el schema aplicado y los usuarios seed cargados (cédulas 0000000001/2/3 con password `test1234`).
