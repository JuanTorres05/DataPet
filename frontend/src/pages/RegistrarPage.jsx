import { useState } from "react";
import Spinner from "../components/Spinner";
import api from "../services/api";
import {
  User, Phone, Envelope, Plus, Trash, Check, WarningCircle, Notebook,
  Cat, ArrowRight, ArrowLeft, CheckCircle
} from "@phosphor-icons/react";

/* Constants */
const MASCOTA_INIT = { nombre: "", especie: "", raza: "" };
const FORM_INIT    = { cliente: { nombre: "", telefono: "", correo: "" }, mascotas: [{ ...MASCOTA_INIT }] };
const telefonoRegex = /^[0-9+\-\s]{7,15}$/;
const ESPECIES = [
  { value: "Perro",  icon: "🐕", label: "Perro"  },
  { value: "Gato",   icon: "🐈", label: "Gato"   },
  { value: "Ave",    icon: "🦜", label: "Ave"     },
  { value: "Conejo", icon: "🐇", label: "Conejo"  },
  { value: "Reptil", icon: "🦎", label: "Reptil"  },
  { value: "Otro",   icon: "🐾", label: "Otro"    },
];
const PET_PALETTE = [
  { accent: "#1D4B58", bg: "#F2F6F7", bd: "#D5E2E4" },
  { accent: "#2A8E79", bg: "#EBF7F5", bd: "#B2E0D9" },
  { accent: "#7B5EA7", bg: "#F5F0FF", bd: "#D6C8F5" },
  { accent: "#C0720A", bg: "#FFF5E6", bd: "#FFD4A0" },
  { accent: "#B03060", bg: "#FFF0F5", bd: "#F5C0D0" },
];

const STEPS = [
  { id: 1, label: "Propietario", desc: "Datos de contacto" },
  { id: 2, label: "Mascotas",   desc: "Datos de la(s) mascota(s)" },
  { id: 3, label: "Resumen",    desc: "Confirmacion" },
];

function getPalette(i) { return PET_PALETTE[i % PET_PALETTE.length]; }

/* Validation helpers */
function validateCliente(cliente) {
  const e = {};
  if (!cliente.nombre.trim())                               e.nombre   = "Nombre obligatorio.";
  if (!telefonoRegex.test(cliente.telefono))                e.telefono = "Telefono invalido (7-15 digitos).";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cliente.correo)) e.correo   = "Correo no valido.";
  return e;
}
function validateMascotas(mascotas) {
  return mascotas.map(m => {
    const e = {};
    if (!m.nombre.trim())  e.nombre  = "Nombre obligatorio.";
    if (!m.especie.trim()) e.especie = "Selecciona una especie.";
    if (!m.raza.trim())    e.raza    = "Raza obligatoria.";
    return e;
  });
}

/* Sub-components */
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-[11px] mt-1.5 font-semibold select-none" style={{ color: "var(--color-danger)" }}>
      <span>▲</span>{msg}
    </p>
  );
}
function FieldLabel({ htmlFor, children, required }) {
  return (
    <label htmlFor={htmlFor} className="label">
      {children}{required && <span className="ml-1" style={{ color: "var(--color-danger)" }}>*</span>}
    </label>
  );
}

/* Stepper Header */
function StepperHeader({ step }) {
  return (
    <div className="flex items-center mb-8">
      {STEPS.map((s, idx) => {
        const status = s.id < step ? "done" : s.id === step ? "active" : "pending";
        const isLast = idx === STEPS.length - 1;
        return (
          <div key={s.id} className="flex items-center flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-shrink-0">
              <div className={`stepper-circle ${status}`}>
                {status === "done" ? <Check size={13} weight="bold" /> : s.id}
              </div>
              <div className="hidden sm:block">
                <p className={`stepper-label ${status}`}>{s.label}</p>
                <p className="text-[9px] uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>{s.desc}</p>
              </div>
            </div>
            {!isLast && <div className={`stepper-connector ${status === "done" ? "done" : ""}`} />}
          </div>
        );
      })}
    </div>
  );
}

