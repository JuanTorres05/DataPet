import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';
import { 
  CalendarBlank, 
  Plus, 
  Trash, 
  X, 
  ArrowCounterClockwise,
  Check,
  MagnifyingGlass,
  Stethoscope,
  Phone,
  User,
  Chat,
  WarningCircle
} from '@phosphor-icons/react';

/* ── Helpers ─────────────────────────────────────────── */
function getEspecieEmoji(especie) {
  const esp = especie?.toLowerCase();
  if (esp?.includes('perro') || esp?.includes('can')) return '🐕';
  if (esp?.includes('gato') || esp?.includes('fel')) return '🐈';
  if (esp?.includes('ave') || esp?.includes('pajaro')) return '🦜';
  if (esp?.includes('conejo')) return '🐇';
  if (esp?.includes('reptil') || esp?.includes('tortuga') || esp?.includes('iguana')) return '🦎';
  return '🐾';
}

function formatTime(dateTimeStr) {
  const date = new Date(dateTimeStr);
  return date.toLocaleTimeString('es-CO', { hour: '2-digit', minute: '2-digit', hour12: true });
}

function formatDateDisplay(dateTimeStr) {
  const date = new Date(dateTimeStr);
  return date.toLocaleDateString('es-CO', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function AgendaPage() {
  const { user } = useAuth();
  const isAdminOrRecepcionista = user?.rol === 'admin' || user?.rol === 'recepcionista';

  // State
  const [citas, setCitas] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [fechaFiltro, setFechaFiltro] = useState(() => {
    const today = new Date();
    const tzOffset = today.getTimezoneOffset() * 60000;
    return (new Date(today.getTime() - tzOffset)).toISOString().slice(0, 10);
  });
  const [estadoFiltro, setEstadoFiltro] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [clienteQuery, setClienteQuery] = useState('');
  const [selectedCliente, setSelectedCliente] = useState(null);
  const [selectedMascotaId, setSelectedMascotaId] = useState('');
  const [selectedUsuarioId, setSelectedUsuarioId] = useState('');
  const [fechaHoraInput, setFechaHoraInput] = useState('');
  const [motivoInput, setMotivoInput] = useState('');
  const [formError, setFormError] = useState('');
  const [guardando, setGuardando] = useState(false);

  // Fetch appointments
  const loadCitas = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const params = {};
      if (fechaFiltro) params.fecha = fechaFiltro;
      if (estadoFiltro) params.estado = estadoFiltro;

      const res = await api.get('/citas', { params });
      setCitas(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al cargar las citas.');
    } finally {
      setLoading(false);
    }
  }, [fechaFiltro, estadoFiltro]);

  // Fetch clients & vets for modal
  const loadModalData = async () => {
    try {
      const resClientes = await api.get('/clientes');
      setClientes(resClientes.data);

      // Extraer veterinarios del endpoint de usuarios via login info
      // Usamos el endpoint de citas/dashboard-stats para verificar
      // y cargamos los vets directamente desde /auth/usuarios (si existe)
      // o bien hacemos un login simulado. En su lugar, buscamos en BD:
      const resVets = await api.get('/auth/veterinarios').catch(() => ({ data: [] }));
      if (resVets.data.length > 0) {
        setVeterinarios(resVets.data);
      } else {
        // Fallback: pedir al usuario que ingrese el ID del vet manualmente
        // mostrando los usuarios disponibles desde el contexto de auth
        setVeterinarios([]);
      }
    } catch (err) {
      console.error('Error al cargar datos auxiliares del modal', err);
    }
  };

  useEffect(() => {
    loadCitas();
  }, [loadCitas]);

  useEffect(() => {
    if (modalOpen) {
      loadModalData();
    }
  }, [modalOpen]);

  // Handle status update
  const handleUpdateStatus = async (citaId, nuevoEstado) => {
    try {
      await api.patch(`/citas/${citaId}/estado`, { estado: nuevoEstado });
      loadCitas();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al actualizar el estado de la cita.');
    }
  };

  // Handle delete
  const handleDeleteCita = async (citaId) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta cita de la agenda?')) return;
    try {
      await api.delete(`/citas/${citaId}`);
      loadCitas();
    } catch (err) {
      alert(err.response?.data?.message || 'Error al eliminar la cita.');
    }
  };

  // Handle submit appointment
  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedMascotaId) return setFormError('Por favor selecciona una mascota.');
    if (!selectedUsuarioId) return setFormError('Por favor selecciona un veterinario.');
    if (!fechaHoraInput) return setFormError('Por favor especifica fecha y hora.');
    if (!motivoInput.trim()) return setFormError('Por favor describe el motivo de la cita.');

    try {
      setGuardando(true);
      setFormError('');

      await api.post('/citas', {
        mascota_id: Number(selectedMascotaId),
        usuario_id: Number(selectedUsuarioId),
        fecha_hora: fechaHoraInput,
        motivo: motivoInput.trim(),
      });

      // Reset form & reload
      setModalOpen(false);
      setSelectedCliente(null);
      setClienteQuery('');
      setSelectedMascotaId('');
      setSelectedUsuarioId('');
      setFechaHoraInput('');
      setMotivoInput('');
      loadCitas();
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al crear la cita.');
    } finally {
      setGuardando(false);
    }
  };

  // Filter clients autocomplete
  const filteredClientes = clienteQuery.trim() === ''
    ? []
    : clientes.filter(c => 
        c.nombre.toLowerCase().includes(clienteQuery.toLowerCase()) ||
        c.telefono.includes(clienteQuery) ||
        c.correo.toLowerCase().includes(clienteQuery.toLowerCase())
      );

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* ── Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <span>🗓️</span> Agenda Diaria
          </h1>
          <p className="page-subtitle">
            {fechaFiltro ? formatDateDisplay(fechaFiltro) : 'Mostrando todas las citas'}
          </p>
        </div>

        {isAdminOrRecepcionista && (
          <button 
            onClick={() => setModalOpen(true)}
            className="btn-premium-primary uppercase tracking-wider text-xs"
          >
            <span>Agendar Cita</span>
            <div className="btn-icon-wrapper">
              <Plus size={12} weight="bold" />
            </div>
          </button>
        )}
      </div>

      {/* ── Filters (Double-Bezel Card) ── */}
      <div className="bezel-card-outer">
        <div className="bezel-card-inner grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div>
            <label className="label">Filtrar por fecha</label>
            <input 
              type="date" 
              value={fechaFiltro} 
              onChange={(e) => setFechaFiltro(e.target.value)}
              className="input-field" 
            />
          </div>

          <div>
            <label className="label">Estado de la cita</label>
            <div className="flex rounded-xl overflow-hidden border border-[#E2E8EA] h-11 bg-white p-0.5">
              {[
                { val: '', label: 'Todas' },
                { val: 'pendiente', label: 'Pendientes' },
                { val: 'atendida', label: 'Atendidas' },
                { val: 'cancelada', label: 'Canceladas' }
              ].map(btn => (
                <button
                  key={btn.val}
                  type="button"
                  onClick={() => setEstadoFiltro(btn.val)}
                  className={`flex-1 text-[11px] font-bold uppercase transition-all duration-300 rounded-lg select-none ${
                    estadoFiltro === btn.val 
                      ? 'bg-[#2A6B7C] text-white shadow-sm' 
                      : 'text-[#5C7078] hover:bg-[#F0F7F9] hover:text-[#2A6B7C]'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex justify-start md:justify-end">
            <button
              onClick={() => {
                const today = new Date();
                const tzOffset = today.getTimezoneOffset() * 60000;
                setFechaFiltro((new Date(today.getTime() - tzOffset)).toISOString().slice(0, 10));
                setEstadoFiltro('');
              }}
              className="btn-premium-secondary w-full md:w-auto text-xs uppercase tracking-wider"
            >
              <span>Limpiar Filtros</span>
              <div className="btn-icon-wrapper">
                <ArrowCounterClockwise size={12} weight="bold" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* ── Citas List/Table (Double-Bezel Card) ── */}
      {error && (
        <div className="alert-error">
          <WarningCircle size={20} className="flex-shrink-0" />
          <div>
            <p className="font-semibold">Error al cargar citas</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bezel-card-outer">
          <div className="bezel-card-inner flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#2A6B7C] border-t-transparent animate-spin"></div>
            <p className="text-xs text-[#5C7078] font-bold uppercase tracking-wider">Cargando agenda diaria...</p>
          </div>
        </div>
      ) : citas.length === 0 ? (
        <div className="bezel-card-outer max-w-lg mx-auto">
          <div className="bezel-card-inner text-center p-12">
            <div className="w-16 h-16 rounded-2xl bg-[#F0F7F9] border border-[#C2DCE2] flex items-center justify-center text-3xl mx-auto mb-4">
              📅
            </div>
            <h3 className="font-bold text-[#1A2B30] text-sm uppercase tracking-wide">No hay citas registradas</h3>
            <p className="text-[#5C7078] text-xs mt-2 leading-relaxed">
              No se encontraron citas programadas en los filtros seleccionados. {isAdminOrRecepcionista && 'Agrega una nueva cita en el botón superior.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bezel-card-outer">
          <div className="bezel-card-inner p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#F7F8FA] border-b border-[#E2E8EA]">
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C7078] select-none">Hora</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C7078] select-none">Paciente</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C7078] select-none">Propietario</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C7078] select-none">Atiende</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C7078] select-none">Motivo</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C7078] select-none">Estado</th>
                    <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-[#5C7078] text-right select-none">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E2E8EA]">
                  {citas.map((cita) => {
                    const isPendiente = cita.estado === 'pendiente';
                    const isAtendida = cita.estado === 'atendida';
                    const isCancelada = cita.estado === 'cancelada';

                    return (
                      <tr key={cita.id} className="hover:bg-[#F7F8FA]/60 transition-all duration-300">
                        {/* Hora */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="font-bold text-sm text-[#1A2B30]">{formatTime(cita.fecha_hora)}</span>
                        </td>

                        {/* Paciente */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-[#F0F7F9] border border-[#C2DCE2] flex items-center justify-center text-lg select-none">
                              {getEspecieEmoji(cita.especie)}
                            </div>
                            <div>
                              <p className="font-bold text-[#1A2B30] text-sm leading-none">{cita.mascota_nombre}</p>
                              <p className="text-[10px] text-[#5C7078] uppercase font-bold tracking-wider mt-1">{cita.especie}</p>
                            </div>
                          </div>
                        </td>

                        {/* Propietario */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="font-semibold text-[#1A2B30] text-sm flex items-center gap-1">
                              <User size={13} className="text-[#5C7078]" /> {cita.cliente_nombre}
                            </span>
                            <span className="text-xs text-[#5C7078] mt-0.5 flex items-center gap-1">
                              <Phone size={13} className="text-[#5C7078]" /> {cita.telefono}
                            </span>
                          </div>
                        </td>

                        {/* Veterinario */}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[#1A2B30]">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Stethoscope size={16} className="text-[#2A6B7C]" />
                            <span>Dr. {cita.veterinario_nombre}</span>
                          </span>
                        </td>

                        {/* Motivo */}
                        <td className="px-6 py-4 max-w-xs truncate text-xs text-[#5C7078] font-medium" title={cita.motivo}>
                          <span className="flex items-center gap-1">
                            <Chat size={13} /> {cita.motivo}
                          </span>
                        </td>

                        {/* Estado */}
                        <td className="px-6 py-4 whitespace-nowrap">
                          {isPendiente && <span className="badge-yellow">Pendiente</span>}
                          {isAtendida && <span className="badge-green">Atendida</span>}
                          {isCancelada && <span className="badge-red">Cancelada</span>}
                        </td>

                        {/* Acciones */}
                        <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                          <div className="flex items-center justify-end gap-1.5">
                            {isPendiente && (
                              <>
                                <button
                                  onClick={() => handleUpdateStatus(cita.id, 'atendida')}
                                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-[#E2E8EA] bg-white text-emerald-600 hover:bg-emerald-50 hover:border-emerald-200 transition-all active:scale-[0.9] duration-300"
                                  title="Marcar como atendida"
                                >
                                  <Check size={14} weight="bold" />
                                </button>
                                <button
                                  onClick={() => handleUpdateStatus(cita.id, 'cancelada')}
                                  className="h-8 w-8 rounded-lg flex items-center justify-center border border-[#E2E8EA] bg-white text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-all active:scale-[0.9] duration-300"
                                  title="Cancelar cita"
                                >
                                  <X size={14} weight="bold" />
                                </button>
                              </>
                            )}

                            {!isPendiente && (
                              <button
                                onClick={() => handleUpdateStatus(cita.id, 'pendiente')}
                                className="px-2.5 py-1 rounded-md border border-[#E2E8EA] bg-white text-[#5C7078] hover:bg-[#F7F8FA] hover:text-[#1A2B30] transition-all duration-300 text-[10px] uppercase font-bold tracking-wider"
                                title="Restablecer a pendiente"
                              >
                                Restablecer
                              </button>
                            )}

                            {isAdminOrRecepcionista && (
                              <button
                                onClick={() => handleDeleteCita(cita.id)}
                                className="h-8 w-8 rounded-lg flex items-center justify-center border border-[#E2E8EA] bg-white text-rose-500 hover:bg-rose-100 hover:text-rose-600 transition-all active:scale-[0.9] duration-300 ml-2"
                                title="Eliminar cita"
                              >
                                <Trash size={14} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Modal: Agendar Cita (Double Bezel inside Overlay) ── */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg overflow-hidden">
            
            <div className="bezel-card-outer">
              <div className="bezel-card-inner !p-0">
                
                {/* Modal Header */}
                <div className="px-6 py-4 bg-[#F7F8FA] border-b border-[#E2E8EA] flex justify-between items-center">
                  <h2 className="font-bold text-[#1A2B30] text-sm uppercase tracking-wider">Agendar Nueva Cita</h2>
                  <button 
                    onClick={() => {
                      setModalOpen(false);
                      setSelectedCliente(null);
                      setClienteQuery('');
                      setSelectedMascotaId('');
                      setSelectedUsuarioId('');
                      setFechaHoraInput('');
                      setMotivoInput('');
                      setFormError('');
                    }}
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-[#5C7078] hover:text-[#1A2B30] hover:bg-slate-100 transition-colors"
                  >
                    <X size={16} weight="bold" />
                  </button>
                </div>

                {/* Modal Body */}
                <form onSubmit={handleBookAppointment} className="p-6 space-y-4">
                  
                  {formError && (
                    <div className="alert-error text-xs">
                      <WarningCircle size={16} />
                      <span>{formError}</span>
                    </div>
                  )}

                  {/* Paso 1: Buscar Propietario */}
                  <div className="space-y-1.5">
                    <label className="label">Propietario / Cliente</label>
                    {!selectedCliente ? (
                      <div className="relative">
                        <MagnifyingGlass className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C7078]" />
                        <input
                          type="text"
                          placeholder="Buscar por nombre, teléfono o correo..."
                          value={clienteQuery}
                          onChange={(e) => setClienteQuery(e.target.value)}
                          className="input-field pl-10"
                        />
                        {filteredClientes.length > 0 && (
                          <div className="absolute w-full mt-1.5 bg-white border border-[#E2E8EA] rounded-xl shadow-lg max-h-48 overflow-y-auto z-10 divide-y divide-[#E2E8EA]">
                            {filteredClientes.map((c) => (
                              <div
                                key={c.id}
                                onClick={() => {
                                  setSelectedCliente(c);
                                  setClienteQuery('');
                                  setSelectedMascotaId(c.mascotas[0]?.id || '');
                                }}
                                className="p-3 text-xs hover:bg-[#F0F7F9] cursor-pointer transition-colors"
                              >
                                <p className="font-bold text-[#1A2B30]">{c.nombre}</p>
                                <p className="text-[10px] text-[#5C7078] mt-0.5 uppercase tracking-wide">{c.telefono} • {c.correo}</p>
                              </div>
                            ))}
                          </div>
                        )}
                        {clienteQuery.trim().length > 1 && filteredClientes.length === 0 && (
                          <div className="absolute w-full mt-1.5 bg-white border border-[#E2E8EA] rounded-xl p-3 shadow-lg text-xs text-[#5C7078] italic z-10">
                            No se encontraron clientes.
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="p-3.5 bg-[#F0F7F9] border border-[#C2DCE2] rounded-xl flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm text-[#2A6B7C]">{selectedCliente.nombre}</p>
                          <p className="text-xs text-[#5C7078] mt-0.5">{selectedCliente.telefono} • {selectedCliente.correo}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedCliente(null);
                            setSelectedMascotaId('');
                          }}
                          className="text-xs text-rose-600 hover:underline font-bold uppercase tracking-wider"
                        >
                          Cambiar
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Paso 2: Seleccionar Mascota */}
                  {selectedCliente && (
                    <div className="space-y-1.5 animate-fade-in">
                      <label className="label">Mascota de {selectedCliente.nombre}</label>
                      {selectedCliente.mascotas.length === 0 ? (
                        <div className="alert-warning text-xs">
                          <WarningCircle size={16} />
                          <span>Este cliente no tiene mascotas registradas.</span>
                        </div>
                      ) : (
                        <select
                          value={selectedMascotaId}
                          onChange={(e) => setSelectedMascotaId(e.target.value)}
                          className="input-field"
                        >
                          <option value="" disabled>-- Selecciona la mascota --</option>
                          {selectedCliente.mascotas.map((m) => (
                            <option key={m.id} value={m.id}>
                              {getEspecieEmoji(m.especie)} {m.nombre} ({m.especie} • {m.raza})
                            </option>
                          ))}
                        </select>
                      )}
                    </div>
                  )}

                  {/* Paso 3: Seleccionar Veterinario */}
                  <div className="space-y-1.5">
                    <label className="label">Veterinario que atiende</label>
                    <select
                      value={selectedUsuarioId}
                      onChange={(e) => setSelectedUsuarioId(e.target.value)}
                      className="input-field"
                    >
                      <option value="" disabled>-- Selecciona un profesional --</option>
                      {veterinarios.map((v) => (
                        <option key={v.id} value={v.id}>
                          Dr(a). {v.nombre}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Paso 4: Fecha y Hora */}
                  <div className="space-y-1.5">
                    <label className="label">Fecha y Hora</label>
                    <input
                      type="datetime-local"
                      value={fechaHoraInput}
                      onChange={(e) => setFechaHoraInput(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  {/* Paso 5: Motivo de consulta */}
                  <div className="space-y-1.5">
                    <label className="label">Motivo de consulta</label>
                    <textarea
                      placeholder="Chequeo preventivo, vacunas, malestar general..."
                      value={motivoInput}
                      onChange={(e) => setMotivoInput(e.target.value)}
                      rows="3"
                      className="w-full p-3.5 border border-[#E2E8EA] rounded-xl text-sm bg-white focus:outline-none focus:border-[#2A6B7C] transition-all placeholder-slate-400"
                    ></textarea>
                  </div>

                  {/* Modal Actions */}
                  <div className="pt-4 flex justify-end gap-3 border-t border-[#E2E8EA] -mx-6 -mb-6 p-6 bg-[#F7F8FA]">
                    <button
                      type="button"
                      onClick={() => {
                        setModalOpen(false);
                        setSelectedCliente(null);
                        setClienteQuery('');
                        setSelectedMascotaId('');
                        setSelectedUsuarioId('');
                        setFechaHoraInput('');
                        setMotivoInput('');
                        setFormError('');
                      }}
                      className="btn-premium-secondary uppercase tracking-wider text-xs"
                      disabled={guardando}
                    >
                      <span>Cancelar</span>
                    </button>
                    <button
                      type="submit"
                      className="btn-premium-primary uppercase tracking-wider text-xs min-w-[140px]"
                      disabled={guardando}
                    >
                      {guardando ? (
                        <span className="flex items-center gap-2">
                          <Spinner size="sm" /> Procesando...
                        </span>
                      ) : (
                        <>
                          <span>Agendar Cita</span>
                          <div className="btn-icon-wrapper">
                            <Check size={12} weight="bold" />
                          </div>
                        </>
                      )}
                    </button>
                  </div>

                </form>

              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
