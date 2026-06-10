import { useState } from 'react';
import Spinner from '../components/Spinner';
import api from '../services/api';
import { 
  User, 
  Phone, 
  Envelope, 
  Plus, 
  Trash, 
  Check, 
  WarningCircle, 
  Notebook,
  Cat
} from '@phosphor-icons/react';

/* ── Constantes ─────────────────────────────────────── */
const MASCOTA_INIT = { nombre: '', especie: '', raza: '' };

const FORM_INIT = {
  cliente: { nombre: '', telefono: '', correo: '' },
  mascotas: [{ ...MASCOTA_INIT }],
};

const telefonoRegex = /^[0-9+\-\s]{7,15}$/;

const ESPECIES = [
  { value: 'Perro',  icon: '🐕', label: 'Perro'  },
  { value: 'Gato',   icon: '🐈', label: 'Gato'   },
  { value: 'Ave',    icon: '🦜', label: 'Ave'     },
  { value: 'Conejo', icon: '🐇', label: 'Conejo'  },
  { value: 'Reptil', icon: '🦎', label: 'Reptil'  },
  { value: 'Otro',   icon: '🐾', label: 'Otro'    },
];

const PET_PALETTE = [
  { accent: '#2A6B7C', bg: '#F0F7F9', tag: 'Mascota' },
  { accent: '#7B5EA7', bg: '#F5F0FF', tag: 'Mascota' },
  { accent: '#C0720A', bg: '#FFF5E6', tag: 'Mascota' },
  { accent: '#2E7D52', bg: '#EBF5EF', tag: 'Mascota' },
  { accent: '#B03060', bg: '#FFF0F5', tag: 'Mascota' },
];

/* ── Helpers ─────────────────────────────────────────── */
function validate(form) {
  const e = { cliente: {}, mascotas: form.mascotas.map(() => ({})) };
  if (!form.cliente.nombre.trim())                               e.cliente.nombre   = 'Nombre obligatorio.';
  if (!telefonoRegex.test(form.cliente.telefono))                e.cliente.telefono = 'Teléfono inválido (7-15 dígitos).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.cliente.correo)) e.cliente.correo   = 'Correo no válido.';
  form.mascotas.forEach((m, i) => {
    if (!m.nombre.trim())  e.mascotas[i].nombre  = 'Nombre obligatorio.';
    if (!m.especie.trim()) e.mascotas[i].especie = 'Selecciona una especie.';
    if (!m.raza.trim())    e.mascotas[i].raza    = 'Raza obligatoria.';
  });
  const hasErrors = Object.keys(e.cliente).length > 0 || e.mascotas.some(m => Object.keys(m).length > 0);
  return hasErrors ? e : null;
}

function getPaletteForIndex(i) {
  return PET_PALETTE[i % PET_PALETTE.length];
}

/* ── Sub-componentes ─────────────────────────────────── */
function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-[11px] mt-1.5 font-semibold select-none text-[#C0392B]">
      <span>▲</span>{msg}
    </p>
  );
}

function Label({ htmlFor, children, required }) {
  return (
    <label
      htmlFor={htmlFor}
      className="block font-semibold uppercase mb-1.5 select-none text-xs text-[#5C7078] tracking-wider"
      style={{ letterSpacing: '0.06em' }}
    >
      {children}
      {required && <span className="ml-1 text-[#C0392B]">*</span>}
    </label>
  );
}

