export function errorHandler(err, _req, res, _next) {
  if (err?.name === 'ZodError') {
    return res.status(400).json({
      message: 'Datos inválidos.',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message
      }))
    });
  }

  if (err?.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'Dato duplicado.' });
  }

  if (err?.statusCode) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  return res.status(500).json({ message: 'Error interno del servidor.' });
}
