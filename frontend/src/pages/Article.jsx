import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, AlertTriangle, CheckCircle } from 'lucide-react'
import { fetchArticle } from '../services/api'
import SentimentBadge from '../components/SentimentBadge'
import FakeScoreBadge from '../components/FakeScoreBadge'
import BiasIndicator from '../components/BiasIndicator'
import CategoryTag from '../components/CategoryTag'
import CredibilityScore from '../components/CredibilityScore'
import PolarityBar from '../components/PolarityBar'
import WordCloudChart from '../components/WordCloudChart'
import SourceCard from '../components/SourceCard'
import GeoBadge from '../components/GeoBadge'
import ArticleActions from '../components/ArticleActions'
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts'

const ENTITY_COLORS = {
  PERSON:  'bg-blue-100 text-blue-700',
  ORG:     'bg-purple-100 text-purple-700',
  GPE:     'bg-teal-100 text-teal-700',
  LOC:     'bg-green-100 text-green-700',
  PRODUCT: 'bg-orange-100 text-orange-700',
  EVENT:   'bg-pink-100 text-pink-700',
  NORP:    'bg-indigo-100 text-indigo-700',
}

function ScoreGauge({ label, value, max = 100, color }) {
  const pct = Math.min((value / max) * 100, 100)
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-slate-500 w-28 shrink-0">{label}</span>
      <div className="flex-1 bg-slate-100 rounded-full h-2">
        <div className={`h-2 rounded-full ${color} transition-all`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs font-medium text-slate-700 w-10 text-right">{value.toFixed(1)}</span>
    </div>
  )
}

function SectionTitle({ children }) {
  return <h2 className="font-semibold text-slate-800 mb-4 text-sm uppercase tracking-wide text-slate-400">{children}</h2>
}

