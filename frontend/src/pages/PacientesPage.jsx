import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import { Users, MagnifyingGlass, Phone, Envelope, Cat, ArrowRight, WarningCircle, Plus } from "@phosphor-icons/react";

const PET_PALETTE = [
  { accent: "#1D4B58", bg: "#F2F6F7", bd: "#D5E2E4" },
  { accent: "#7B5EA7", bg: "#F5F0FF", bd: "#D6C8F5" },
  { accent: "#C0720A", bg: "#FFF5E6", bd: "#FFD4A0" },
  { accent: "#2A8E79", bg: "#EBF7F5", bd: "#B2E0D9" },
  { accent: "#B03060", bg: "#FFF0F5", bd: "#F5C0D0" },
];
function getPalette(i) { return PET_PALETTE[i % PET_PALETTE.length]; }

export default function PacientesPage() {
  const [clientes,     setClientes]     = useState([]);
  const [loading,      setLoading]      = useState(true);
  const [error,        setError]        = useState("");
  const [searchQuery,  setSearchQuery]  = useState("");

  const loadClientes = async () => {
    try {
      setLoading(true); setError("");
      const res = await api.get("/clientes");
      setClientes(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Error al obtener el listado de clientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadClientes(); }, []);

  const filteredClientes = clientes.filter(c =>
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.telefono.includes(searchQuery) ||
    c.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mascotas.some(m => m.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="page-title">Expedientes y Clientes</h1>
          <p className="page-subtitle">Busca y consulta las fichas clinicas de las mascotas y sus duenos.</p>
        </div>
        <Link to="/registrar" className="btn-premium-primary">
          <span>Nuevo Registro</span>
          <div className="btn-icon-wrapper"><Plus size={13} weight="bold" /></div>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlass size={16} className="absolute left-4 top-1/2 -translate-y-1/2" style={{ color: "var(--color-muted)" }} />
        <input
          type="text"
          placeholder="Buscar por dueno, telefono, correo o nombre de mascota..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="input-field pl-11"
        />
      </div>

      {/* Counter badge */}
      {!loading && !error && (
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: "var(--color-text)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {filteredClientes.length}
          </span>
          <span className="text-sm" style={{ color: "var(--color-muted)" }}>
            {filteredClientes.length === 1 ? "cliente encontrado" : "clientes encontrados"}
          </span>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 p-4 rounded-xl border text-sm"
          style={{ backgroundColor: "var(--color-danger-bg)", borderColor: "var(--color-danger)", color: "var(--color-danger)" }}>
          <WarningCircle size={18} weight="bold" style={{ flexShrink: 0 }} />
          <span className="font-semibold">{error}</span>
        </div>
      )}

      {/* Loading */}
      {loading ? (
        <div className="card flex flex-col items-center justify-center py-16 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin"
            style={{ borderColor: "var(--color-primary)", borderTopColor: "transparent" }} />
          <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>Cargando expedientes...</p>
        </div>
      ) : filteredClientes.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-4"
            style={{ backgroundColor: "var(--color-primary-lt)", border: "1.5px solid var(--color-primary-bd)" }}>
            👥
          </div>
          <h3 className="font-bold text-base" style={{ color: "var(--color-text)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            {searchQuery ? "Sin resultados" : "Sin clientes registrados"}
          </h3>
          <p className="text-sm mt-1.5 max-w-xs" style={{ color: "var(--color-muted)" }}>
            {searchQuery
              ? `No hay coincidencias para "${searchQuery}". Intenta con otros terminos.`
              : "Registra el primer propietario y su mascota para empezar."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredClientes.map(c => (
            <div key={c.id} className="card flex flex-col justify-between gap-4">

              {/* Owner info */}
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ backgroundColor: "var(--color-primary-lt)", border: "1.5px solid var(--color-primary-bd)", color: "var(--color-primary)" }}>
                  <Users size={18} weight="duotone" />
                </div>
                <div className="min-w-0">
                  <h3 className="font-bold text-base leading-tight truncate"
                    style={{ color: "var(--color-text)", fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                    {c.nombre}
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--color-muted)" }}>
                    Propietario(a)
                  </span>
                </div>
              </div>

              {/* Contact */}
              <div className="space-y-1.5">
                <p className="flex items-center gap-2 text-sm" style={{ color: "var(--color-muted)" }}>
                  <Phone size={13} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                  <span className="font-medium truncate">{c.telefono}</span>
                </p>
                <p className="flex items-center gap-2 text-sm" style={{ color: "var(--color-muted)" }}>
                  <Envelope size={13} style={{ color: "var(--color-primary)", flexShrink: 0 }} />
                  <span className="font-medium truncate">{c.correo}</span>
                </p>
              </div>

              {/* Pets */}
              <div className="pt-3 border-t" style={{ borderColor: "var(--color-border)" }}>
                <p className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5 mb-2 select-none"
                  style={{ color: "var(--color-muted)" }}>
                  <Cat size={12} />
                  <span>Mascotas ({c.mascotas.length})</span>
                </p>
                {c.mascotas.length === 0 ? (
                  <p className="text-xs italic" style={{ color: "var(--color-muted)" }}>Sin mascotas registradas.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {c.mascotas.map((m, idx) => {
                      const p = getPalette(idx);
                      return (
                        <Link key={m.id} to={`/mascotas/${m.id}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg border text-xs font-bold transition-all active:scale-95"
                          style={{ color: p.accent, backgroundColor: p.bg, borderColor: p.bd }}>
                          🐾 {m.nombre}
                          <ArrowRight size={9} weight="bold" />
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
