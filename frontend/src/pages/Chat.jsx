import { useState, useRef, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Send, Bot, User, Loader } from 'lucide-react'
import { sendChat } from '../services/api'

const SUGGESTIONS = [
  'Summarize today\'s top news for me',
  'Which articles have the highest fake score?',
  'What\'s the general sentiment of today\'s news?',
  'Explain how fake news detection works',
  'What does political bias in news mean?',
]

function Message({ msg }) {
  const isUser = msg.role === 'user'
  return (
    <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
        isUser ? 'bg-indigo-600' : 'bg-slate-200'
      }`}>
        {isUser ? <User size={14} className="text-white" /> : <Bot size={14} className="text-slate-600" />}
      </div>
      <div className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
        isUser
          ? 'bg-indigo-600 text-white rounded-tr-sm'
          : 'bg-white border border-slate-200 text-slate-800 rounded-tl-sm'
      }`}>
        {msg.content}
      </div>
    </div>
  )
}

export default function Chat() {
  const [searchParams] = useSearchParams()
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m TruthLens AI. I can help you understand today\'s news, explain fake news detection, analyze media bias, or answer questions about any articles you\'ve analyzed. What would you like to know?' }
  ])
  const [input, setInput] = useState(decodeURIComponent(searchParams.get('q') || ''))
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg) return

    setInput('')
    setMessages(prev => [...prev, { role: 'user', content: userMsg }])
    setLoading(true)

    try {
      const history = messages.slice(-8).map(m => ({ role: m.role, content: m.content }))
      const { reply } = await sendChat(userMsg, history)
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Sorry, something went wrong. Make sure the backend is running.' }])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 flex flex-col h-[calc(100vh-56px)]">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-900">AI Chat</h1>
        <p className="text-sm text-slate-500">Ask anything about news, fake detection, bias, or today's headlines</p>
      </div>

      {/* Chat window */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 bg-slate-50 rounded-2xl p-4 border border-slate-200">
        {messages.map((m, i) => <Message key={i} msg={m} />)}
        {loading && (
          <div className="flex gap-3">
            <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center shrink-0">
              <Bot size={14} className="text-slate-600" />
            </div>
            <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-sm px-4 py-3">
              <Loader size={14} className="animate-spin text-slate-400" />
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggestions */}
      {messages.length <= 1 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {SUGGESTIONS.map(s => (
            <button key={s} onClick={() => send(s)}
              className="text-xs bg-white border border-slate-200 text-slate-600 px-3 py-1.5 rounded-full hover:border-indigo-300 hover:text-indigo-600 transition-colors">
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={e => { e.preventDefault(); send() }} className="flex gap-2">
        <input
          type="text"
          placeholder="Ask about news, bias, fake detection…"
          className="input flex-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading || !input.trim()} className="btn-primary flex items-center gap-1.5 disabled:opacity-50">
          <Send size={15} /> Send
        </button>
      </form>
    </div>
  )
}
