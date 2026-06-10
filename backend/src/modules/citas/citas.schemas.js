import { z } from 'zod';

export const crearCitaSchema = z.object({
  mascota_id: z.number().int().positive('La mascota es requerida'),
  usuario_id: z.number().int().positive('El veterinario es requerido'),
  fecha_hora: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'La fecha y hora no es válida',
  }),
  motivo: z.string().min(3, 'El motivo debe tener al menos 3 caracteres'),
});

export const cambiarEstadoSchema = z.object({
  estado: z.enum(['pendiente', 'atendida', 'cancelada'], {
    errorMap: () => ({ message: 'El estado debe ser: pendiente, atendida o cancelada' }),
  }),
});
