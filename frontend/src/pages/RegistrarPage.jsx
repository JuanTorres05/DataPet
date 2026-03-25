import { useState } from 'react';
import Navbar from '../components/Navbar';
import Spinner from '../components/Spinner';
import api from '../services/api';

const GREEN = '#2E8B57';
const BLUE  = '#2C7BE5';

const FORM_INIT = {
  cliente: { nombre: '', telefono: '', correo: '' },
  mascota: { nombre: '', especie: '', raza: '' },
};

const telefonoRegex = /^[0-9+\-\s]{7,15}$/;

function validate(form) {
  const e = { cliente: {}, mascota: {} };
  if (!form.cliente.nombre.trim()) e.cliente.nombre = 'Obligatorio.';
  if (!telefonoRegex.test(form.cliente.telefono)) e.cliente.telefono = 'Teléfono inválido (7-15 dígitos).';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.cliente.correo)) e.cliente.correo = 'Correo no válido.';
  if (!form.mascota.nombre.trim()) e.mascota.nombre = 'Obligatorio.';
  if (!form.mascota.especie.trim()) e.mascota.especie = 'Obligatorio.';
  if (!form.mascota.raza.trim()) e.mascota.raza = 'Obligatorio.';
  const hasErrors = Object.keys(e.cliente).length > 0 || Object.keys(e.mascota).length > 0;
  return hasErrors ? e : null;
}

const ESPECIES = [
  { value: 'Perro',  icon: '🐕' },
  { value: 'Gato',   icon: '🐈' },
  { value: 'Ave',    icon: '🦜' },
  { value: 'Conejo', icon: '🐇' },
  { value: 'Reptil', icon: '🦎' },
  { value: 'Otro',   icon: '🐾' },
];

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
      <span>●</span>{msg}
    </p>
  );
}

