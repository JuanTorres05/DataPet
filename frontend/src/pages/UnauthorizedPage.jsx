import { Link } from 'react-router-dom';

export default function UnauthorizedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F7F8FA] px-6">
      <div className="bg-white border border-[#E2E8EA] rounded-xl p-10 text-center max-w-sm w-full">
        <div
          className="w-14 h-14 rounded-xl flex items-center justify-center text-3xl mx-auto mb-5"
          style={{ backgroundColor: '#FDECEA' }}
        >
          🚫
        </div>
        <h1 className="font-semibold text-[#1A2B30] mb-2" style={{ fontSize: '18px' }}>Acceso no autorizado</h1>
        <p className="text-xs text-[#5C7078] mb-7 leading-relaxed">
          No tienes permisos suficientes para acceder a esta sección del sistema.
          Contacta al administrador si crees que es un error.
        </p>
        <Link to="/dashboard" className="btn-primary w-full">
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}
