import { useAppStore } from '../state/appStore'

export default function EscalationGlow() {
  const escalated = useAppStore((s) => s.escalated)
  if (!escalated) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50"
      style={{
        // Warm, calming halo — not alarm red. Matches editorial palette.
        boxShadow: 'inset 0 0 120px 40px rgba(199, 80, 58, 0.22)',
        animation: 'escalation-pulse 3s cubic-bezier(0.4, 0, 0.2, 1) infinite',
      }}
    >
      <style>{`
        @keyframes escalation-pulse {
          0%, 100% { opacity: 0.55; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
