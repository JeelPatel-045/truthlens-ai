import { useState, useEffect, useCallback, useRef } from 'react'
import { Search, RefreshCw, Bell, Clock, Rss } from 'lucide-react'
import NewsCard from '../components/NewsCard'
import LoadingSkeleton from '../components/LoadingSkeleton'
import { fetchFeed } from '../services/api'

const CATEGORIES = [
  { value: null,            label: 'All' },
  { value: 'general',       label: '📰 General' },
  { value: 'technology',    label: '💻 Tech' },
  { value: 'business',      label: '💼 Business' },
  { value: 'health',        label: '🏥 Health' },
  { value: 'science',       label: '🔬 Science' },
  { value: 'sports',        label: '⚽ Sports' },
  { value: 'entertainment', label: '🎬 Entertainment' },
]

const RSS_SOURCES = ['All Sources', 'BBC News', 'TechCrunch', 'NPR', 'Al Jazeera', 'Ars Technica', 'The Guardian', 'Hacker News']

const AUTO_REFRESH_MS = 5 * 60 * 1000  // 5 minutes

function useTimeAgo(date) {
  const [label, setLabel] = useState('')
  useEffect(() => {
    const update = () => {
      if (!date) return
      const diff = Math.floor((Date.now() - date.getTime()) / 1000)
      if (diff < 60) setLabel('just now')
      else if (diff < 3600) setLabel(`${Math.floor(diff / 60)}m ago`)
      else setLabel(`${Math.floor(diff / 3600)}h ago`)
    }
    update()
    const t = setInterval(update, 30000)
    return () => clearInterval(t)
  }, [date])
  return label
}

export default function Home() {
  const [articles, setArticles] = useState([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [category, setCategory] = useState(null)
  const [query, setQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [sourceFilter, setSourceFilter] = useState('All Sources')
  const [error, setError] = useState(null)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [newCount, setNewCount] = useState(0)
  const [showNewBanner, setShowNewBanner] = useState(false)
  const prevIdsRef = useRef(new Set())
  const updatedLabel = useTimeAgo(lastUpdated)

  const loadArticles = useCallback(async (cat, q, src, silent = false) => {
    if (!silent) setLoading(true)
    else setRefreshing(true)
    setError(null)
    try {
      const params = { category: cat || undefined, q: q || undefined }
      if (src && src !== 'All Sources') params.source = src
      const data = await fetchFeed(params.category, params.q)

      // Detect new articles on silent refresh
      if (silent && prevIdsRef.current.size > 0) {
        const freshIds = new Set(data.map(a => a.id))
        const newOnes = [...freshIds].filter(id => !prevIdsRef.current.has(id))
        if (newOnes.length > 0) {
          setNewCount(newOnes.length)
          setShowNewBanner(true)
        }
      }

      prevIdsRef.current = new Set(data.map(a => a.id))
      setArticles(data)
      setLastUpdated(new Date())
    } catch {
      setError('Failed to load news. Make sure the backend is running on port 8003.')
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  // Initial load
  useEffect(() => { loadArticles(category, query, sourceFilter) }, [category, query, sourceFilter])

  // Auto-refresh every 5 minutes (silent)
  useEffect(() => {
    const timer = setInterval(() => {
      loadArticles(category, query, sourceFilter, true)
    }, AUTO_REFRESH_MS)
    return () => clearInterval(timer)
  }, [category, query, sourceFilter, loadArticles])

  const handleSearch = e => {
    e.preventDefault()
    setQuery(searchInput)
    setCategory(null)
  }

  const handleCategoryChange = (cat) => {
    setCategory(cat)
    setQuery('')
    setSearchInput('')
  }

  const handleNewBannerClick = () => {
    setShowNewBanner(false)
    setNewCount(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const visibleArticles = sourceFilter !== 'All Sources'
    ? articles.filter(a => (a.source || '').toLowerCase().includes(sourceFilter.toLowerCase()))
    : articles

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">

      {/* New articles banner */}
      {showNewBanner && (
        <div
          className="fixed top-16 left-1/2 -translate-x-1/2 z-40 bg-indigo-600 text-white px-5 py-2.5 rounded-full shadow-lg flex items-center gap-2 text-sm cursor-pointer hover:bg-indigo-700 transition-colors"
          onClick={handleNewBannerClick}
        >
          <Bell size={14} />
          {newCount} new article{newCount > 1 ? 's' : ''} available — tap to see
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Rss size={20} className="text-indigo-600" />
            Live News Feed
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Auto-analyzed from BBC, TechCrunch, NPR, Al Jazeera & more
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-400 self-end">
          {lastUpdated && (
            <span className="flex items-center gap-1">
              <Clock size={11} /> Updated {updatedLabel}
            </span>
          )}
          <button
            onClick={() => loadArticles(category, query, sourceFilter, false)}
            disabled={loading || refreshing}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={13} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-4">
        <div className="relative flex-1 max-w-lg">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search topics, events, people…"
            className="input pl-8"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
          />
        </div>
        <button type="submit" className="btn-primary text-sm">Search</button>
      </form>

      {/* Category pills */}
      <div className="flex gap-2 flex-wrap mb-3">
        {CATEGORIES.map(c => (
          <button
            key={c.label}
            onClick={() => handleCategoryChange(c.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              category === c.value
                ? 'bg-indigo-600 text-white'
                : 'bg-white border border-slate-200 text-slate-600 hover:border-indigo-300 hover:text-indigo-600'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Source filter */}
      <div className="flex gap-2 flex-wrap mb-5 pb-4 border-b border-slate-100">
        <span className="text-xs text-slate-400 self-center mr-1">Source:</span>
        {RSS_SOURCES.map(s => (
          <button
            key={s}
            onClick={() => setSourceFilter(s)}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
              sourceFilter === s
                ? 'bg-slate-800 text-white'
                : 'bg-white border border-slate-200 text-slate-500 hover:border-slate-400'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-4 text-sm">
          {error}
        </div>
      )}

      {/* Stats bar */}
      {!loading && visibleArticles.length > 0 && (
        <div className="flex items-center gap-4 mb-4 text-xs text-slate-400">
          <span>{visibleArticles.length} articles</span>
          <span>·</span>
          <span>{visibleArticles.filter(a => (a.nlp?.fake_score ?? 0) >= 65).length} flagged as suspicious</span>
          <span>·</span>
          <span>Auto-refreshes every 5 min</span>
        </div>
      )}

      {/* Grid */}
      {loading ? (
        <div>
          <p className="text-xs text-slate-400 mb-4 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
            Fetching from multiple sources and running NLP analysis…
          </p>
          <LoadingSkeleton count={6} />
        </div>
      ) : visibleArticles.length === 0 ? (
        <div className="text-center py-16 text-slate-400">
          <p className="text-4xl mb-3">📰</p>
          <p>No articles found for this filter.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleArticles.map(a => <NewsCard key={a.id} article={a} />)}
        </div>
      )}
    </div>
  )
}
