import type { ArtKind } from '../data/products'

interface Props {
  art: ArtKind
  palette: [string, string, string]
  label: string
  className?: string
  /** true হলে নিজের ফ্রেম আঁকে না। কার্ডে সেলাই আর আলপনা আলাদা আসে। */
  plain?: boolean
}

/**
 * সব পণ্যের ছবি হাতে আঁকা এসভিজি। কোনো ফটো নেই।
 * প্রতিটি কাজের নিজের নকশা আছে। যেমন জামদানির ফুল, কাঁথার সেলাই।
 */
export default function ProductArt({ art, palette, label, className, plain = false }: Props) {
  const [c1, c2, c3] = palette
  return (
    <svg
      viewBox="0 0 400 300"
      role="img"
      aria-label={label}
      className={className}
      preserveAspectRatio="xMidYMid slice"
    >
      <rect width="400" height="300" fill={c3} />
      {!plain && (
        <>
          <g fill={c1} opacity="0.9">
            <circle cx="18" cy="18" r="4" />
            <circle cx="382" cy="18" r="4" />
            <circle cx="18" cy="282" r="4" />
            <circle cx="382" cy="282" r="4" />
          </g>
          <rect x="10" y="10" width="380" height="280" fill="none" stroke={c1} strokeWidth="3" rx="10" />
          <rect x="18" y="18" width="364" height="264" fill="none" stroke={c2} strokeWidth="1.5" strokeDasharray="8 6" rx="8" />
        </>
      )}
      {art === 'jamdani' && (
        <g>
          <rect x="60" y="40" width="280" height="220" rx="8" fill={c1} />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3, 4].map((col) => (
              <g key={`${r}-${col}`} transform={`translate(${95 + col * 52}, ${70 + r * 48})`}>
                <path d="M0,-16 L12,0 L0,16 L-12,0 Z" fill={c2} />
                <circle r="4" fill={c3} />
              </g>
            )),
          )}
          <rect x="60" y="40" width="280" height="18" fill={c2} />
          <rect x="60" y="242" width="280" height="18" fill={c2} />
        </g>
      )}
      {art === 'kantha' && (
        <g>
          <circle cx="200" cy="150" r="88" fill={c1} />
          <circle cx="200" cy="150" r="66" fill="none" stroke={c3} strokeWidth="3" strokeDasharray="6 6" />
          <circle cx="200" cy="150" r="44" fill="none" stroke={c2} strokeWidth="3" strokeDasharray="6 6" />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <path key={a} d="M0,-88 Q10,-50 0,-30 Q-10,-50 0,-88" fill={c2} transform={`rotate(${a} 200 150) translate(200 150)`} />
          ))}
          <circle cx="200" cy="150" r="12" fill={c2} />
          <g stroke={c3} strokeWidth="2" strokeDasharray="5 5">
            <line x1="40" y1="60" x2="360" y2="60" />
            <line x1="40" y1="240" x2="360" y2="240" />
          </g>
        </g>
      )}
      {art === 'monipuri' && (
        <g>
          <rect x="70" y="40" width="260" height="220" rx="6" fill={c1} />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={86 + i * 40} y="52" width="18" height="196" fill={i % 2 ? c2 : c3} opacity="0.9" />
          ))}
          <path d="M70,120 L330,120 L330,180 L70,180 Z" fill={c1} opacity="0.85" />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path key={i} d={`M${92 + i * 36},132 l10,14 l-10,14 l-10,-14 Z`} fill={c2} />
          ))}
        </g>
      )}
      {art === 'terracotta' && (
        <g fill={c1}>
          <ellipse cx="130" cy="235" rx="62" ry="14" fill={c2} />
          <ellipse cx="270" cy="235" rx="62" ry="14" fill={c2} />
          <path d="M95,120 Q130,95 165,120 L158,210 Q130,228 102,210 Z" />
          <path d="M235,110 Q270,85 305,110 L298,205 Q270,222 242,205 Z" />
          <path d="M118,95 Q130,80 142,95 L138,118 L122,118 Z" fill={c2} />
          <path d="M258,85 Q270,70 282,85 L278,108 L262,108 Z" fill={c2} />
          <g fill={c3}>
            <circle cx="130" cy="150" r="7" />
            <circle cx="130" cy="180" r="7" />
            <circle cx="270" cy="145" r="7" />
            <circle cx="270" cy="175" r="7" />
          </g>
        </g>
      )}
      {art === 'jhapi' && (
        <g>
          <ellipse cx="200" cy="240" rx="110" ry="16" fill={c2} opacity="0.5" />
          <path d="M110,150 Q110,70 200,70 Q290,70 290,150 L290,190 Q290,235 200,235 Q110,235 110,190 Z" fill={c1} />
          <path d="M110,150 Q200,120 290,150" fill="none" stroke={c3} strokeWidth="4" />
          <circle cx="200" cy="98" r="14" fill={c2} />
          <rect x="185" y="62" width="30" height="14" rx="7" fill={c2} />
          <g fill={c3}>
            <circle cx="150" cy="180" r="6" />
            <circle cx="200" cy="190" r="6" />
            <circle cx="250" cy="180" r="6" />
          </g>
          <text x="200" y="140" textAnchor="middle" fontSize="26" fill={c3} fontFamily="Noto Serif Bengali, serif">৳</text>
        </g>
      )}
      {art === 'bamboo' && (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <rect key={i} x={90 + i * 38} y="80" width="20" height="150" rx="8" fill={i % 2 ? c1 : c2} />
          ))}
          {[0, 1, 2].map((i) => (
            <rect key={i} x="80" y={105 + i * 48} width="240" height="18" rx="9" fill={c1} opacity="0.85" />
          ))}
          <path d="M90,80 Q200,55 310,80" fill="none" stroke={c1} strokeWidth="8" />
          <path d="M150,55 Q200,30 250,55" fill="none" stroke={c2} strokeWidth="6" />
        </g>
      )}
      {art === 'jute' && (
        <g>
          <path d="M120,100 L280,100 L300,240 Q200,260 100,240 Z" fill={c1} />
          <path d="M150,100 Q150,60 200,60 Q250,60 250,100" fill="none" stroke={c1} strokeWidth="10" />
          <g stroke={c3} strokeWidth="2" opacity="0.7">
            {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
              <line key={i} x1={120 + i * 22} y1="105" x2={115 + i * 24} y2="238" />
            ))}
          </g>
          <circle cx="200" cy="175" r="34" fill={c2} />
          <text x="200" y="185" textAnchor="middle" fontSize="24" fill={c3} fontFamily="Noto Serif Bengali, serif">পাট</text>
        </g>
      )}
      {art === 'rickshaw' && (
        <g>
          <rect x="55" y="55" width="290" height="190" rx="12" fill={c1} />
          <circle cx="200" cy="150" r="62" fill={c2} />
          <circle cx="200" cy="150" r="46" fill={c3} />
          <path d="M200,112 Q228,150 200,188 Q172,150 200,112" fill={c1} />
          <path d="M168,128 Q200,150 232,128" fill="none" stroke={c1} strokeWidth="4" />
          <circle cx="200" cy="150" r="10" fill={c2} />
          {[0, 1, 2, 3].map((i) => (
            <circle key={i} cx={95 + i * 16} cy="215" r="6" fill={c2} />
          ))}
        </g>
      )}
      {art === 'gamchha' && (
        <g>
          <rect x="70" y="45" width="260" height="210" rx="6" fill={c3} />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect key={i} x={70 + i * 52} y="45" width="26" height="210" fill={i % 2 ? c1 : c2} opacity="0.85" />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <rect key={i} x="70" y={45 + i * 52} width="260" height="26" fill={i % 2 ? c2 : c1} opacity="0.55" />
          ))}
          <rect x="70" y="45" width="260" height="210" fill="none" stroke={c1} strokeWidth="4" rx="6" />
        </g>
      )}
      {art === 'cushion' && (
        <g>
          <rect x="75" y="70" width="250" height="170" rx="18" fill={c1} />
          <rect x="90" y="85" width="220" height="140" rx="12" fill="none" stroke={c3} strokeWidth="3" strokeDasharray="7 6" />
          <circle cx="200" cy="155" r="42" fill={c2} />
          {[0, 60, 120, 180, 240, 300].map((a) => (
            <ellipse key={a} cx="200" cy="113" rx="10" ry="20" fill={c3} transform={`rotate(${a} 200 155)`} />
          ))}
          <circle cx="200" cy="155" r="12" fill={c1} />
        </g>
      )}
      {art === 'kansa' && (
        <g>
          <ellipse cx="200" cy="245" rx="120" ry="12" fill={c2} opacity="0.5" />
          <ellipse cx="150" cy="190" rx="70" ry="38" fill={c1} />
          <ellipse cx="150" cy="182" rx="58" ry="28" fill={c2} />
          <path d="M245,130 L285,130 L278,215 Q265,228 252,215 Z" fill={c1} />
          <path d="M245,130 Q265,112 285,130" fill="none" stroke={c1} strokeWidth="6" />
          <circle cx="150" cy="190" r="18" fill={c3} opacity="0.8" />
        </g>
      )}
      {art === 'pitha' && (
        <g>
          <rect x="80" y="85" width="240" height="130" rx="60" fill={c1} />
          <rect x="100" y="105" width="200" height="90" rx="40" fill="none" stroke={c3} strokeWidth="3" strokeDasharray="6 6" />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle key={i} cx={130 + i * 35} cy="150" r="14" fill={c2} />
          ))}
        </g>
      )}
      {art === 'pati' && (
        <g>
          <rect x="60" y="70" width="280" height="170" rx="8" fill={c1} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <rect key={i} x={70 + i * 34} y="78" width="16" height="154" fill={i % 2 ? c2 : c3} opacity="0.9" />
          ))}
          <rect x="60" y="120" width="280" height="14" fill={c2} />
          <rect x="60" y="175" width="280" height="14" fill={c2} />
        </g>
      )}
      {art === 'diya' && (
        <g>
          {[0, 1, 2].map((i) => (
            <g key={i} transform={`translate(${105 + i * 95}, 0)`}>
              <path d="M0,170 Q-45,170 -45,195 Q-45,215 0,215 Q45,215 45,195 Q45,170 0,170" fill={c1} />
              <path d="M0,150 Q-12,170 0,185 Q12,170 0,150" fill={c2} />
              <ellipse cx="0" cy="145" rx="7" ry="12" fill="#fde68a" />
            </g>
          ))}
          <ellipse cx="200" cy="245" rx="130" ry="10" fill={c2} opacity="0.4" />
        </g>
      )}
    </svg>
  )
}
