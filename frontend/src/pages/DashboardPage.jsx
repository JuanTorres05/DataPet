import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import { 
  Users, Cat, CalendarBlank, Stethoscope,
  ArrowRight, Plus, ClipboardText, ChartBar, TrendUp, Pulse
} from "@phosphor-icons/react";

const ROL_CONFIG = {
  admin:         { icon: "🛡️", greeting: "Panel de administracion" },
  veterinario:   { icon: "🩺", greeting: "Panel clinico" },
  recepcionista: { icon: "📋", greeting: "Panel de recepcion" },
};

const ROL_ACCESOS = {
  admin: [
    { to: "/registrar", icon: Plus,          label: "Registrar Paciente", desc: "Alta de nuevo propietario y su mascota en el sistema.",            btnLabel: "Nuevo Registro",  accent: "#1D4B58" },
    { to: "/agenda",    icon: CalendarBlank, label: "Agenda de Citas",    desc: "Gestionar consultas medicas, estados y programacion diaria.",      btnLabel: "Ver Agenda",     accent: "#2A8E79" },
    { to: "/pacientes", icon: ClipboardText, label: "Buscar Paciente",    desc: "Consultar expedientes, datos de contacto e historias clinicas.",    btnLabel: "Ver Pacientes",  accent: "#1D4B58" },
    { to: "/reportes",  icon: ChartBar,      label: "Reportes",           desc: "Metricas del sistema, citas atendidas y estadisticas de especies.", btnLabel: "Ver Reportes",   accent: "#2A8E79" },
  ],
  recepcionista: [
    { to: "/registrar", icon: Plus,          label: "Registrar Paciente", desc: "Alta de nuevo propietario y su mascota en el sistema.",         btnLabel: "Nuevo Registro", accent: "#1D4B58" },
    { to: "/agenda",    icon: CalendarBlank, label: "Agenda de Citas",    desc: "Gestionar consultas medicas, estados y programacion diaria.",   btnLabel: "Ver Agenda",     accent: "#2A8E79" },
    { to: "/pacientes", icon: ClipboardText, label: "Buscar Paciente",    desc: "Consultar expedientes, datos de contacto e historias clinicas.", btnLabel: "Ver Pacientes",  accent: "#1D4B58" },
  ],
  veterinario: [
    { to: "/agenda",    icon: CalendarBlank, label: "Agenda de Citas",    desc: "Visualizar pacientes agendados y registrar atencion medica.",    btnLabel: "Ver Agenda",    accent: "#2A8E79" },
    { to: "/pacientes", icon: ClipboardText, label: "Buscar Paciente",    desc: "Consultar expedientes, datos de contacto e historias clinicas.", btnLabel: "Ver Pacientes", accent: "#1D4B58" },
    { to: "/reportes",  icon: ChartBar,      label: "Reportes",           desc: "Metricas clinicas, citas atendidas y actividad semanal.",         btnLabel: "Ver Reportes",  accent: "#2A8E79" },
  ],
};

function getHora() {
  const h = new Date().getHours();
  if (h < 12) return "Buenos dias";
  if (h < 18) return "Buenas tardes";
  return "Buenas noches";
}

