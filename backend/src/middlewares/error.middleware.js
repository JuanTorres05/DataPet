// Manejador global de errores de Express
// Se pone AL FINAL en app.js (después de las rutas) para capturar cualquier error
// que los controladores pasen con next(err)

export function errorHandler(err, _req, res, _next) {
  // Error de validación de Zod - campos inválidos o faltantes
  // Formateamos los errores para que el frontend pueda mostrarlos por campo
  if (err?.name === 'ZodError') {
    return res.status(400).json({
      message: 'Datos inválidos.',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  // Error de BD - cédula, correo u otro campo UNIQUE duplicado
  if (err?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Dato duplicado.' });
  }

  // Errores personalizados (como UnauthorizedError) que tienen statusCode definido
  if (err?.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  // Cualquier otro error inesperado - no exponemos el detalle por seguridad
  // OJO: en desarrollo se puede añadir console.error(err) para ver el stack
  return res.status(500).json({ message: 'Error interno del servidor.' });
}
