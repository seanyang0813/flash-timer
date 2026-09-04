import { useEffect, useMemo, useRef, useState } from 'react';

const DEMO_N = 3;
const FRAME_DURATIONS = [3300, 2850, 3500, 3150, 3900, 3300, 3600, 4400];
const TAU = Math.PI * 2;
const CENTER = { x: 420, y: 250 };
const ELLIPSE = { rx: 57, ry: 130 };
const COLLAR_WIDTH = 27;

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const FRAMES = [
  {
    kicker: '01 · THE FIBRE',
    title: 'Start on Σ₂.',
    caption: 'δ is fixed. The chosen test curve a crosses its annular neighborhood twice.',
    formula: 'δ ⊂ Σ₂,    i(a,δ)=2',
  },
  {
    kicker: '02 · LOCALIZE',
    title: 'Isolate N(δ).',
    caption: 'A Dehn twist is supported only in this annulus. The rest of the genus-two surface stays put.',
    formula: 'N(δ) ≅ S¹ × [−1,1]',
  },
  {
    kicker: '03 · ONE TWIST',
    title: 'Shear once.',
    caption: 'Cut the annulus open. One boundary rotates through 2π while the endpoints return to themselves.',
    formula: 'D₁(s,θ) = (s, θ + 2πρ(s))',
  },
  {
    kicker: '04 · RETURN TO Σ₂',
    title: 'Reveal d(a).',
    caption: 'The gray curve is the original a. The cyan curve is its image after one positive Dehn twist.',
    formula: 'a  ⟶  d(a)',
  },
  {
    kicker: '05 · ITERATE',
    title: 'Apply the same map again.',
    caption: 'Only the two portions of a inside N(δ) wind. The surface and the outer portions of a remain fixed.',
    formula: 'a ⟶ d(a) ⟶ d²(a) ⟶ d³(a)',
  },
  {
    kicker: '06 · THE FIBRATION',
    title: 'Zoom out to W₃.',
    caption: 'The power twist conjugates the second Matsumoto block and changes the displayed Lefschetz fibration.',
    formula: 'W₃ = F Fᵈ³',
  },
  {
    kicker: '07 · THE CERTIFICATE',
    title: 'Mess detects |n|.',
    caption: 'The visible curve explains the geometry. Mess abelianization is what certifies inequivalence.',
    formula: 'Wₘ ≅ Wₙ  ⇔  |m| = |n|',
  },
  {
    kicker: '08 · THE ABSORPTION',
    title: 'The barbell absorbs d³.',
    caption: 'The fibration changes, but the ambient extension moves the gluing twist into one summand.',
    formula: 'X₃ ≅⁺ X₀ ≅⁺ E(1,1)',
  },
];

function ellipsePoint(theta, side) {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const base = {
    x: CENTER.x + ELLIPSE.rx * cos,
    y: CENTER.y + ELLIPSE.ry * sin,
  };
  const normal = {
    x: cos / ELLIPSE.rx,
    y: sin / ELLIPSE.ry,
  };
  const length = Math.hypot(normal.x, normal.y) || 1;
  return {
    x: base.x + side * COLLAR_WIDTH * normal.x / length,
    y: base.y + side * COLLAR_WIDTH * normal.y / length,
  };
}

function twistPoint(side, theta0, power) {
  const rho = smooth((side + 1) / 2);
  return ellipsePoint(theta0 + TAU * power * rho, side);
}

function curvePath(power) {
  const samples = 150;
  const top = [];
  const bottom = [];
  for (let index = 0; index <= samples; index += 1) {
    const side = -1 + 2 * index / samples;
    top.push(twistPoint(side, Math.PI / 2, power));
  }
  for (let index = 0; index <= samples; index += 1) {
    const side = 1 - 2 * index / samples;
    bottom.push(twistPoint(side, Math.PI * 1.5, power));
  }

  const start = top[0];
  const topOuter = top[top.length - 1];
  const bottomOuter = bottom[0];
  const bottomInner = bottom[bottom.length - 1];

  let path = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`;
  top.slice(1).forEach((point) => {
    path += ` L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  });
  path += ` C 610 78, 735 116, 744 250`;
  path += ` C 735 384, 610 422, ${bottomOuter.x.toFixed(2)} ${bottomOuter.y.toFixed(2)}`;
  bottom.slice(1).forEach((point) => {
    path += ` L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`;
  });
  path += ` C 230 422, 105 384, 96 250`;
  path += ` C 105 116, 230 78, ${start.x.toFixed(2)} ${start.y.toFixed(2)} Z`;
  return path;
}