export default function DashboardPage() {
  const { user } = useAuth();
  const cfg     = ROL_CONFIG[user?.rol]  ?? ROL_CONFIG.admin;
  const accesos = ROL_ACCESOS[user?.rol] ?? [];

  const [stats,   setStats]   = useState({ clientes: "-", mascotas: "-", citasHoy: "-", veterinarios: "-" });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.get("/citas/dashboard-stats");
        setStats(res.data);
      } catch (err) {
        console.error("Error al cargar metricas del dashboard", err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statsItems = [
    { label: "Clientes activos",  value: stats.clientes,     icon: Users,        accent: "var(--color-primary)",    bg: "var(--color-primary-lt)",  bd: "var(--color-primary-bd)" },
    { label: "Mascotas",          value: stats.mascotas,     icon: Cat,          accent: "var(--color-success)",    bg: "var(--color-success-bg)",  bd: "#B2E0D9" },
    { label: "Citas hoy",         value: stats.citasHoy,     icon: CalendarBlank,accent: "var(--color-warning)",    bg: "var(--color-warning-bg)",  bd: "#FCD34D" },
    { label: "Veterinarios",      value: stats.veterinarios, icon: Stethoscope,  accent: "var(--color-primary-dk)", bg: "var(--color-primary-lt)",  bd: "var(--color-primary-bd)" },
  ];

  return (
    <div className="space-y-6 h-full animate-fade-in">

      {/* ── Top Bar: Welcome + Date ── */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ backgroundColor: "var(--color-primary-lt)", border: "1.5px solid var(--color-primary-bd)" }}>
            {cfg.icon}
          </div>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--color-muted)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              {getHora()}
            </p>
            <h1 style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "20px", fontWeight: "700", color: "var(--color-text)", letterSpacing: "-0.02em" }}>
              {user?.nombre}
            </h1>
            <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
              {cfg.greeting}
            </span>
          </div>
        </div>

        <div className="rounded-xl border px-4 py-2.5 text-right flex-shrink-0"
          style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-ambient)" }}>
          <p className="font-bold text-xs tracking-wide"
            style={{ color: "var(--color-text)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {new Date().toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <p className="text-xs font-medium mt-0.5" style={{ color: "var(--color-muted)" }}>
            {new Date().toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true })}
          </p>
        </div>
      </div>

      {/* ── KPI Grid: siempre 4 columnas en pantalla normal ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsItems.map((s, idx) => {
          const Icon = s.icon;
          return (
            <div key={idx} className="card">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center border"
                  style={{ backgroundColor: s.bg, borderColor: s.bd, color: s.accent }}>
                  <Icon size={20} weight="duotone" />
                </div>
                <TrendUp size={13} style={{ color: "var(--color-success)", marginTop: "2px" }} />
              </div>
              <p className="font-bold leading-none mb-1.5"
                style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "32px", color: "var(--color-text)", letterSpacing: "-0.04em" }}>
                {loading ? <span className="skeleton inline-block w-10 h-7 rounded" /> : s.value}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                {s.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* ── Acciones Rapidas: grid que se expande ── */}
      <div className="flex-1">
        <p className="section-title mb-4">Acciones rapidas</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {accesos.map((acc, idx) => {
            const ActionIcon = acc.icon;
            return (
              <div key={idx} className="card flex flex-col justify-between" style={{ minHeight: "160px" }}>
                <div>
                  <div className="flex items-center gap-2.5 mb-3">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
                      style={{ backgroundColor: acc.accent + "15", color: acc.accent, border: "1px solid " + acc.accent + "25" }}>
                      <ActionIcon size={16} weight="bold" />
                    </div>
                    <h3 className="font-bold text-sm leading-tight"
                      style={{ color: "var(--color-text)", fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.01em" }}>
                      {acc.label}
                    </h3>
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                    {acc.desc}
                  </p>
                </div>
                <div className="pt-4">
                  <Link to={acc.to}
                    className="flex items-center justify-between w-full h-9 px-4 rounded-xl font-semibold text-xs transition-all active:scale-[0.98]"
                    style={{ backgroundColor: acc.accent, color: "white", fontFamily: "'Plus Jakarta Sans', sans-serif", transition: "all 0.25s cubic-bezier(0.16,1,0.3,1)" }}>
                    <span>{acc.btnLabel}</span>
                    <ArrowRight size={13} weight="bold" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Status Footer ── */}
      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border"
        style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-ambient)" }}>
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--color-success)" }} />
        <p className="text-xs" style={{ color: "var(--color-muted)" }}>
          <strong style={{ color: "var(--color-text)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sistema operativo</strong>
          {" "}— Modulos de autenticacion, alta de mascotas y agenda de citas activos en base de datos.
        </p>
      </div>

    </div>
  );
}

