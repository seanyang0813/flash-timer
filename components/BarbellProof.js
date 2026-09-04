import { useEffect, useMemo, useState } from 'react';

const STEPS = [
  { label: 'Matching pair', title: 'Transport the two B₀ pieces', note: 'The matching sphere is split into hemispheres D₁ and D₂ along B₀.' },
  { label: 'Sections', title: 'Bring in E₁ and E₂', note: 'Each selected exceptional section has square −1 and meets one hemisphere once.' },
  { label: 'Resolve', title: 'Resolve both intersections', note: 'The two resolutions take place independently in disjoint four-balls.' },
  { label: 'Framing', title: 'Repair each framing integrally', note: 'Each hemisphere changes from relative framing −1 to relative framing 0.' },
  { label: 'Cuffs', title: 'Push off the square-zero sphere', note: 'Opposite push-offs produce the disjoint framed cuffs S₊ and S₋.' },
  { label: 'Barbell', title: 'Insert the Niu barbell', note: 'A framed arc in the pair of pants joins the two square-zero cuffs.' },
  { label: 'Restriction', title: 'Read the active restriction', note: 'The outer boundary contributes +δ and the two inner boundaries contribute −B₀.' },
  { label: 'Correction', title: 'Cancel the two inner twists', note: 'Two product-framed B₀ monodromy extensions leave exactly the separating twist.' },
  { label: 'Gluing', title: 'Absorb dⁿ into one summand', note: 'The ambient extension changes the boundary identification from gₙ to g₀.' },
  { label: 'Conclusion', title: 'The smooth manifold stays fixed', note: 'The displayed fibrations change, but every unmarked total space is E(1,1).' },
];

function Formula({ step, n }) {
  if (step === 0) return <span>R = D<sub>1</sub> ∪<sub>B₀</sub> D<sub>2</sub></span>;
  if (step === 1) return <span>E<sub>1</sub><sup>2</sup> = E<sub>2</sub><sup>2</sup> = −1</span>;
  if (step === 2) return <span>D̂<sub>i</sub> = D<sub>i</sub> ♮ E<sub>i</sub></span>;
  if (step === 3) return <span>e(νD̂<sub>i</sub>, n) = −1 − 1 + 2 = 0</span>;
  if (step === 4) return <span>S<sub>+</sub><sup>2</sup> = S<sub>−</sub><sup>2</sup> = 0</span>;
  if (step === 5) return <span>∂P = δ ⊔ B₀<sup>+</sup> ⊔ B₀<sup>−</sup></span>;
  if (step === 6) return <span>β|<sub>Σ</sub> = t<sub>δ</sub> t<sub>B₀</sub><sup>−2</sup></span>;
  if (step === 7) return <span>Φ = M<sub>B₀</sub><sup>2</sup> ∘ β, &nbsp; Φ|<sub>Σ</sub> = t<sub>δ</sub> = d</span>;
  if (step === 8) return <span>g₀ ∘ Φ̂<sup>{n}</sup> = g<sub>{n}</sub></span>;
  return <span>X<sub>{n}</sub> ≅<sup>+</sup> X₀ ≅<sup>+</sup> E(1,1)</span>;
}

function Arrow({ x, y, direction = 1, color = '#ff5aa8', radius = 42 }) {
  const sweep = direction > 0 ? 1 : 0;
  const endX = x + direction * radius * 0.75;
  return (
    <g>
      <path
        d={`M ${x - direction * radius * 0.72} ${y + radius * 0.18} A ${radius} ${radius} 0 0 ${sweep} ${endX} ${y - radius * 0.18}`}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d={direction > 0
          ? `M ${endX - 12} ${y - radius * 0.34} L ${endX} ${y - radius * 0.18} L ${endX - 18} ${y - radius * 0.10}`
          : `M ${endX + 12} ${y - radius * 0.34} L ${endX} ${y - radius * 0.18} L ${endX + 18} ${y - radius * 0.10}`}
        fill="none"
        stroke={color}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </g>
  );
}