function PetCard({ mascota, index, onUpdate, onRemove, errors, canRemove }) {
  const palette = getPaletteForIndex(index);

  return (
    <div className="bezel-card-outer">
      <div className="bezel-card-inner !p-0 overflow-hidden">
        
        {/* Card header con acento de color y número */}
        <div
          className="flex items-center justify-between px-5 py-4 border-b transition-colors duration-500"
          style={{ backgroundColor: palette.bg, borderColor: palette.accent + '25' }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold select-none"
              style={{ backgroundColor: palette.accent }}
            >
              {index + 1}
            </div>
            <div>
              <span className="font-bold text-sm flex items-center gap-1.5" style={{ color: palette.accent }}>
                <Cat size={16} weight="bold" />
                {mascota.nombre.trim() ? mascota.nombre : `Mascota #${index + 1}`}
              </span>
            </div>
          </div>

          {canRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              className="px-3 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider border transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.95] flex items-center gap-1.5"
              style={{ 
                color: '#C0392B', 
                backgroundColor: '#FDECEA', 
                borderColor: '#C0392B30' 
              }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FCDCDA'; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#FDECEA'; }}
            >
              <Trash size={13} />
              <span>Eliminar</span>
            </button>
          )}
        </div>

        {/* Campos del formulario */}
        <div className="p-5 space-y-4">
          
          {/* Nombre */}
          <div className="space-y-1.5">
            <Label htmlFor={`m-nombre-${index}`} required>Nombre de la mascota</Label>
            <input
              id={`m-nombre-${index}`}
              type="text"
              placeholder="Ej. Max, Luna, Canela…"
              value={mascota.nombre}
              onChange={(e) => onUpdate(index, 'nombre', e.target.value)}
              className={`input-field ${errors?.nombre ? 'input-error' : ''}`}
            />
            <FieldError msg={errors?.nombre} />
          </div>

          {/* Especie — selector visual táctil */}
          <div className="space-y-1.5">
            <Label required>Especie</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {ESPECIES.map((esp) => {
                const selected = mascota.especie === esp.value;
                return (
                  <button
                    key={esp.value}
                    type="button"
                    onClick={() => onUpdate(index, 'especie', esp.value)}
                    className="flex flex-col items-center justify-center gap-1.5 h-16 rounded-xl border-2 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] select-none active:scale-[0.95]"
                    style={{
                      borderColor: selected ? palette.accent : '#E2E8EA',
                      backgroundColor: selected ? palette.bg : '#FAFAFA',
                      color: selected ? palette.accent : '#5C7078',
                      fontWeight: selected ? '700' : '500',
                      transform: selected ? 'scale(1.02)' : 'scale(1)'
                    }}
                  >
                    <span className="text-2xl">{esp.icon}</span>
                    <span className="text-[10px] uppercase tracking-wide">{esp.label}</span>
                  </button>
                );
              })}
            </div>
            <FieldError msg={errors?.especie} />
          </div>

          {/* Raza */}
          <div className="space-y-1.5">
            <Label htmlFor={`m-raza-${index}`} required>Raza</Label>
            <input
              id={`m-raza-${index}`}
              type="text"
              placeholder="Ej. Golden Retriever, Persa, Criolla…"
              value={mascota.raza}
              onChange={(e) => onUpdate(index, 'raza', e.target.value)}
              className={`input-field ${errors?.raza ? 'input-error' : ''}`}
            />
            <FieldError msg={errors?.raza} />
          </div>

        </div>

      </div>
    </div>
  );
}

