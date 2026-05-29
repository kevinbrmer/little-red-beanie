import type { FaceExpression } from '../state/appStore'

interface Props {
  clothingColor: string | null  // hex
  face: FaceExpression
  showFace: boolean             // false in Phase 2, true from Phase 3 on
}

const FACE_HREF: Record<FaceExpression, string> = {
  happy: '/images/faces/happy.svg',
  surprised: '/images/faces/surprised.svg',
  scared: '/images/faces/scared.svg',
  sad: '/images/faces/sad.svg',
}

export default function KimiSilhouette({ clothingColor, face, showFace }: Props) {
  const cloth = clothingColor ?? '#ffffff'
  const transitionStyle = { transition: 'fill 1s ease-in-out' }

  return (
    <svg viewBox="0 0 400 600" className="h-full w-full">
      {/* Hair — always dark */}
      <path
        d="M 130 120 Q 110 80 200 70 Q 290 80 270 120 Q 280 100 280 150 L 270 180 Q 200 160 130 180 L 120 150 Q 120 100 130 120 Z"
        fill="#1a1a1a"
      />
      {/* Skin */}
      <ellipse cx="200" cy="170" rx="60" ry="70" fill="#e8b896" />
      <rect x="180" y="225" width="40" height="30" fill="#e8b896" />
      <circle cx="120" cy="380" r="18" fill="#e8b896" />
      <circle cx="280" cy="380" r="18" fill="#e8b896" />
      {/* Clothing — colored via prop with 1s transition */}
      <path
        d="M 145 240 L 255 240 L 290 380 L 320 560 L 80 560 L 110 380 Z"
        fill={cloth}
        stroke="#1a1a1a"
        strokeWidth="3"
        style={transitionStyle}
      />
      <path
        d="M 145 245 L 105 380 L 135 380 L 165 250 Z"
        fill={cloth}
        stroke="#1a1a1a"
        strokeWidth="3"
        style={transitionStyle}
      />
      <path
        d="M 255 245 L 295 380 L 265 380 L 235 250 Z"
        fill={cloth}
        stroke="#1a1a1a"
        strokeWidth="3"
        style={transitionStyle}
      />
      {/* Face slot — only after Phase 3 */}
      {showFace && (
        <image
          href={FACE_HREF[face]}
          x="155"
          y="135"
          width="90"
          height="90"
        />
      )}
    </svg>
  )
}
