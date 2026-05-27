import { MapPin } from 'lucide-react'

export default function GeoBadge({ geoTags, compact = false }) {
  if (!geoTags) return null
  const { primary_country, primary_flag, primary_region, all_locations } = geoTags

  if (!primary_country && primary_region === 'Global') {
    return (
      <span className="badge bg-slate-100 text-slate-500">
        🌐 Global
      </span>
    )
  }

  if (compact) {
    return (
      <span className="badge bg-teal-50 text-teal-700 border border-teal-100">
        {primary_flag} {primary_country || primary_region}
      </span>
    )
  }

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1.5">
        <MapPin size={13} className="text-teal-500 shrink-0" />
        <span className="text-xs font-medium text-slate-700">Geographic Focus</span>
      </div>
      <div className="flex flex-wrap gap-1.5">
        <span className="badge bg-teal-50 text-teal-700 border border-teal-100">
          {primary_flag} {primary_country || 'Global'}
        </span>
        {primary_region && (
          <span className="badge bg-slate-100 text-slate-500">
            {primary_region}
          </span>
        )}
        {all_locations && all_locations.slice(1, 3).map((loc, i) => (
          <span key={i} className="badge bg-slate-50 text-slate-500 border border-slate-100">
            {loc.flag} {loc.country}
          </span>
        ))}
      </div>
    </div>
  )
}