/* ── Página principal ────────────────────────────────── */
export default function RegistrarPage() {
  const [form, setForm]         = useState(FORM_INIT);
  const [errors, setErrors]     = useState({ cliente: {}, mascotas: [{}] });
  const [loading, setLoading]   = useState(false);
  const [success, setSuccess]   = useState(null);
  const [apiError, setApiError] = useState('');

  /* Cliente helpers */
  function setCliente(field, value) {
    setForm(f => ({ ...f, cliente: { ...f.cliente, [field]: value } }));
  }

  /* Mascota helpers */
  function updateMascota(index, field, value) {
    setForm(f => {
      const mascotas = f.mascotas.map((m, i) => i === index ? { ...m, [field]: value } : m);
      return { ...f, mascotas };
    });
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

  /* Submit */
  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate(form);
    if (v) { setErrors(v); return; }

    setLoading(true);
    setApiError('');
    setSuccess(null);
    setErrors({ cliente: {}, mascotas: form.mascotas.map(() => ({})) });

    try {
      const { data } = await api.post('/clientes/registrar', form);
      setSuccess(data);
      setForm(FORM_INIT);
      setErrors({ cliente: {}, mascotas: [{}] });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const status = err.response?.status;
      const body   = err.response?.data;

      if (status === 409)                      setApiError('El correo electrónico ya está registrado en el sistema.');
      else if (status === 400 && body?.errors) {
        const mapped = { cliente: {}, mascotas: form.mascotas.map(() => ({})) };
        body.errors.forEach(({ path, message }) => {
          const parts = path.split('.');
          if (parts[0] === 'cliente' && parts[1]) {
            mapped.cliente[parts[1]] = message;
          } else if (parts[0] === 'mascotas' && parts[2]) {
            const idx = Number(parts[1]);
            if (!isNaN(idx)) mapped.mascotas[idx][parts[2]] = message;
          }
        });
        setErrors(mapped);
      }
      else if (status === 403)                 setApiError('No tienes permisos para realizar esta acción.');
      else                                     setApiError('Error al registrar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  }

  const totalMascotas = form.mascotas.length;

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* ── Page Header ─────────────────────────────────── */}
      <div className="flex items-center justify-between flex-wrap gap-4 page-header">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#F0F7F9] text-[#2A6B7C] border border-[#C2DCE2] flex-shrink-0">
            <Notebook size={22} weight="bold" />
          </div>
          <div>
            <h1 className="page-title">Nuevo Registro</h1>
            <p className="page-subtitle">
              Registra al propietario y sus mascotas simultáneamente en una sola transacción.
            </p>
          </div>
        </div>
      </div>

      {/* ── Éxito ── */}
      {success && (
        <div className="alert-success">
          <Check size={20} className="flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">¡Registro exitoso!</p>
            <p className="text-xs mt-1 leading-relaxed">
              Propietario <strong>{success.cliente.nombre}</strong> registrado con{' '}
              <strong>{success.mascotas.length} {success.mascotas.length === 1 ? 'mascota' : 'mascotas'}</strong>:{' '}
              {success.mascotas.map(m => m.nombre).join(', ')}.
            </p>
          </div>
        </div>
      )}

      {/* ── Error de API ── */}
      {apiError && (
        <div className="alert-error">
          <WarningCircle size={20} className="flex-shrink-0" />
          <span className="text-xs font-semibold">{apiError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">

        {/* ── Sección 1: Propietario ── */}
        <div className="bezel-card-outer">
          <div className="bezel-card-inner !p-0 overflow-hidden">

            <div className="px-5 py-4 flex items-center gap-3 border-b border-[#E2E8EA] bg-[#F7F8FA]">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[#2A6B7C] select-none">
                1
              </div>
              <div>
                <h2 className="font-bold text-[#1A2B30] text-sm uppercase tracking-wider">Datos del Propietario</h2>
                <p className="text-[10px] text-[#5C7078] font-medium uppercase tracking-wide mt-0.5">Contacto principal</p>
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="c-nombre" required>Nombre completo</Label>
                <div className="relative">
                  <User size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C7078]" />
                  <input
                    id="c-nombre"
                    type="text"
                    placeholder="Ej. Ana García López"
                    value={form.cliente.nombre}
                    onChange={e => setCliente('nombre', e.target.value)}
                    className={`input-field pl-11 ${errors.cliente.nombre ? 'input-error' : ''}`}
                  />
                </div>
                <FieldError msg={errors.cliente.nombre} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="c-tel" required>Teléfono</Label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C7078]" />
                    <input
                      id="c-tel"
                      type="tel"
                      placeholder="3001234567"
                      value={form.cliente.telefono}
                      onChange={e => setCliente('telefono', e.target.value)}
                      className={`input-field pl-11 ${errors.cliente.telefono ? 'input-error' : ''}`}
                    />
                  </div>
                  <FieldError msg={errors.cliente.telefono} />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="c-correo" required>Correo electrónico</Label>
                  <div className="relative">
                    <Envelope size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C7078]" />
                    <input
                      id="c-correo"
                      type="email"
                      placeholder="ana@correo.com"
                      value={form.cliente.correo}
                      onChange={e => setCliente('correo', e.target.value)}
                      className={`input-field pl-11 ${errors.cliente.correo ? 'input-error' : ''}`}
                    />
                  </div>
                  <FieldError msg={errors.cliente.correo} />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ── Sección 2: Mascotas ── */}
        <div className="space-y-4">
          
          {/* Encabezado con contador */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white bg-[#2A6B7C] select-none">
                2
              </div>
              <div>
                <h2 className="font-bold text-[#1A2B30] text-sm uppercase tracking-wider flex items-center gap-2">
                  <span>Mascotas</span>
                  <span className="badge-green lowercase tracking-normal px-2 py-0.5">
                    {totalMascotas} {totalMascotas === 1 ? 'mascota' : 'mascotas'}
                  </span>
                </h2>
                <p className="text-[10px] text-[#5C7078] uppercase font-bold tracking-wider mt-0.5">Máximo 10 mascotas por registro</p>
              </div>
            </div>
          </div>

          {/* Listado de tarjetas de mascotas */}
          <div className="space-y-4">
            {form.mascotas.map((mascota, i) => (
              <PetCard
                key={i}
                mascota={mascota}
                index={i}
                onUpdate={updateMascota}
                onRemove={removeMascota}
                errors={errors.mascotas?.[i]}
                canRemove={form.mascotas.length > 1}
              />
            ))}
          </div>

          {/* Botón agregar mascota */}
          {totalMascotas < 10 && (
            <button
              type="button"
              onClick={addMascota}
              className="w-full py-4 rounded-2xl font-bold text-xs uppercase tracking-wider select-none border-2 border-dashed border-[#2A6B7C]/40 bg-[#F7F8FA] text-[#2A6B7C] hover:bg-[#F0F7F9] hover:border-[#2A6B7C] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.98] flex items-center justify-center gap-2"
            >
              <span>🐾 Agregar otra mascota</span>
            </button>
          )}
        </div>

        {/* Divisor */}
        <div className="border-t border-[#E2E8EA] my-2" />

        {/* CTA Footer */}
        <div className="flex items-center justify-between pb-4">
          <p className="text-[11px] font-medium text-[#5C7078]">
            <span className="text-[#C0392B] font-bold">*</span> Campos obligatorios
          </p>

          <button
            type="submit"
            disabled={loading}
            className="btn-premium-primary min-w-[220px]"
          >
            {loading ? (
              <span className="flex items-center gap-2 mx-auto">
                <Spinner size="sm" /> Guardando…
              </span>
            ) : (
              <>
                <span>Guardar {totalMascotas > 1 ? `${totalMascotas} mascotas` : 'registro'}</span>
                <div className="btn-icon-wrapper">
                  <Check size={12} weight="bold" />
                </div>
              </>
            )}
          </button>
        </div>

      </form>
    </div>
  );
}
