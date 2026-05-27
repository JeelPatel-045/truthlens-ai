import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bookmark, BookmarkCheck, Share2, Copy, Check, Bot, Search, Download } from 'lucide-react'

function useBookmark(articleId) {
  const key = `tl_saved_${articleId}`
  const [saved, setSaved] = useState(() => !!localStorage.getItem(key))

  const toggle = (article) => {
    if (saved) {
      localStorage.removeItem(key)
      setSaved(false)
    } else {
      localStorage.setItem(key, JSON.stringify({ id: articleId, title: article?.title, saved_at: new Date().toISOString() }))
      setSaved(true)
    }
  }
  return { saved, toggle }
}

function ActionBtn({ icon: Icon, label, onClick, active, color = 'slate' }) {
  const colors = {
    slate:  'bg-slate-50 text-slate-600 hover:bg-slate-100 border-slate-200',
    indigo: 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200',
    green:  'bg-green-50 text-green-700 hover:bg-green-100 border-green-200',
    amber:  'bg-amber-50 text-amber-700 hover:bg-amber-100 border-amber-200',
  }
  return (
    <button
      onClick={onClick}
      title={label}
      className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-colors ${active ? colors[color] : colors.slate}`}
    >
      <Icon size={13} />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}

export default function ArticleActions({ article, compact = false }) {
  const navigate = useNavigate()
  const { saved, toggle } = useBookmark(article?.id)
  const [copied, setCopied] = useState(false)

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback
    }
  }

  const handleShare = () => {
    const url = article?.url || window.location.href
    if (navigator.share) {
      navigator.share({ title: article?.title, url }).catch(() => {})
    } else {
      copyToClipboard(url)
    }
  }

  const handleCopySummary = () => {
    const summary = article?.summary || article?.title || ''
    copyToClipboard(summary)
  }

  const handleAskAI = () => {
    const msg = encodeURIComponent(`Tell me more about: "${article?.title}"`)
    navigate(`/chat?q=${msg}`)
  }

  const handleFindSimilar = () => {
    const words = (article?.title || '').split(' ').slice(0, 3).join(' ')
    navigate(`/?q=${encodeURIComponent(words)}`)
  }

  const handleDownload = () => {
    const nlp = article?.nlp || {}
    const data = {
      title: article?.title,
      source: article?.source,
      summary: article?.summary,
      analysis: {
        sentiment: nlp.sentiment,
        fake_score: nlp.fake_score,
        credibility: nlp.credibility_score,
        bias: nlp.bias?.label,
        geo: nlp.geo_tags?.primary_country,
        reading_level: nlp.reading_level,
      },
      exported_at: new Date().toISOString(),
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const link = document.createElement('a')
    link.href = URL.createObjectURL(blob)
    link.download = `truthlens_${article?.id || 'analysis'}.json`
    link.click()
  }

  if (compact) {
    return (
      <div className="flex items-center gap-1.5">
        <button
          onClick={() => toggle(article)}
          className={`p-1.5 rounded-lg transition-colors ${saved ? 'text-indigo-600 bg-indigo-50' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
          title={saved ? 'Saved' : 'Save'}
        >
          {saved ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
        </button>
        <button
          onClick={handleShare}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
          title="Share"
        >
          <Share2 size={14} />
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-wrap gap-2">
      <ActionBtn
        icon={saved ? BookmarkCheck : Bookmark}
        label={saved ? 'Saved' : 'Save'}
        onClick={() => toggle(article)}
        active={saved}
        color="indigo"
      />
      <ActionBtn
        icon={Share2}
        label="Share"
        onClick={handleShare}
      />
      <ActionBtn
        icon={copied ? Check : Copy}
        label={copied ? 'Copied!' : 'Copy Summary'}
        onClick={handleCopySummary}
        active={copied}
        color="green"
      />
      <ActionBtn
        icon={Bot}
        label="Ask AI"
        onClick={handleAskAI}
        color="indigo"
      />
      <ActionBtn
        icon={Search}
        label="Find Similar"
        onClick={handleFindSimilar}
      />
      <ActionBtn
        icon={Download}
        label="Export"
        onClick={handleDownload}
        color="amber"
      />
    </div>
  )
}
