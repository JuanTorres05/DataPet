# Arquitectura base DATAVET

## Visión general

El sistema se construirá como una aplicación cliente-servidor desacoplada:

1. **Frontend (React + Tailwind)**
   - Presenta formularios y vistas por rol.
   - Consume API REST por HTTP/JSON.
   - Gestiona token JWT en sesión segura.

2. **Backend (Node.js + Express)**
   - Expone rutas REST bajo `/api`.
   - Aplica capas: Routes → Controllers → Services → Models.
   - Usa middlewares para autenticación y autorización por rol.

3. **Base de datos (MariaDB)**
   - Almacena usuarios, clientes, mascotas, citas y auditoría.
   - Soporta transacciones para procesos críticos (ej. registro unificado).

## Componentes técnicos por capa

### Frontend
- React Router para navegación protegida.
- Axios para consumo de API con interceptor JWT.
- Tailwind para UI consistente y rápida.

### Backend
- Express como servidor HTTP.
- JWT para login y sesiones stateless.
- Bcrypt para hash de contraseñas.
- Validaciones de payload (campos obligatorios/formato).

### Base de datos
- Tablas iniciales:
  - `usuarios`
  - `roles`
  - `clientes`
  - `mascotas`
- Integridad con llaves foráneas y `UNIQUE` por correo/teléfono.

## Flujos prioritarios

1. **HU-01 Login**
   - Usuario envía credenciales.
   - Backend valida usuario + password.
   - Genera JWT con `sub`, `rol`, `exp`.
   - Frontend redirige según rol.

2. **HU-02 Registro unificado Cliente+Mascota**
   - Recepcionista llena formulario único.
   - Backend valida y ejecuta transacción:
     - Inserta cliente.
     - Inserta mascota ligada al cliente.
   - Si falla algún paso, rollback completo.
