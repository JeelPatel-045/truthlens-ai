const COLOR_MAP = {
  'Left-Leaning':  'bg-blue-100 text-blue-700',
  'Center':        'bg-slate-100 text-slate-600',
  'Right-Leaning': 'bg-rose-100 text-rose-700',
}

export default function BiasIndicator({ bias }) {
  const label = bias?.label || 'Center'
  return (
    <span className={`badge ${COLOR_MAP[label] || COLOR_MAP['Center']}`}>
      ⚖️ {label}
    </span>
  )
}
