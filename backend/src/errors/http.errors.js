/**
 * Clase base para errores HTTP con código de estado.
 */
export class HttpError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = this.constructor.name;
  }
}

/**
 * 401 Unauthorized — credenciales inválidas o token ausente.
 */
export class UnauthorizedError extends HttpError {
  constructor(message = 'No autorizado.') {
    super(401, message);
  }
}

/**
 * 403 Forbidden — autenticado pero sin permisos suficientes.
 */
export class ForbiddenError extends HttpError {
  constructor(message = 'No tiene permisos para esta acción.') {
    super(403, message);
  }
}

/**
 * 404 Not Found — recurso no encontrado.
 */
export class NotFoundError extends HttpError {
  constructor(message = 'Recurso no encontrado.') {
    super(404, message);
  }
}