export default function Article() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [article, setArticle] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchArticle(id).then(setArticle).finally(() => setLoading(false))
  }, [id])

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-6 bg-slate-200 rounded w-1/4 mb-6" />
      <div className="h-8 bg-slate-200 rounded w-3/4 mb-4" />
      <div className="h-48 bg-slate-100 rounded-2xl" />
    </div>
  )

  if (!article || article.error) return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-500">
      <p>Article not found.</p>
      <button onClick={() => navigate('/')} className="block mx-auto mt-4 btn-secondary">← Back to Feed</button>
    </div>
  )

  const nlp = article.nlp || {}
  const fake = nlp.fake_score ?? 0
  const cred = nlp.credibility_score ?? 5

  const radarData = [
    { subject: 'Credibility', value: cred * 10 },
    { subject: 'Positivity',  value: nlp.sentiment_scores?.positive ?? 0 },
    { subject: 'Objectivity', value: nlp.sentiment_scores?.neutral ?? 0 },
    { subject: 'Realness',    value: 100 - fake },
    { subject: 'Neutrality',  value: nlp.bias?.label === 'Center' ? 80 : 30 },
  ]

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 mb-5">
        <ArrowLeft size={16} /> Back to Feed
      </button>

      {/* ── HEADER ── */}
      <div className="card p-6 mb-4">
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <CategoryTag category={article.category} />
          {article.url && (
            <a href={article.url} target="_blank" rel="noopener noreferrer"
              className="ml-auto flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
              <ExternalLink size={12} /> Read Original
            </a>
          )}
        </div>

        <h1 className="text-xl font-bold text-slate-900 mb-3 leading-snug">{article.title}</h1>

        {/* Alerts */}
        {fake >= 65 && (
          <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl p-3 mb-3">
            <AlertTriangle size={16} className="text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-red-700">High Fake News Risk ({fake.toFixed(0)}%)</p>
              <p className="text-xs text-red-600 mt-0.5">Multiple markers of potentially misleading content detected.</p>
            </div>
          </div>
        )}
        {fake < 35 && (
          <div className="flex items-start gap-2 bg-green-50 border border-green-200 rounded-xl p-3 mb-3">
            <CheckCircle size={16} className="text-green-500 mt-0.5 shrink-0" />
            <p className="text-sm text-green-700 font-medium">This article appears credible ({(100-fake).toFixed(0)}% real confidence)</p>
          </div>
        )}

        {/* AI Summary */}
        {article.summary && (
          <div className="bg-indigo-50 rounded-xl p-4 border-l-4 border-indigo-400 mb-4">
            <p className="text-xs font-semibold text-indigo-700 mb-1">AI Summary</p>
            <p className="text-sm text-slate-700 leading-relaxed">{article.summary}</p>
          </div>
        )}

        {/* Actions */}
        <ArticleActions article={article} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* ── WHO POSTED THIS ── */}
        <div className="card p-5">
          <SectionTitle>Who Posted This</SectionTitle>
          <SourceCard sourceInfo={article.source_info} />
        </div>

        {/* ── WHAT AREA ── */}
        <div className="card p-5">
          <SectionTitle>Geographic Focus</SectionTitle>
          {nlp.geo_tags ? (
            <div className="space-y-3">
              <GeoBadge geoTags={nlp.geo_tags} />
              {nlp.geo_tags.primary_country && (
                <div className="bg-slate-50 rounded-xl p-3 text-sm">
                  <p className="text-slate-500 text-xs mb-1">Primary Location</p>
                  <p className="font-semibold text-slate-800">
                    {nlp.geo_tags.primary_flag} {nlp.geo_tags.primary_country}
                  </p>
                  <p className="text-xs text-slate-400 mt-0.5">{nlp.geo_tags.primary_region}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-slate-400">No geographic data detected</p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        {/* ── NLP SCORES ── */}
        <div className="card p-5">
          <SectionTitle>NLP Analysis</SectionTitle>
          <div className="flex flex-wrap gap-2 mb-4">
            <SentimentBadge sentiment={nlp.sentiment} />
            <FakeScoreBadge score={fake} />
            <BiasIndicator bias={nlp.bias} />
            <CredibilityScore score={cred} />
            {nlp.is_clickbait && <span className="badge bg-yellow-100 text-yellow-700">⚡ Clickbait</span>}
            {nlp.reading_level && <span className="badge bg-slate-100 text-slate-600">📖 {nlp.reading_level} read</span>}
          </div>

          <div className="space-y-2.5 mb-4">
            <ScoreGauge label="Positive" value={nlp.sentiment_scores?.positive ?? 0} color="bg-emerald-400" />
            <ScoreGauge label="Neutral"  value={nlp.sentiment_scores?.neutral ?? 0}  color="bg-slate-300" />
            <ScoreGauge label="Negative" value={nlp.sentiment_scores?.negative ?? 0} color="bg-red-400" />
            <ScoreGauge label="Fake Score" value={fake} color={fake >= 65 ? 'bg-red-500' : fake >= 35 ? 'bg-yellow-400' : 'bg-green-400'} />
            <ScoreGauge label="Credibility" value={cred} max={10} color="bg-indigo-400" />
          </div>

          <PolarityBar scores={nlp.sentiment_scores} />
        </div>

        {/* ── RADAR CHART ── */}
        <div className="card p-5">
          <SectionTitle>Article Score Radar</SectionTitle>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e2e8f0" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
              <Radar dataKey="value" stroke="#4f46e5" fill="#4f46e5" fillOpacity={0.15} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ── WHAT CAN YOU DO ── */}
      <div className="card p-5 mb-4">
        <SectionTitle>What Can You Do</SectionTitle>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
          {[
            { emoji: '📌', label: 'Save Article', desc: 'Bookmark for later reading', action: () => {} },
            { emoji: '🔗', label: 'Share', desc: 'Share link with others' },
            { emoji: '📋', label: 'Copy Summary', desc: 'Copy AI-generated summary' },
            { emoji: '🤖', label: 'Ask AI', desc: 'Get AI explanation via chat', action: () => navigate(`/chat`) },
            { emoji: '🔍', label: 'Find Similar', desc: 'Search related news', action: () => navigate(`/?q=${encodeURIComponent((article.title || '').split(' ').slice(0,3).join(' '))}`) },
            { emoji: '📊', label: 'Export Analysis', desc: 'Download NLP report as JSON' },
          ].map(item => (
            <div key={item.label}
              className="bg-slate-50 rounded-xl p-3 hover:bg-indigo-50 hover:border-indigo-200 border border-transparent transition-colors cursor-pointer"
              onClick={item.action}
            >
              <span className="text-xl block mb-1">{item.emoji}</span>
              <p className="font-medium text-slate-800 text-xs">{item.label}</p>
              <p className="text-[10px] text-slate-400 mt-0.5">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-4">
          <ArticleActions article={article} />
        </div>
      </div>

      {/* ── NAMED ENTITIES ── */}
      {nlp.entities && nlp.entities.length > 0 && (
        <div className="card p-5 mb-4">
          <SectionTitle>Named Entities (NER)</SectionTitle>
          <div className="flex flex-wrap gap-2">
            {nlp.entities.map((e, i) => (
              <span key={i} className={`badge ${ENTITY_COLORS[e.label] || 'bg-slate-100 text-slate-600'}`}>
                {e.text}
                <span className="ml-1 opacity-60 text-[10px]">{e.label}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ── WORD CLOUD ── */}
      {nlp.keywords && nlp.keywords.length > 0 && (
        <div className="card p-5">
          <SectionTitle>Article Word Cloud</SectionTitle>
          <WordCloudChart words={nlp.keywords} height={260} />
        </div>
      )}
    </div>
  )
}