export default function RegistrarPage() {
  const [form, setForm]       = useState(FORM_INIT);
  const [errors, setErrors]   = useState({ cliente: {}, mascota: {} });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [apiError, setApiError] = useState('');

  function setCliente(field, value) { setForm((f) => ({ ...f, cliente: { ...f.cliente, [field]: value } })); }
  function setMascota(field, value) { setForm((f) => ({ ...f, mascota: { ...f.mascota, [field]: value } })); }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate(form);
    if (v) { setErrors(v); return; }
    setLoading(true); setApiError(''); setSuccess(null); setErrors({ cliente: {}, mascota: {} });
    try {
      const { data } = await api.post('/clientes/registrar', form);
      setSuccess(data); setForm(FORM_INIT);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      const status = err.response?.status;
      const body   = err.response?.data;
      if (status === 409) setApiError('El correo electrónico ya está registrado en el sistema.');
      else if (status === 400 && body?.errors) {
        const mapped = { cliente: {}, mascota: {} };
        body.errors.forEach(({ path, message }) => {
          const [section, field] = path.split('.');
          if (section && field) mapped[section][field] = message;
        });
        setErrors(mapped);
      } else if (status === 403) setApiError('No tienes permisos para realizar esta acción.');
      else setApiError('Error al registrar. Intenta nuevamente.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#F5F7FA' }}>
      <Navbar />

      <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-8">

        {/* Header */}
        <div className="mb-7 animate-fade-in">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-xl"
              style={{ backgroundColor: GREEN, boxShadow: '0 2px 8px rgba(46,139,87,0.30)' }}
            >
              ➕
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-800">Registrar Cliente y Mascota</h1>
              <p className="text-sm text-slate-500 mt-0.5">Completa el formulario para crear un nuevo registro en el sistema</p>
            </div>
          </div>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-2 mb-8">
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold text-white"
            style={{ backgroundColor: GREEN }}
          >
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-xs" style={{ backgroundColor: 'rgba(255,255,255,0.25)' }}>1</span>
            Propietario
          </div>
          <div className="h-px flex-1 bg-slate-200" />
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-full text-xs font-semibold">
            <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-400">2</span>
            Mascota
          </div>
          <div className="h-px flex-1 bg-slate-200" />
          <div className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 text-slate-500 rounded-full text-xs font-semibold">
            <span className="w-5 h-5 bg-slate-100 rounded-full flex items-center justify-center text-xs text-slate-400">✓</span>
            Confirmar
          </div>
        </div>

        {/* Success */}
        {success && (
          <div className="alert-success mb-6 animate-slide-up">
            <span className="text-2xl">✅</span>
            <div>
              <p className="font-bold text-base">¡Registro exitoso!</p>
              <p className="text-sm mt-0.5">
                Cliente <strong>{success.cliente.nombre}</strong> y mascota{' '}
                <strong>{success.mascota.nombre}</strong> creados correctamente.
              </p>
            </div>
          </div>
        )}

        {apiError && (
          <div className="alert-error mb-6">
            <span className="text-xl">⚠️</span>
            <span>{apiError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-6">

          {/* Sección Propietario */}
          <div className="bg-white rounded-xl overflow-hidden border border-slate-100" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{ backgroundColor: '#f0faf4', borderBottom: '1px solid #bae8ce' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ backgroundColor: GREEN }}>👤</div>
              <div>
                <h2 className="font-bold text-sm" style={{ color: '#1d5e39' }}>Datos del Propietario</h2>
                <p className="text-xs" style={{ color: '#247548' }}>Información de contacto del dueño</p>
              </div>
            </div>
            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div className="sm:col-span-2">
                <label className="label" htmlFor="c-nombre">Nombre completo *</label>
                <input id="c-nombre" type="text" placeholder="Ej. Ana García"
                  value={form.cliente.nombre} onChange={(e) => setCliente('nombre', e.target.value)}
                  className={`input-field ${errors.cliente.nombre ? 'input-error' : ''}`} />
                <FieldError msg={errors.cliente.nombre} />
              </div>
              <div>
                <label className="label" htmlFor="c-tel">Teléfono *</label>
                <input id="c-tel" type="tel" placeholder="Ej. 3001234567"
                  value={form.cliente.telefono} onChange={(e) => setCliente('telefono', e.target.value)}
                  className={`input-field ${errors.cliente.telefono ? 'input-error' : ''}`} />
                <FieldError msg={errors.cliente.telefono} />
              </div>
              <div>
                <label className="label" htmlFor="c-correo">Correo electrónico *</label>
                <input id="c-correo" type="email" placeholder="ana@correo.com"
                  value={form.cliente.correo} onChange={(e) => setCliente('correo', e.target.value)}
                  className={`input-field ${errors.cliente.correo ? 'input-error' : ''}`} />
                <FieldError msg={errors.cliente.correo} />
              </div>
            </div>
          </div>

          {/* Sección Mascota */}
          <div className="bg-white rounded-xl overflow-hidden border border-slate-100" style={{ boxShadow: '0 2px 12px rgba(0,0,0,0.06)' }}>
            <div
              className="px-6 py-4 flex items-center gap-3"
              style={{ backgroundColor: '#eff6ff', borderBottom: '1px solid #bfdbfe' }}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm" style={{ backgroundColor: BLUE }}>🐾</div>
              <div>
                <h2 className="font-bold text-sm" style={{ color: '#1d4ed8' }}>Datos de la Mascota</h2>
                <p className="text-xs" style={{ color: '#2563da' }}>Información del paciente veterinario</p>
              </div>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="label" htmlFor="m-nombre">Nombre de la mascota *</label>
                <input id="m-nombre" type="text" placeholder="Ej. Max, Luna, Coco…"
                  value={form.mascota.nombre} onChange={(e) => setMascota('nombre', e.target.value)}
                  className={`input-field ${errors.mascota.nombre ? 'input-error' : ''}`} />
                <FieldError msg={errors.mascota.nombre} />
              </div>

              {/* Selector visual de especie */}
              <div>
                <label className="label">Especie *</label>
                <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                  {ESPECIES.map((esp) => {
                    const selected = form.mascota.especie === esp.value;
                    return (
                      <button
                        key={esp.value}
                        type="button"
                        onClick={() => setMascota('especie', esp.value)}
                        className="flex flex-col items-center gap-1 p-3 rounded-xl text-xs font-semibold transition-all duration-150"
                        style={{
                          border: selected ? `2px solid ${BLUE}` : '2px solid #e2e8f0',
                          backgroundColor: selected ? '#eff6ff' : '#fff',
                          color: selected ? '#1d4ed8' : '#64748b',
                        }}
                      >
                        <span className="text-2xl">{esp.icon}</span>
                        {esp.value}
                      </button>
                    );
                  })}
                </div>
                <FieldError msg={errors.mascota.especie} />
              </div>

              <div>
                <label className="label" htmlFor="m-raza">Raza *</label>
                <input id="m-raza" type="text" placeholder="Ej. Labrador, Persa, Canario…"
                  value={form.mascota.raza} onChange={(e) => setMascota('raza', e.target.value)}
                  className={`input-field ${errors.mascota.raza ? 'input-error' : ''}`} />
                <FieldError msg={errors.mascota.raza} />
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="flex items-center justify-between pt-2">
            <p className="text-slate-400 text-xs">* Campos obligatorios</p>
            <button type="submit" disabled={loading} className="btn-primary px-8 py-3 text-base gap-2">
              {loading ? <><Spinner size="sm" /> Guardando…</> : <><span>✅</span> Guardar Registro</>}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