function ProofGraphic({ step, n }) {
  const matchingVisible = step <= 3;
  const barbellVisible = step >= 4 && step <= 7;
  const gluingVisible = step >= 8;

  return (
    <svg viewBox="0 0 800 430" className="proof-graphic" role="img" aria-label={STEPS[step].title}>
      <defs>
        <radialGradient id="sphere-fill" cx="45%" cy="35%">
          <stop offset="0" stopColor="#31445b" />
          <stop offset="1" stopColor="#101823" />
        </radialGradient>
        <linearGradient id="cuff-fill" x1="0" x2="1">
          <stop offset="0" stopColor="#12343b" />
          <stop offset="1" stopColor="#241735" />
        </linearGradient>
        <filter id="proof-glow" x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge><feMergeNode in="b" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      <rect x="8" y="8" width="784" height="414" rx="30" className="proof-stage-bg" />

      <g className={`proof-scene ${matchingVisible ? 'visible' : 'hidden'}`}>
        <ellipse cx="400" cy="212" rx="184" ry="154" fill="url(#sphere-fill)" className="matching-sphere" />
        <path d="M 217 212 C 302 184, 498 184, 583 212" className="equator-back" />
        <path d="M 217 212 C 302 240, 498 240, 583 212" className="equator-front" />
        <text x="400" y="235" className="svg-main-label">B₀</text>
        <text x="305" y="150" className="svg-soft-label">D₁</text>
        <text x="495" y="150" className="svg-soft-label">D₂</text>

        <g className={`section-lines ${step >= 1 ? 'on' : ''}`}>
          <path d="M 286 55 C 260 130, 288 278, 314 366" />
          <path d="M 514 55 C 540 130, 512 278, 486 366" />
          <text x="245" y="72">E₁² = −1</text>
          <text x="555" y="72" textAnchor="end">E₂² = −1</text>
        </g>

        <g className={`resolution-points ${step >= 2 ? 'on' : ''}`} filter="url(#proof-glow)">
          <circle cx="292" cy="212" r="16" />
          <circle cx="508" cy="212" r="16" />
        </g>

        <g className={`framing-calc ${step >= 3 ? 'on' : ''}`}>
          <rect x="205" y="340" width="176" height="48" rx="14" />
          <rect x="419" y="340" width="176" height="48" rx="14" />
          <text x="293" y="370">−1 − 1 + 2 = 0</text>
          <text x="507" y="370">−1 − 1 + 2 = 0</text>
        </g>
      </g>

      <g className={`proof-scene ${barbellVisible ? 'visible' : 'hidden'}`}>
        <ellipse cx="266" cy="218" rx="108" ry="136" fill="url(#cuff-fill)" className="cuff" />
        <ellipse cx="534" cy="218" rx="108" ry="136" fill="url(#cuff-fill)" className="cuff" />
        <path d="M 374 218 L 426 218" className={`bar ${step >= 5 ? 'on' : ''}`} />
        <path d="M 368 218 L 432 218" className={`bar-glow ${step >= 5 ? 'on' : ''}`} filter="url(#proof-glow)" />
        <ellipse cx="266" cy="218" rx="76" ry="98" className="inner-boundary" />
        <ellipse cx="534" cy="218" rx="76" ry="98" className="inner-boundary" />
        <path d="M 112 218 C 112 72, 688 72, 688 218 C 688 364, 112 364, 112 218 Z" className="outer-delta" />
        <text x="400" y="80" className="delta-proof-label">δ</text>
        <text x="266" y="224" className="svg-main-label">B₀⁺</text>
        <text x="534" y="224" className="svg-main-label">B₀⁻</text>
        <text x="266" y="389" className="cuff-label">S₊² = 0</text>
        <text x="534" y="389" className="cuff-label">S₋² = 0</text>

        <g className={`barbell-arrows ${step >= 6 ? 'on' : ''}`}>
          <Arrow x={400} y={105} direction={1} radius={56} />
          <Arrow x={266} y={218} direction={-1} color="#7f8da3" radius={46} />
          <Arrow x={534} y={218} direction={-1} color="#7f8da3" radius={46} />
        </g>

        <g className={`correction-arrows ${step >= 7 ? 'on' : ''}`}>
          <Arrow x={266} y={218} direction={1} color="#64f3d1" radius={34} />
          <Arrow x={534} y={218} direction={1} color="#64f3d1" radius={34} />
          <text x="400" y="326" className="correction-text">B₀² cancels B₀⁻²</text>
        </g>
      </g>

      <g className={`proof-scene ${gluingVisible ? 'visible' : 'hidden'}`}>
        <g className={`gluing-diagram ${step === 8 ? 'on' : 'past'}`}>
          <rect x="84" y="120" width="220" height="184" rx="64" className="summand" />
          <rect x="496" y="120" width="220" height="184" rx="64" className="summand" />
          <text x="194" y="205" className="summand-label">Y₁°</text>
          <text x="606" y="205" className="summand-label">Y₂°</text>
          <path d="M 304 212 L 496 212" className="gluing-line" />
          <text x="400" y="181" className="gluing-label">g{n}</text>
          <text x="400" y="254" className="absorb-label">Φ^{n} absorbs d^{n}</text>
          <path d="M 384 275 L 416 275 L 400 296 Z" className="down-arrow" />
          <text x="400" y="332" className="gluing-result">g₀ ∘ Φ̂^{n} = g{n}</text>
        </g>

        <g className={`elliptic-conclusion ${step >= 9 ? 'on' : ''}`}>
          <circle cx="400" cy="205" r="118" className="elliptic-orb" filter="url(#proof-glow)" />
          <circle cx="400" cy="205" r="82" className="elliptic-ring" />
          <text x="400" y="213" className="elliptic-name">E(1,1)</text>
          <text x="400" y="365" className="elliptic-result">X{n} ≅⁺ X₀ ≅⁺ E(1,1)</text>
        </g>
      </g>
    </svg>
  );
}

