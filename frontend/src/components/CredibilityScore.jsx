export default function CredibilityScore({ score }) {
  const s = score ?? 5
  let cls
  if (s >= 7.5) cls = 'text-emerald-600'
  else if (s >= 5) cls = 'text-amber-600'
  else cls = 'text-red-500'

  return (
    <span className="badge bg-slate-50 border border-slate-200 text-slate-600">
      🛡️ <span className={`font-semibold ${cls}`}>{s.toFixed(1)}</span>/10
    </span>
  )
}
