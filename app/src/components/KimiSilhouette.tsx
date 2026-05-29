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

// Soft warm ink for outlines — matches --color-ink
const INK = '#1F1B16'
const HAIR = '#231C16'
const SKIN = '#E3B79A'

export default function KimiSilhouette({ clothingColor, face, showFace }: Props) {
  const cloth = clothingColor ?? '#FBF7EE' // paper-tone when empty, not stark white
  const transitionStyle = { transition: 'fill 1s ease-in-out' }

  return (
    <svg
      viewBox="0 0 400 600"
      className="h-full w-full"
      style={{
        filter:
          'drop-shadow(0 6px 18px rgba(31, 27, 22, 0.18)) drop-shadow(0 2px 4px rgba(31, 27, 22, 0.10))',
      }}
    >
      {/* Hair — always dark, warm-black */}
      <path
        d="M 130 120 Q 110 80 200 70 Q 290 80 270 120 Q 280 100 280 150 L 270 180 Q 200 160 130 180 L 120 150 Q 120 100 130 120 Z"
        fill={HAIR}
      />
      {/* Skin */}
      <ellipse cx="200" cy="170" rx="60" ry="70" fill={SKIN} />
      <rect x="180" y="225" width="40" height="30" fill={SKIN} />
      <circle cx="120" cy="380" r="18" fill={SKIN} />
      <circle cx="280" cy="380" r="18" fill={SKIN} />
      {/* Clothing — colored via prop with 1s transition. Softer strokes (2px),
          rounded line joins for an illustrated feel. */}
      <path
        d="M 145 240 L 255 240 L 290 380 L 320 560 L 80 560 L 110 380 Z"
        fill={cloth}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={transitionStyle}
      />
      <path
        d="M 145 245 L 105 380 L 135 380 L 165 250 Z"
        fill={cloth}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        style={transitionStyle}
      />
      <path
        d="M 255 245 L 295 380 L 265 380 L 235 250 Z"
        fill={cloth}
        stroke={INK}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
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
