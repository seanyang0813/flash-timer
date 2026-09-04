import { useEffect, useMemo, useState } from 'react';

const LAYERS = [
  ['surface', 'surface'],
  ['sections', 'sections E₁,E₂'],
  ['hemispheres', 'hemispheres D₁,D₂'],
  ['cuffs', 'resolved cuffs'],
  ['bar', 'bar'],
  ['polar', 'polar collars'],
];

function NodeLink({ id, onSelect, children, className = '' }) {
  return (
    <button type="button" className={`inline-node-link ${className}`} onClick={() => onSelect(id)}>
      {children}
    </button>
  );
}

function GeometryDiagram({ layers, onSelect }) {
  return (
    <svg className="extension-geometry-svg" viewBox="0 0 900 520" role="img" aria-label="Matsumoto barbell extension configuration">
      <defs>
        <linearGradient id="proof-surface-fill" x1="0" x2="1">
          <stop offset="0" stopColor="#18272d" />
          <stop offset="1" stopColor="#2b1b30" />
        </linearGradient>
        <filter id="proof-geometry-glow" x="-70%" y="-70%" width="240%" height="240%">
          <feGaussianBlur stdDeviation="6" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
        <marker id="proof-geometry-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
          <path d="M0,0 L0,6 L8,3 z" fill="#f5ae53" />
        </marker>
      </defs>

      <rect x="18" y="18" width="864" height="484" rx="30" className="extension-geometry-frame" />

      {layers.surface && (
        <g className="geometry-layer surface-layer" onClick={() => onSelect('two-cuffs')}>
          <path d="M 92 260 C 92 102, 808 102, 808 260 C 808 418, 92 418, 92 260 Z" fill="url(#proof-surface-fill)" />
          <path d="M 92 260 C 92 102, 808 102, 808 260 C 808 418, 92 418, 92 260 Z" className="pants-outer-boundary" />
          <text x="450" y="91" textAnchor="middle" className="geometry-delta-label">δ</text>
          <text x="450" y="465" textAnchor="middle" className="geometry-layer-caption">P ⊂ Σ, &nbsp; ∂P = δ ⊔ B₀⁺ ⊔ B₀⁻</text>
        </g>
      )}

      {layers.hemispheres && (
        <g className="geometry-layer hemisphere-layer" onClick={() => onSelect('matching-sphere')}>
          <ellipse cx="305" cy="260" rx="142" ry="172" />
          <ellipse cx="595" cy="260" rx="142" ry="172" />
          <text x="250" y="168">D₁</text>
          <text x="650" y="168" textAnchor="end">D₂</text>
          <text x="305" y="391" textAnchor="middle">relative framing −1</text>
          <text x="595" y="391" textAnchor="middle">relative framing −1</text>
        </g>
      )}

      <g className="geometry-layer b0-layer">
        <ellipse cx="305" cy="260" rx="91" ry="116" />
        <ellipse cx="595" cy="260" rx="91" ry="116" />
        <text x="305" y="267" textAnchor="middle">B₀⁺</text>
        <text x="595" y="267" textAnchor="middle">B₀⁻</text>
      </g>

      {layers.sections && (
        <g className="geometry-layer section-layer" onClick={() => onSelect('type-iia')}>
          <path d="M 250 45 C 215 156, 270 354, 325 478" />
          <path d="M 650 45 C 685 156, 630 354, 575 478" />
          <circle cx="287" cy="260" r="13" />
          <circle cx="613" cy="260" r="13" />
          <text x="190" y="54">E₁²=−1</text>
          <text x="710" y="54" textAnchor="end">E₂²=−1</text>
        </g>
      )}

      {layers.cuffs && (
        <g className="geometry-layer cuff-layer" onClick={() => onSelect('two-cuffs')}>
          <ellipse cx="305" cy="260" rx="137" ry="167" />
          <ellipse cx="305" cy="260" rx="148" ry="178" />
          <ellipse cx="595" cy="260" rx="137" ry="167" />
          <ellipse cx="595" cy="260" rx="148" ry="178" />
          <text x="305" y="119" textAnchor="middle">S₊²=0</text>
          <text x="595" y="119" textAnchor="middle">S₋²=0</text>
        </g>
      )}

      {layers.bar && (
        <g className="geometry-layer bar-layer" onClick={() => onSelect('niu-barbell')}>
          <path d="M 447 260 L 453 260" className="bar-shadow" />
          <path d="M 447 260 L 453 260" className="bar-core" filter="url(#proof-geometry-glow)" />
          <path d="M 398 260 L 502 260" className="bar-full" />
          <path d="M 410 246 L 490 246" className="bar-orientation" markerEnd="url(#proof-geometry-arrow)" />
          <text x="450" y="230" textAnchor="middle">framed bar</text>
        </g>
      )}

      {layers.polar && (
        <g className="geometry-layer polar-layer" onClick={() => onSelect('polar-collars')}>
          {[
            [270, 194, 'K₊ᴺ'], [270, 326, 'K₊ˢ'], [630, 194, 'K₋ᴺ'], [630, 326, 'K₋ˢ'],
          ].map(([x, y, label]) => (
            <g key={label}>
              <circle cx={x} cy={y} r="25" className="polar-halo" />
              <circle cx={x} cy={y} r="8" className="polar-core" filter="url(#proof-geometry-glow)" />
              <text x={x + (x < 450 ? -34 : 34)} y={y + 4} textAnchor={x < 450 ? 'end' : 'start'}>{label}</text>
            </g>
          ))}
          <text x="450" y="492" textAnchor="middle" className="polar-caption">blue disks lie in open neighborhoods where β=id</text>
        </g>
      )}
    </svg>
  );
}

