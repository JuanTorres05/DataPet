import { useState, useEffect, useCallback, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Spinner from "../components/Spinner";
import { CalendarBlank, Plus, Trash, X, ArrowCounterClockwise, Check, MagnifyingGlass, Stethoscope, Phone, User, Chat, WarningCircle, CheckCircle } from "@phosphor-icons/react";

function getEspecieEmoji(especie) {
  const e = especie?.toLowerCase();
  if (e?.includes("perro") || e?.includes("can")) return "🐕";
  if (e?.includes("gato") || e?.includes("fel")) return "🐈";
  if (e?.includes("ave") || e?.includes("pajaro")) return "🦜";
  if (e?.includes("conejo")) return "🐇";
  if (e?.includes("reptil") || e?.includes("tortuga") || e?.includes("iguana")) return "🦎";
  return "🐾";
}

function formatTime(s) {
  return new Date(s).toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit", hour12: true });
}
function formatDateDisplay(s) {
  return new Date(s).toLocaleDateString("es-CO", { weekday: "long", day: "numeric", month: "long" });
}

const ESTADO_STYLES = {
  pendiente: { bg: "var(--color-warning-bg)",  color: "var(--color-warning)",  label: "Pendiente"  },
  atendida:  { bg: "var(--color-success-bg)",  color: "var(--color-success)",  label: "Atendida"   },
  cancelada: { bg: "var(--color-danger-bg)",   color: "var(--color-danger)",   label: "Cancelada"  },
};

export default function AgendaPage() {
  const { user } = useAuth();
  const isAdminOrRec = user?.rol === "admin" || user?.rol === "recepcionista";

  const [citas,        setCitas]        = useState([]);
  const [clientes,     setClientes]     = useState([]);
  const [veterinarios, setVeterinarios] = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");

  const [fechaFiltro,  setFechaFiltro]  = useState(() => {
    const t = new Date(); return new Date(t - t.getTimezoneOffset()*60000).toISOString().slice(0,10);
  });
  const [estadoFiltro, setEstadoFiltro] = useState("");

  const [modalOpen,        setModalOpen]        = useState(false);
  const [clienteQuery,     setClienteQuery]     = useState("");
  const [selectedCliente,  setSelectedCliente]  = useState(null);
  const [selectedMascotaId,setSelectedMascotaId]= useState("");
  const [selectedUsuarioId,setSelectedUsuarioId]= useState("");
  const [fechaHoraInput,   setFechaHoraInput]   = useState("");
  const [motivoInput,      setMotivoInput]      = useState("");
  const [formError,        setFormError]        = useState("");
  const [guardando,        setGuardando]        = useState(false);
  const [successMsg,       setSuccessMsg]       = useState(null); // { mascota, fecha }
  const successTimer = useRef(null);

  const loadCitas = useCallback(async () => {
    try {
      setLoading(true); setError("");
      const params = {};
      if (fechaFiltro)  params.fecha  = fechaFiltro;
      if (estadoFiltro) params.estado = estadoFiltro;
      const res = await api.get("/citas", { params });
      setCitas(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al cargar las citas.");
    } finally { setLoading(false); }
  }, [fechaFiltro, estadoFiltro]);

  const loadModalData = async () => {
    try {
      const resC = await api.get("/clientes");
      setClientes(resC.data);
      const resV = await api.get("/auth/veterinarios").catch(() => ({ data: [] }));
      setVeterinarios(resV.data);
    } catch (err) { console.error("Error modal data", err); }
  };

  useEffect(() => { loadCitas(); },              [loadCitas]);
  useEffect(() => { if (modalOpen) loadModalData(); }, [modalOpen]);

  // Auto-dismiss success banner after 5s
  function showSuccess(msg) {
    setSuccessMsg(msg);
    clearTimeout(successTimer.current);
    successTimer.current = setTimeout(() => setSuccessMsg(null), 5000);
  }

  const handleUpdateStatus = async (id, estado) => {
    try { await api.patch(`/citas/${id}/estado`, { estado }); loadCitas(); }
    catch (err) { alert(err.response?.data?.message || "Error al actualizar."); }
  };
  const handleDelete = async (id) => {
    if (!window.confirm("Eliminar esta cita de la agenda?")) return;
    try { await api.delete(`/citas/${id}`); loadCitas(); }
    catch (err) { alert(err.response?.data?.message || "Error al eliminar."); }
  };

  const handleBook = async (e) => {
    e.preventDefault();
    if (!selectedMascotaId)  return setFormError("Selecciona una mascota.");
    if (!selectedUsuarioId)  return setFormError("Selecciona un veterinario.");
    if (!fechaHoraInput)     return setFormError("Especifica fecha y hora.");
    if (!motivoInput.trim()) return setFormError("Describe el motivo de la cita.");

    // Capture display data before resetting
    const mascotaNombre = selectedCliente?.mascotas?.find(m => String(m.id) === String(selectedMascotaId))?.nombre || "la mascota";
    const vetNombre     = veterinarios.find(v => String(v.id) === String(selectedUsuarioId))?.nombre || "el veterinario";
    const fechaDisplay  = new Date(fechaHoraInput).toLocaleString("es-CO", { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit", hour12: true });

    try {
      setGuardando(true); setFormError("");
      await api.post("/citas", { mascota_id: Number(selectedMascotaId), usuario_id: Number(selectedUsuarioId), fecha_hora: fechaHoraInput, motivo: motivoInput.trim() });
      // Reset modal
      setModalOpen(false);
      setSelectedCliente(null); setClienteQuery(""); setSelectedMascotaId("");
      setSelectedUsuarioId(""); setFechaHoraInput(""); setMotivoInput("");
      loadCitas();
      // Show success banner
      showSuccess({ mascota: mascotaNombre, vet: vetNombre, fecha: fechaDisplay });
    } catch (err) { setFormError(err.response?.data?.message || "Error al crear la cita."); }
    finally { setGuardando(false); }
  };

  const filteredClientes = clienteQuery.trim() === "" ? [] :
    clientes.filter(c => c.nombre.toLowerCase().includes(clienteQuery.toLowerCase()) || c.telefono.includes(clienteQuery) || c.correo.toLowerCase().includes(clienteQuery.toLowerCase()));

  const today = new Date(); const todayStr = new Date(today - today.getTimezoneOffset()*60000).toISOString().slice(0,10);

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Agenda Diaria</h1>
          <p className="page-subtitle">{fechaFiltro ? formatDateDisplay(fechaFiltro) : "Mostrando todas las citas"}</p>
        </div>
        {isAdminOrRec && (
          <button onClick={() => setModalOpen(true)} className="btn-premium-primary">
            <span>Agendar Cita</span>
            <div className="btn-icon-wrapper"><Plus size={13} weight="bold" /></div>
          </button>
        )}
      </div>

      {/* ── Confirmation Banner ── */}
      {successMsg && (
        <div
          className="animate-fade-in flex items-start gap-4 px-5 py-4 rounded-2xl border"
          style={{
            backgroundColor: "var(--color-success-bg)",
            borderColor: "var(--color-success)",
            boxShadow: "0 4px 20px -4px rgba(42,142,121,0.18)",
          }}
        >
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: "var(--color-success)", color: "white" }}
          >
            <CheckCircle size={22} weight="fill" />
          </div>
          <div className="flex-1 min-w-0">
            <p
              className="font-bold text-base leading-tight"
              style={{ color: "var(--color-success)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}
            >
              ¡Cita agendada exitosamente!
            </p>
            <p className="text-sm mt-1 leading-relaxed" style={{ color: "var(--color-success)" }}>
              <strong>{successMsg.mascota}</strong> quedó agendada con{" "}
              <strong>Dr(a). {successMsg.vet}</strong> para el{" "}
              <strong>{successMsg.fecha}</strong>.
            </p>
          </div>
          <button
            onClick={() => setSuccessMsg(null)}
            className="flex items-center justify-center w-7 h-7 rounded-lg flex-shrink-0 transition-all active:scale-90"
            style={{ color: "var(--color-success)", backgroundColor: "rgba(42,142,121,0.12)" }}
          >
            <X size={14} weight="bold" />
          </button>
        </div>
      )}


      {/* Filters */}
      <div className="card grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
        <div>
          <label className="label">Filtrar por fecha</label>
          <input type="date" value={fechaFiltro} onChange={e => setFechaFiltro(e.target.value)} className="input-field" />
        </div>
        <div>
          <label className="label">Estado</label>
          <div className="flex rounded-xl overflow-hidden border h-11 p-0.5" style={{ borderColor: "var(--color-border)", backgroundColor: "var(--color-primary-lt)" }}>
            {[{ val: "", label: "Todas" }, { val: "pendiente", label: "Pendientes" }, { val: "atendida", label: "Atendidas" }, { val: "cancelada", label: "Canceladas" }].map(btn => (
              <button key={btn.val} type="button" onClick={() => setEstadoFiltro(btn.val)}
                className="flex-1 text-xs font-bold uppercase tracking-wide transition-all rounded-lg select-none"
                style={{
                  backgroundColor: estadoFiltro === btn.val ? "var(--color-primary)" : "transparent",
                  color: estadoFiltro === btn.val ? "white" : "var(--color-muted)",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}>
                {btn.label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <button onClick={() => { setFechaFiltro(todayStr); setEstadoFiltro(""); }}
            className="btn-premium-secondary w-full">
            <span>Limpiar filtros</span>
            <div className="btn-icon-wrapper" style={{ backgroundColor: "rgba(29,75,88,0.08)" }}>
              <ArrowCounterClockwise size={12} weight="bold" />
            </div>
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border text-sm"
          style={{ backgroundColor: "var(--color-danger-bg)", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
          <WarningCircle size={18} weight="bold" style={{ flexShrink: 0 }} />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Table */}
      {loading ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>Cargando agenda...</p>
        </div>
      ) : citas.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
            style={{ backgroundColor: "var(--color-primary-lt)", border: "1.5px solid var(--color-primary-bd)" }}>📅</div>
          <h3 className="font-bold text-base" style={{ color: "var(--color-text)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Sin citas registradas</h3>
          <p className="text-sm mt-1.5" style={{ color: "var(--color-muted)" }}>
            No hay citas en los filtros seleccionados. {isAdminOrRec && "Agrega una nueva cita arriba."}
          </p>
        </div>
      ) : (
        <div className="card p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr style={{ backgroundColor: "var(--color-primary-lt)", borderBottom: "1.5px solid var(--color-border)" }}>
                  {["Hora", "Paciente", "Propietario", "Atiende", "Motivo", "Estado", "Acciones"].map(h => (
                    <th key={h} className="px-5 py-3.5 font-bold uppercase text-[11px] tracking-wider select-none"
                      style={{ color: "var(--color-muted)", fontFamily: "'Plus Jakarta Sans', sans-serif", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {citas.map((cita, i) => {
                  const est = ESTADO_STYLES[cita.estado] ?? ESTADO_STYLES.pendiente;
                  return (
                    <tr key={cita.id} style={{ borderBottom: "1px solid var(--color-border)", backgroundColor: i % 2 === 0 ? "white" : "var(--color-primary-lt)" }}>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="font-bold text-base" style={{ color: "var(--color-text)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                          {formatTime(cita.fecha_hora)}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                            style={{ backgroundColor: "var(--color-primary-lt)", border: "1px solid var(--color-primary-bd)" }}>
                            {getEspecieEmoji(cita.especie)}
                          </div>
                          <div>
                            <p className="font-bold text-sm leading-none" style={{ color: "var(--color-text)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{cita.mascota_nombre}</p>
                            <p className="text-[10px] uppercase font-bold tracking-wider mt-0.5" style={{ color: "var(--color-muted)" }}>{cita.especie}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <p className="font-semibold text-sm flex items-center gap-1.5" style={{ color: "var(--color-text)" }}>
                          <User size={13} style={{ color: "var(--color-muted)", flexShrink: 0 }} />{cita.cliente_nombre}
                        </p>
                        <p className="text-xs flex items-center gap-1 mt-0.5" style={{ color: "var(--color-muted)" }}>
                          <Phone size={11} style={{ flexShrink: 0 }} />{cita.telefono}
                        </p>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="flex items-center gap-1.5 text-sm font-medium" style={{ color: "var(--color-text)" }}>
                          <Stethoscope size={15} style={{ color: "var(--color-primary)" }} />Dr. {cita.veterinario_nombre}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 max-w-[180px] truncate text-sm" style={{ color: "var(--color-muted)" }} title={cita.motivo}>
                        <span className="flex items-center gap-1">
                          <Chat size={13} style={{ flexShrink: 0 }} />{cita.motivo}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide"
                          style={{ backgroundColor: est.bg, color: est.color }}>
                          {est.label}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <div className="flex items-center gap-1.5 justify-end">
                          {cita.estado === "pendiente" && (
                            <>
                              <button onClick={() => handleUpdateStatus(cita.id, "atendida")} title="Marcar atendida"
                                className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all active:scale-90"
                                style={{ borderColor: "var(--color-success)", color: "var(--color-success)", backgroundColor: "var(--color-success-bg)" }}>
                                <Check size={14} weight="bold" />
                              </button>
                              <button onClick={() => handleUpdateStatus(cita.id, "cancelada")} title="Cancelar cita"
                                className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all active:scale-90"
                                style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)", backgroundColor: "var(--color-danger-bg)" }}>
                                <X size={14} weight="bold" />
                              </button>
                            </>
                          )}
                          {cita.estado !== "pendiente" && (
                            <button onClick={() => handleUpdateStatus(cita.id, "pendiente")} title="Restablecer"
                              className="px-2.5 py-1.5 rounded-lg border text-xs font-bold uppercase tracking-wide transition-all"
                              style={{ borderColor: "var(--color-border)", color: "var(--color-muted)", backgroundColor: "white" }}>
                              Restablecer
                            </button>
                          )}
                          {isAdminOrRec && (
                            <button onClick={() => handleDelete(cita.id)} title="Eliminar"
                              className="w-8 h-8 rounded-lg border flex items-center justify-center transition-all active:scale-90 ml-1"
                              style={{ borderColor: "var(--color-danger)", color: "var(--color-danger)", backgroundColor: "var(--color-danger-bg)" }}>
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
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-modal)" }}>

            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b"
              style={{ backgroundColor: "var(--color-primary-lt)", borderColor: "var(--color-border)" }}>
              <h2 className="font-bold text-base" style={{ color: "var(--color-text)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Agendar Nueva Cita
              </h2>
              <button onClick={() => { setModalOpen(false); setSelectedCliente(null); setClienteQuery(""); setSelectedMascotaId(""); setSelectedUsuarioId(""); setFechaHoraInput(""); setMotivoInput(""); setFormError(""); }}
                className="w-8 h-8 rounded-lg flex items-center justify-center transition-all"
                style={{ color: "var(--color-muted)", backgroundColor: "var(--color-border)" }}>
                <X size={16} weight="bold" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleBook} className="p-6 space-y-4">
              {formError && (
                <div className="flex items-center gap-2.5 p-3 rounded-xl border text-sm"
                  style={{ backgroundColor: "var(--color-danger-bg)", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
                  <WarningCircle size={16} weight="bold" style={{ flexShrink: 0 }} />{formError}
                </div>
              )}

              {/* Propietario */}
              <div>
                <label className="label">Propietario / Cliente</label>
                {!selectedCliente ? (
                  <div className="relative">
                    <MagnifyingGlass size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
                    <input type="text" placeholder="Buscar por nombre, telefono o correo..." value={clienteQuery}
                      onChange={e => setClienteQuery(e.target.value)} className="input-field pl-10" />
                    {filteredClientes.length > 0 && (
                      <div className="absolute w-full mt-1 bg-white border rounded-xl shadow-lg max-h-48 overflow-y-auto z-10 divide-y"
                        style={{ borderColor: "var(--color-border)" }}>
                        {filteredClientes.map(c => (
                          <div key={c.id} onClick={() => { setSelectedCliente(c); setClienteQuery(""); setSelectedMascotaId(c.mascotas[0]?.id || ""); }}
                            className="p-3 cursor-pointer transition-colors"
                            style={{ color: "var(--color-text)" }}
                            onMouseEnter={e => e.currentTarget.style.backgroundColor = "var(--color-primary-lt)"}
                            onMouseLeave={e => e.currentTarget.style.backgroundColor = "white"}>
                            <p className="font-bold text-sm">{c.nombre}</p>
                            <p className="text-xs mt-0.5 uppercase tracking-wide" style={{ color: "var(--color-muted)" }}>{c.telefono} • {c.correo}</p>
                          </div>
                        ))}
                      </div>
                    )}
                    {clienteQuery.trim().length > 1 && filteredClientes.length === 0 && (
                      <div className="absolute w-full mt-1 bg-white border rounded-xl p-3 shadow-lg z-10 text-sm italic"
                        style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
                        No se encontraron clientes.
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between p-3.5 rounded-xl border"
                    style={{ backgroundColor: "var(--color-primary-lt)", borderColor: "var(--color-primary-bd)" }}>
                    <div>
                      <p className="font-bold text-sm" style={{ color: "var(--color-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{selectedCliente.nombre}</p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--color-muted)" }}>{selectedCliente.telefono} • {selectedCliente.correo}</p>
                    </div>
                    <button type="button" onClick={() => { setSelectedCliente(null); setSelectedMascotaId(""); }}
                      className="text-xs font-bold uppercase tracking-wide transition-all"
                      style={{ color: "var(--color-danger)" }}>
                      Cambiar
                    </button>
                  </div>
                )}
              </div>

              {/* Mascota */}
              {selectedCliente && (
                <div className="animate-fade-in">
                  <label className="label">Mascota de {selectedCliente.nombre}</label>
                  {selectedCliente.mascotas.length === 0 ? (
                    <div className="p-3 rounded-xl border text-sm" style={{ backgroundColor: "var(--color-warning-bg)", borderColor: "var(--color-warning)", color: "var(--color-warning)" }}>
                      <WarningCircle size={15} style={{ display: "inline", marginRight: "6px" }} />Este cliente no tiene mascotas registradas.
                    </div>
                  ) : (
                    <select value={selectedMascotaId} onChange={e => setSelectedMascotaId(e.target.value)} className="input-field">
                      <option value="" disabled>-- Selecciona la mascota --</option>
                      {selectedCliente.mascotas.map(m => (
                        <option key={m.id} value={m.id}>{getEspecieEmoji(m.especie)} {m.nombre} ({m.especie} • {m.raza})</option>
                      ))}
                    </select>
                  )}
                </div>
              )}

              {/* Veterinario */}
              <div>
                <label className="label">Veterinario que atiende</label>
                <select value={selectedUsuarioId} onChange={e => setSelectedUsuarioId(e.target.value)} className="input-field">
                  <option value="" disabled>-- Selecciona un profesional --</option>
                  {veterinarios.map(v => (<option key={v.id} value={v.id}>Dr(a). {v.nombre}</option>))}
                </select>
              </div>

              {/* Fecha y hora */}
              <div>
                <label className="label">Fecha y Hora</label>
                <input type="datetime-local" value={fechaHoraInput} onChange={e => setFechaHoraInput(e.target.value)} className="input-field" />
              </div>

              {/* Motivo */}
              <div>
                <label className="label">Motivo de consulta</label>
                <textarea placeholder="Chequeo preventivo, vacunas, malestar general..." value={motivoInput}
                  onChange={e => setMotivoInput(e.target.value)} rows="3"
                  className="w-full p-4 rounded-xl border bg-white text-sm focus:outline-none transition-all"
                  style={{ borderColor: "var(--color-border)", color: "var(--color-text)", resize: "none", fontFamily: "'Inter', sans-serif" }}
                  onFocus={e => { e.target.style.borderColor = "var(--color-primary)"; e.target.style.boxShadow = "0 0 0 3px rgba(29,75,88,0.08)"; }}
                  onBlur={e => { e.target.style.borderColor = "var(--color-border)"; e.target.style.boxShadow = "none"; }}
                />
              </div>

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-2 border-t" style={{ borderColor: "var(--color-border)" }}>
                <button type="button" onClick={() => { setModalOpen(false); setSelectedCliente(null); setClienteQuery(""); setSelectedMascotaId(""); setSelectedUsuarioId(""); setFechaHoraInput(""); setMotivoInput(""); setFormError(""); }}
                  className="btn-premium-secondary" disabled={guardando}>
                  <span>Cancelar</span>
                </button>
                <button type="submit" className="btn-premium-primary" disabled={guardando}>
                  {guardando ? (<><Spinner size="sm" />Procesando...</>) : (<><span>Agendar Cita</span><div className="btn-icon-wrapper"><Check size={13} weight="bold" /></div></>)}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
