import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import {
  ChartBar,
  Users,
  Cat,
  CalendarBlank,
  Stethoscope,
  ClipboardText,
  CheckCircle,
  XCircle,
  Clock,
  ArrowClockwise,
  Trophy,
  PawPrint,
} from '@phosphor-icons/react';

/* â”€â”€â”€ Mini Bar Chart (SVG nativo, sin dependencias) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function BarChart({ data, xKey, yKey, color = '#2A6B7C', height = 160 }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-xs text-[#5C7078]">
        Sin datos disponibles
      </div>
    );
  }

  const values = data.map((d) => Number(d[yKey]) || 0);
  const maxVal = Math.max(...values, 1);
  const barW = 100 / data.length;

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className="w-full"
      style={{ height }}
      aria-label="GrÃ¡fica de barras"
    >
      {data.map((d, i) => {
        const val = Number(d[yKey]) || 0;
        const barH = (val / maxVal) * (height - 24);
        const x = i * barW;
        const y = height - 20 - barH;
        return (
          <g key={i}>
            <rect
              x={x + barW * 0.12}
              y={y}
              width={barW * 0.76}
              height={barH}
              fill={color}
              rx="2"
              opacity="0.85"
            />
            {/* Etiqueta en la barra */}
            {val > 0 && (
              <text
                x={x + barW / 2}
                y={y - 3}
                textAnchor="middle"
                fontSize="5"
                fill="#1A2B30"
                fontWeight="600"
              >
                {val}
              </text>
            )}
            {/* Etiqueta del eje X */}
            <text
              x={x + barW / 2}
              y={height - 6}
              textAnchor="middle"
              fontSize="4.5"
              fill="#5C7078"
            >
              {d[xKey]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* â”€â”€â”€ Donut Chart (SVG nativo) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function DonutChart({ segments, total }) {
  const COLORS = ['#2A6B7C', '#2E7D52', '#A86A00', '#C0392B', '#6B4F7C'];
  const r = 30;
  const cx = 50;
  const cy = 50;
  const circumference = 2 * Math.PI * r;

  // Precalcular los offsets acumulados de forma pura sin mutaciÃ³n de variables externas
  const segmentsWithOffset = segments.map((seg, idx) => {
    const pct = total > 0 ? seg.value / total : 0;
    const offsetVal = segments
      .slice(0, idx)
      .reduce((acc, curr) => acc + (total > 0 ? curr.value / total : 0), 0);
    return { ...seg, pct, offsetVal };
  });

  return (
    <svg viewBox="0 0 100 100" className="w-full max-w-[140px]" aria-label="Donut chart">
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="#E2E8EA" strokeWidth="12" />
      {segmentsWithOffset.map((seg, i) => {
        const dash = circumference * seg.pct;
        const gap = circumference - dash;
        return (
          <circle
            key={i}
            cx={cx}
            cy={cy}
            r={r}
            fill="none"
            stroke={COLORS[i % COLORS.length]}
            strokeWidth="12"
            strokeDasharray={`${dash} ${gap}`}
            strokeDashoffset={-seg.offsetVal * circumference + circumference * 0.25}
            style={{ transition: 'stroke-dasharray 0.8s cubic-bezier(0.32,0.72,0,1)' }}
          />
        );
      })}
      <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="700" fill="#1A2B30">
        {total}
      </text>
      <text x={cx} y={cy + 9} textAnchor="middle" fontSize="5" fill="#5C7078">
        citas
      </text>
    </svg>
  );
}

/* â”€â”€â”€ StatCard â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
function StatCard({ icon, label, value, color = '#2A6B7C', bg = '#F0F7F9', border = '#C2DCE2', loading }) {
  const IconComponent = icon;
  return (
    <div className="card">
      <div className="flex items-center gap-4 h-full">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border"
          style={{ backgroundColor: bg, color, borderColor: border }}
        >
          <IconComponent size={22} weight="duotone" />
        </div>
        <div>
          <p className="text-3xl font-bold leading-none">
            {loading ? <span className="text-[#5C7078] text-base">...</span> : value}
          </p>
          <p className="text-[10px] text-[#5C7078] font-bold uppercase tracking-wider mt-1 leading-tight">
            {label}
          </p>
        </div>
      </div>
    </div>
  );
}

/* â”€â”€â”€ Componente principal â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */
export default function ReportesPage() {
  const [resumen, setResumen] = useState(null);
  const [citasDia, setCitasDia] = useState([]);
  const [citasSemana, setCitasSemana] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [diasFiltro, setDiasFiltro] = useState(30);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const [r1, r2, r3] = await Promise.all([
        api.get('/reportes/resumen'),
        api.get(`/reportes/citas-por-dia?dias=${diasFiltro}`),
        api.get('/reportes/citas-por-dia-semana'),
      ]);
      setResumen(r1.data);
      // Formatea fecha para eje X (solo dd/mm)
      setCitasDia(
        r2.data.map((d) => ({
          ...d,
          fechaLabel: new Date(d.fecha).toLocaleDateString('es-CO', {
            day: '2-digit',
            month: '2-digit',
          }),
        }))
      );
      setCitasSemana(r3.data);
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los reportes. Verifica que el servidor estÃ© activo.');
    } finally {
      setLoading(false);
    }
  }, [diasFiltro]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const statCards = resumen
    ? [
        { icon: Users, label: 'Clientes registrados', value: resumen.totalClientes, color: 'var(--color-primary)', bg: 'var(--color-primary-lt)', border: '#C2DCE2' },
        { icon: Cat, label: 'Mascotas registradas', value: resumen.totalMascotas, color: 'var(--color-primary)', bg: 'var(--color-primary-lt)', border: '#C2DCE2' },
        { icon: CalendarBlank, label: 'Citas totales', value: resumen.totalCitas, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', border: '#FFE3B3' },
        { icon: ClipboardText, label: 'Registros clÃ­nicos', value: resumen.totalHistorial, color: 'var(--color-success)', bg: 'var(--color-success-bg)', border: '#C7E2D2' },
      ]
    : [];

  const donutSegments = resumen
    ? [
        { label: 'Atendidas', value: resumen.citasAtendidas },
        { label: 'Pendientes', value: resumen.citasPendientes },
        { label: 'Canceladas', value: resumen.citasCanceladas },
      ]
    : [];

  return (
    <div className="space-y-6 animate-fade-in">

      {/* â”€â”€ Encabezado â”€â”€ */}
      <div className="card">
        <div className=" flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#F0F7F9] text-[#2A6B7C] border border-[#C2DCE2]">
              <ChartBar size={24} weight="duotone" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C7078]">Panel administrativo</p>
              <h1 className="text-2xl font-bold">Reportes</h1>
              <p className="text-xs text-[#5C7078] mt-0.5">EstadÃ­sticas y mÃ©tricas del sistema DataVet</p>
            </div>
          </div>
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold text-[#2A6B7C] border border-[#C2DCE2] bg-[#F0F7F9] hover:bg-[#E0EEF2] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] active:scale-[0.97] disabled:opacity-50"
          >
            <ArrowClockwise size={14} className={loading ? 'animate-spin' : ''} />
            Actualizar
          </button>
        </div>
      </div>

      {/* â”€â”€ Error â”€â”€ */}
      {error && (
        <div className="alert-error">
          <XCircle size={18} weight="fill" className="flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* â”€â”€ KPI Cards â”€â”€ */}
      <div>
        <h2 className="section-title">MÃ©tricas generales</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? [1, 2, 3, 4].map((k) => (
                <div key={k} className="card">
                  <div className=" h-20 animate-pulse bg-[#F0F2F4] rounded-[calc(1.75rem-0.375rem)]" />
                </div>
              ))
            : statCards.map((s, i) => (
                <StatCard key={i} {...s} loading={loading} />
              ))}
        </div>
      </div>

      {/* â”€â”€ Estado de Citas + Top Veterinario â”€â”€ */}
      {resumen && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Donut â€“ estado de citas */}
          <div className="card">
            <div className="">
              <h2 className="section-title mb-4">Estado de citas</h2>
              <div className="flex items-center gap-6 flex-wrap">
                <DonutChart segments={donutSegments} total={resumen.totalCitas} />
                <div className="space-y-3 flex-1 min-w-[140px]">
                  {[
                    { label: 'Atendidas', value: resumen.citasAtendidas, icon: CheckCircle, color: 'var(--color-success)', bg: 'var(--color-success-bg)' },
                    { label: 'Pendientes', value: resumen.citasPendientes, icon: Clock, color: 'var(--color-warning)', bg: 'var(--color-warning-bg)' },
                    { label: 'Canceladas', value: resumen.citasCanceladas, icon: XCircle, color: '#C0392B', bg: '#FDECEA' },
                  ].map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <div key={item.label} className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: item.bg, color: item.color }}
                          >
                            <ItemIcon size={14} weight="fill" />
                          </div>
                          <span className="text-xs font-semibold text-[#5C7078]">{item.label}</span>
                        </div>
                        <span className="text-base font-bold text-[#1A2B30]">{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Top Vet + Top Especie */}
          <div className="space-y-5">
            {resumen.topVeterinario && (
              <div className="card">
                <div className=" flex items-center gap-4">
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#FFF4E0] text-[#A86A00] border border-[#FFE3B3] flex-shrink-0">
                    <Trophy size={22} weight="duotone" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-[#5C7078]">Veterinario mÃ¡s activo</p>
                    <p className="text-base font-bold text-[#1A2B30] tracking-tight">{resumen.topVeterinario.veterinario}</p>
                    <p className="text-xs text-[#5C7078]">{resumen.topVeterinario.totalAtendidas} citas atendidas</p>
                  </div>
                </div>
              </div>
            )}

            {resumen.topEspecies.length > 0 && (
              <div className="card">
                <div className="">
                  <div className="flex items-center gap-2 mb-3">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center bg-[#F0F7F9] text-[#2A6B7C] border border-[#C2DCE2]">
                      <PawPrint size={14} weight="fill" />
                    </div>
                    <h2 className="section-title mb-0">Especies mÃ¡s frecuentes</h2>
                  </div>
                  <div className="space-y-2">
                    {resumen.topEspecies.map((e, i) => {
                      const pct = Math.round((e.total / resumen.totalMascotas) * 100);
                      return (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-0.5">
                            <span className="font-semibold text-[#1A2B30] capitalize">{e.especie}</span>
                            <span className="text-[#5C7078]">{e.total} ({pct}%)</span>
                          </div>
                          <div className="h-1.5 bg-[#E2E8EA] rounded-full overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-700"
                              style={{ width: `${pct}%`, backgroundcolor: 'var(--color-primary)' }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* â”€â”€ GrÃ¡fica de Citas por DÃ­a â”€â”€ */}
      <div className="card">
        <div className="">
          <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
            <div>
              <h2 className="section-title mb-0">Citas por dÃ­a</h2>
              <p className="text-xs text-[#5C7078]">Actividad de los Ãºltimos {diasFiltro} dÃ­as</p>
            </div>
            <div className="flex items-center gap-2">
              {[7, 14, 30, 60].map((d) => (
                <button
                  key={d}
                  onClick={() => setDiasFiltro(d)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all duration-300 ${
                    diasFiltro === d
                      ? 'bg-[#2A6B7C] text-white'
                      : 'bg-[#F0F7F9] text-[#5C7078] hover:bg-[#E0EEF2]'
                  }`}
                >
                  {d}d
                </button>
              ))}
            </div>
          </div>
          {loading ? (
            <div className="h-40 bg-[#F0F2F4] animate-pulse rounded-xl" />
          ) : (
            <BarChart
              data={citasDia}
              xKey="fechaLabel"
              yKey="total"
              color="#2A6B7C"
              height={160}
            />
          )}
        </div>
      </div>

      {/* â”€â”€ GrÃ¡fica por DÃ­a de la Semana â”€â”€ */}
      <div className="card">
        <div className="">
          <h2 className="section-title mb-1">Actividad por dÃ­a de la semana</h2>
          <p className="text-xs text-[#5C7078] mb-4">DÃ­as con mayor concurrencia histÃ³rica</p>
          {loading ? (
            <div className="h-40 bg-[#F0F2F4] animate-pulse rounded-xl" />
          ) : (
            <BarChart
              data={citasSemana}
              xKey="dia"
              yKey="total"
              color="#2E7D52"
              height={140}
            />
          )}
        </div>
      </div>

      {/* â”€â”€ Tabla detallada Ãºltimos dÃ­as â”€â”€ */}
      {citasDia.length > 0 && (
        <div className="card">
          <div className="">
            <h2 className="section-title mb-4">Detalle por dÃ­a</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-[#E2E8EA]">
                    {['Fecha', 'Total', 'Atendidas', 'Pendientes', 'Canceladas'].map((col) => (
                      <th
                        key={col}
                        className="text-left py-2 px-3 text-[10px] font-bold uppercase tracking-wider text-[#5C7078] first:pl-0"
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[...citasDia].reverse().slice(0, 20).map((row, i) => (
                    <tr
                      key={i}
                      className="border-b border-[#F0F2F4] hover:bg-[#F7F8FA] transition-colors"
                    >
                      <td className="py-2.5 px-3 font-semibold text-[#1A2B30] first:pl-0">
                        {new Date(row.fecha).toLocaleDateString('es-CO', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-2.5 px-3 font-bold text-[#2A6B7C]">{row.total}</td>
                      <td className="py-2.5 px-3">
                        <span className="badge-green">{row.atendidas || 0}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="badge-yellow">{row.pendientes || 0}</span>
                      </td>
                      <td className="py-2.5 px-3">
                        <span className="badge-red">{row.canceladas || 0}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

