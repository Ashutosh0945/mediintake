import { RISK_COLORS } from '../lib/riskScoring'

export default function RiskBadge({ level, score, showScore = false }) {
  const colors = RISK_COLORS[level] ?? RISK_COLORS.low
  const label = level?.charAt(0).toUpperCase() + level?.slice(1)

  return (
    <span className={`inline-flex items-center gap-1.5 ${colors.bg} px-2.5 py-0.5 rounded-full text-xs font-semibold`}>
      <span className={`w-1.5 h-1.5 rounded-full ${colors.dot} animate-pulse-slow`} />
      {label} Risk
      {showScore && <span className="opacity-60">· {score}</span>}
    </span>
  )
}
