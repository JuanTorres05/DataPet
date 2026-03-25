# DATAVET

Base inicial del proyecto para trabajar por **historias de usuario** con una arquitectura desacoplada:

- **Frontend**: React + Tailwind (pendiente de implementación)
- **Backend**: Node.js + Express (implementación inicial lista)
- **Base de datos**: MariaDB (puerto 3306)
- **Autenticación**: JWT con control de roles (Admin, Veterinario, Recepcionista)

## Estado actual

✅ Planificación base creada para trabajo por historias de usuario.
✅ Backend inicial desarrollado para HU-01 y HU-02:

- `POST /api/auth/login` (valida credenciales y genera JWT)
- `POST /api/clientes/registrar` (registro transaccional cliente + mascota)
- Middleware JWT + autorización por roles

## Estructura creada

```text
/docs
/database
/backend
  src/
  tests/
  package.json
```

## Ejecución rápida backend

```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

## Próximo paso recomendado

Implementar frontend de HU-01 (pantalla login + rutas protegidas) y conectar con los endpoints ya disponibles en backend.
