import { Link, useNavigate, useLocation, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useEffect, useRef, useState } from "react";
import { 
  House, 
  Calendar, 
  UserPlus, 
  ChartBar, 
  SignOut, 
  MagnifyingGlass,
  ClipboardText,
  Monitor,
  PawPrint
} from "@phosphor-icons/react";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Inicio",    icon: House,         roles: ["admin", "veterinario", "recepcionista"] },
  { to: "/agenda",    label: "Agenda",    icon: Calendar,      roles: ["admin", "veterinario", "recepcionista"] },
  { to: "/monitoreo", label: "Monitoreo", icon: Monitor,       roles: ["admin", "veterinario", "recepcionista"] },
  { to: "/pacientes", label: "Pacientes", icon: ClipboardText, roles: ["admin", "veterinario", "recepcionista"] },
  { to: "/registrar", label: "Registrar", icon: UserPlus,      roles: ["admin", "recepcionista"] },
  { to: "/reportes",  label: "Reportes",  icon: ChartBar,      roles: ["admin", "veterinario"] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    function handleKeyDown(e) {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  function handleLogout() {
    logout();
    navigate("/login");
  }

  const mainLinks = NAV_ITEMS.filter((item) => item.roles.includes(user?.rol));

  return (
    <div className="flex h-screen overflow-hidden antialiased" style={{ backgroundColor: "var(--color-bg)", color: "var(--color-text)" }}>
      
      {/* Sidebar */}
      <aside className="w-[60px] lg:w-[260px] flex flex-col flex-shrink-0 z-20 border-r"
        style={{ backgroundColor: "var(--color-primary)", borderColor: "var(--color-primary-dk)" }}>
        
        {/* Logo */}
        <div className="h-14 flex items-center px-3 lg:px-5 border-b flex-shrink-0"
          style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <Link to="/dashboard" className="flex items-center gap-3 w-full min-w-0">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.15)" }}>
              <PawPrint size={16} weight="fill" color="white" />
            </div>
            <span className="font-bold text-sm hidden lg:inline text-white truncate"
              style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.02em" }}>
              DataVet
            </span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
          <p className="hidden lg:block px-3 pt-4 pb-2 text-[9px] font-semibold uppercase tracking-[0.12em]"
            style={{ color: "rgba(255,255,255,0.4)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Menu
          </p>
          {mainLinks.map((item) => {
            const active = location.pathname === item.to || location.pathname.startsWith(item.to + "/");
            const Icon = item.icon;
            return (
              <Link key={item.label} to={item.to} title={item.label}
                className="flex items-center gap-3 rounded-xl select-none active:scale-[0.97]"
                style={{
                  padding: "9px 12px",
                  backgroundColor: active ? "rgba(255,255,255,0.12)" : "transparent",
                  color: active ? "white" : "rgba(255,255,255,0.65)",
                  fontWeight: active ? "600" : "500",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                }}>
                <Icon size={18} weight={active ? "fill" : "regular"} style={{ flexShrink: 0 }} />
                <span className="hidden lg:inline text-sm truncate"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Bottom: User + Logout */}
        <div className="border-t p-2 flex-shrink-0" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="hidden lg:flex items-center gap-2.5 px-2 py-2 rounded-xl mb-1">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: "rgba(255,255,255,0.15)", color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {user?.nombre?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-white truncate leading-tight"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {user?.nombre}
              </p>
              <span className="text-[9px] font-bold uppercase tracking-widest"
                style={{ color: "rgba(255,255,255,0.45)" }}>
                {user?.rol}
              </span>
            </div>
          </div>
          <button onClick={handleLogout} title="Cerrar sesion"
            className="flex items-center gap-2.5 w-full rounded-xl transition-all active:scale-[0.97]"
            style={{ padding: "9px 12px", color: "rgba(255,255,255,0.55)", fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "13px", fontWeight: "500", transition: "all 0.25s ease" }}>
            <SignOut size={16} style={{ flexShrink: 0 }} />
            <span className="hidden lg:inline">Salir</span>
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-col flex-1 overflow-hidden min-w-0">
        
        {/* Header */}
        <header className="h-14 flex items-center justify-between px-5 flex-shrink-0 z-10 border-b"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)" }}>
          
          <div className="relative flex items-center min-w-[220px] max-w-[360px] flex-1">
            <MagnifyingGlass size={15} className="absolute left-3" style={{ color: "var(--color-muted)" }} />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Buscar paciente, dueno o cita..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-9 pl-9 pr-12 text-sm rounded-xl border"
              style={{ backgroundColor: "var(--color-primary-lt)", borderColor: "transparent", color: "var(--color-text)", outline: "none", fontFamily: "'Inter', sans-serif" }}
              onFocus={e => { e.target.style.backgroundColor = "white"; e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(29,75,88,0.08)"; }}
              onBlur={e => { e.target.style.backgroundColor = "var(--color-primary-lt)"; e.target.style.borderColor = "transparent"; e.target.style.boxShadow = "none"; }}
            />
            <kbd className="absolute right-3 hidden sm:inline-flex items-center px-1.5 py-0.5 text-[9px] font-semibold rounded select-none"
              style={{ color: "var(--color-muted)", backgroundColor: "var(--color-border)", border: "1px solid var(--color-border)" }}>
              ⌘K
            </kbd>
          </div>

          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-xl border ml-4"
            style={{ backgroundColor: "var(--color-primary-lt)", borderColor: "var(--color-border)" }}>
            <div className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold"
              style={{ backgroundColor: "var(--color-primary)", color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {user?.nombre?.charAt(0)?.toUpperCase() || "U"}
            </div>
            <div>
              <p className="text-xs font-semibold leading-tight truncate max-w-[110px]"
                style={{ color: "var(--color-text)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {user?.nombre}
              </p>
              <span className="text-[9px] font-bold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                {user?.rol}
              </span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8" style={{ backgroundColor: "var(--color-bg)" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}

