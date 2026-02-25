# Backend DATAVET

API Express inicial para HU-01 (login) y HU-02 (registro unificado cliente+mascota).

## Requisitos
- Node.js 20+
- MariaDB 10+

## Configuración
1. Copiar variables de entorno:
   ```bash
   cp .env.example .env
   ```
2. Instalar dependencias:
   ```bash
   npm install
   ```
3. Ejecutar servidor en desarrollo:
   ```bash
   npm run dev
   ```

## Endpoints iniciales
- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/clientes/registrar` (requiere JWT y rol `admin` o `recepcionista`)

## Scripts
- `npm run dev`
- `npm start`
- `npm test`
