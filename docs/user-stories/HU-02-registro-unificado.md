# HU-02 — Registro unificado de cliente y mascota

## Historia
**Como** recepcionista  
**Quiero** registrar los datos del propietario y su mascota en un solo formulario  
**Para** agilizar el proceso de alta y evitar duplicidad de pasos.

## Criterios de aceptación
1. Formulario pide nombre, teléfono y correo del cliente.
2. Pide nombre, especie y raza de la mascota.
3. Guarda cliente y mascota de forma transaccional.
4. Muestra confirmación visual cuando el registro es exitoso.
5. Ante error no deben quedar registros parciales.

## Reglas de negocio
- Correo del cliente debe ser único.
- Teléfono con formato válido.
- Mascota siempre debe pertenecer a un cliente existente.

## Casos de prueba mínimos
- Registro exitoso cliente+mascota.
- Error por datos obligatorios faltantes.
- Error por correo duplicado.
- Verificación de rollback si falla inserción de mascota.
