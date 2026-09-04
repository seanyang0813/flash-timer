import { useMemo } from 'react';

const LEFT = 82;
const RIGHT = 638;
const TOP = 62;
const BOTTOM = 350;
const MID = (TOP + BOTTOM) / 2;
const PERIOD = BOTTOM - TOP;

function pathCopies(power) {
  const copies = [];
  const count = Math.max(3, Math.ceil(Math.abs(power)) + 3);
  for (let copy = -count; copy <= count; copy += 1) {
    const points = [];
    for (let index = 0; index <= 180; index += 1) {
      const s = index / 180;
      const x = LEFT + (RIGHT - LEFT) * s;
      const y = MID - power * PERIOD * s + copy * PERIOD;
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    copies.push(points.join(' '));
  }
  return copies;
}

function FlattenTwist({ twist, pulse, targetN, clean = false }) {
  const copies = useMemo(() => pathCopies(twist), [twist]);
  const direction = targetN < 0 ? 'opposite orientation' : 'positive orientation';

  return (
    <div className={`flatten-stage ${clean ? 'clean' : ''}`}>
      <svg viewBox="0 0 720 420" role="img" aria-label={`Flattened annular model of the Dehn twist d to the ${targetN}`}>
        <defs>
          <clipPath id="annulus-clip">
            <rect x={LEFT} y={TOP} width={RIGHT - LEFT} height={BOTTOM - TOP} rx="18" />
          </clipPath>
          <filter id="cyan-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="4" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <filter id="pink-glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
          </filter>
          <linearGradient id="annulus-fill" x1="0" x2="1">
            <stop offset="0" stopColor="#111722" />
            <stop offset=".5" stopColor="#21172d" />
            <stop offset="1" stopColor="#111722" />
          </linearGradient>
        </defs>

        <rect x="18" y="20" width="684" height="382" rx="28" className="flat-frame" />
        <rect
          x={LEFT}
          y={TOP}
          width={RIGHT - LEFT}
          height={BOTTOM - TOP}
          rx="18"
          fill="url(#annulus-fill)"
          className="annulus-rect"
        />
        <rect
          x={LEFT}
          y={TOP}
          width={RIGHT - LEFT}
          height={BOTTOM - TOP}
          rx="18"
          className="annulus-pulse"
          style={{ opacity: 0.08 + pulse * 0.52 }}
        />

        <g clipPath="url(#annulus-clip)">
          <line x1={LEFT} x2={RIGHT} y1={MID} y2={MID} className="flat-ghost" />
          {copies.map((points, index) => (
            <polyline
              key={index}
              points={points}
              className="flat-current"
              filter="url(#cyan-glow)"
            />
          ))}
          <line
            x1={(LEFT + RIGHT) / 2}
            x2={(LEFT + RIGHT) / 2}
            y1={TOP}
            y2={BOTTOM}
            className="flat-delta-halo"
            filter="url(#pink-glow)"
          />
          <line
            x1={(LEFT + RIGHT) / 2}
            x2={(LEFT + RIGHT) / 2}
            y1={TOP}
            y2={BOTTOM}
            className="flat-delta"
          />
        </g>

        <line x1={LEFT} x2={RIGHT} y1={TOP} y2={TOP} className="identified-edge" />
        <line x1={LEFT} x2={RIGHT} y1={BOTTOM} y2={BOTTOM} className="identified-edge" />
        <path d={`M 54 ${TOP + 8} L 54 ${BOTTOM - 8}`} className="identify-arrow" />
        <path d={`M 47 ${TOP + 18} L 54 ${TOP + 8} L 61 ${TOP + 18}`} className="identify-arrow" />
        <path d={`M 47 ${BOTTOM - 18} L 54 ${BOTTOM - 8} L 61 ${BOTTOM - 18}`} className="identify-arrow" />

        <g className="flat-labels">
          <text x={(LEFT + RIGHT) / 2 + 12} y={TOP + 27} className="delta-text">δ</text>
          <text x={LEFT + 12} y={MID - 14} className="ghost-text">a</text>
          <text x={RIGHT - 12} y={MID - 14} textAnchor="end" className="current-text">
            d<tspan baselineShift="super" fontSize="11">{targetN}</tspan>(a)
          </text>
          <text x="28" y={TOP - 12} className="edge-text">θ = 2π</text>
          <text x="28" y={BOTTOM + 24} className="edge-text">θ = 0</text>
          <text x="54" y={MID + 4} textAnchor="middle" className="identify-text" transform={`rotate(-90 54 ${MID + 4})`}>identified</text>
        </g>

        {!clean && (
          <g className="flat-equation">
            <text x="360" y="385" textAnchor="middle">
              D<tspan baselineShift="sub" fontSize="12">n</tspan>(s, θ)
              <tspan> = (s, θ + 2πnρ(s))</tspan>
            </text>
            <text x="681" y="385" textAnchor="end" className="orientation-text">{direction}</text>
          </g>
        )}
      </svg>
    </div>
  );
}

export default FlattenTwist;
