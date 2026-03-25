export default function Spinner({ size = 'md' }) {
  const sizes = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-10 h-10 border-3',
  };
  return (
    <span
      className={`inline-block ${sizes[size]} border-white/40 border-t-white rounded-full animate-spin`}
      role="status"
      aria-label="Cargando"
    />
  );
}
