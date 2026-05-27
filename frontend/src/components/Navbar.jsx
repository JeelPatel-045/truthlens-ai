import { Link, useLocation } from 'react-router-dom'
import { Newspaper, TrendingUp, Search, MessageSquare, BarChart2 } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { to: '/',         label: 'Feed',     Icon: Newspaper },
  { to: '/trends',   label: 'Trends',   Icon: TrendingUp },
  { to: '/analyze',  label: 'Analyze',  Icon: Search },
  { to: '/chat',     label: 'AI Chat',  Icon: MessageSquare },
]

export default function Navbar() {
  const { pathname } = useLocation()
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
            <BarChart2 size={16} className="text-white" />
          </div>
          <span className="font-bold text-slate-900 text-lg tracking-tight">TruthLens</span>
          <span className="text-xs font-medium bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded-md">AI</span>
        </Link>

        {/* Nav links */}
        <nav className="hidden md:flex items-center gap-1">
          {NAV.map(({ to, label, Icon }) => (
            <Link
              key={to}
              to={to}
              className={clsx(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors',
                pathname === to
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              )}
            >
              <Icon size={15} />
              {label}
            </Link>
          ))}
        </nav>

        {/* Mobile nav */}
        <nav className="flex md:hidden items-center gap-1">
          {NAV.map(({ to, Icon }) => (
            <Link
              key={to}
              to={to}
              className={clsx(
                'p-2 rounded-lg transition-colors',
                pathname === to ? 'bg-indigo-50 text-indigo-700' : 'text-slate-500 hover:bg-slate-50'
              )}
            >
              <Icon size={18} />
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