function BarbellProof({ open, onClose, n }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(true);
  const safeN = Number.isFinite(n) ? n : 0;
  const absoluteN = Math.abs(safeN);

  useEffect(() => {
    if (!open) return undefined;
    setStep(0);
    setPlaying(true);
    return undefined;
  }, [open]);

  useEffect(() => {
    if (!open || !playing) return undefined;
    const timer = window.setTimeout(() => {
      setStep((current) => {
        if (current >= STEPS.length - 1) {
          setPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, step === 3 || step === 7 ? 2300 : 1700);
    return () => window.clearTimeout(timer);
  }, [open, playing, step]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event) => {
      if (event.key === 'Escape') onClose();
      if (event.key === 'ArrowRight') {
        setPlaying(false);
        setStep((current) => Math.min(STEPS.length - 1, current + 1));
      }
      if (event.key === 'ArrowLeft') {
        setPlaying(false);
        setStep((current) => Math.max(0, current - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const selected = useMemo(() => STEPS[step], [step]);
  if (!open) return null;

  return (
    <div className="proof-modal" role="dialog" aria-modal="true" aria-label="Barbell extension proof">
      <button className="proof-backdrop" onClick={onClose} aria-label="Close proof" />
      <section className="proof-sheet">
        <header className="proof-header">
          <div>
            <span>WHY THE MANIFOLD ABSORBS THE TWIST</span>
            <h2>{selected.title}</h2>
          </div>
          <button className="proof-close" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="proof-main">
          <ProofGraphic step={step} n={safeN} />
          <div className="proof-explanation">
            <span>{String(step + 1).padStart(2, '0')} / {STEPS.length}</span>
            <p>{selected.note}</p>
            <div className="proof-formula"><Formula step={step} n={safeN} /></div>
            {step === 9 && (
              <small>
                The extension works for positive and negative powers. For the selected n = {safeN}, the absorbed power has magnitude {absoluteN}.
              </small>
            )}
          </div>
        </div>

        <footer className="proof-footer">
          <button
            onClick={() => {
              setPlaying(false);
              setStep((current) => Math.max(0, current - 1));
            }}
            disabled={step === 0}
            aria-label="Previous proof step"
          >
            ←
          </button>
          <button
            className="proof-play"
            onClick={() => {
              if (step === STEPS.length - 1) setStep(0);
              setPlaying((value) => !value);
            }}
          >
            {playing ? 'Pause' : step === STEPS.length - 1 ? 'Replay' : 'Play'}
          </button>
          <div className="proof-dots">
            {STEPS.map((item, index) => (
              <button
                key={item.label}
                className={index === step ? 'active' : index < step ? 'done' : ''}
                onClick={() => {
                  setPlaying(false);
                  setStep(index);
                }}
                aria-label={`Step ${index + 1}: ${item.label}`}
              >
                <i />
              </button>
            ))}
          </div>
          <button
            onClick={() => {
              setPlaying(false);
              setStep((current) => Math.min(STEPS.length - 1, current + 1));
            }}
            disabled={step === STEPS.length - 1}
            aria-label="Next proof step"
          >
            →
          </button>
        </footer>
      </section>
    </div>
  );
}

export default BarbellProof;
