# Sprint 01 — Plan de ejecución

## Objetivo del sprint
Entregar un flujo funcional de acceso seguro (HU-01) y registro unificado de cliente/mascota (HU-02).

## Capacidad estimada
- Duración sugerida: 2 semanas
- Equipo: Frontend, Backend, QA, Fullstack

## Historias comprometidas
1. HU-01 Login del sistema
2. HU-02 Registro unificado de cliente y mascota

## Tareas técnicas HU-01
1. Crear pantalla login con React + Tailwind.
2. Implementar endpoint `POST /api/auth/login`.
3. Integrar JWT en backend y middleware de autorización.
4. Configurar rutas protegidas en frontend.
5. Redirección por rol tras autenticación.
6. Pruebas funcionales de acceso permitido/denegado.

## Tareas técnicas HU-02
1. Diseñar formulario unificado Cliente + Mascota.
2. Validar campos obligatorios y formato.
3. Crear endpoint `POST /api/clientes/registrar`.
4. Implementar transacción en BD para evitar parciales.
5. Crear tablas/relaciones y restricciones en MariaDB.
6. Conectar frontend con backend mediante Axios.
7. Mostrar feedback visual de éxito/error.
8. Ejecutar pruebas funcionales de flujo completo.

## Riesgos
- Falta de estandarización de validaciones frontend/backend.
- Retrasos por definición tardía de roles/permisos.
- Ambigüedad en reglas de negocio para clientes duplicados.

## Entregables del sprint
- Endpoints documentados y operativos.
- Scripts SQL iniciales listos para despliegue.
- Historias HU-01 y HU-02 con evidencia de pruebas.