function CuffCalculation({ index, onSelect }) {
  return (
    <NodeLink id={index === 1 ? 'cuff-one' : 'cuff-two'} onSelect={onSelect} className="cuff-calculation-card">
      <span>CUFF {index}</span>
      <div className="cuff-mini-diagram">
        <div className="cuff-hemisphere"><b>D{index}</b><small>−1</small></div>
        <i>resolve + intersection</i>
        <div className="cuff-section"><b>E{index}</b><small>−1</small></div>
      </div>
      <dl>
        <div><dt>relative thimble framing</dt><dd>−1</dd></div>
        <div><dt>section square</dt><dd>−1</dd></div>
        <div><dt>signed intersection</dt><dd>+1</dd></div>
      </dl>
      <code>−1 − 1 + 2(+1) = 0</code>
      <strong>C{index}² = 0</strong>
    </NodeLink>
  );
}

function NiuChecklist({ onSelect }) {
  const checks = [
    ['two square-zero cuffs', 'S₊ and S₋ are opposite push-offs of the resolved sphere'],
    ['embedded framed bar', 'arc lies in P from B₀⁺ to B₀⁻'],
    ['correct local orientation', 'outer boundary positive; inner boundaries negative'],
    ['boundary-relative model', 'compact support in the interior of the thickened barbell'],
    ['central active slice', 'P has boundary δ ⊔ B₀⁺ ⊔ B₀⁻'],
  ];
  return (
    <NodeLink id="niu-barbell" onSelect={onSelect} className="niu-checklist-card">
      <header>
        <div><span>NIU HYPOTHESES</span><h3>Local barbell input</h3></div>
        <b>Niu 2024 · §2.1</b>
      </header>
      <ul>
        {checks.map(([label, note]) => <li key={label}><i>✓</i><div><strong>{label}</strong><small>{note}</small></div></li>)}
      </ul>
      <p><b>Scope guard:</b> Proposition 2.6 supplies the level model and central point push. The stronger open-neighborhood polar-collar statement is proved separately.</p>
    </NodeLink>
  );
}

