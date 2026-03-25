import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="card p-10 text-center max-w-sm w-full animate-fade-in">
        <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4">
          🚫
        </div>
        <h1 className="text-xl font-bold text-gray-800 mb-2">Acceso no autorizado</h1>
        <p className="text-gray-400 text-sm mb-6">
          No tienes permisos para acceder a esta sección del sistema.
        </p>
        <Link to="/dashboard" className="btn-primary w-full">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
