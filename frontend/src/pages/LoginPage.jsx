import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';

const GREEN = '#2E8B57';
const GREEN_DK = '#247548';

function getRolRedirect(rol) {
  if (rol === 'recepcionista') return '/registrar';
  return '/dashboard';
}

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ cedula: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function validate() {
    const e = {};
    if (!form.cedula.trim()) e.cedula = 'La cédula es obligatoria.';
    if (form.password.length < 6) e.password = 'Mínimo 6 caracteres.';
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    setApiError('');
    setErrors({});
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.token, data.user);
      navigate(getRolRedirect(data.user.rol), { replace: true });
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setApiError('Cédula o contraseña incorrectos.');
      else if (status === 400) setApiError('Por favor verifica los datos ingresados.');
      else setApiError('Error de conexión. Verifica que el servidor esté activo.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: '#F5F7FA' }}>

      {/* Panel izquierdo — branding verde */}
      <div
        className="hidden lg:flex flex-col justify-between w-[45%] p-12 relative overflow-hidden"
        style={{ backgroundColor: GREEN }}
      >
        <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.12)' }} />
        <div className="absolute -bottom-16 -left-16 w-60 h-60 rounded-full" style={{ backgroundColor: 'rgba(0,0,0,0.12)' }} />
        <div className="absolute top-1/2 right-8 w-32 h-32 rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.08)' }} />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: 'rgba(255,255,255,0.2)' }}>
            <span className="text-2xl">🐾</span>
          </div>
          <span className="text-white font-bold text-xl tracking-tight">DataVet</span>
        </div>

        {/* Ilustración central */}
        <div className="relative z-10 text-center">
          <div className="text-8xl mb-6 animate-pulse-soft">🐕</div>
          <h2 className="text-white text-3xl font-bold leading-tight mb-4">
            Cuida a tus pacientes<br />con tecnología
          </h2>
          <p className="text-base leading-relaxed" style={{ color: 'rgba(255,255,255,0.80)' }}>
            Gestión veterinaria moderna, rápida y confiable.<br />
            Todo lo que necesitas en un solo lugar.
          </p>

          <div className="mt-8 space-y-3">
            {[
              { icon: '📋', text: 'Registro de clientes y mascotas' },
              { icon: '🗓️', text: 'Agenda de citas inteligente' },
              { icon: '🔒', text: 'Acceso seguro por roles' },
            ].map(f => (
              <div
                key={f.text}
                className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-left"
                style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
              >
                <span className="text-xl">{f.icon}</span>
                <span className="text-white text-sm font-medium">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative z-10">
          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.60)' }}>
            DATAVET © {new Date().getFullYear()} · Todos los derechos reservados
          </p>
        </div>
      </div>

      {/* Panel derecho — formulario */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md animate-fade-in">

          {/* Header móvil */}
          <div className="lg:hidden text-center mb-8">
            <div
              className="inline-flex w-14 h-14 rounded-2xl items-center justify-center mb-3"
              style={{ backgroundColor: GREEN }}
            >
              <span className="text-3xl">🐾</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-800">DataVet</h1>
            <p className="text-slate-500 text-sm">Sistema de gestión veterinaria</p>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800">Bienvenido de vuelta 👋</h2>
            <p className="text-slate-500 text-sm mt-1">Ingresa tus credenciales para continuar</p>
          </div>

          {apiError && (
            <div className="alert-error mb-6">
              <span className="text-lg">⚠️</span>
              <span>{apiError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            <div>
              <label className="label" htmlFor="cedula">Número de cédula</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base select-none">🪪</span>
                <input
                  id="cedula" type="text" autoComplete="username"
                  placeholder="Ej. 1234567890"
                  value={form.cedula}
                  onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                  className={`input-field pl-10 ${errors.cedula ? 'input-error' : ''}`}
                />
              </div>
              {errors.cedula && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>●</span>{errors.cedula}</p>}
            </div>

            <div>
              <label className="label" htmlFor="password">Contraseña</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-base select-none">🔑</span>
                <input
                  id="password"
                  type={showPass ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={`input-field pl-10 pr-12 ${errors.password ? 'input-error' : ''}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-sm transition-colors"
                  tabIndex={-1}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>●</span>{errors.password}</p>}
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? <><Spinner size="sm" /> Verificando…</> : 'Ingresar al sistema'}
            </button>
          </form>

          {/* Hint usuarios de prueba */}
          <div className="mt-8 p-4 rounded-xl border" style={{ backgroundColor: '#eff6ff', borderColor: '#bfdbfe' }}>
            <p className="text-xs font-semibold mb-2" style={{ color: '#2C7BE5' }}>🧪 Usuarios de prueba</p>
            <div className="space-y-1">
              {[
                { rol: 'Admin', cedula: '0000000001' },
                { rol: 'Veterinario', cedula: '0000000002' },
                { rol: 'Recepcionista', cedula: '0000000003' },
              ].map(u => (
                <div key={u.rol} className="flex justify-between text-xs" style={{ color: '#2563da' }}>
                  <span className="font-medium">{u.rol}</span>
                  <span>{u.cedula} · <em>test1234</em></span>
                </div>
              ))}
            </div>
          </div>

          <p className="text-center text-slate-300 text-xs mt-8">DATAVET © {new Date().getFullYear()}</p>
        </div>
      </div>
    </div>
  );
}
