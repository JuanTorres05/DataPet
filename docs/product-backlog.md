# Product Backlog inicial — DATAVET

## Épica 1: Acceso seguro al sistema

### HU-01 — Login del sistema (Alta prioridad)
**Como** usuario del sistema  
**Quiero** iniciar sesión con credenciales seguras  
**Para** acceder únicamente a las funciones que me corresponden.

**Criterios de aceptación**
1. Debe existir formulario de login (cédula + contraseña).
2. Debe validar credenciales contra la base de datos.
3. Debe generar token JWT.
4. Debe redirigir según rol.
5. Debe bloquear acceso sin autenticación.

---

## Épica 2: Registro operativo de pacientes

### HU-02 — Registro unificado de cliente y mascota (Alta prioridad)
**Como** recepcionista  
**Quiero** registrar datos del propietario y su mascota en un solo formulario  
**Para** agilizar el proceso de alta y evitar duplicidad de pasos.

**Criterios de aceptación**
1. El formulario solicita nombre, teléfono y correo del cliente.
2. Solicita nombre, especie y raza de la mascota.
3. Al guardar, crea registros en `clientes` y `mascotas` de forma transaccional.
4. Muestra confirmación visual de registro exitoso.
5. Si ocurre un error, no se crean registros parciales.

---

## Épica 3: Gestión clínica (pendiente de refinamiento)

### HU-03 — Agenda de citas
**Como** recepcionista  
**Quiero** agendar citas por cliente/mascota  
**Para** organizar la atención diaria.

### HU-04 — Consulta de pacientes por veterinario
**Como** veterinario  
**Quiero** visualizar historial básico del paciente  
**Para** atender con información previa.

### HU-05 — Reportes administrativos
**Como** admin  
**Quiero** ver reportes de operación  
**Para** tomar decisiones.
