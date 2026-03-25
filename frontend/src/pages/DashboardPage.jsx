import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';

const GREEN       = '#2E8B57';
const GREEN_DK    = '#247548';
const BLUE        = '#2C7BE5';
const ORANGE      = '#F77F00';

const ROL_CONFIG = {
  admin: {
    bg: GREEN, bgDark: GREEN_DK,
    icon: '🛡️', greeting: 'Panel de administración',
  },
  veterinario: {
    bg: BLUE, bgDark: '#2563da',
    icon: '🩺', greeting: 'Panel clínico',
  },
  recepcionista: {
    bg: ORANGE, bgDark: '#c96700',
    icon: '📋', greeting: 'Panel de recepción',
  },
};

const STATS = [
  { label: 'Clientes activos', value: '—', icon: '👥', bg: '#f0faf4', color: GREEN },
  { label: 'Mascotas',         value: '—', icon: '🐾', bg: '#eff6ff', color: BLUE },
  { label: 'Citas hoy',        value: '—', icon: '🗓️', bg: '#fff7ed', color: ORANGE },
  { label: 'Veterinarios',     value: '—', icon: '🩺', bg: '#f0fdf4', color: '#16a34a' },
];

const ROL_ACCESOS = {
  admin:         [{ to: '/registrar', icon: '➕', label: 'Registrar Cliente y Mascota', desc: 'Alta de nuevo paciente' }],
  recepcionista: [{ to: '/registrar', icon: '➕', label: 'Registrar Cliente y Mascota', desc: 'Alta de nuevo paciente' }],
  veterinario:   [],
};

function getHora() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const cfg     = ROL_CONFIG[user?.rol] ?? ROL_CONFIG.admin;
  const accesos = ROL_ACCESOS[user?.rol] ?? [];

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F7FA' }}>
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto w-full px-6 py-8">

        {/* ── Hero banner ── */}
        <div
          className="relative overflow-hidden rounded-2xl p-7 mb-8 animate-fade-in"
          style={{
            background: `linear-gradient(135deg, ${cfg.bg} 0%, ${cfg.bgDark} 100%)`,
            boxShadow: '0 4px 24px 0 rgba(0,0,0,0.12)',
          }}
        >
          <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.10)' }} />
          <div className="absolute right-16 -bottom-8 w-24 h-24 rounded-full"  style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />

          <div className="relative z-10 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl" style={{ backgroundColor: 'rgba(255,255,255,0.20)' }}>
                {cfg.icon}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.75)' }}>{getHora()},</p>
                <h1 className="text-2xl font-bold text-white">{user?.nombre}</h1>
                <span className="text-sm" style={{ color: 'rgba(255,255,255,0.70)' }}>{cfg.greeting}</span>
              </div>
            </div>

            <div
              className="rounded-xl px-5 py-3 text-right"
              style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
            >
              <p className="font-semibold text-white text-sm">
                {new Date().toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' })}
              </p>
              <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.70)' }}>
                {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        </div>

        {/* ── Stats ── */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8 animate-slide-up">
          {STATS.map((s) => (
            <div key={s.label} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: s.bg, color: s.color }}>
                {s.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-slate-800">{s.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Accesos rápidos ── */}
        <p className="section-title">Acciones rápidas</p>

        {accesos.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {accesos.map((acc) => (
              <Link
                key={acc.to}
                to={acc.to}
                className="card-hover p-5 animate-fade-in"
                style={{ borderLeft: `4px solid ${GREEN}` }}
              >
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{acc.icon}</span>
                  <p className="font-semibold text-slate-800 text-sm">{acc.label}</p>
                </div>
                <p className="text-slate-500 text-xs">{acc.desc}</p>
                <div className="mt-3 text-xs font-semibold flex items-center gap-1" style={{ color: GREEN }}>
                  Ir a registrar <span>→</span>
                </div>
              </Link>
            ))}

            {['🗓️ Agendar cita', '🔍 Buscar paciente'].map((label) => (
              <div key={label} className="card p-5 border-l-4 border-slate-200" style={{ opacity: 0.55, cursor: 'not-allowed' }}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">{label.split(' ')[0]}</span>
                  <p className="font-semibold text-slate-500 text-sm">{label.slice(2)}</p>
                </div>
                <p className="text-slate-400 text-xs">Disponible próximamente</p>
                <span className="mt-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-yellow-50 text-yellow-700">
                  Próximamente
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="card p-10 text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl mx-auto mb-4" style={{ backgroundColor: '#eff6ff' }}>
              🩺
            </div>
            <h3 className="font-bold text-slate-700 text-lg">Panel del veterinario</h3>
            <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
              Las funciones clínicas estarán disponibles en el próximo sprint.
            </p>
            <div className="mt-6 flex justify-center gap-2">
              <span className="badge-yellow">En desarrollo</span>
              <span className="badge-blue">Sprint 2</span>
            </div>
          </div>
        )}

        {/* ── Info footer ── */}
        <div className="mt-4 p-4 bg-white rounded-xl border border-slate-100 flex items-start gap-3" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
          <span className="text-xl">ℹ️</span>
          <div>
            <p className="text-sm font-semibold text-slate-700">Sistema en desarrollo activo</p>
            <p className="text-xs text-slate-400 mt-0.5">
              HU-01 y HU-02 implementadas. Próximo sprint: agenda de citas y panel clínico veterinario.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
