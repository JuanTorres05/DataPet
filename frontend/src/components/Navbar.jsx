import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const GREEN = '#2E8B57';

const ROL_BADGES = {
  admin:         { bg: '#fee2e2', color: '#b91c1c', label: 'admin' },
  veterinario:   { bg: '#dcfce7', color: '#15803d', label: 'veterinario' },
  recepcionista: { bg: '#dbeafe', color: '#1d4ed8', label: 'recepcionista' },
};

const ROL_ICONS = {
  admin:         '🛡️',
  veterinario:   '🩺',
  recepcionista: '📋',
};

const NAV_LINKS = [
  { to: '/dashboard', label: 'Inicio',    icon: '🏠', roles: ['admin', 'veterinario', 'recepcionista'] },
  { to: '/registrar', label: 'Registrar', icon: '➕', roles: ['admin', 'recepcionista'] },
];

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  function handleLogout() { logout(); navigate('/login'); }

  const visibleLinks = NAV_LINKS.filter((l) => l.roles.includes(user?.rol));
  const badge = ROL_BADGES[user?.rol];

  return (
    <nav
      className="sticky top-0 z-50 border-b"
      style={{ backgroundColor: '#fff', borderColor: '#e2e8f0', boxShadow: '0 1px 8px rgba(0,0,0,0.06)' }}
    >
      <div className="max-w-6xl mx-auto px-6 py-3 flex items-center justify-between">

        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105"
            style={{ backgroundColor: GREEN, boxShadow: '0 2px 8px rgba(46,139,87,0.25)' }}
          >
            <span className="text-lg">🐾</span>
          </div>
          <div className="leading-tight">
            <span className="font-bold text-slate-800 text-base tracking-tight">DataVet</span>
            <span className="text-xs text-slate-400 block -mt-0.5">Sistema veterinario</span>
          </div>
        </Link>

        {/* Links */}
        <div className="flex items-center gap-1">
          {visibleLinks.map((link) => {
            const active = location.pathname === link.to;
            return (
              <Link
                key={link.to}
                to={link.to}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
                style={active
                  ? { backgroundColor: '#f0faf4', color: GREEN, fontWeight: 600 }
                  : { color: '#64748b' }
                }
                onMouseEnter={e => { if (!active) { e.currentTarget.style.backgroundColor = '#f8fafc'; e.currentTarget.style.color = '#1e293b'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.backgroundColor = ''; e.currentTarget.style.color = '#64748b'; } }}
              >
                <span className="text-base">{link.icon}</span>
                {link.label}
                {active && (
                  <span className="ml-1 w-1.5 h-1.5 rounded-full inline-block" style={{ backgroundColor: GREEN }} />
                )}
              </Link>
            );
          })}
        </div>

        {/* Usuario + logout */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-100">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-sm"
              style={{ backgroundColor: '#f0faf4' }}
            >
              {ROL_ICONS[user?.rol] ?? '👤'}
            </div>
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-700 leading-tight">{user?.nombre}</p>
              {badge && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: badge.bg, color: badge.color }}
                >
                  {badge.label}
                </span>
              )}
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-slate-500 transition-all duration-150 hover:bg-slate-50 hover:text-slate-800"
          >
            <span>↩</span>
            <span className="hidden sm:inline">Salir</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
