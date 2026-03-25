// Validaciones del módulo clientes con Zod
// El schema refleja exactamente los campos de las tablas clientes y mascotas en BD

import { z } from 'zod';

// Regex para teléfono: admite dígitos, +, -, espacios - entre 7 y 15 caracteres
// Ejemplo válido: "3001234567", "+57 300 123 4567"
const telefonoRegex = /^[0-9+\-\s]{7,15}$/;

export const registrarClienteMascotaSchema = z.object({
  // Sección del propietario
  cliente: z.object({
    nombre: z.string().min(1, 'El nombre del cliente es obligatorio.').trim(),
    telefono: z
      .string()
      .regex(telefonoRegex, 'El teléfono debe tener entre 7 y 15 dígitos (puede incluir +, - y espacios).'),
    correo: z
      .string()
      .email('El correo no tiene un formato válido.')
      // Normalizamos a minúsculas para evitar duplicados tipo "Ana@mail.com" vs "ana@mail.com"
      .transform((v) => v.toLowerCase().trim())
  }),

  // Sección de la mascota
  mascota: z.object({
    nombre: z.string().min(1, 'El nombre de la mascota es obligatorio.').trim(),
    especie: z.string().min(1, 'La especie es obligatoria.').trim(),
    raza: z.string().min(1, 'La raza es obligatoria.').trim()
  })
});
