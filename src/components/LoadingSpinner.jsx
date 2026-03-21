export default function LoadingSpinner({ text = 'Loading…' }) {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '16px', background: '#020617' }}>
      <div style={{ width: '40px', height: '40px', border: '3px solid rgba(8,145,178,0.15)', borderTopColor: '#22D3EE', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      {text && <p style={{ color: 'rgba(103,232,249,0.4)', fontSize: '14px', fontWeight: 500 }}>{text}</p>}
    </div>
  )
}
export function InlineSpinner() {
  return (
    <>
      <div style={{ width: '14px', height: '14px', border: '2px solid rgba(255,255,255,0.25)', borderTopColor: 'white', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite', flexShrink: 0 }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  )
}
