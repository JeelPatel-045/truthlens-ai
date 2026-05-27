export default function PolarityBar({ scores }) {
  if (!scores) return null
  const { positive = 0, negative = 0, neutral = 0 } = scores
  return (
    <div className="w-full">
      <div className="flex rounded-full overflow-hidden h-2 mb-1">
        <div className="bg-emerald-400 transition-all" style={{ width: `${positive}%` }} title={`Positive ${positive}%`} />
        <div className="bg-slate-200 transition-all" style={{ width: `${neutral}%` }} title={`Neutral ${neutral}%`} />
        <div className="bg-red-400 transition-all" style={{ width: `${negative}%` }} title={`Negative ${negative}%`} />
      </div>
      <div className="flex justify-between text-[10px] text-slate-400">
        <span>+{positive.toFixed(0)}%</span>
        <span className="text-slate-300">{neutral.toFixed(0)}% neutral</span>
        <span>-{negative.toFixed(0)}%</span>
      </div>
    </div>
  )
}
