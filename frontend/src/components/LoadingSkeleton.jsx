export default function LoadingSkeleton({ count = 6 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card p-4 animate-pulse">
          <div className="h-3 bg-slate-200 rounded w-1/3 mb-3" />
          <div className="h-4 bg-slate-200 rounded w-full mb-2" />
          <div className="h-4 bg-slate-200 rounded w-4/5 mb-4" />
          <div className="h-24 bg-slate-100 rounded-xl mb-3" />
          <div className="h-3 bg-slate-200 rounded w-2/3 mb-2" />
          <div className="flex gap-2 mt-3">
            <div className="h-5 w-16 bg-slate-200 rounded-full" />
            <div className="h-5 w-20 bg-slate-200 rounded-full" />
            <div className="h-5 w-14 bg-slate-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  )
}
