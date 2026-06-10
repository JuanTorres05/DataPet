// Validaciones del módulo clientes con Zod
// Se acepta ahora un array de mascotas (mínimo 1, máximo 10) para registro múltiple

import { z } from 'zod';

// Regex para teléfono: admite dígitos, +, -, espacios - entre 7 y 15 caracteres
const telefonoRegex = /^[0-9+\-\s]{7,15}$/;

const mascotaSchema = z.object({
  nombre:  z.string().min(1, 'El nombre de la mascota es obligatorio.').trim(),
  especie: z.string().min(1, 'La especie es obligatoria.').trim(),
  raza:    z.string().min(1, 'La raza es obligatoria.').trim()
});

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

  // Array de mascotas (mínimo 1, máximo 10 por registro)
  mascotas: z
    .array(mascotaSchema)
    .min(1, 'Debes registrar al menos una mascota.')
    .max(10, 'No puedes registrar más de 10 mascotas a la vez.')
});
