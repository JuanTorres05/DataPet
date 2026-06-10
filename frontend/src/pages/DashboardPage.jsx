import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Users, 
  Cat, 
  CalendarBlank, 
  Stethoscope, 
  ArrowRight,
  Plus,
  Info,
  ClipboardText,
  ChartBar
} from '@phosphor-icons/react';

const ROL_CONFIG = {
  admin: {
    icon: '🛡️', greeting: 'Panel de administración',
  },
  veterinario: {
    icon: '🩺', greeting: 'Panel clínico',
  },
  recepcionista: {
    icon: '📋', greeting: 'Panel de recepción',
  },
};

const ROL_ACCESOS = {
  admin: [
    { to: '/registrar', icon: Plus, label: 'Registrar Paciente', desc: 'Alta de nuevo propietario y su mascota en el sistema.', btnLabel: 'Nuevo Registro' },
    { to: '/agenda', icon: CalendarBlank, label: 'Agenda de Citas', desc: 'Gestionar consultas médicas, estados y programación diaria.', btnLabel: 'Ver Agenda' },
    { to: '/pacientes', icon: ClipboardText, label: 'Buscar Paciente', desc: 'Consultar expedientes, datos de contacto e historias clínicas.', btnLabel: 'Ver Pacientes' },
    { to: '/reportes', icon: ChartBar, label: 'Reportes', desc: 'Métricas del sistema, citas atendidas y estadísticas de especies.', btnLabel: 'Ver Reportes' }
  ],
  recepcionista: [
    { to: '/registrar', icon: Plus, label: 'Registrar Paciente', desc: 'Alta de nuevo propietario y su mascota en el sistema.', btnLabel: 'Nuevo Registro' },
    { to: '/agenda', icon: CalendarBlank, label: 'Agenda de Citas', desc: 'Gestionar consultas médicas, estados y programación diaria.', btnLabel: 'Ver Agenda' },
    { to: '/pacientes', icon: ClipboardText, label: 'Buscar Paciente', desc: 'Consultar expedientes, datos de contacto e historias clínicas.', btnLabel: 'Ver Pacientes' }
  ],
  veterinario: [
    { to: '/agenda', icon: CalendarBlank, label: 'Agenda de Citas', desc: 'Visualizar pacientes agendados y registrar atención médica.', btnLabel: 'Ver Agenda' },
    { to: '/pacientes', icon: ClipboardText, label: 'Buscar Paciente', desc: 'Consultar expedientes, datos de contacto e historias clínicas.', btnLabel: 'Ver Pacientes' },
    { to: '/reportes', icon: ChartBar, label: 'Reportes', desc: 'Métricas clínicas, citas atendidas y actividad semanal.', btnLabel: 'Ver Reportes' }
  ],
};

function getHora() {
  const h = new Date().getHours();
  if (h < 12) return 'Buenos días';
  if (h < 18) return 'Buenas tardes';
  return 'Buenas noches';
}

