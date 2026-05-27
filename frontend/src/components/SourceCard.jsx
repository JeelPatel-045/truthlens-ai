import { ExternalLink, Shield, TrendingUp } from 'lucide-react'

const RELIABILITY_COLOR = {
  'Very High': 'text-emerald-600 bg-emerald-50',
  'High':      'text-green-600 bg-green-50',
  'Moderate':  'text-amber-600 bg-amber-50',
  'Low':       'text-red-600 bg-red-50',
  'Unknown':   'text-slate-500 bg-slate-50',
}

const BIAS_COLOR = {
  'Center':        'bg-slate-100 text-slate-600',
  'Center-Left':   'bg-blue-50 text-blue-600',
  'Left-Leaning':  'bg-blue-100 text-blue-700',
  'Center-Right':  'bg-rose-50 text-rose-600',
  'Right-Leaning': 'bg-rose-100 text-rose-700',
  'Unknown':       'bg-slate-100 text-slate-500',
}

export default function SourceCard({ sourceInfo, compact = false }) {
  if (!sourceInfo) return null
  const {
    full_name, credibility, bias, country, flag,
    region, website, description, type, founded, reliability,
  } = sourceInfo

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-base">{flag}</span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-slate-700 truncate">{full_name}</p>
          <p className="text-[10px] text-slate-400">{region}</p>
        </div>
        <span className={`badge ml-auto ${RELIABILITY_COLOR[reliability] || RELIABILITY_COLOR['Unknown']} text-[10px]`}>
          {credibility?.toFixed(1)}/10
        </span>
      </div>
    )
  }

  return (
    <div className="card p-4">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{flag}</span>
          <div>
            <p className="font-semibold text-slate-900 text-sm">{full_name}</p>
            <p className="text-xs text-slate-400">{type} · Est. {founded || 'N/A'}</p>
          </div>
        </div>
        {website && (
          <a href={website} target="_blank" rel="noopener noreferrer"
            className="text-indigo-500 hover:text-indigo-700">
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      <p className="text-xs text-slate-500 mb-3 leading-relaxed">{description}</p>

      <div className="grid grid-cols-2 gap-2">
        {/* Credibility */}
        <div className="bg-slate-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <Shield size={11} className="text-slate-400" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Credibility</span>
          </div>
          <p className={`text-lg font-bold ${(credibility ?? 0) >= 8 ? 'text-emerald-600' : (credibility ?? 0) >= 6 ? 'text-amber-600' : 'text-red-500'}`}>
            {credibility?.toFixed(1)}<span className="text-xs font-normal text-slate-400">/10</span>
          </p>
        </div>

        {/* Reliability */}
        <div className="bg-slate-50 rounded-lg p-2.5">
          <div className="flex items-center gap-1 mb-1">
            <TrendingUp size={11} className="text-slate-400" />
            <span className="text-[10px] text-slate-400 uppercase tracking-wide">Reliability</span>
          </div>
          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${RELIABILITY_COLOR[reliability] || RELIABILITY_COLOR['Unknown']}`}>
            {reliability}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3">
        <span className={`badge ${BIAS_COLOR[bias] || BIAS_COLOR['Unknown']}`}>
          ⚖️ {bias}
        </span>
        <span className="badge bg-slate-100 text-slate-600">
          📍 {country}
        </span>
      </div>
    </div>
  )
}
