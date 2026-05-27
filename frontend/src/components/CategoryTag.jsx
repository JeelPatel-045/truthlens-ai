const CATEGORY_COLORS = {
  technology:    'bg-violet-100 text-violet-700',
  business:      'bg-amber-100 text-amber-700',
  health:        'bg-teal-100 text-teal-700',
  science:       'bg-cyan-100 text-cyan-700',
  sports:        'bg-orange-100 text-orange-700',
  entertainment: 'bg-pink-100 text-pink-700',
  general:       'bg-slate-100 text-slate-600',
  politics:      'bg-indigo-100 text-indigo-700',
}

const ICONS = {
  technology:    '💻',
  business:      '💼',
  health:        '🏥',
  science:       '🔬',
  sports:        '⚽',
  entertainment: '🎬',
  general:       '📰',
  politics:      '🏛️',
}

export default function CategoryTag({ category }) {
  const c = (category || 'general').toLowerCase()
  return (
    <span className={`badge ${CATEGORY_COLORS[c] || CATEGORY_COLORS.general}`}>
      {ICONS[c] || '📰'} {c.charAt(0).toUpperCase() + c.slice(1)}
    </span>
  )
}
