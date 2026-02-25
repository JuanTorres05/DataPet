# Definition of Done (DoD) — DATAVET

Una historia de usuario se considera terminada cuando cumple todos los puntos:

## 1) Funcionalidad
- Cumple criterios de aceptación definidos en la historia.
- Tiene validaciones de entrada y manejo de errores funcional.
- Respeta permisos por rol cuando aplique.

## 2) Calidad técnica
- Código revisado por al menos 1 integrante.
- Sin secretos ni credenciales hardcodeadas.
- API documentada (endpoint, request, response, errores).

## 3) Datos y consistencia
- Migraciones/SQL actualizadas si hubo cambios de esquema.
- Operaciones transaccionales implementadas cuando correspondan.
- Datos de prueba mínimos para validar flujo.

## 4) Pruebas
- Pruebas funcionales de los casos principales.
- Pruebas de casos de error esperados.
- Evidencia de pruebas registrada en la historia.

## 5) UX y entrega
- Mensajes al usuario claros (éxito/error).
- Flujo navegable sin bloqueos.
- Cambios integrados en rama principal mediante PR.