function annulusPath(side) {
  const points = [];
  for (let index = 0; index <= 180; index += 1) {
    const theta = TAU * index / 180;
    points.push(ellipsePoint(theta, side));
  }
  return points.map((point, index) => `${index ? 'L' : 'M'} ${point.x.toFixed(2)} ${point.y.toFixed(2)}`).join(' ') + ' Z';
}

function flattenCopies(power) {
  const left = 172;
  const right = 668;
  const top = 86;
  const bottom = 414;
  const middle = (top + bottom) / 2;
  const period = bottom - top;
  const copies = [];
  const count = Math.max(3, Math.ceil(Math.abs(power)) + 3);
  for (let copy = -count; copy <= count; copy += 1) {
    const points = [];
    for (let index = 0; index <= 180; index += 1) {
      const s = index / 180;
      const x = left + (right - left) * s;
      const y = middle - power * period * smooth(s) + copy * period;
      points.push(`${x.toFixed(2)},${y.toFixed(2)}`);
    }
    copies.push(points.join(' '));
  }
  return copies;
}

function SurfaceDiagram({ power, ghost, isolated, progress }) {
  const currentPath = useMemo(() => curvePath(power), [power]);
  const ghostPath = useMemo(() => curvePath(0), []);
  const inner = useMemo(() => annulusPath(-1), []);
  const outer = useMemo(() => annulusPath(1), []);
  const isolate = isolated ? 1 : 0;
  const zoom = isolated ? 1.38 : 1;
  const translateX = isolated ? -160 : 0;
  const translateY = isolated ? -95 : 0;

  return (
    <svg className="story-svg surface-story" viewBox="0 0 840 500" role="img" aria-label="Genus-two surface with separating curve delta and test curve a">
      <defs>
        <linearGradient id="story-surface" x1="0" x2="1">
          <stop offset="0" stopColor="#18222a" />
          <stop offset=".48" stopColor="#20222b" />
          <stop offset="1" stopColor="#261c2a" />
        </linearGradient>
        <filter id="story-cyan-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <filter id="story-pink-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="5" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <g style={{ transform: `translate(${translateX}px, ${translateY}px) scale(${zoom})`, transformOrigin: '420px 250px' }}>
        <path
          className="story-surface-shape"
          style={{ opacity: 1 - isolate * 0.74 }}
          d="M 76 250 C 76 118 220 62 330 148 C 370 179 470 179 510 148 C 620 62 764 118 764 250 C 764 382 620 438 510 352 C 470 321 370 321 330 352 C 220 438 76 382 76 250 Z"
          fill="url(#story-surface)"
        />
        <ellipse className="story-hole" cx="240" cy="250" rx="92" ry="72" style={{ opacity: 1 - isolate * 0.72 }} />
        <ellipse className="story-hole" cx="600" cy="250" rx="92" ry="72" style={{ opacity: 1 - isolate * 0.72 }} />

        <path className="story-annulus-boundary" d={inner} style={{ opacity: 0.10 + isolate * 0.78 }} />
        <path className="story-annulus-boundary" d={outer} style={{ opacity: 0.10 + isolate * 0.78 }} />
        <path className="story-annulus-fill" d={`${outer} ${inner}`} style={{ opacity: isolate * (0.16 + 0.24 * progress) }} />

        {ghost && <path className="story-curve ghost" d={ghostPath} />}
        <path className="story-curve current" d={currentPath} filter="url(#story-cyan-glow)" />
        <ellipse
          className="story-delta-halo"
          cx={CENTER.x}
          cy={CENTER.y}
          rx={ELLIPSE.rx}
          ry={ELLIPSE.ry}
          filter="url(#story-pink-glow)"
        />
        <ellipse className="story-delta" cx={CENTER.x} cy={CENTER.y} rx={ELLIPSE.rx} ry={ELLIPSE.ry} />

        <g className="story-labels">
          <g transform="translate(472 110)">
            <rect x="0" y="0" width="96" height="32" rx="16" className="story-label-bg delta" />
            <text x="48" y="21" textAnchor="middle" className="story-label-text delta">δ · fixed</text>
          </g>
          <g transform="translate(607 358)">
            <rect x="0" y="0" width={power === 0 ? 62 : 108} height="32" rx="16" className="story-label-bg curve" />
            <text x={power === 0 ? 31 : 54} y="21" textAnchor="middle" className="story-label-text curve">
              {power === 0 ? 'a' : `d${Number.isInteger(power) ? power : ''}(a)`}
            </text>
          </g>
          {ghost && (
            <g transform="translate(112 358)">
              <rect x="0" y="0" width="106" height="32" rx="16" className="story-label-bg ghost" />
              <text x="53" y="21" textAnchor="middle" className="story-label-text ghost">a · original</text>
            </g>
          )}
        </g>
      </g>
    </svg>
  );
}

