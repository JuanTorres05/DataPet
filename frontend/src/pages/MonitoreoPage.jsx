import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import {
  Monitor,
  Clock,
  CheckCircle,
  XCircle,
  ArrowClockwise,
  Dog,
  Cat,
  Bird,
  PawPrint,
  Stethoscope,
  User,
  Warning,
  Circle,
} from '@phosphor-icons/react';

/* â”€â”€â”€ Helpers â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function renderSpeciesIcon(especie) {
  const e = (especie || '').toLowerCase();
  if (e.includes('perro') || e.includes('canino')) return <Dog size={22} weight="duotone" />;
  if (e.includes('gato') || e.includes('felino')) return <Cat size={22} weight="duotone" />;
  if (e.includes('ave') || e.includes('loro') || e.includes('pÃ¡jaro')) return <Bird size={22} weight="duotone" />;
  return <PawPrint size={22} weight="duotone" />;
}

function formatHora(fechaHora) {
  return new Date(fechaHora).toLocaleTimeString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

function formatFecha(fechaHora) {
  return new Date(fechaHora).toLocaleDateString('es-CO', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

/* â”€â”€â”€ LiveIndicator â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function LiveIndicator({ segundos }) {
  return (
    <div className="flex items-center gap-2">
      <span className="relative flex h-2.5 w-2.5">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-green-500" />
      </span>
      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">
        En vivo Â· actualiza en {segundos}s
      </span>
    </div>
  );
}

/* â”€â”€â”€ CitaCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function CitaCard({ cita, onCambiarEstado, loadingId, userRol }) {
  const isPendiente = cita.estado === 'pendiente';
  const isAtendida = cita.estado === 'atendida';
  const isCancelada = cita.estado === 'cancelada';
  const isLoading = loadingId === cita.id;

  const puedeAtender = ['admin', 'veterinario', 'recepcionista'].includes(userRol);
  const puedeCancelar = ['admin', 'recepcionista'].includes(userRol);

  return (
    <div
      className={`bezel-card-outer transition-all duration-500 ${
        isCancelada ? 'opacity-50' : ''
      }`}
    >
      <div className="">
        <div className="flex items-start gap-3">
          {/* Icono especie */}
          <div
            className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${
              isPendiente
                ? 'bg-[#FFF4E0] text-[#A86A00] border-[#FFE3B3]'
                : isAtendida
                ? 'bg-[#EBF5EF] text-[#2E7D52] border-[#C7E2D2]'
                : 'bg-[#FDECEA] text-[#C0392B] border-[#F5C6C2]'
            }`}
          >
            {renderSpeciesIcon(cita.especie)}
          </div>

          {/* Info central */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <div>
                <p className="font-bold text-[#1A2B30] text-sm leading-tight">
                  {cita.mascota_nombre}
                  <span className="text-[#5C7078] font-normal text-xs ml-1.5">
                    ({cita.especie})
                  </span>
                </p>
                <p className="text-xs text-[#5C7078] mt-0.5 flex items-center gap-1">
                  <User size={11} />
                  {cita.cliente_nombre}
                  {cita.telefono && (
                    <span className="text-[#5C7078] ml-1">Â· {cita.telefono}</span>
                  )}
                </p>
              </div>

              {/* Hora */}
              <div className="flex items-center gap-1.5 bg-[#F0F7F9] border border-[#C2DCE2] rounded-lg px-2.5 py-1 flex-shrink-0">
                <Clock size={12} className="text-[#2A6B7C]" />
                <span className="text-xs font-bold text-[#2A6B7C]">
                  {formatHora(cita.fecha_hora)}
                </span>
              </div>
            </div>

            {/* Motivo */}
            <p className="text-xs text-[#5C7078] mt-2 leading-relaxed line-clamp-2">
              <span className="font-semibold text-[#1A2B30]">Motivo:</span> {cita.motivo}
            </p>

            {/* Veterinario */}
            <div className="flex items-center gap-1.5 mt-2">
              <Stethoscope size={11} className="text-[#5C7078]" />
              <span className="text-[10px] text-[#5C7078]">
                {cita.veterinario_nombre}
              </span>
            </div>
          </div>
        </div>

        {/* Acciones */}
        {isPendiente && (
          <div className="flex gap-2 mt-4 pt-3 border-t border-[#F0F2F4]">
            {puedeAtender && (
              <button
                onClick={() => onCambiarEstado(cita.id, 'atendida')}
                disabled={isLoading}
                className="flex-1 flex items-center justify-center gap-2 h-9 rounded-xl text-xs font-semibold bg-[#EBF5EF] text-[#2E7D52] border border-[#C7E2D2] hover:bg-[#D6EDE0] transition-all duration-300 active:scale-[0.97] disabled:opacity-50"
              >
                <CheckCircle size={14} weight="fill" />
                {isLoading ? 'Guardando...' : 'Marcar atendida'}
              </button>
            )}
            {puedeCancelar && (
              <button
                onClick={() => onCambiarEstado(cita.id, 'cancelada')}
                disabled={isLoading}
                className="flex items-center justify-center gap-1.5 h-9 px-3 rounded-xl text-xs font-semibold bg-[#FDECEA] text-[#C0392B] border border-[#F5C6C2] hover:bg-[#FAD4D0] transition-all duration-300 active:scale-[0.97] disabled:opacity-50"
              >
                <XCircle size={14} weight="fill" />
                Cancelar
              </button>
            )}
          </div>
        )}

        {/* Badge estado si no es pendiente */}
        {!isPendiente && (
          <div className="mt-3 pt-3 border-t border-[#F0F2F4] flex items-center gap-2">
            {isAtendida ? (
              <span className="badge-green flex items-center gap-1.5">
                <CheckCircle size={11} weight="fill" /> Atendida
              </span>
            ) : (
              <span className="badge-red flex items-center gap-1.5">
                <XCircle size={11} weight="fill" /> Cancelada
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

/* â”€â”€â”€ Componente principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
const REFRESH_INTERVAL = 30;

export default function MonitoreoPage() {
  const { user } = useAuth();
  const [citas, setCitas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [loadingId, setLoadingId] = useState(null);
  const [segundos, setSegundos] = useState(REFRESH_INTERVAL);
  const [ultimaActualizacion, setUltimaActualizacion] = useState(null);
  const timerRef = useRef(null);
  const countdownRef = useRef(null);

  const hoy = new Date().toISOString().split('T')[0];

  const loadCitas = useCallback(async (silencioso = false) => {
    try {
      if (!silencioso) setLoading(true);
      setError('');
      // Cargamos TODAS las citas de hoy (pendientes + atendidas + canceladas)
      const res = await api.get(`/citas?fecha=${hoy}`);
      setCitas(res.data);
      setUltimaActualizacion(new Date());
      setSegundos(REFRESH_INTERVAL);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar las citas. Verifica que el servidor estÃ© activo.');
    } finally {
      setLoading(false);
    }
  }, [hoy]);

  // Auto-refresh cada 30s
  useEffect(() => {
    loadCitas();

    timerRef.current = setInterval(() => loadCitas(true), REFRESH_INTERVAL * 1000);

    countdownRef.current = setInterval(() => {
      setSegundos((s) => {
        if (s <= 1) return REFRESH_INTERVAL;
        return s - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timerRef.current);
      clearInterval(countdownRef.current);
    };
  }, [loadCitas]);

  async function handleCambiarEstado(citaId, nuevoEstado) {
    try {
      setLoadingId(citaId);
      await api.patch(`/citas/${citaId}/estado`, { estado: nuevoEstado });
      // Actualizar en el estado local sin refetch
      setCitas((prev) =>
        prev.map((c) => (c.id === citaId ? { ...c, estado: nuevoEstado } : c))
      );
    } catch (err) {
      console.error(err);
      alert('No se pudo actualizar el estado de la cita.');
    } finally {
      setLoadingId(null);
    }
  }

  const citasPendientes = citas.filter((c) => c.estado === 'pendiente');
  const citasAtendidas = citas.filter((c) => c.estado === 'atendida');
  const citasCanceladas = citas.filter((c) => c.estado === 'cancelada');

  return (
    <div className="space-y-8  animate-fade-in">

      {/* â”€â”€ Header â”€â”€ */}
      <div className="card">
        <div className=" flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#F0F7F9] text-[#2A6B7C] border border-[#C2DCE2]">
              <Monitor size={24} weight="duotone" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C7078]">
                {formatFecha(new Date())}
              </p>
              <h1 className="text-xl font-bold text-[#1A2B30] tracking-tight">
                Monitoreo de Pacientes
              </h1>
              {ultimaActualizacion && (
                <p className="text-xs text-[#5C7078] mt-0.5">
                  Actualizado:{' '}
                  {ultimaActualizacion.toLocaleTimeString('es-CO', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <LiveIndicator segundos={segundos} />
            <button
              onClick={() => loadCitas()}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#2A6B7C] border border-[#C2DCE2] bg-[#F0F7F9] hover:bg-[#E0EEF2] transition-all duration-300 active:scale-[0.97] disabled:opacity-50"
            >
              <ArrowClockwise size={14} className={loading ? 'animate-spin' : ''} />
              Actualizar
            </button>
          </div>
        </div>
      </div>

      {/* â”€â”€ KPIs del dÃ­a â”€â”€ */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'En espera', value: citasPendientes.length, color: '#A86A00', bg: '#FFF4E0', border: '#FFE3B3', icon: Clock },
          { label: 'Atendidas', value: citasAtendidas.length, color: '#2E7D52', bg: '#EBF5EF', border: '#C7E2D2', icon: CheckCircle },
          { label: 'Canceladas', value: citasCanceladas.length, color: '#C0392B', bg: '#FDECEA', border: '#F5C6C2', icon: XCircle },
        ].map(({ label, value, color, bg, border, icon }) => {
          const IconComponent = icon;
          return (
            <div key={label} className="card">
              <div className=" flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 border"
                  style={{ backgroundColor: bg, color, borderColor: border }}
                >
                  <IconComponent size={20} weight="duotone" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#1A2B30] leading-none">{loading ? 'Â·' : value}</p>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C7078] mt-1">{label}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* â”€â”€ Error â”€â”€ */}
      {error && (
        <div className="alert-error">
          <Warning size={18} weight="fill" className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* â”€â”€ Citas pendientes â”€â”€ */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="section-title mb-0">Pacientes en espera</h2>
          {citasPendientes.length > 0 && (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FFF4E0] text-[#A86A00] border border-[#FFE3B3]">
              {citasPendientes.length}
            </span>
          )}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[1, 2, 3].map((k) => (
              <div key={k} className="card">
                <div className=" h-36 animate-pulse bg-[#F0F2F4] rounded-[calc(1.75rem-0.375rem)]" />
              </div>
            ))}
          </div>
        ) : citasPendientes.length === 0 ? (
          <div className="card">
            <div className=" flex flex-col items-center justify-center py-12 text-center gap-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F0F7F9] border border-[#C2DCE2] flex items-center justify-center text-[#2A6B7C]">
                <CheckCircle size={28} weight="duotone" />
              </div>
              <div>
                <p className="font-bold text-[#1A2B30] text-sm">Sin pacientes en espera</p>
                <p className="text-xs text-[#5C7078] mt-1">Todos los pacientes del dÃ­a han sido atendidos.</p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {citasPendientes.map((cita) => (
              <CitaCard
                key={cita.id}
                cita={cita}
                onCambiarEstado={handleCambiarEstado}
                loadingId={loadingId}
                userRol={user?.rol}
              />
            ))}
          </div>
        )}
      </div>

      {/* â”€â”€ Atendidas hoy â”€â”€ */}
      {!loading && citasAtendidas.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="section-title mb-0">Atendidos hoy</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#EBF5EF] text-[#2E7D52] border border-[#C7E2D2]">
              {citasAtendidas.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {citasAtendidas.map((cita) => (
              <CitaCard
                key={cita.id}
                cita={cita}
                onCambiarEstado={handleCambiarEstado}
                loadingId={loadingId}
                userRol={user?.rol}
              />
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€ Canceladas hoy (colapsado) â”€â”€ */}
      {!loading && citasCanceladas.length > 0 && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <h2 className="section-title mb-0">Canceladas hoy</h2>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#FDECEA] text-[#C0392B] border border-[#F5C6C2]">
              {citasCanceladas.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {citasCanceladas.map((cita) => (
              <CitaCard
                key={cita.id}
                cita={cita}
                onCambiarEstado={handleCambiarEstado}
                loadingId={loadingId}
                userRol={user?.rol}
              />
            ))}
          </div>
        </div>
      )}

      {/* â”€â”€ Sin citas hoy â”€â”€ */}
      {!loading && citas.length === 0 && !error && (
        <div className="card">
          <div className=" flex flex-col items-center justify-center py-16 text-center gap-3">
            <div className="w-16 h-16 rounded-2xl bg-[#F0F7F9] border border-[#C2DCE2] flex items-center justify-center text-[#2A6B7C]">
              <Circle size={32} weight="thin" />
            </div>
            <div>
              <p className="font-bold text-[#1A2B30]">Sin citas programadas hoy</p>
              <p className="text-xs text-[#5C7078] mt-1.5">
                No hay citas agendadas para el dÃ­a de hoy.{' '}
                <a href="/agenda" className="text-[#2A6B7C] font-semibold hover:underline">
                  Ir a la Agenda
                </a>{' '}
                para programar una.
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

