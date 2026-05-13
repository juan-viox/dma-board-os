/**
 * DMA caduceus logo — inline SVG with currentColor fill so it adapts to context.
 * Verbatim port of the SVG defined in brand-card.html.
 */
type Props = { className?: string; ariaLabel?: string }

export function DmaLogo({ className = 'h-12 w-12', ariaLabel = 'Dominican Medical Association logo' }: Props) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 200"
      role="img"
      aria-label={ariaLabel}
      style={{ shapeRendering: 'geometricPrecision' }}
    >
      {/* Outer medallion ring */}
      <circle cx="100" cy="100" r="94" fill="none" stroke="currentColor" strokeWidth="3" />
      <circle cx="100" cy="100" r="86" fill="none" stroke="currentColor" strokeWidth="1" opacity="0.5" />
      {/* Vertical staff */}
      <line x1="100" y1="44" x2="100" y2="160" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      {/* Wings */}
      <path d="M 100 56 Q 70 50 56 70 Q 64 60 80 60 Q 88 60 92 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 100 56 Q 130 50 144 70 Q 136 60 120 60 Q 112 60 108 64" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 84 62 L 76 70 M 78 66 L 70 74 M 88 66 L 82 72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <path d="M 116 62 L 124 70 M 122 66 L 130 74 M 112 66 L 118 72" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.7" />
      <circle cx="100" cy="44" r="5" fill="currentColor" />
      {/* Two intertwined snakes */}
      <path d="M 100 70 C 78 78 78 92 100 100 C 122 108 122 122 100 130 C 78 138 78 152 100 160" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <path d="M 100 70 C 122 78 122 92 100 100 C 78 108 78 122 100 130 C 122 138 122 152 100 160" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="80" cy="76" r="3" fill="currentColor" />
      <circle cx="120" cy="76" r="3" fill="currentColor" />
      <text x="100" y="178" textAnchor="middle" fontFamily="Fraunces, Georgia, serif" fontWeight="700" fontSize="14" letterSpacing="3" fill="currentColor">DMA · NY</text>
      <path d="M 168 96 Q 172 92 178 94 Q 174 96 172 100 Q 174 96 178 100 Q 174 102 172 102 Q 174 104 178 106 Q 174 106 170 104 L 170 110" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" opacity="0.55" />
      <text x="100" y="32" textAnchor="middle" fontFamily="Jost, sans-serif" fontWeight="500" fontSize="8" letterSpacing="2" fill="currentColor" opacity="0.8">EST 1997</text>
    </svg>
  )
}