function FlatAnnulusStory({ power, progress }) {
  const copies = useMemo(() => flattenCopies(power), [power]);
  return (
    <svg className="story-svg flat-story" viewBox="0 0 840 500" role="img" aria-label="Cut-open annulus showing one Dehn twist">
      <defs>
        <clipPath id="story-flat-clip">
          <rect x="172" y="86" width="496" height="328" rx="24" />
        </clipPath>
        <filter id="story-flat-glow" x="-50%" y="-50%" width="200%" height="200%">
          <feGaussianBlur stdDeviation="4" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>
      <rect x="54" y="36" width="732" height="428" rx="34" className="flat-story-frame" />
      <rect x="172" y="86" width="496" height="328" rx="24" className="flat-story-annulus" />
      <rect x="172" y="86" width="496" height="328" rx="24" className="flat-story-pulse" style={{ opacity: 0.10 + Math.sin(Math.PI * progress) * 0.46 }} />
      <g clipPath="url(#story-flat-clip)">
        <line x1="172" x2="668" y1="250" y2="250" className="flat-story-ghost" />
        {copies.map((points, index) => <polyline key={index} points={points} className="flat-story-current" filter="url(#story-flat-glow)" />)}
        <line x1="420" x2="420" y1="86" y2="414" className="flat-story-delta-halo" />
        <line x1="420" x2="420" y1="86" y2="414" className="flat-story-delta" />
      </g>
      <line x1="172" x2="668" y1="86" y2="86" className="flat-story-edge" />
      <line x1="172" x2="668" y1="414" y2="414" className="flat-story-edge" />
      <path d="M 140 102 L 140 398 M 132 114 L 140 102 L 148 114 M 132 386 L 140 398 L 148 386" className="flat-story-identify" />
      <text x="420" y="64" textAnchor="middle" className="flat-story-title">cut-open annulus N(δ)</text>
      <text x="441" y="116" className="flat-story-delta-text">δ</text>
      <text x="194" y="232" className="flat-story-ghost-text">a</text>
      <text x="646" y="230" textAnchor="end" className="flat-story-current-text">d(a)</text>
      <text x="140" y="253" textAnchor="middle" className="flat-story-identify-text" transform="rotate(-90 140 253)">identified edges</text>
      <text x="420" y="448" textAnchor="middle" className="flat-story-formula">(s, θ) ↦ (s, θ + 2πρ(s))</text>
    </svg>
  );
}

function MiniSurface({ x, power, label, twisted }) {
  const path = curvePath(power);
  return (
    <g transform={`translate(${x} 118) scale(.42) translate(-420 -250)`}>
      <path className="mini-surface" d="M 76 250 C 76 118 220 62 330 148 C 370 179 470 179 510 148 C 620 62 764 118 764 250 C 764 382 620 438 510 352 C 470 321 370 321 330 352 C 220 438 76 382 76 250 Z" />
      <ellipse className="mini-hole" cx="240" cy="250" rx="92" ry="72" />
      <ellipse className="mini-hole" cx="600" cy="250" rx="92" ry="72" />
      {twisted && <path className="mini-curve" d={path} />}
      <ellipse className="mini-delta" cx={CENTER.x} cy={CENTER.y} rx={ELLIPSE.rx} ry={ELLIPSE.ry} />
    </g>
  );
}

