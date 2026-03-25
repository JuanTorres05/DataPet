# DATAVET — Backend

API REST para el sistema de gestión veterinaria DATAVET, construida con **Node.js + Express + MySQL**.

---

## Requisitos

- Node.js >= 20
- MySQL 8+
- npm >= 9

---

## Instalación

```bash
# 1. Instalar dependencias
npm install

# 2. Copiar y configurar variables de entorno
cp .env.example .env
# Edita .env con tus datos de BD y un JWT_SECRET seguro
```

### Generar un JWT_SECRET seguro

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## Base de datos

```bash
# 1. Aplicar el esquema
mysql -u root -p datavet < ../database/schema.sql

# 2. (Opcional) Cargar datos de prueba para tests de integración
mysql -u root -p datavet < ../database/seed-test.sql
```

Los usuarios semilla tienen contraseña `test1234`:
| Cédula | Rol |
|---|---|
| 0000000001 | admin |
| 0000000002 | veterinario |
| 0000000003 | recepcionista |

---

## Ejecutar en desarrollo

```bash
npm run dev
```

El servidor arranca en `http://localhost:3000`.

---

## Documentación interactiva (Swagger)

Con el servidor corriendo, abre:

```
http://localhost:3000/api/docs
```

---

## Endpoints disponibles

| Método | Ruta | Auth | Roles |
|--------|------|------|-------|
| `GET` | `/api/health` | No | — |
| `POST` | `/api/auth/login` | No | — |
| `POST` | `/api/clientes/registrar` | JWT | admin, recepcionista |
| `GET` | `/api/mascotas/cliente/:clienteId` | JWT | todos |
| `GET` | `/api/mascotas/:id` | JWT | todos |

---

## Tests

```bash
npm test
```

Ejecuta todos los archivos `*.test.js` bajo `tests/` usando el test runner nativo de Node.js.

**Cobertura de los tests:**
- `tests/health.test.js` — Endpoint de salud
- `tests/auth.test.js` — HU-01: Login (7 casos)
- `tests/clientes.test.js` — HU-02: Registro cliente+mascota (6 casos)

> Los tests de auth y clientes requieren BD en ejecución y el seed cargado.

---

## Estructura del proyecto

```
backend/
├── openapi.yaml             # Spec OpenAPI 3.0
├── src/
│   ├── app.js               # Express app + Swagger UI
│   ├── server.js            # Arranque del servidor
│   ├── config/env.js        # Variables de entorno validadas
│   ├── db/pool.js           # Pool de conexiones MySQL
│   ├── errors/
│   │   └── http.errors.js   # HttpError, UnauthorizedError, ForbiddenError, NotFoundError
│   ├── middlewares/
│   │   ├── auth.middleware.js   # requireAuth + requireRole
│   │   └── error.middleware.js  # Manejador global de errores
│   ├── modules/
│   │   ├── auth/            # HU-01: Login
│   │   ├── clientes/        # HU-02: Registro cliente+mascota
│   │   └── mascotas/        # Consulta de mascotas
│   └── routes/index.js      # Router central
└── tests/
    ├── health.test.js
    ├── auth.test.js
    └── clientes.test.js
```
