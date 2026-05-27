const COLOR_MAP = {
  'Very Positive': 'bg-emerald-100 text-emerald-700',
  'Positive':      'bg-green-100 text-green-700',
  'Neutral':       'bg-slate-100 text-slate-600',
  'Negative':      'bg-orange-100 text-orange-700',
  'Very Negative': 'bg-red-100 text-red-700',
}

const EMOJI_MAP = {
  'Very Positive': '😊',
  'Positive':      '🙂',
  'Neutral':       '😐',
  'Negative':      '😟',
  'Very Negative': '😡',
}

export default function SentimentBadge({ sentiment }) {
  const label = sentiment || 'Neutral'
  return (
    <span className={`badge ${COLOR_MAP[label] || COLOR_MAP['Neutral']}`}>
      {EMOJI_MAP[label]} {label}
    </span>
  )
}
