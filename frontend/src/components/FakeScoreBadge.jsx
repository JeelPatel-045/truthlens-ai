export default function FakeScoreBadge({ score }) {
  const s = score ?? 0
  let cls, label
  if (s >= 65) {
    cls = 'bg-red-100 text-red-700'
    label = `⚠️ ${s.toFixed(0)}% Fake`
  } else if (s >= 35) {
    cls = 'bg-yellow-100 text-yellow-700'
    label = `🔍 ${s.toFixed(0)}% Uncertain`
  } else {
    cls = 'bg-green-100 text-green-700'
    label = `✓ ${s.toFixed(0)}% Real`
  }
  return <span className={`badge ${cls}`}>{label}</span>
}
