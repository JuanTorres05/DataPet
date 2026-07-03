import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";
import Spinner from "../components/Spinner";
import { IdentificationCard, Lock, Eye, EyeSlash, ArrowRight, ShieldCheck, PawPrint } from "@phosphor-icons/react";

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({ cedula: "", password: "" });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  function validate() {
    const e = {};
    if (!form.cedula.trim()) e.cedula = "La cedula es obligatoria.";
    if (form.password.length < 6) e.password = "Minimo 6 caracteres.";
    return e;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const v = validate();
    if (Object.keys(v).length) { setErrors(v); return; }
    setLoading(true);
    setApiError("");
    setErrors({});
    try {
      const { data } = await api.post("/auth/login", form);
      login(data.token, data.user);
      if (data.user.rol === "recepcionista") {
        navigate("/registrar", { replace: true });
      } else {
        navigate("/dashboard", { replace: true });
      }
    } catch (err) {
      const status = err.response?.status;
      if (status === 401) setApiError("Cedula o contrasena incorrectos.");
      else if (status === 400) setApiError("Por favor verifica los datos ingresados.");
      else setApiError("Error de conexion. Verifica que el servidor este activo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row overflow-hidden antialiased"
      style={{ backgroundColor: "var(--color-bg)" }}>

      {/* Left: Brand Panel */}
      <div className="md:w-[52%] flex flex-col justify-between p-8 md:p-14 relative overflow-hidden"
        style={{ backgroundColor: "var(--color-primary)" }}>

        {/* Dot grid */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.06) 1px, transparent 1px)", backgroundSize: "22px 22px" }} />

        {/* Decorative blobs */}
        <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full pointer-events-none"
          style={{ backgroundColor: "rgba(42, 142, 121, 0.15)", filter: "blur(60px)" }} />
        <div className="absolute -bottom-16 -left-12 w-56 h-56 rounded-full pointer-events-none"
          style={{ backgroundColor: "rgba(255,255,255,0.04)", filter: "blur(50px)" }} />

        {/* Logo */}
        <div className="flex items-center gap-3 relative z-10">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center"
            style={{ backgroundColor: "rgba(255,255,255,0.12)", border: "1px solid rgba(255,255,255,0.18)" }}>
            <PawPrint size={15} weight="fill" color="white" />
          </div>
          <span className="font-bold text-sm text-white tracking-tight"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", letterSpacing: "-0.01em" }}>
            DataVet
          </span>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 my-auto py-10 max-w-md">
          <span className="inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.18em] font-semibold mb-6 border"
            style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.8)", borderColor: "rgba(255,255,255,0.12)" }}>
            Sistema de Gestion Veterinaria
          </span>
          <h1 className="font-bold leading-[1.08] mb-5 text-white"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "clamp(2rem, 5vw, 3.2rem)", letterSpacing: "-0.03em" }}>
            Care with<br />clarity.
          </h1>
          <p className="text-sm leading-relaxed max-w-[40ch]"
            style={{ color: "rgba(255,255,255,0.65)" }}>
            Organiza el flujo de tu clinica en un entorno agil. Agendamiento operativo, expedientes clinicos unificados y control simplificado.
          </p>

          {/* Feature pills */}
          <div className="flex flex-wrap gap-2 mt-7">
            {["Agendamiento", "Expedientes Clinicos", "Control de Caja", "Monitoreo"].map(f => (
              <span key={f} className="inline-flex rounded-full text-[10px] font-semibold px-3 py-1"
                style={{ backgroundColor: "rgba(255,255,255,0.08)", color: "rgba(255,255,255,0.7)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {f}
              </span>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 text-[9px] font-semibold uppercase tracking-[0.14em] relative z-10"
          style={{ color: "rgba(255,255,255,0.35)" }}>
          <span>DataVet Platform</span>
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
          <span>v2.1.0</span>
          <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "rgba(255,255,255,0.25)" }} />
          <span>Secure</span>
        </div>
      </div>

      {/* Right: Form Panel */}
      <div className="md:w-[48%] flex items-center justify-center p-6 md:p-12"
        style={{ backgroundColor: "var(--color-bg)" }}>
        <div className="w-full max-w-[400px] animate-fade-in">

          {/* Card */}
          <div className="rounded-2xl border p-7"
            style={{ backgroundColor: "var(--color-surface)", borderColor: "var(--color-border)", boxShadow: "var(--shadow-modal)" }}>

            {/* Card header */}
            <div className="mb-6">
              <div className="flex items-center gap-2.5 mb-4">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: "var(--color-primary-lt)", border: "1px solid var(--color-primary-bd)" }}>
                  <Lock size={16} weight="bold" style={{ color: "var(--color-primary)" }} />
                </div>
                <div>
                  <h2 className="font-bold" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", fontSize: "16px", color: "var(--color-text)", letterSpacing: "-0.02em" }}>
                    Acceso al Sistema
                  </h2>
                </div>
              </div>
              <p className="text-xs leading-relaxed" style={{ color: "var(--color-muted)" }}>
                Ingresa tu cedula y contrasena asignada por el administrador.
              </p>
            </div>

            {/* API Error */}
            {apiError && (
              <div className="flex items-center gap-2.5 p-3.5 rounded-xl border mb-5 text-xs"
                style={{ backgroundColor: "var(--color-danger-bg)", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
                <span className="text-base leading-none">⚠</span>
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} noValidate className="space-y-4">

              {/* Cedula */}
              <div>
                <label className="label" htmlFor="cedula">
                  Cedula de Identidad <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <div className="relative">
                  <IdentificationCard size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-muted)" }} />
                  <input
                    id="cedula" type="text" autoComplete="username" placeholder="Ej. 0000000001"
                    value={form.cedula}
                    onChange={(e) => setForm({ ...form, cedula: e.target.value })}
                    className={`input-field pl-10 ${errors.cedula ? "input-error" : ""}`}
                  />
                </div>
                {errors.cedula && (
                  <p className="text-[11px] font-medium mt-1.5 flex items-center gap-1" style={{ color: "var(--color-danger)" }}>
                    <span>▲</span>{errors.cedula}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="label" htmlFor="password">
                  Contrasena <span style={{ color: "var(--color-danger)" }}>*</span>
                </label>
                <div className="relative">
                  <Lock size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    style={{ color: "var(--color-muted)" }} />
                  <input
                    id="password" type={showPass ? "text" : "password"} autoComplete="current-password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className={`input-field pl-10 pr-11 ${errors.password ? "input-error" : ""}`}
                  />
                  <button type="button" onClick={() => setShowPass(!showPass)} tabIndex={-1}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center justify-center"
                    style={{ color: "var(--color-muted)" }}>
                    {showPass ? <EyeSlash size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-[11px] font-medium mt-1.5 flex items-center gap-1" style={{ color: "var(--color-danger)" }}>
                    <span>▲</span>{errors.password}
                  </p>
                )}
              </div>

              {/* Submit */}
              <button type="submit" disabled={loading}
                className="w-full mt-2 h-10 rounded-xl font-semibold text-sm flex items-center justify-between px-5 transition-all active:scale-[0.98] disabled:opacity-50"
                style={{
                  backgroundColor: "var(--color-primary)",
                  color: "white",
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  letterSpacing: "-0.01em",
                  transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
                }}>
                {loading ? (
                  <span className="flex items-center gap-2 mx-auto">
                    <Spinner size="sm" /> Verificando...
                  </span>
                ) : (
                  <>
                    <span>Ingresar al sistema</span>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center"
                      style={{ backgroundColor: "rgba(255,255,255,0.18)" }}>
                      <ArrowRight size={13} weight="bold" />
                    </div>
                  </>
                )}
              </button>
            </form>

            {/* Demo accounts */}
            <div className="mt-6 rounded-xl border p-4 space-y-2.5"
              style={{ backgroundColor: "var(--color-primary-lt)", borderColor: "var(--color-primary-bd)" }}>
              <p className="text-[10px] font-bold uppercase tracking-[0.08em] flex items-center gap-1.5"
                style={{ color: "var(--color-primary)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                <ShieldCheck size={13} weight="fill" />
                <span>Accesos de demostracion</span>
              </p>
              <div className="space-y-1.5 divide-y" style={{ borderColor: "var(--color-border)" }}>
                {[
                  { rol: "Administrador", cedula: "0000000001" },
                  { rol: "Veterinario",   cedula: "0000000002" },
                  { rol: "Recepcionista", cedula: "0000000003" },
                ].map((u, i) => (
                  <div key={u.rol} className={`flex justify-between text-[11px] ${i > 0 ? "pt-1.5" : ""}`}
                    style={{ color: "var(--color-muted)" }}>
                    <span className="font-semibold">{u.rol}</span>
                    <span>{u.cedula} · <em className="not-italic font-bold" style={{ color: "var(--color-text)" }}>test1234</em></span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