export default function DashboardPage() {
  const { user } = useAuth();
  const cfg = ROL_CONFIG[user?.rol] ?? ROL_CONFIG.admin;
  const accesos = ROL_ACCESOS[user?.rol] ?? [];

  const [stats, setStats] = useState({
    clientes: '—',
    mascotas: '—',
    citasHoy: '—',
    veterinarios: '—'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.get('/citas/dashboard-stats');
        setStats(res.data);
      } catch (err) {
        console.error('Error al cargar métricas del dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  const statsItems = [
    { label: 'Clientes activos', value: stats.clientes, icon: Users, color: '#2A6B7C', bg: '#F0F7F9' },
    { label: 'Mascotas',         value: stats.mascotas, icon: Cat, color: '#2A6B7C', bg: '#F0F7F9' },
    { label: 'Citas hoy',        value: stats.citasHoy, icon: CalendarBlank, color: '#A86A00', bg: '#FFF4E0' },
    { label: 'Veterinarios',     value: stats.veterinarios, icon: Stethoscope, color: '#2E7D52', bg: '#EBF5EF' },
  ];

  return (
    <div className="space-y-8 max-w-5xl mx-auto animate-fade-in">
      
      {/* ── Header Welcome Section (Double-Bezel Card) ── */}
      <div className="bezel-card-outer">
        <div className="bezel-card-inner flex items-center justify-between flex-wrap gap-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl bg-[#F0F7F9] text-[#2A6B7C] border border-[#C2DCE2]">
              {cfg.icon}
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C7078]">{getHora()}</p>
              <h1 className="text-xl font-bold text-[#1A2B30] mt-0.5 tracking-tight">{user?.nombre}</h1>
              <span className="text-[10px] text-[#5C7078] font-semibold uppercase tracking-wider">{cfg.greeting}</span>
            </div>
          </div>

          <div className="border border-[#E2E8EA] bg-[#F7F8FA] rounded-xl px-4 py-2.5 text-right min-w-[155px] shadow-[inset_0_1px_1px_rgba(0,0,0,0.02)]">
            <p className="font-bold text-xs text-[#1A2B30] uppercase tracking-wider">
              {new Date().toLocaleDateString('es-CO', { weekday: 'short', day: 'numeric', month: 'short' })}
            </p>
            <p className="text-[11px] font-medium text-[#5C7078] mt-0.5">
              {new Date().toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true })}
            </p>
          </div>
        </div>
      </div>

      {/* ── Stats Section (Grid Layout, Double-Bezel ambient shadow cards) ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        {statsItems.map((s, idx) => {
          const IconComponent = s.icon;
          return (
            <div key={idx} className="bezel-card-outer">
              <div className="bezel-card-inner flex items-center gap-4 h-full">
                <div 
                  className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border"
                  style={{ 
                    backgroundColor: s.bg, 
                    color: s.color,
                    borderColor: s.color === '#2A6B7C' ? '#C2DCE2' : s.color === '#A86A00' ? '#FFE3B3' : '#C7E2D2'
                  }}
                >
                  <IconComponent size={24} weight="duotone" />
                </div>
                <div>
                  <p className="text-3xl font-bold text-[#1A2B30] tracking-tight leading-none">
                    {loading ? '...' : s.value}
                  </p>
                  <p className="text-[10px] text-[#5C7078] font-bold uppercase tracking-wider mt-1.5 leading-tight">
                    {s.label}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Quick Actions Section ── */}
      <div>
        <h2 className="section-title">Acciones rápidas</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {accesos.map((acc, idx) => {
            const ActionIcon = acc.icon;
            return (
              <div key={idx} className="bezel-card-outer">
                <div className="bezel-card-inner flex flex-col justify-between h-[180px]">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F0F7F9] text-[#2A6B7C] border border-[#C2DCE2]">
                        <ActionIcon size={18} weight="bold" />
                      </div>
                      <h3 className="font-bold text-[#1A2B30] text-sm tracking-tight">{acc.label}</h3>
                    </div>
                    <p className="text-[#5C7078] text-xs leading-relaxed mt-2">{acc.desc}</p>
                  </div>
                  <div className="pt-2">
                    <Link 
                      to={acc.to} 
                      className="btn-premium-primary w-full text-xs font-semibold uppercase tracking-wider"
                    >
                      <span>{acc.btnLabel}</span>
                      <div className="btn-icon-wrapper">
                        <ArrowRight size={12} weight="bold" />
                      </div>
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Info Footer (Double Bezel) ── */}
      <div className="bezel-card-outer">
        <div className="bezel-card-inner flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-[#F0F7F9] text-[#2A6B7C] border border-[#C2DCE2] flex-shrink-0">
            <Info size={16} weight="bold" />
          </div>
          <div>
            <p className="text-xs font-bold text-[#1A2B30] uppercase tracking-wider">Sistema en desarrollo activo</p>
            <p className="text-xs text-[#5C7078] mt-1.5 leading-relaxed">
              Módulos de autenticación, alta de mascotas y agenda de citas completamente operativos en base de datos.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