function PolarCollarCard({ onSelect }) {
  return (
    <NodeLink id="polar-collars" onSelect={onSelect} className="polar-proof-card">
      <div className="polar-proof-visual">
        <div className="active-region">
          <span>ACTIVE</span>
          <i className="outer-active" />
          <i className="inner-active one" />
          <i className="inner-active two" />
          <small>three twist annuli in P</small>
        </div>
        <div className="inactive-region">
          <span>INACTIVE</span>
          {[0, 1, 2, 3].map((index) => <i key={index} className={`fixed-disk disk-${index + 1}`} />)}
          <small>four polar disk neighborhoods<br /><b>fixed pointwise</b></small>
        </div>
      </div>
      <div className="polar-proof-text">
        <span>RELATIVE COLLAR LEMMA</span>
        <code>S² → GL⁺(2,ℝ) ≃ S¹</code>
        <code>π₂(S¹)=0</code>
        <p>The normal derivative is null-homotopic, so relative tubular-neighborhood straightening makes β the literal identity on smaller open cuff neighborhoods.</p>
        <strong>pointwise identity ≠ setwise preservation</strong>
      </div>
    </NodeLink>
  );
}

function CancellationInspector({ onSelect }) {
  const [running, setRunning] = useState(false);
  const [phase, setPhase] = useState(0);

  useEffect(() => {
    if (!running) return undefined;
    if (phase >= 3) {
      const stop = window.setTimeout(() => setRunning(false), 450);
      return () => window.clearTimeout(stop);
    }
    const timer = window.setTimeout(() => setPhase((value) => value + 1), 900);
    return () => window.clearTimeout(timer);
  }, [phase, running]);

  const play = () => {
    setPhase(0);
    setRunning(true);
  };

  return (
    <div className="cancellation-inspector">
      <header>
        <div><span>EXACT SURFACE ACTION</span><h3>Symbolic cancellation</h3></div>
        <button type="button" onClick={play}>{running ? 'Running…' : 'Run cancellation'}</button>
      </header>
      <button type="button" className="beta-equation" onClick={() => onSelect('beta-restriction')}>
        <span>barbell restriction</span>
        <code>β|Σ = tδ · tB₀⁺⁻¹ · tB₀⁻⁻¹ = tδ · tB₀⁻²</code>
      </button>
      <button type="button" className="cancellation-equation" onClick={() => onSelect('phi-extension')}>
        <code>
          Φ|Σ = <span className={phase >= 1 ? 'active-term' : ''}>tB₀²</span>
          <span> · </span>
          <span className={phase >= 2 ? 'delta-term' : ''}>tδ</span>
          <span> · </span>
          <span className={phase >= 1 ? 'cancelled-term' : ''}>tB₀⁻²</span>
        </code>
        <i className={phase >= 1 ? 'visible' : ''}>cancel</i>
        <strong className={phase >= 2 ? 'visible' : ''}>= tδ</strong>
        <b className={phase >= 3 ? 'visible' : ''}>= d</b>
      </button>
      <p>The cancellation is valid with the required boundary germ because β and MB₀ are both product-framed near Σ.</p>
    </div>
  );
}

function GluingInspector({ onSelect }) {
  return (
    <NodeLink id="gluing" onSelect={onSelect} className="gluing-inspector-card">
      <div className="gluing-piece left"><strong>Y₁°</strong><small>apply Φⁿ</small></div>
      <div className="gluing-neck">
        <code>gₙ</code>
        <i />
        <code className="clean">g₀</code>
      </div>
      <div className="gluing-piece right"><strong>Y₂°</strong><small>identity</small></div>
      <div className="gluing-equations">
        <code>gₙ(x,eⁱθ) = (dⁿ(x),e⁻ⁱθ)</code>
        <code>Φ̂(x,eⁱθ) = (d(x),eⁱθ)</code>
        <strong>g₀ ○ Φ̂ⁿ = gₙ</strong>
        <p>This literal boundary identity is the entire reason the piecewise map descends to Xₙ≅X₀.</p>
      </div>
    </NodeLink>
  );
}

