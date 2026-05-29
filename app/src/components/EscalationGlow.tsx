import { useAppStore } from '../state/appStore'

export default function EscalationGlow() {
  const escalated = useAppStore((s) => s.escalated)
  if (!escalated) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-50"
      style={{
        boxShadow: 'inset 0 0 80px 30px rgba(220, 38, 38, 0.35)',
        animation: 'pulse 2.5s ease-in-out infinite',
      }}
    >
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.6; }
          50% { opacity: 1; }
        }
      `}</style>
    </div>
  )
}
