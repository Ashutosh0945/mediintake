export default function LoadingSpinner({ size = 'lg', text = 'Loading…' }) {
  const s = size === 'sm' ? 'w-5 h-5' : 'w-10 h-10'
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4">
      <div className={`${s} border-2 border-slate-700 border-t-teal-500 rounded-full animate-spin`} />
      {text && <p className="text-slate-400 text-sm">{text}</p>}
    </div>
  )
}

export function InlineSpinner() {
  return <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin inline-block" />
}
