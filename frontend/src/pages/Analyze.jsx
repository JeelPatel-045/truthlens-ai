import { useState } from 'react'
import { Search, Link as LinkIcon, FileText, Loader } from 'lucide-react'
import { analyzeArticle } from '../services/api'
import SentimentBadge from '../components/SentimentBadge'
import FakeScoreBadge from '../components/FakeScoreBadge'
import BiasIndicator from '../components/BiasIndicator'
import CategoryTag from '../components/CategoryTag'
import CredibilityScore from '../components/CredibilityScore'
import PolarityBar from '../components/PolarityBar'
import WordCloudChart from '../components/WordCloudChart'

const ENTITY_COLORS = {
  PERSON:  'bg-blue-100 text-blue-700',
  ORG:     'bg-purple-100 text-purple-700',
  GPE:     'bg-teal-100 text-teal-700',
  LOC:     'bg-green-100 text-green-700',
}

export default function Analyze() {
  const [mode, setMode] = useState('url')
  const [url, setUrl] = useState('')
  const [text, setText] = useState('')
  const [title, setTitle] = useState('')
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async e => {
    e.preventDefault()
    setError(null)
    setResult(null)
    setLoading(true)
    try {
      const payload = mode === 'url' ? { url } : { text, title }
      const data = await analyzeArticle(payload)
      setResult(data)
    } catch (e) {
      setError(e.response?.data?.detail || 'Analysis failed. Check the URL or try pasting text.')
    } finally {
      setLoading(false)
    }
  }

  const nlp = result?.nlp || {}

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-1">Analyze Article</h1>
        <p className="text-sm text-slate-500">Paste a URL or text to get instant NLP analysis</p>
      </div>

      {/* Input card */}
      <div className="card p-6 mb-6">
        {/* Mode toggle */}
        <div className="flex gap-2 mb-5">
          {[
            { id: 'url', Icon: LinkIcon, label: 'URL' },
            { id: 'text', Icon: FileText, label: 'Paste Text' },
          ].map(m => (
            <button
              key={m.id}
              onClick={() => setMode(m.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                mode === m.id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <m.Icon size={14} /> {m.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {mode === 'url' ? (
            <input
              type="url"
              placeholder="https://example.com/news-article"
              className="input"
              value={url}
              onChange={e => setUrl(e.target.value)}
              required
            />
          ) : (
            <>
              <input
                type="text"
                placeholder="Article title (optional)"
                className="input"
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
              <textarea
                placeholder="Paste your article text here…"
                className="input resize-none"
                rows={7}
                value={text}
                onChange={e => setText(e.target.value)}
                required
              />
            </>
          )}

          <button type="submit" disabled={loading} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {loading ? <><Loader size={15} className="animate-spin" /> Analyzing…</> : <><Search size={15} /> Analyze Now</>}
          </button>
        </form>

        {error && <p className="mt-3 text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{error}</p>}
      </div>

      {/* Results */}
      {result && (
        <div className="space-y-4">
          {/* Title + Summary */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-3">
              <CategoryTag category={result.category} />
              <span className="text-xs text-slate-500">{result.source}</span>
            </div>
            <h2 className="text-lg font-bold text-slate-900 mb-3">{result.title}</h2>
            {result.summary && (
              <div className="bg-indigo-50 rounded-xl p-4 border-l-4 border-indigo-400">
                <p className="text-xs font-semibold text-indigo-700 mb-1">AI Summary</p>
                <p className="text-sm text-slate-700">{result.summary}</p>
              </div>
            )}
          </div>

          {/* NLP badges + polarity */}
          <div className="card p-5">
            <h3 className="font-semibold text-slate-800 mb-3 text-sm">NLP Results</h3>
            <div className="flex flex-wrap gap-2 mb-4">
              <SentimentBadge sentiment={nlp.sentiment} />
              <FakeScoreBadge score={nlp.fake_score} />
              <BiasIndicator bias={nlp.bias} />
              <CredibilityScore score={nlp.credibility_score} />
              {nlp.is_clickbait && <span className="badge bg-yellow-100 text-yellow-700">⚡ Clickbait</span>}
              {nlp.reading_level && <span className="badge bg-slate-100 text-slate-600">📖 {nlp.reading_level} read</span>}
            </div>
            <PolarityBar scores={nlp.sentiment_scores} />

            <div className="mt-4 grid grid-cols-2 gap-3">
              {[
                ['Positive', `${nlp.sentiment_scores?.positive?.toFixed(1)}%`, 'text-emerald-600'],
                ['Negative', `${nlp.sentiment_scores?.negative?.toFixed(1)}%`, 'text-red-500'],
                ['Neutral', `${nlp.sentiment_scores?.neutral?.toFixed(1)}%`, 'text-slate-500'],
                ['Compound', nlp.sentiment_scores?.compound?.toFixed(3), 'text-indigo-600'],
              ].map(([label, val, cls]) => (
                <div key={label} className="bg-slate-50 rounded-lg p-3">
                  <p className="text-xs text-slate-500">{label}</p>
                  <p className={`text-lg font-bold ${cls}`}>{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Entities */}
          {nlp.entities?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-3 text-sm">Named Entities</h3>
              <div className="flex flex-wrap gap-2">
                {nlp.entities.map((e, i) => (
                  <span key={i} className={`badge ${ENTITY_COLORS[e.label] || 'bg-slate-100 text-slate-600'}`}>
                    {e.text} <span className="opacity-60 text-[10px]">{e.label}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Word Cloud */}
          {nlp.keywords?.length > 0 && (
            <div className="card p-5">
              <h3 className="font-semibold text-slate-800 mb-3 text-sm">Word Cloud</h3>
              <WordCloudChart words={nlp.keywords} height={250} />
            </div>
          )}
        </div>
      )}
    </div>
  )
}
