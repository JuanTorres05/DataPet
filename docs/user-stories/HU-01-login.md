# HU-01 — Login del sistema

## Historia
**Como** usuario del sistema  
**Quiero** iniciar sesión con credenciales seguras  
**Para** acceder únicamente a las funciones que me corresponden.

## Roles involucrados
- Admin
- Veterinario
- Recepcionista / Encargado

## Criterios de aceptación
1. Formulario con cédula y contraseña.
2. Validación de credenciales en base de datos.
3. Emisión de token JWT válido.
4. Redirección por rol después de login.
5. Protección de rutas sin token.

## Reglas de negocio
- La contraseña se verifica con hash seguro (bcrypt).
- El token incluye rol y expiración.
- Usuarios inactivos no pueden autenticarse.

## Casos de prueba mínimos
- Login exitoso para cada rol.
- Error por contraseña incorrecta.
- Error por usuario no existente.
- Acceso denegado a ruta protegida sin token.
