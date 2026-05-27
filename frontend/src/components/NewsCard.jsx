import { useNavigate } from 'react-router-dom'
import { ExternalLink, Clock, AlertTriangle, Shield } from 'lucide-react'
import SentimentBadge from './SentimentBadge'
import FakeScoreBadge from './FakeScoreBadge'
import BiasIndicator from './BiasIndicator'
import CategoryTag from './CategoryTag'
import CredibilityScore from './CredibilityScore'
import PolarityBar from './PolarityBar'
import GeoBadge from './GeoBadge'
import ArticleActions from './ArticleActions'

function timeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000
  if (diff < 60) return 'just now'
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
  return `${Math.floor(diff / 86400)}d ago`
}

function SourceBadge({ source, sourceInfo }) {
  const cred = sourceInfo?.credibility ?? null
  const flag = sourceInfo?.flag ?? '🌐'
  const reliability = sourceInfo?.reliability ?? 'Unknown'
  const reliabilityColor = {
    'Very High': 'text-emerald-600',
    'High':      'text-green-600',
    'Moderate':  'text-amber-600',
    'Low':       'text-red-500',
    'Unknown':   'text-slate-400',
  }
  return (
    <div className="flex items-center gap-1.5 min-w-0">
      <span className="text-sm">{flag}</span>
      <div className="min-w-0">
        <span className="text-xs font-medium text-slate-700 truncate block">{source}</span>
        {cred !== null && (
          <span className={`text-[10px] ${reliabilityColor[reliability] || 'text-slate-400'}`}>
            {reliability} · {cred.toFixed(1)}/10
          </span>
        )}
      </div>
    </div>
  )
}

export default function NewsCard({ article }) {
  const navigate = useNavigate()
  const { id, title, summary, source, source_info, published_at, image_url, category, url, nlp } = article
  const highFake = (nlp?.fake_score ?? 0) >= 65
  const isClickbait = nlp?.is_clickbait
  const geoTags = nlp?.geo_tags

  return (
    <div
      className={`card p-4 flex flex-col gap-3 cursor-pointer group ${highFake ? 'border-red-200 bg-red-50/30' : ''}`}
      onClick={() => navigate(`/article/${id}`)}
    >
      {/* Top: source + time + category */}
      <div className="flex items-start justify-between gap-2">
        <SourceBadge source={source} sourceInfo={source_info} />
        <div className="flex items-center gap-1.5 shrink-0">
          {published_at && (
            <span className="flex items-center gap-0.5 text-[10px] text-slate-400">
              <Clock size={10} />{timeAgo(published_at)}
            </span>
          )}
          <CategoryTag category={category} />
        </div>
      </div>

      {/* Image */}
      {image_url && (
        <img
          src={image_url}
          alt={title}
          className="w-full h-36 object-cover rounded-xl"
          onError={e => { e.target.style.display = 'none' }}
        />
      )}

      {/* Warning + Title */}
      <div>
        {(highFake || isClickbait) && (
          <div className="flex items-center gap-1 text-xs text-amber-600 mb-1 font-medium">
            <AlertTriangle size={12} />
            {highFake ? 'Potentially Misleading Content' : 'Clickbait Detected'}
          </div>
        )}
        <h3 className="font-semibold text-slate-900 text-sm leading-snug line-clamp-2 group-hover:text-indigo-700 transition-colors">
          {title}
        </h3>
      </div>

      {/* AI Summary (Inshorts style) */}
      {summary && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 bg-indigo-50/60 rounded-lg px-3 py-2 border-l-2 border-indigo-200">
          {summary}
        </p>
      )}

      {/* Geo badge */}
      {geoTags && (geoTags.primary_country || geoTags.primary_region !== 'Global') && (
        <GeoBadge geoTags={geoTags} compact />
      )}

      {/* Polarity bar */}
      {nlp?.sentiment_scores && <PolarityBar scores={nlp.sentiment_scores} />}

      {/* NLP badges */}
      <div className="flex flex-wrap gap-1.5">
        {nlp?.sentiment && <SentimentBadge sentiment={nlp.sentiment} />}
        <FakeScoreBadge score={nlp?.fake_score} />
        <BiasIndicator bias={nlp?.bias} />
        <CredibilityScore score={nlp?.credibility_score} />
      </div>

      {/* Who posted + actions row */}
      <div
        className="flex items-center justify-between pt-2 border-t border-slate-100 mt-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center gap-1.5">
          {source_info?.credibility && (
            <div className="flex items-center gap-1 text-xs text-slate-400">
              <Shield size={11} />
              <span>{source_info.country}</span>
              <span>·</span>
              <span>{source_info.type}</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <ArticleActions article={article} compact />
          {url && (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-0.5 text-xs text-slate-400 hover:text-slate-600"
            >
              <ExternalLink size={11} />
            </a>
          )}
        </div>
      </div>

      {/* Read more */}
      <button
        className="text-xs text-indigo-600 hover:text-indigo-800 font-medium text-left -mt-1"
        onClick={e => { e.stopPropagation(); navigate(`/article/${id}`) }}
      >
        Full NLP Analysis →
      </button>
    </div>
  )
}