function FibrationStory() {
  return (
    <svg className="story-svg fibration-story" viewBox="0 0 840 500" role="img" aria-label="The factorization W3 equals F times F conjugated by d cubed">
      <MiniSurface x={236} power={0} label="F" twisted={false} />
      <MiniSurface x={604} power={DEMO_N} label="Fᵈ³" twisted />
      <text x="236" y="370" textAnchor="middle" className="block-label">F</text>
      <text x="604" y="370" textAnchor="middle" className="block-label">Fᵈ³</text>
      <text x="420" y="266" textAnchor="middle" className="block-times">·</text>
      <path d="M 322 390 C 360 426, 480 426, 518 390" className="factor-brace" />
      <text x="420" y="456" textAnchor="middle" className="factor-word">W₃ = F Fᵈ³</text>
      <text x="604" y="89" textAnchor="middle" className="conjugation-note">second block conjugated by d³</text>
    </svg>
  );
}

function MessStory({ progress }) {
  const collapse = smooth(progress);
  return (
    <svg className="story-svg mess-story" viewBox="0 0 840 500" role="img" aria-label="Mess abelianization detects the magnitude of the exponent">
      <g className="mess-orbits">
        <circle cx={220 + 95 * collapse} cy="214" r="66" className="mess-node positive" />
        <circle cx={620 - 95 * collapse} cy="214" r="66" className="mess-node negative" />
        <text x={220 + 95 * collapse} y="223" textAnchor="middle" className="mess-node-text">+3</text>
        <text x={620 - 95 * collapse} y="223" textAnchor="middle" className="mess-node-text">−3</text>
        <path d={`M ${286 + 80 * collapse} 214 L ${554 - 80 * collapse} 214`} className="mess-connector" />
        <text x="420" y="132" textAnchor="middle" className="mess-caption">opposite twist directions</text>
      </g>
      <g style={{ opacity: 0.18 + 0.82 * collapse }}>
        <rect x="283" y="300" width="274" height="82" rx="24" className="mess-magnitude-box" />
        <text x="420" y="333" textAnchor="middle" className="mess-magnitude-small">MESS CONTENT MAGNITUDE</text>
        <text x="420" y="367" textAnchor="middle" className="mess-magnitude">|n| = 3</text>
      </g>
      <text x="420" y="438" textAnchor="middle" className="mess-theorem">Wₘ ≅ Wₙ  ⇔  |m| = |n|</text>
    </svg>
  );
}

function BarbellEnding({ progress }) {
  const reveal = smooth(progress);
  return (
    <svg className="story-svg barbell-ending" viewBox="0 0 840 500" role="img" aria-label="The barbell extension absorbs the twist and leaves the smooth manifold E(1,1)">
      <g style={{ opacity: 1 - 0.54 * reveal, transform: `translate(${reveal * -42}px, 0)` }}>
        <ellipse cx="205" cy="224" rx="85" ry="115" className="ending-cuff" />
        <ellipse cx="405" cy="224" rx="85" ry="115" className="ending-cuff" />
        <path d="M 290 224 L 320 224" className="ending-bar" />
        <path d="M 316 224 L 320 224 L 324 224" className="ending-bar-glow" />
        <path d="M 86 224 C 86 82, 524 82, 524 224 C 524 366, 86 366, 86 224 Z" className="ending-delta" />
        <text x="305" y="66" textAnchor="middle" className="ending-delta-label">δ</text>
        <text x="205" y="230" textAnchor="middle" className="ending-cuff-label">S₊²=0</text>
        <text x="405" y="230" textAnchor="middle" className="ending-cuff-label">S₋²=0</text>
        <text x="305" y="404" textAnchor="middle" className="ending-formula">Φ|Σ = d</text>
      </g>

      <g style={{ opacity: 0.15 + 0.85 * reveal }}>
        <path d="M 515 224 L 606 224" className="ending-arrow" />
        <path d="M 592 211 L 606 224 L 592 237" className="ending-arrow-head" />
        <text x="560" y="195" textAnchor="middle" className="ending-absorb">g₀ ∘ Φ̂³ = g₃</text>
        <circle cx="700" cy="224" r={70 + 18 * reveal} className="ending-orb" />
        <circle cx="700" cy="224" r={46 + 12 * reveal} className="ending-orb-ring" />
        <text x="700" y="232" textAnchor="middle" className="ending-orb-name">E(1,1)</text>
        <text x="700" y="365" textAnchor="middle" className="ending-same">same smooth manifold</text>
      </g>
      <text x="420" y="470" textAnchor="middle" className="ending-headline">DIFFERENT FIBRATIONS · SAME SMOOTH 4-MANIFOLD</text>
    </svg>
  );
}