/* Pet Card */
function PetCard({ mascota, index, onUpdate, onRemove, errors, canRemove }) {
  const p = getPalette(index);
  return (
    <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "var(--color-border)", boxShadow: "var(--shadow-ambient)" }}>
      {/* Card header */}
      <div className="flex items-center justify-between px-5 py-3 border-b" style={{ backgroundColor: p.bg, borderColor: p.bd }}>
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold" style={{ backgroundColor: p.accent }}>
            {index + 1}
          </div>
          <span className="font-bold text-sm" style={{ color: p.accent, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            <Cat size={14} style={{ display: "inline", marginRight: "6px" }} weight="bold" />
            {mascota.nombre.trim() ? mascota.nombre : `Mascota #${index + 1}`}
          </span>
        </div>
        {canRemove && (
          <button type="button" onClick={() => onRemove(index)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold uppercase tracking-wider transition-all active:scale-[0.95]"
            style={{ color: "var(--color-danger)", backgroundColor: "var(--color-danger-bg)", borderColor: "var(--color-danger)" + "30" }}>
            <Trash size={12} />Eliminar
          </button>
        )}
      </div>
      {/* Fields */}
      <div className="p-5 space-y-4 bg-white">
        {/* Nombre */}
        <div>
          <FieldLabel htmlFor={`m-nombre-${index}`} required>Nombre de la mascota</FieldLabel>
          <input id={`m-nombre-${index}`} type="text" placeholder="Ej. Max, Luna, Canela..."
            value={mascota.nombre} onChange={e => onUpdate(index, "nombre", e.target.value)}
            className={`input-field ${errors?.nombre ? "input-error" : ""}`} />
          <FieldError msg={errors?.nombre} />
        </div>
        {/* Especie */}
        <div>
          <FieldLabel required>Especie</FieldLabel>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {ESPECIES.map(esp => {
              const sel = mascota.especie === esp.value;
              return (
                <button key={esp.value} type="button" onClick={() => onUpdate(index, "especie", esp.value)}
                  className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border-2 transition-all select-none active:scale-[0.95]"
                  style={{ borderColor: sel ? p.accent : "var(--color-border)", backgroundColor: sel ? p.bg : "var(--color-primary-lt)", color: sel ? p.accent : "var(--color-muted)", fontWeight: sel ? "700" : "500", transform: sel ? "scale(1.03)" : "scale(1)" }}>
                  <span className="text-xl">{esp.icon}</span>
                  <span className="text-[9px] uppercase tracking-wide">{esp.label}</span>
                </button>
              );
            })}
          </div>
          <FieldError msg={errors?.especie} />
        </div>
        {/* Raza */}
        <div>
          <FieldLabel htmlFor={`m-raza-${index}`} required>Raza</FieldLabel>
          <input id={`m-raza-${index}`} type="text" placeholder="Ej. Golden Retriever, Persa, Criolla..."
            value={mascota.raza} onChange={e => onUpdate(index, "raza", e.target.value)}
            className={`input-field ${errors?.raza ? "input-error" : ""}`} />
          <FieldError msg={errors?.raza} />
        </div>
      </div>
    </div>
  );
}

/* Summary Row */
function SummaryRow({ label, value }) {
  return (
    <div className="flex items-start justify-between py-2.5 border-b" style={{ borderColor: "var(--color-border)" }}>
      <span className="text-[11px] font-bold uppercase tracking-wider" style={{ color: "var(--color-muted)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{label}</span>
      <span className="text-sm font-semibold text-right ml-4" style={{ color: "var(--color-text)" }}>{value || "—"}</span>
    </div>
  );
}

/* Main Page */
export default function RegistrarPage() {
  const [step,     setStep]     = useState(1);
  const [form,     setForm]     = useState(FORM_INIT);
  const [errors,   setErrors]   = useState({ cliente: {}, mascotas: [{}] });
  const [loading,  setLoading]  = useState(false);
  const [success,  setSuccess]  = useState(null);
  const [apiError, setApiError] = useState("");

  /* Helpers */
  function setCliente(field, value) { setForm(f => ({ ...f, cliente: { ...f.cliente, [field]: value } })); }
  function updateMascota(index, field, value) {
    setForm(f => ({ ...f, mascotas: f.mascotas.map((m, i) => i === index ? { ...m, [field]: value } : m) }));
  }
  function addMascota() {
    if (form.mascotas.length >= 10) return;
    setForm(f => ({ ...f, mascotas: [...f.mascotas, { ...MASCOTA_INIT }] }));
    setErrors(e => ({ ...e, mascotas: [...e.mascotas, {}] }));
  }
  function removeMascota(index) {
    if (form.mascotas.length <= 1) return;
    setForm(f => ({ ...f, mascotas: f.mascotas.filter((_, i) => i !== index) }));
    setErrors(e => ({ ...e, mascotas: e.mascotas.filter((_, i) => i !== index) }));
  }

  /* Step navigation */
  function goNext() {
    if (step === 1) {
      const ce = validateCliente(form.cliente);
      if (Object.keys(ce).length) { setErrors(e => ({ ...e, cliente: ce })); return; }
      setErrors(e => ({ ...e, cliente: {} }));
    }
    if (step === 2) {
      const me = validateMascotas(form.mascotas);
      if (me.some(m => Object.keys(m).length)) { setErrors(e => ({ ...e, mascotas: me })); return; }
      setErrors(e => ({ ...e, mascotas: form.mascotas.map(() => ({})) }));
    }
    setStep(s => Math.min(s + 1, 3));
  }
  function goBack() { setStep(s => Math.max(s - 1, 1)); }

  /* Submit */
  async function handleSubmit() {
    setLoading(true);
    setApiError("");
    setSuccess(null);
    try {
      const { data } = await api.post("/clientes/registrar", form);
      setSuccess(data);
      setForm(FORM_INIT);
      setErrors({ cliente: {}, mascotas: [{}] });
      setStep(1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      const status = err.response?.status;
      const body   = err.response?.data;
      if (status === 409) setApiError("El correo electronico ya esta registrado en el sistema.");
      else if (status === 400 && body?.errors) {
        const mapped = { cliente: {}, mascotas: form.mascotas.map(() => ({})) };
        body.errors.forEach(({ path, message }) => {
          const parts = path.split(".");
          if (parts[0] === "cliente" && parts[1]) mapped.cliente[parts[1]] = message;
          else if (parts[0] === "mascotas" && parts[2]) {
            const idx = Number(parts[1]);
            if (!isNaN(idx)) mapped.mascotas[idx][parts[2]] = message;
          }
        });
        setErrors(mapped);
        setStep(1);
      }
      else if (status === 403) setApiError("No tienes permisos para realizar esta accion.");
      else setApiError("Error al registrar. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">

      {/* Page Header */}
      <div className="flex items-center gap-3.5 mb-2">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: "var(--color-primary-lt)", border: "1.5px solid var(--color-primary-bd)" }}>
          <Notebook size={18} weight="bold" style={{ color: "var(--color-primary)" }} />
        </div>
        <div>
          <h1 className="page-title">Nuevo Registro</h1>
          <p className="page-subtitle">Registra al propietario y sus mascotas en una sola transaccion.</p>
        </div>
      </div>

      {/* Success */}
      {success && (
        <div className="flex items-start gap-3 p-4 rounded-2xl border"
          style={{ backgroundColor: "var(--color-success-bg)", borderColor: "var(--color-success)" }}>
          <CheckCircle size={20} weight="fill" style={{ color: "var(--color-success)", flexShrink: 0 }} />
          <div>
            <p className="font-semibold text-sm" style={{ color: "var(--color-success)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
              Registro exitoso
            </p>
            <p className="text-xs mt-1 leading-relaxed" style={{ color: "var(--color-success)" }}>
              Propietario <strong>{success.cliente.nombre}</strong> registrado con <strong>{success.mascotas.length} {success.mascotas.length === 1 ? "mascota" : "mascotas"}</strong>: {success.mascotas.map(m => m.nombre).join(", ")}.
            </p>
          </div>
        </div>
      )}

      {/* API Error */}
      {apiError && (
        <div className="flex items-center gap-3 p-4 rounded-2xl border text-xs"
          style={{ backgroundColor: "var(--color-danger-bg)", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
          <WarningCircle size={18} weight="bold" style={{ flexShrink: 0 }} />
          <span className="font-semibold">{apiError}</span>
        </div>
      )}

      {/* Wizard Card */}
      <div className="rounded-2xl border" style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-modal)" }}>
        <div className="p-6 border-b" style={{ borderColor: "var(--color-border)" }}>
          <StepperHeader step={step} />

          {/* Step 1: Propietario */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <FieldLabel htmlFor="c-nombre" required>Nombre completo</FieldLabel>
                <div className="relative">
                  <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
                  <input id="c-nombre" type="text" placeholder="Ej. Ana Garcia Lopez"
                    value={form.cliente.nombre} onChange={e => setCliente("nombre", e.target.value)}
                    className={`input-field pl-10 ${errors.cliente.nombre ? "input-error" : ""}`} />
                </div>
                <FieldError msg={errors.cliente.nombre} />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <FieldLabel htmlFor="c-tel" required>Telefono</FieldLabel>
                  <div className="relative">
                    <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
                    <input id="c-tel" type="tel" placeholder="3001234567"
                      value={form.cliente.telefono} onChange={e => setCliente("telefono", e.target.value)}
                      className={`input-field pl-10 ${errors.cliente.telefono ? "input-error" : ""}`} />
                  </div>
                  <FieldError msg={errors.cliente.telefono} />
                </div>
                <div>
                  <FieldLabel htmlFor="c-correo" required>Correo electronico</FieldLabel>
                  <div className="relative">
                    <Envelope size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
                    <input id="c-correo" type="email" placeholder="ana@correo.com"
                      value={form.cliente.correo} onChange={e => setCliente("correo", e.target.value)}
                      className={`input-field pl-10 ${errors.cliente.correo ? "input-error" : ""}`} />
                  </div>
                  <FieldError msg={errors.cliente.correo} />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Mascotas */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-muted)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  {form.mascotas.length} {form.mascotas.length === 1 ? "mascota" : "mascotas"} registradas
                </p>
                <span className="text-[10px]" style={{ color: "var(--color-muted)" }}>Maximo 10</span>
              </div>
              {form.mascotas.map((mascota, i) => (
                <PetCard key={i} mascota={mascota} index={i} onUpdate={updateMascota} onRemove={removeMascota}
                  errors={errors.mascotas?.[i]} canRemove={form.mascotas.length > 1} />
              ))}
              {form.mascotas.length < 10 && (
                <button type="button" onClick={addMascota}
                  className="w-full py-3.5 rounded-2xl font-bold text-xs uppercase tracking-wider select-none border-2 border-dashed transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                  style={{ borderColor: "var(--color-primary-bd)", backgroundColor: "var(--color-primary-lt)", color: "var(--color-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <Plus size={14} weight="bold" />Agregar otra mascota
                </button>
              )}
            </div>
          )}

          {/* Step 3: Summary */}
          {step === 3 && (
            <div className="animate-fade-in space-y-5">
              {/* Owner summary */}
              <div>
                <p className="section-title mb-3">Propietario</p>
                <div className="rounded-xl border overflow-hidden" style={{ borderColor: "var(--color-border)" }}>
                  <div className="px-4 divide-y" style={{ divideColor: "var(--color-border)" }}>
                    <SummaryRow label="Nombre"  value={form.cliente.nombre} />
                    <SummaryRow label="Telefono" value={form.cliente.telefono} />
                    <SummaryRow label="Correo"  value={form.cliente.correo} />
                  </div>
                </div>
              </div>
              {/* Pets summary */}
              <div>
                <p className="section-title mb-3">
                  Mascotas ({form.mascotas.length})
                </p>
                <div className="space-y-3">
                  {form.mascotas.map((m, i) => {
                    const p = getPalette(i);
                    const esp = ESPECIES.find(e => e.value === m.especie);
                    return (
                      <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border"
                        style={{ backgroundColor: p.bg, borderColor: p.bd }}>
                        <span className="text-2xl">{esp?.icon || "🐾"}</span>
                        <div>
                          <p className="font-bold text-sm" style={{ color: p.accent, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{m.nombre || "—"}</p>
                          <p className="text-[11px]" style={{ color: "var(--color-muted)" }}>{m.especie} · {m.raza || "—"}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between p-5">
          <div>
            {step > 1 && (
              <button type="button" onClick={goBack}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border font-semibold text-sm transition-all active:scale-[0.97]"
                style={{ borderColor: "var(--color-border)", color: "var(--color-muted)", backgroundColor: "white", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <ArrowLeft size={15} weight="bold" />Atras
              </button>
            )}
          </div>
          <div className="flex items-center gap-3">
            <p className="text-[11px] font-medium hidden sm:block" style={{ color: "var(--color-muted)" }}>
              Paso {step} de {STEPS.length}
            </p>
            {step < 3 ? (
              <button type="button" onClick={goNext}
                className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.97]"
                style={{ backgroundColor: "var(--color-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                Continuar<ArrowRight size={15} weight="bold" />
              </button>
            ) : (
              <button type="button" onClick={handleSubmit} disabled={loading}
                className="flex items-center gap-2 px-5 py-2 rounded-xl font-semibold text-sm text-white transition-all active:scale-[0.97] disabled:opacity-60"
                style={{ backgroundColor: "var(--color-success)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                {loading ? (
                  <><Spinner size="sm" />Guardando...</>
                ) : (
                  <><Check size={15} weight="bold" />Confirmar y Registrar</>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

