import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { 
  Users, 
  MagnifyingGlass, 
  Phone, 
  Envelope, 
  Cat, 
  ArrowRight,
  WarningCircle,
  Plus
} from '@phosphor-icons/react';

const PET_PALETTE = [
  { accent: '#2A6B7C', bg: '#F0F7F9' },
  { accent: '#7B5EA7', bg: '#F5F0FF' },
  { accent: '#C0720A', bg: '#FFF5E6' },
  { accent: '#2E7D52', bg: '#EBF5EF' },
  { accent: '#B03060', bg: '#FFF0F5' },
];

function getPaletteForIndex(i) {
  return PET_PALETTE[i % PET_PALETTE.length];
}

export default function PacientesPage() {
  const [clientes, setClientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const loadClientes = async () => {
    try {
      setLoading(true);
      setError('');
      const res = await api.get('/clientes');
      setClientes(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al obtener el listado de clientes.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClientes();
  }, []);

  // Filter clients
  const filteredClientes = clientes.filter(c => 
    c.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.telefono.includes(searchQuery) ||
    c.correo.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.mascotas.some(m => m.nombre.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* ── Page Header ── */}
      <div className="flex items-center justify-between flex-wrap gap-4 page-header">
        <div>
          <h1 className="page-title flex items-center gap-2">
            <span>📋</span> Expedientes y Clientes
          </h1>
          <p className="page-subtitle">
            Busca y consulta las fichas clínicas de las mascotas y sus respectivos dueños.
          </p>
        </div>
        
        <Link to="/registrar" className="btn-premium-primary uppercase tracking-wider text-xs">
          <span>Nuevo Registro</span>
          <div className="btn-icon-wrapper">
            <Plus size={12} weight="bold" />
          </div>
        </Link>
      </div>

      {/* ── Search Bar Card (Double-Bezel) ── */}
      <div className="bezel-card-outer">
        <div className="bezel-card-inner relative">
          <MagnifyingGlass size={18} className="absolute left-8 top-1/2 -translate-y-1/2 text-[#5C7078]" />
          <input
            type="text"
            placeholder="Buscar por dueño, teléfono, correo o nombre de mascota..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-11 pr-4 bg-[#F7F8FA] border border-[#E2E8EA] rounded-xl text-sm focus:outline-none focus:border-[#2A6B7C] focus:bg-white transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] placeholder-[#5C7078]"
          />
        </div>
      </div>

      {/* ── Clientes Grid ── */}
      {error && (
        <div className="alert-error">
          <WarningCircle size={20} className="flex-shrink-0" />
          <div>
            <p className="font-semibold text-sm">Error al cargar datos</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      )}

      {loading ? (
        <div className="bezel-card-outer">
          <div className="bezel-card-inner flex flex-col items-center justify-center p-12 space-y-4">
            <div className="w-8 h-8 rounded-full border-2 border-[#2A6B7C] border-t-transparent animate-spin"></div>
            <p className="text-xs text-[#5C7078] font-bold uppercase tracking-wider">Cargando expedientes...</p>
          </div>
        </div>
      ) : filteredClientes.length === 0 ? (
        <div className="bezel-card-outer max-w-lg mx-auto">
          <div className="bezel-card-inner text-center p-12">
            <div className="w-16 h-16 rounded-2xl bg-[#F0F7F9] border border-[#C2DCE2] flex items-center justify-center text-3xl mx-auto mb-4">
              👥
            </div>
            <h3 className="font-bold text-[#1A2B30] text-sm uppercase tracking-wide">No se encontraron clientes</h3>
            <p className="text-[#5C7078] text-xs mt-2 leading-relaxed">
              No hay coincidencias para "{searchQuery}". Intenta con otros términos o registra un nuevo propietario.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClientes.map((c) => (
            <div key={c.id} className="bezel-card-outer">
              <div className="bezel-card-inner flex flex-col justify-between h-full space-y-5">
                
                {/* Header: Propietario info */}
                <div>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F0F7F9] border border-[#C2DCE2] flex items-center justify-center text-[#2A6B7C] flex-shrink-0">
                        <Users size={20} weight="duotone" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[#1A2B30] text-sm leading-tight">{c.nombre}</h3>
                        <span className="text-[10px] text-[#5C7078] font-bold uppercase tracking-wider">Propietario(a)</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2 text-xs text-[#5C7078]">
                    <p className="flex items-center gap-2 font-medium">
                      <Phone size={14} className="text-[#2A6B7C]" />
                      <span>{c.telefono}</span>
                    </p>
                    <p className="flex items-center gap-2 font-medium">
                      <Envelope size={14} className="text-[#2A6B7C]" />
                      <span className="truncate">{c.correo}</span>
                    </p>
                  </div>
                </div>

                {/* Footer: List of Pets */}
                <div className="pt-4 border-t border-[#E2E8EA] space-y-2.5">
                  <p className="text-[10px] text-[#5C7078] font-bold uppercase tracking-wider flex items-center gap-1.5 select-none">
                    <Cat size={14} />
                    <span>Mascotas Registradas ({c.mascotas.length})</span>
                  </p>

                  {c.mascotas.length === 0 ? (
                    <p className="text-xs text-[#5C7078] italic">Sin mascotas registradas.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {c.mascotas.map((m, idx) => {
                        const palette = getPaletteForIndex(idx);
                        return (
                          <Link
                            key={m.id}
                            to={`/mascotas/${m.id}`}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] hover:scale-102 active:scale-98"
                            style={{ 
                              color: palette.accent, 
                              backgroundColor: palette.bg, 
                              borderColor: palette.accent + '30' 
                            }}
                          >
                            <span>🐾 {m.nombre}</span>
                            <ArrowRight size={10} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>

              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
