import { useCallback } from 'react'
import ReactWordcloud from 'react-wordcloud'

const OPTIONS = {
  rotations: 2,
  rotationAngles: [0, -90],
  fontSizes: [14, 52],
  fontFamily: 'Inter, sans-serif',
  fontWeight: '600',
  padding: 2,
  deterministic: true,
  enableTooltip: true,
}

const COLORS = [
  '#4f46e5', '#7c3aed', '#0891b2', '#059669',
  '#d97706', '#dc2626', '#2563eb', '#7c3aed',
]

export default function WordCloudChart({ words, height = 280 }) {
  const callbacks = useCallback(() => ({
    getWordColor: (_, i) => COLORS[i % COLORS.length],
  }), [])

  if (!words || words.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400 text-sm">
        No data yet — analyze some articles first
      </div>
    )
  }

  const normalized = words.map(w => ({
    text: w.text,
    value: Math.max(w.value, 5),
  }))

  return (
    <div style={{ height }} className="wordcloud w-full">
      <ReactWordcloud
        words={normalized}
        options={OPTIONS}
        callbacks={callbacks()}
      />
    </div>
  )
}
