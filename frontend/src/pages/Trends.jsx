import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from 'recharts'
import WordCloudChart from '../components/WordCloudChart'
import { fetchTrends } from '../services/api'
import { TrendingUp } from 'lucide-react'

const SENTIMENT_COLORS = {
  'Very Positive': '#10b981',
  'Positive':      '#34d399',
  'Neutral':       '#94a3b8',
  'Negative':      '#fb923c',
  'Very Negative': '#ef4444',
}

const STAT_CARDS = (data) => [
  { label: 'Articles Analyzed', value: data.total_analyzed ?? 0, icon: '📊' },
  { label: 'Avg Fake Rate', value: `${(data.fake_rate ?? 0).toFixed(1)}%`, icon: '🔍' },
  { label: 'Categories', value: Object.keys(data.category_distribution ?? {}).length, icon: '🗂️' },
  { label: 'Unique Keywords', value: (data.word_cloud ?? []).length, icon: '🔤' },
]

export default function Trends() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchTrends().then(setData).finally(() => setLoading(false))
  }, [])

  if (loading) return (
    <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-4 gap-4 mb-6">
        {[1,2,3,4].map(i => <div key={i} className="h-20 bg-slate-200 rounded-2xl" />)}
      </div>
      <div className="h-64 bg-slate-100 rounded-2xl" />
    </div>
  )

  const sentimentData = Object.entries(data?.sentiment_distribution ?? {})
    .filter(([, v]) => v > 0)
    .map(([name, value]) => ({ name, value }))

  const categoryData = Object.entries(data?.category_distribution ?? {})
    .map(([name, value]) => ({ name: name.charAt(0).toUpperCase() + name.slice(1), value }))
    .sort((a, b) => b.value - a.value)

  const stats = STAT_CARDS(data ?? {})

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
          <TrendingUp size={22} className="text-indigo-600" /> Trends Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">Aggregated insights from all analyzed articles</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {stats.map(s => (
          <div key={s.label} className="card p-4 text-center">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-2xl font-bold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Word Cloud */}
      <div className="card p-6 mb-4">
        <h2 className="font-semibold text-slate-800 mb-4">Global Word Cloud</h2>
        <WordCloudChart words={data?.word_cloud ?? []} height={320} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* Sentiment Pie */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">Sentiment Distribution</h2>
          {sentimentData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie
                  data={sentimentData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {sentimentData.map((entry) => (
                    <Cell key={entry.name} fill={SENTIMENT_COLORS[entry.name] ?? '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Category Bar */}
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">Category Distribution</h2>
          {categoryData.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-10">No data yet</p>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={categoryData} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11 }} width={80} />
                <Tooltip />
                <Bar dataKey="value" fill="#4f46e5" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Top Entities */}
      {data?.top_entities?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-semibold text-slate-800 mb-4 text-sm">Most Mentioned Entities</h2>
          <div className="flex flex-wrap gap-2">
            {data.top_entities.map((e, i) => (
              <span key={i} className="badge bg-indigo-50 text-indigo-700 border border-indigo-100">
                {e.text}
                <span className="ml-1.5 bg-indigo-200 text-indigo-800 text-[10px] px-1.5 py-0.5 rounded-full">
                  {e.count}
                </span>
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