function StoryGraphic({ frame, progress }) {
  if (frame === 0) return <SurfaceDiagram power={0} ghost={false} isolated={false} progress={progress} />;
  if (frame === 1) return <SurfaceDiagram power={0} ghost={false} isolated progress={progress} />;
  if (frame === 2) return <FlatAnnulusStory power={smooth(progress)} progress={progress} />;
  if (frame === 3) return <SurfaceDiagram power={1} ghost isolated={false} progress={progress} />;
  if (frame === 4) return <SurfaceDiagram power={1 + 2 * smooth(progress)} ghost isolated={false} progress={progress} />;
  if (frame === 5) return <FibrationStory />;
  if (frame === 6) return <MessStory progress={progress} />;
  return <BarbellEnding progress={progress} />;
}

function TheoremStory({ onExplore, onProof }) {
  const [frame, setFrame] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [progress, setProgress] = useState(0);
  const clockRef = useRef({ startedAt: performance.now(), frame: 0 });

  useEffect(() => {
    clockRef.current = { startedAt: performance.now(), frame };
    setProgress(0);
  }, [frame]);

  useEffect(() => {
    let frameId;
    const tick = (now) => {
      const duration = FRAME_DURATIONS[frame];
      const nextProgress = clamp((now - clockRef.current.startedAt) / duration);
      setProgress(nextProgress);
      if (playing && nextProgress >= 1) {
        if (frame < FRAMES.length - 1) {
          setFrame((current) => Math.min(FRAMES.length - 1, current + 1));
        } else {
          setPlaying(false);
        }
      }
      frameId = requestAnimationFrame(tick);
    };
    frameId = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameId);
  }, [frame, playing]);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'ArrowRight') {
        setPlaying(false);
        setFrame((current) => Math.min(FRAMES.length - 1, current + 1));
      }
      if (event.key === 'ArrowLeft') {
        setPlaying(false);
        setFrame((current) => Math.max(0, current - 1));
      }
      if (event.key === ' ') {
        event.preventDefault();
        if (frame === FRAMES.length - 1 && !playing) setFrame(0);
        setPlaying((value) => !value);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [frame, playing]);

  const data = FRAMES[frame];
  const jump = (next) => {
    setPlaying(false);
    setFrame(clamp(next, 0, FRAMES.length - 1));
  };

  return (
    <section className="theorem-story" aria-label="Eight-frame visual proof story">
      <div className="story-copy" key={`copy-${frame}`}>
        <span>{data.kicker}</span>
        <h1>{data.title}</h1>
        <p>{data.caption}</p>
        <div className="story-formula">{data.formula}</div>
      </div>

      <div className="story-stage" key={`graphic-${frame}`}>
        <StoryGraphic frame={frame} progress={progress} />
      </div>

      <div className="story-controls">
        <button
          className="story-back"
          onClick={() => jump(frame - 1)}
          disabled={frame === 0}
        >
          ← Back
        </button>

        <button
          className="story-play"
          onClick={() => {
            if (frame === FRAMES.length - 1 && !playing) {
              setFrame(0);
              setPlaying(true);
              return;
            }
            if (!playing && progress >= 1) {
              clockRef.current.startedAt = performance.now() - FRAME_DURATIONS[frame] * 0.22;
            }
            setPlaying((value) => !value);
          }}
        >
          {playing ? 'Pause autoplay' : frame === FRAMES.length - 1 ? 'Replay story' : 'Autoplay'}
        </button>

        <div className="story-progress" aria-label={`Frame ${frame + 1} of ${FRAMES.length}`}>
          {FRAMES.map((item, index) => (
            <button
              key={item.kicker}
              className={index === frame ? 'active' : index < frame ? 'done' : ''}
              onClick={() => jump(index)}
              aria-label={`Go to frame ${index + 1}: ${item.title}`}
            >
              <i />
              <span>{String(index + 1).padStart(2, '0')}</span>
            </button>
          ))}
        </div>

        {frame < FRAMES.length - 1 ? (
          <button className="story-next" onClick={() => jump(frame + 1)}>
            Next →
          </button>
        ) : (
          <button className="story-next final" onClick={onExplore}>
            Explore n →
          </button>
        )}
      </div>

      <div className="story-secondary">
        <button onClick={onProof}>Open the full barbell proof</button>
      </div>
    </section>
  );
}

export default TheoremStory;