function ExtensionProofBranch({ hostile, onSelect }) {
  const [layers, setLayers] = useState({ surface: true, sections: true, hemispheres: true, cuffs: true, bar: true, polar: true });
  const toggle = (key) => setLayers((current) => ({ ...current, [key]: !current[key] }));

  return (
    <section id="extension-branch" className="proof-branch-section extension-proof">
      <header className="proof-section-header">
        <div>
          <span>II · EXTENSION BRANCH</span>
          <h2>Why the same twist does not change the total space</h2>
          <p>The objective is a product-framed pair diffeomorphism Φ with Φ|Σ=d.</p>
        </div>
        <div className="branch-verdict extension">Barbell absorbs the twist</div>
      </header>

      <NodeLink id="phi-extension" onSelect={onSelect} className="extension-goal-card">
        <span>CONSTRUCTION GOAL</span>
        <code>Φ : (Y,Σ) → (Y,Σ)</code>
        <strong>Φ|Σ = d = tδ</strong>
        <p>If this exists with product normal action, Φⁿ absorbs dⁿ for every positive and negative integer n.</p>
      </NodeLink>

      <div className="geometry-inspector-card">
        <header>
          <div><span>GEOMETRIC CONFIGURATION</span><h3>Layer inspector</h3></div>
          <small>click an object to inspect its proof node</small>
        </header>
        <div className="geometry-toggle-row">
          {LAYERS.map(([key, label]) => (
            <button key={key} className={layers[key] ? 'active' : ''} onClick={() => toggle(key)}>
              <i />{label}
            </button>
          ))}
        </div>
        <GeometryDiagram layers={layers} onSelect={onSelect} />
      </div>

      <div className="section-resolution-grid">
        <CuffCalculation index={1} onSelect={onSelect} />
        <CuffCalculation index={2} onSelect={onSelect} />
      </div>

      <NodeLink id="two-cuffs" onSelect={onSelect} className="relative-framing-warning">
        <span>WHY TWO SEPARATE CALCULATIONS MATTER</span>
        <code>e(νD̂₁,n)=0 &nbsp;and&nbsp; e(νD̂₂,n)=0</code>
        <p>Total square zero alone could hide opposite hemisphere defects. The proof needs the prescribed boundary normal to extend over each completed hemisphere individually.</p>
      </NodeLink>

      <div className="niu-and-collar-grid">
        <NiuChecklist onSelect={onSelect} />
        <PolarCollarCard onSelect={onSelect} />
      </div>

      <CancellationInspector onSelect={onSelect} />
      <GluingInspector onSelect={onSelect} />

      <div className="identity-and-result-grid">
        <NodeLink id="identity-sum" onSelect={onSelect} className="identity-model-card">
          <span>IMPORTED IDENTITY-SUM CALCULATION</span>
          <h3>X₀ is E(1,1)</h3>
          <p>The source branched-cover model identifies the identity double as an elliptic fibration over T² with two I₀* fibers.</p>
          <code>X₀ ≅⁺ E(1,1)</code>
        </NodeLink>
        <NodeLink id="total-space-result" onSelect={onSelect} className="branch-final-card extension">
          <span>FIXED TOTAL SPACE</span>
          <code>Xₙ ≅⁺ X₀ ≅⁺ E(1,1)</code>
          <small>for every n∈ℤ; the diffeomorphisms are unmarked</small>
        </NodeLink>
      </div>

      {hostile && (
        <div className="branch-hostile-summary">
          <span>HOSTILE AUDIT CHECKPOINT</span>
          <p>
            The fatal geometric risks are the wrong transported pair, extra section intersections, incorrect signed cuff framings, polar collars that are only setwise preserved, a hidden power or conjugate in β|Σ, a non-product normal germ, or a boundary-circle sign error. Each appears as a dedicated graph node rather than being buried in prose.
          </p>
        </div>
      )}
    </section>
  );
}

export default ExtensionProofBranch;
