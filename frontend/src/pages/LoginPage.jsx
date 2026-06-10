import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import Spinner from '../components/Spinner';
import { 
  IdentificationCard, 
  Lock, 
  Eye, 
  EyeSlash, 
  ArrowRight,
  ShieldCheck
} from '@phosphor-icons/react';

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
      
      // Redirect according to role
      if (data.user.rol === 'recepcionista') {
        navigate('/registrar', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
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
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F7F8FA] overflow-hidden antialiased">
      
      {/* ── Left Panel: Editorial/Brand Section ── */}
      <div className="md:w-[55%] bg-[#2A6B7C] text-white p-8 md:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-5 pointer-events-none bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        
        {/* Top Header */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center">
            <span className="text-sm">🐾</span>
          </div>
          <span className="font-bold text-sm tracking-tight uppercase tracking-wider">DataVet</span>
        </div>

        {/* Center Copy */}
        <div className="my-auto py-12 relative z-10 max-w-lg">
          <span className="inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-semibold bg-white/10 text-white/90 border border-white/10 mb-6">
            Gestión Inteligente
          </span>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.05] mb-6">
            Care with clarity.
          </h1>
          <p className="text-white/80 text-sm md:text-base max-w-[45ch] leading-relaxed">
            Organiza el flujo de tu clínica en un entorno ágil. Agendamiento operativo, expedientes clínicos unificados y control de caja simplificado.
          </p>
        </div>

        {/* Footer Details */}
        <div className="flex items-center gap-4 text-[10px] text-white/55 uppercase font-medium tracking-[0.15em] relative z-10">
          <span>DataVet Platform</span>
          <span>•</span>
          <span>v2.1.0</span>
          <span>•</span>
          <span>Secure</span>
        </div>
      </div>

      {/* ── Right Panel: Form Section ── */}
      <div className="md:w-[45%] flex items-center justify-center p-6 md:p-12 bg-[#F7F8FA]">
        <div className="w-full max-w-[420px] animate-fade-in">
          
          {/* Double-Bezel Card Container */}
          <div className="bezel-card-outer">
            <div className="bezel-card-inner">
              
              <div className="mb-6">
                <h2 className="text-lg font-bold text-[#1A2B30] tracking-tight">Acceso al Sistema</h2>
                <p className="text-xs text-[#5C7078] mt-1.5 leading-relaxed">
                  Ingresa tu cédula y contraseña asignada por el administrador.
                </p>
              </div>

              {apiError && (
                <div className="alert-error mb-5 text-xs">
                  <span>⚠️</span>
                  <span>{apiError}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate className="space-y-4">
                
                {/* Cédula */}
                <div className="space-y-1.5">
                  <label className="label" htmlFor="cedula">
                    Cédula de Identidad <span className="text-[#C0392B]">*</span>
                  </label>
                  <div className="relative">
                    <IdentificationCard size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C7078]" />
                    <input
                      id="cedula"
                      type="text"
                      autoComplete="username"
                      placeholder="Ej. 0000000001"
                      value={form.cedula}
                      onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                      className={`input-field pl-11 ${errors.cedula ? 'input-error' : ''}`}
                    />
                  </div>
                  {errors.cedula && (
                    <p className="text-[#C0392B] text-[11px] font-medium flex items-center gap-1 select-none">
                      <span>▲</span>{errors.cedula}
                    </p>
                  )}
                </div>

                {/* Contraseña */}
                <div className="space-y-1.5">
                  <label className="label" htmlFor="password">
                    Contraseña <span className="text-[#C0392B]">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#5C7078]" />
                    <input
                      id="password"
                      type={showPass ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className={`input-field pl-11 pr-12 ${errors.password ? 'input-error' : ''}`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C7078] hover:text-[#1A2B30] flex items-center justify-center"
                      tabIndex={-1}
                    >
                      {showPass ? <EyeSlash size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[#C0392B] text-[11px] font-medium flex items-center gap-1 select-none">
                      <span>▲</span>{errors.password}
                    </p>
                  )}
                </div>

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="btn-premium-primary w-full mt-3 uppercase tracking-wider text-xs font-semibold"
                >
                  {loading ? (
                    <span className="flex items-center gap-2 mx-auto">
                      <Spinner size="sm" /> Verificando…
                    </span>
                  ) : (
                    <>
                      <span>Ingresar al sistema</span>
                      <div className="btn-icon-wrapper">
                        <ArrowRight size={12} weight="bold" />
                      </div>
                    </>
                  )}
                </button>
              </form>

              {/* Cuentas de prueba */}
              <div className="mt-6 p-4 rounded-xl border border-[#E2E8EA] bg-[#F7F8FA] space-y-2.5">
                <p className="text-[10px] font-bold text-[#2A6B7C] uppercase tracking-[0.08em] flex items-center gap-1.5">
                  <ShieldCheck size={14} weight="fill" />
                  <span>Accesos de demostración</span>
                </p>
                <div className="space-y-1.5 divide-y divide-[#E2E8EA]">
                  {[
                    { rol: 'Administrador', cedula: '0000000001' },
                    { rol: 'Veterinario', cedula: '0000000002' },
                    { rol: 'Recepcionista', cedula: '0000000003' },
                  ].map((u, i) => (
                    <div key={u.rol} className={`flex justify-between text-[11px] text-[#5C7078] ${i > 0 ? 'pt-1.5' : ''}`}>
                      <span className="font-semibold">{u.rol}</span>
                      <span>{u.cedula} · <em className="not-italic font-semibold text-[#1A2B30]">test1234</em></span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
      
    </div>
  );
}
