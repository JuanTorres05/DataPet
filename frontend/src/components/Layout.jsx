import { Link, useNavigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { 
  House, 
  Calendar, 
  UserPlus, 
  ChartBar, 
  SignOut, 
  MagnifyingGlass,
  ClipboardText,
  Monitor
} from '@phosphor-icons/react';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Inicio', icon: House, roles: ['admin', 'veterinario', 'recepcionista'] },
  { to: '/agenda', label: 'Agenda', icon: Calendar, roles: ['admin', 'veterinario', 'recepcionista'] },
  { to: '/monitoreo', label: 'Monitoreo', icon: Monitor, roles: ['admin', 'veterinario', 'recepcionista'] },
  { to: '/pacientes', label: 'Pacientes', icon: ClipboardText, roles: ['admin', 'veterinario', 'recepcionista'] },
  { to: '/registrar', label: 'Registrar', icon: UserPlus, roles: ['admin', 'recepcionista'] },
  { to: '/reportes', label: 'Reportes', icon: ChartBar, roles: ['admin', 'veterinario'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Handle Ctrl+K shortcut to focus search input
  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  function handleLogout() {
    logout();
    navigate('/login');
  }

  // Filter navigation items by user role
  const mainLinks = NAV_ITEMS.filter((item) => item.roles.includes(user?.rol));

  return (
    <div className="flex h-screen overflow-hidden bg-[#F7F8FA] font-sans antialiased text-[#1A2B30]">
      
      {/* ── Sidebar de Navegación ── */}
      <aside className="w-16 lg:w-[240px] bg-[#2A6B7C] text-white flex flex-col justify-between flex-shrink-0 z-20 border-r border-[#1E5060]">
        <div>
          {/* Logo Section */}
          <div className="h-16 flex items-center px-4 lg:px-6 border-b border-[#1E5060]">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/10 border border-white/20">
                <span className="text-sm">🐾</span>
              </div>
              <span className="font-bold text-base tracking-tight hidden lg:inline">DataVet</span>
            </Link>
          </div>

          {/* Menú de Navegación */}
          <nav className="p-3 space-y-1.5">
            {mainLinks.map((item) => {
              const active = location.pathname === item.to;
              const IconComponent = item.icon;
              
              return (
                <Link
                  key={item.label}
                  to={item.to}
                  className={`flex items-center gap-3.5 px-4.5 py-3 rounded-xl text-sm transition-all select-none duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] ${
                    active 
                      ? 'bg-[#1E5060] text-white font-semibold shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]' 
                      : 'text-white/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <IconComponent 
                    size={20} 
                    weight={active ? 'fill' : 'regular'} 
                    className="flex-shrink-0 transition-transform duration-300"
                  />
                  <span className="hidden lg:inline truncate font-medium">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
      </aside>

      {/* ── Contenedor Principal ── */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        
        {/* Header */}
        <header className="h-16 bg-white border-b border-[#E2E8EA] flex items-center justify-between px-6 flex-shrink-0 z-10">
          
          {/* Búsqueda Global */}
          <div className="relative flex items-center min-w-[280px]">
            <MagnifyingGlass className="absolute left-3.5 text-[#5C7078] text-lg select-none" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar paciente, dueño o cita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-11 pl-11 pr-16 bg-[#F7F8FA] border border-[#E2E8EA] rounded-xl text-sm focus:outline-none focus:border-[#2A6B7C] focus:bg-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder-[#5C7078]"
            />
            <kbd className="absolute right-3.5 hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-semibold text-[#5C7078] bg-white border border-[#E2E8EA] rounded-md shadow-sm select-none">
              Ctrl K
            </kbd>
          </div>

          {/* Perfil Usuario + Logout */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 border-r border-[#E2E8EA] pr-4 h-9">
              <div className="w-8 h-8 rounded-xl bg-[#F0F7F9] border border-[#C2DCE2] flex items-center justify-center text-sm font-bold text-[#2A6B7C]">
                {user?.nombre?.charAt(0) || 'U'}
              </div>
              <div className="hidden md:block text-left">
                <p className="text-xs font-semibold text-[#1A2B30] leading-tight truncate max-w-[120px]">
                  {user?.nombre}
                </p>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C7078]">
                  {user?.rol}
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#5C7078] hover:bg-[#F7F8FA] hover:text-[#1A2B30] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] h-11 active:scale-[0.98]"
            >
              <SignOut size={16} className="text-[#5C7078]" />
              <span>Salir</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 bg-[#F7F8FA]">
          <Outlet />
        </main>
      </div>

    </div>
  );
}
