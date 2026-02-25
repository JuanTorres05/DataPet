import { z } from 'zod';

export const registrarClienteMascotaSchema = z.object({
  cliente: z.object({
    nombre: z.string().min(1, 'El nombre del cliente es obligatorio.'),
    telefono: z.string().min(7, 'El teléfono debe tener al menos 7 caracteres.'),
    correo: z.string().email('El correo no tiene un formato válido.')
  }),
  mascota: z.object({
    nombre: z.string().min(1, 'El nombre de la mascota es obligatorio.'),
    especie: z.string().min(1, 'La especie es obligatoria.'),
    raza: z.string().min(1, 'La raza es obligatoria.')
  })
});
