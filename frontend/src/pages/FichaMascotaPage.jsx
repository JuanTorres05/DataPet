import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/Spinner';
import api from '../services/api';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Envelope, 
  Stethoscope, 
  Calendar, 
  ChatText, 
  Notebook, 
  Check, 
  WarningCircle,
  Plus
} from '@phosphor-icons/react';

function getEspecieEmoji(especie) {
  const esp = especie?.toLowerCase();
  if (esp?.includes('perro') || esp?.includes('can')) return 'ðŸ•';
  if (esp?.includes('gato') || esp?.includes('fel')) return 'ðŸˆ';
  if (esp?.includes('ave') || esp?.includes('pajaro')) return 'ðŸ¦œ';
  if (esp?.includes('conejo')) return 'ðŸ‡';
  if (esp?.includes('reptil') || esp?.includes('tortuga') || esp?.includes('iguana')) return 'ðŸ¦Ž';
  return 'ðŸ¾';
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-CO', { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });
}

export default function FichaMascotaPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const isVeterinarioOrAdmin = user?.rol === 'veterinario' || user?.rol === 'admin';

  // State
  const [mascota, setMascota] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Form State
  const [motivoInput, setMotivoInput] = useState('');
  const [diagnosticoInput, setDiagnosticoInput] = useState('');
  const [tratamientoInput, setTratamientoInput] = useState('');
  const [notasInput, setNotasInput] = useState('');
  const [formError, setFormError] = useState('');
  const [guardando, setGuardando] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const loadMascotaDetails = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get(`/mascotas/${id}`);
      setMascota(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener la ficha del paciente.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadMascotaDetails();
  }, [loadMascotaDetails]);

  const handleSubmitHistorial = async (e) => {
    e.preventDefault();
    if (!motivoInput.trim()) return setFormError('El motivo de consulta es requerido.');
    if (!diagnosticoInput.trim()) return setFormError('El diagnÃ³stico es requerido.');
    if (!tratamientoInput.trim()) return setFormError('El tratamiento es requerido.');

    try {
      setGuardando(true);
      setFormError('');
      setSuccessMsg('');

      const tzOffset = (new Date()).getTimezoneOffset() * 60000;
      const localISOTime = (new Date(Date.now() - tzOffset)).toISOString().slice(0, 19).replace('T', ' ');

      const res = await api.post(`/mascotas/${id}/historial`, {
        fecha: localISOTime,
        motivo: motivoInput.trim(),
        diagnostico: diagnosticoInput.trim(),
        tratamiento: tratamientoInput.trim(),
        notas: notasInput.trim() || null
      });

      // Append new clinical entry at the top of history
      setMascota(m => ({
        ...m,
        historial: [res.data, ...m.historial]
      }));

      // Reset Form
      setMotivoInput('');
      setDiagnosticoInput('');
      setTratamientoInput('');
      setNotasInput('');
      setSuccessMsg('Entrada registrada con Ã©xito.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setFormError(err.response?.data?.message || 'Error al registrar la consulta clÃ­nica.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-24 space-y-4">
        <div className="w-8 h-8 rounded-full border-2 border-[#2A6B7C] border-t-transparent animate-spin"></div>
        <p className="text-xs text-[#5C7078] font-bold uppercase tracking-wider">Cargando expediente clÃ­nico...</p>
      </div>
    );
  }

  if (error || !mascota) {
    return (
      <div className="max-w-md mx-auto p-12">
        <div className="alert-error">
          <WarningCircle size={20} className="flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Error</p>
            <p className="text-xs">{error || 'No se encontrÃ³ el paciente.'}</p>
          </div>
        </div>
        <Link to="/pacientes" className="btn-premium-secondary w-full mt-6 text-xs uppercase tracking-wider">
          <ArrowLeft size={14} /> <span>Volver a pacientes</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto animate-fade-in">
      
      {/* â”€â”€ Back Link & Header â”€â”€ */}
      <div className="space-y-4 page-header">
        <Link 
          to="/pacientes" 
          className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#5C7078] hover:text-[#1A2B30] transition-colors"
        >
          <ArrowLeft size={14} weight="bold" />
          <span>Volver a Pacientes</span>
        </Link>

        <div className="flex items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#F0F7F9] border border-[#C2DCE2] flex items-center justify-center text-3xl select-none">
            {getEspecieEmoji(mascota.especie)}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="page-title text-2xl">{mascota.nombre}</h1>
              <span className="badge-green lowercase tracking-normal px-2.5 py-0.5 mt-0.5 select-none">
                {mascota.especie}
              </span>
            </div>
            <p className="page-subtitle">Raza: {mascota.raza}</p>
          </div>
        </div>
      </div>

      {/* â”€â”€ Split Layout (Editorial Split) â”€â”€ */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* â”€â”€ LEFT PANEL (65%): Clinic History and Consult Forms â”€â”€ */}
        <div className="w-full lg:w-[65%] space-y-6">
          
          {/* Form: Registrar Nueva Consulta (Admin or Veterinario only) */}
          {isVeterinarioOrAdmin && (
            <div className="card">
              <div className="">
                
                <h2 className="text-sm font-bold text-[#1A2B30] uppercase tracking-wider mb-4 flex items-center gap-2 select-none">
                  <Stethoscope size={18} className="text-[#2A6B7C]" />
                  <span>Registrar Nueva Consulta</span>
                </h2>

                {formError && (
                  <div className="alert-error mb-4 text-xs">
                    <WarningCircle size={16} />
                    <span>{formError}</span>
                  </div>
                )}

                {successMsg && (
                  <div className="alert-success mb-4 text-xs">
                    <Check size={16} />
                    <span>{successMsg}</span>
                  </div>
                )}

                <form onSubmit={handleSubmitHistorial} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="label">Motivo de consulta <span className="text-rose-600">*</span></label>
                    <input 
                      type="text"
                      placeholder="Ej. Control post-quirÃºrgico, VacunaciÃ³n triple felina, Dolor abdominal..."
                      value={motivoInput}
                      onChange={(e) => setMotivoInput(e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="label">DiagnÃ³stico ClÃ­nico <span className="text-rose-600">*</span></label>
                      <textarea
                        placeholder="Describa los hallazgos y el diagnÃ³stico..."
                        value={diagnosticoInput}
                        onChange={(e) => setDiagnosticoInput(e.target.value)}
                        rows="3"
                        className="w-full p-3.5 border border-[#E2E8EA] rounded-xl text-sm focus:outline-none focus:border-[#2A6B7C] transition-all bg-white"
                      ></textarea>
                    </div>

                    <div className="space-y-1.5">
                      <label className="label">Tratamiento Asignado <span className="text-rose-600">*</span></label>
                      <textarea
                        placeholder="Describa el tratamiento, medicamentos y dosis..."
                        value={tratamientoInput}
                        onChange={(e) => setTratamientoInput(e.target.value)}
                        rows="3"
                        className="w-full p-3.5 border border-[#E2E8EA] rounded-xl text-sm focus:outline-none focus:border-[#2A6B7C] transition-all bg-white"
                      ></textarea>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="label">Notas adicionales (Opcional)</label>
                    <textarea
                      placeholder="Recomendaciones para el hogar, fecha de prÃ³ximo control..."
                      value={notasInput}
                      onChange={(e) => setNotasInput(e.target.value)}
                      rows="2"
                      className="w-full p-3.5 border border-[#E2E8EA] rounded-xl text-sm focus:outline-none focus:border-[#2A6B7C] transition-all bg-white"
                    ></textarea>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="submit"
                      disabled={guardando}
                      className="btn-premium-primary min-w-[200px]"
                    >
                      {guardando ? (
                        <span className="flex items-center gap-2">
                          <Spinner size="sm" /> Guardando...
                        </span>
                      ) : (
                        <>
                          <span>Guardar Consulta</span>
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
          )}

          {/* Timeline: Historial ClÃ­nico */}
          <div className="card">
            <div className="">
              
              <h2 className="text-sm font-bold text-[#1A2B30] uppercase tracking-wider mb-6 flex items-center gap-2 select-none">
                <Notebook size={18} className="text-[#2A6B7C]" />
                <span>Historial de Consultas ClÃ­nicas ({mascota.historial.length})</span>
              </h2>

              {mascota.historial.length === 0 ? (
                <div className="text-center p-8 text-[#5C7078] italic text-xs">
                  No hay registros clÃ­nicos en la base de datos de esta mascota.
                </div>
              ) : (
                <div className="relative border-l border-[#E2E8EA] ml-3 pl-6 space-y-6">
                  {mascota.historial.map((h) => (
                    <div key={h.id} className="relative group">
                      
                      {/* Timeline dot */}
                      <span className="absolute -left-[31px] top-1.5 w-3.5 h-3.5 rounded-full bg-white border-2 border-[#2A6B7C] group-hover:scale-110 transition-transform duration-300"></span>

                      {/* Timeline Card */}
                      <div className="p-4 rounded-xl border border-[#E2E8EA] bg-[#F7F8FA] space-y-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)]">
                        <div className="flex justify-between items-start flex-wrap gap-2">
                          <div>
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C7078]">Fecha de atenciÃ³n</span>
                            <p className="font-bold text-xs text-[#1A2B30]">{formatDate(h.fecha)}</p>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-[#5C7078]">Veterinario</span>
                            <p className="font-semibold text-xs text-[#2A6B7C]">Dr(a). {h.veterinario_nombre}</p>
                          </div>
                        </div>

                        <div className="border-t border-[#E2E8EA]/65 pt-2 space-y-2">
                          <p className="text-xs text-[#1A2B30] leading-relaxed">
                            <strong className="text-[10px] font-bold uppercase tracking-wider text-[#5C7078] block">Motivo</strong>
                            {h.motivo}
                          </p>
                          
                          <p className="text-xs text-[#1A2B30] leading-relaxed">
                            <strong className="text-[10px] font-bold uppercase tracking-wider text-[#5C7078] block">DiagnÃ³stico</strong>
                            {h.diagnostico}
                          </p>
                          
                          <p className="text-xs text-[#1A2B30] leading-relaxed">
                            <strong className="text-[10px] font-bold uppercase tracking-wider text-[#5C7078] block">Tratamiento</strong>
                            {h.tratamiento}
                          </p>

                          {h.notas && (
                            <p className="text-xs text-[#5C7078] italic leading-relaxed bg-white/50 p-2 rounded-lg border border-[#E2E8EA]/40">
                              <strong className="text-[10px] font-bold uppercase tracking-wider text-[#5C7078] block not-italic">Notas Adicionales</strong>
                              {h.notas}
                            </p>
                          )}
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              )}

            </div>
          </div>

        </div>

        {/* â”€â”€ RIGHT PANEL (35%): Owner Detail & Appointment History â”€â”€ */}
        <div className="w-full lg:w-[35%] space-y-6">
          
          {/* Card: Propietario */}
          <div className="card">
            <div className="">
              
              <h2 className="text-sm font-bold text-[#1A2B30] uppercase tracking-wider mb-4 flex items-center gap-2 select-none">
                <User size={18} className="text-[#2A6B7C]" />
                <span>Contacto del Propietario</span>
              </h2>

              <div className="p-3 bg-[#F0F7F9] border border-[#C2DCE2] rounded-xl space-y-3.5">
                <div>
                  <p className="font-bold text-sm text-[#2A6B7C]">{mascota.cliente.nombre}</p>
                  <span className="text-[10px] text-[#5C7078] font-bold uppercase tracking-wider select-none">Propietario Principal</span>
                </div>

                <div className="space-y-2 text-xs text-[#5C7078] border-t border-[#C2DCE2]/60 pt-3">
                  <p className="flex items-center gap-2 font-medium">
                    <Phone size={14} className="text-[#2A6B7C]" />
                    <span>{mascota.cliente.telefono}</span>
                  </p>
                  <p className="flex items-center gap-2 font-medium">
                    <Envelope size={14} className="text-[#2A6B7C]" />
                    <span className="truncate" title={mascota.cliente.correo}>{mascota.cliente.correo}</span>
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Card: Citas agendadas */}
          <div className="card">
            <div className="">
              
              <h2 className="text-sm font-bold text-[#1A2B30] uppercase tracking-wider mb-4 flex items-center gap-2 select-none">
                <Calendar size={18} className="text-[#2A6B7C]" />
                <span>Historial de Citas ({mascota.citas.length})</span>
              </h2>

              {mascota.citas.length === 0 ? (
                <p className="text-xs text-[#5C7078] italic p-2 text-center">
                  Esta mascota no tiene citas registradas.
                </p>
              ) : (
                <div className="space-y-3.5 max-h-80 overflow-y-auto pr-1">
                  {mascota.citas.map((c) => {
                    const isPendiente = c.estado === 'pendiente';
                    const isAtendida = c.estado === 'atendida';
                    return (
                      <div key={c.id} className="p-3 border border-[#E2E8EA] bg-[#F7F8FA] rounded-xl flex flex-col gap-1">
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-xs text-[#1A2B30]">{formatDate(c.fecha_hora)}</span>
                          {isPendiente && <span className="badge-yellow !text-[9px] !px-2 !py-0.5">Pendiente</span>}
                          {isAtendida && <span className="badge-green !text-[9px] !px-2 !py-0.5">Atendida</span>}
                          {!isPendiente && !isAtendida && <span className="badge-red !text-[9px] !px-2 !py-0.5">Cancelada</span>}
                        </div>
                        <p className="text-[11px] text-[#5C7078] truncate mt-1">
                          <span className="font-semibold text-[#1A2B30]">Motivo:</span> {c.motivo}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}

            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

