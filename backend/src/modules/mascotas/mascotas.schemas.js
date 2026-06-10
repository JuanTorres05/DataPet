import { z } from 'zod';

export const crearHistorialSchema = z.object({
  fecha: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'La fecha no es válida',
  }),
  motivo: z.string().min(3, 'El motivo debe tener al menos 3 caracteres'),
  diagnostico: z.string().min(3, 'El diagnóstico debe tener al menos 3 caracteres'),
  tratamiento: z.string().min(3, 'El tratamiento debe tener al menos 3 caracteres'),
  notas: z.string().optional().nullable(),
});
