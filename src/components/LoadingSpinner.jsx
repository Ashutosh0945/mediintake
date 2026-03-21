export default function LoadingSpinner({ size = 'lg', text = 'Loading…' }) {
  const s = size === 'sm' ? 'w-5 h-5' : 'w-10 h-10'
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: '#EEF2F7' }}>
      <div style={{ position: 'relative' }}>
        <div className={`${s} rounded-full`} style={{ border: '3px solid #C5D3E8', borderTopColor: '#1565C0', animation: 'spin 0.8s linear infinite' }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
      {text && <p style={{ color: '#8FA3C0', fontSize: '14px', fontWeight: 500 }}>{text}</p>}
    </div>
  )
}

export function InlineSpinner() {
  return (
    <>
      <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
