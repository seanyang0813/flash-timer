import { useEffect, useMemo, useRef, useState } from 'react';

const TAU = Math.PI * 2;
const DEMO_N = 3;
const CENTER = { x: 420, y: 250 };
const ELLIPSE = { rx: 57, ry: 130 };
const COLLAR_WIDTH = 27;

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smooth = (value) => {
  const t = clamp(value);
  return t * t * (3 - 2 * t);
};

const CHAPTERS = [
  { key: 'fiber', label: 'Meet the fiber', start: 0, end: 2 },
  { key: 'twist', label: 'See dⁿ', start: 3, end: 7 },
  { key: 'word', label: 'Build Wₙ', start: 8, end: 9 },
  { key: 'classify', label: 'Classify', start: 10, end: 14 },
  { key: 'manifold', label: 'Forget the fibration', start: 15, end: 16 },
  { key: 'goal', label: 'What Φ must do', start: 17, end: 18 },
  { key: 'barbell', label: 'Build Φ', start: 19, end: 25 },
  { key: 'payoff', label: 'Payoff', start: 26, end: 26 },
];

const SCENES = [
  {
    chapter: 'fiber', duration: 5000, eyebrow: 'THE FIBER',
    title: 'This is the fiber Σ.',
    body: 'Think of it as a double donut: a closed surface with two handles.',
    formula: null, kind: 'surface-only',
  },
  {
    chapter: 'fiber', duration: 4500, eyebrow: 'THE FIXED LOOP',
    title: 'This loop is δ.',
    body: 'It separates the two handles. δ is the curve we twist around, and it will stay fixed.',
    formula: 'δ ⊂ Σ', kind: 'delta',
  },
  {
    chapter: 'fiber', duration: 4700, eyebrow: 'THE MOVING CURVE',
    title: 'This curve a crosses δ.',
    body: 'The pink loop δ stays fixed. The cyan test curve a is the object that will move.',
    formula: 'fixed: δ    moving: a', kind: 'curve-a',
  },
  {
    chapter: 'twist', duration: 5000, eyebrow: 'LOCAL SUPPORT',
    title: 'Only a thin neighborhood changes.',
    body: 'A Dehn twist is supported in the annulus N(δ). Everything outside this narrow band remains unchanged.',
    formula: 'N(δ) ≅ S¹ × [−1,1]', kind: 'annulus',
  },
  {
    chapter: 'twist', duration: 6200, eyebrow: 'ONE POSITIVE TWIST',
    title: 'Watch a become d(a).',
    body: 'The surface stays still. Inside the annulus, the crossing pieces of a shear once around δ.',
    formula: 'a  →  d(a)', kind: 'twist-one',
  },
  {
    chapter: 'twist', duration: 6200, eyebrow: 'REPEAT THE SAME MOVE',
    title: 'Now twist once more.',
    body: 'The second application adds exactly one more winding around the same fixed loop δ.',
    formula: 'd(a)  →  d²(a)', kind: 'twist-two',
  },
  {
    chapter: 'twist', duration: 5200, eyebrow: 'OPPOSITE HANDEDNESS',
    title: 'Negative n twists the other way.',
    body: 'The operation is identical, but the annulus shears in the opposite direction.',
    formula: 'a  →  d⁻¹(a)', kind: 'twist-negative',
  },
  {
    chapter: 'twist', duration: 4800, eyebrow: 'WHAT n MEANS',
    title: 'n counts twists around δ.',
    body: 'δ stays fixed. a changes. The magnitude |n| counts repetitions, and the sign records the direction.',
    formula: 'dⁿ(a)', kind: 'twist-recap',
  },
  {
    chapter: 'word', duration: 4500, eyebrow: 'TWO MATSUMOTO BLOCKS',
    title: 'Start with two copies of F.',
    body: 'Each F is one Matsumoto monodromy block. For the moment, the two blocks are identical.',
    formula: 'F · F', kind: 'blocks-plain',
  },
  {
    chapter: 'word', duration: 5600, eyebrow: 'BUILD THE FAMILY',
    title: 'Twist the second block by dⁿ.',
    body: 'The same geometric operation you just watched conjugates every factor in the second block.',
    formula: 'Wₙ = F Fᵈⁿ', kind: 'blocks-twisted',
  },
  {
    chapter: 'classify', duration: 4800, eyebrow: 'THE FIRST QUESTION',
    title: 'Does the fibration remember n?',
    body: 'Perhaps fibration equivalences can remove the twisting. We must test whether W₁, W₂, W₃, … are genuinely different.',
    formula: null, kind: 'classification-question',
  },
  {
    chapter: 'classify', duration: 4200, eyebrow: 'EXAMPLE 1',
    title: 'One twist versus two.', body: 'These land in different fibration classes.',
    formula: 'W₁ ≄ W₂', kind: 'compare-1-2',
  },
  {
    chapter: 'classify', duration: 4200, eyebrow: 'EXAMPLE 2',
    title: 'Two twists versus minus two.', body: 'Changing the direction does not change the fibration class.',
    formula: 'W₂ ≅ W₋₂', kind: 'compare-2-neg2',
  },
  {
    chapter: 'classify', duration: 4200, eyebrow: 'EXAMPLE 3',
    title: 'Three twists versus five.', body: 'Different magnitudes remain different.',
    formula: 'W₃ ≄ W₅', kind: 'compare-3-5',
  },
  {
    chapter: 'classify', duration: 6200, eyebrow: 'THE FIRST HALF OF THE THEOREM',
    title: 'The fibration remembers |n|.',
    body: 'The visible curve explains dⁿ geometrically. A Mess invariant proves that |n| survives every allowed fibration equivalence.',
    formula: 'Wₘ ≅ Wₙ  ⇔  |m| = |n|', kind: 'classification-theorem', proofToggle: true,
  },
  {
    chapter: 'manifold', duration: 5200, eyebrow: 'A NEW QUESTION',
    title: 'Different fibrations—different 4-manifolds?',
    body: 'Forget the fibration maps and look only at the smooth total spaces X₀, X₁, X₂, … .',
    formula: null, kind: 'manifold-question',
  },
  {
    chapter: 'manifold', duration: 5200, eyebrow: 'THE SURPRISE',
    title: 'No. Every total space is E(1,1).',
    body: 'The fibrations are different, but after forgetting the fibration structure the smooth 4-manifold is always the same.',
    formula: 'Xₙ ≅⁺ E(1,1)   for every n', kind: 'manifold-answer',
  },
  {
    chapter: 'goal', duration: 5600, eyebrow: 'WHAT WE NEED',
    title: 'Move the whole Matsumoto piece.',
    body: 'We seek a diffeomorphism Φ of the entire four-dimensional piece whose effect on the fiber is exactly one Dehn twist.',
    formula: 'Φ|Σ = d', kind: 'extension-goal',
  },
  {
    chapter: 'goal', duration: 5600, eyebrow: 'WHY THAT WOULD BE ENOUGH',
    title: 'Then Φⁿ absorbs dⁿ.',
    body: 'Move one whole summand by Φⁿ. The boundary twist disappears from the fiber-sum gluing.',
    formula: 'boundary twist dⁿ  →  ambient motion Φⁿ  →  untwisted gluing', kind: 'absorption-plan',
  },
  {
    chapter: 'barbell', duration: 5600, eyebrow: 'BARBELL STEP A',
    title: 'Name the geometric pieces.',
    body: 'B₀⁺ and B₀⁻ are the two matching boundaries. δ is the outer boundary of their pair of pants. E₁ and E₂ are exceptional sections.',
    formula: '∂P = δ ⊔ B₀⁺ ⊔ B₀⁻', kind: 'barbell-objects',
  },
  {
    chapter: 'barbell', duration: 6200, eyebrow: 'BARBELL STEP B',
    title: 'Repair the first hemisphere.',
    body: 'Resolve the first −1-framed hemisphere with the −1-section E₁. The intersection contributes +2.',
    formula: '−1 − 1 + 2 = 0', kind: 'cuff-one',
  },
  {
    chapter: 'barbell', duration: 6200, eyebrow: 'BARBELL STEP C',
    title: 'Repair the second hemisphere.',
    body: 'Repeat the identical calculation with E₂. Now both completed hemispheres have relative framing zero.',
    formula: '−1 − 1 + 2 = 0', kind: 'cuff-two',
  },
  {
    chapter: 'barbell', duration: 5400, eyebrow: 'BARBELL STEP D',
    title: 'Connect the two square-zero cuffs.',
    body: 'A framed arc joins S₊ to S₋ through the pair of pants bounded by δ, B₀⁺, and B₀⁻.',
    formula: 'S₊  — bar —  S₋', kind: 'connect-bar',
  },
  {
    chapter: 'barbell', duration: 6500, eyebrow: 'BARBELL STEP E',
    title: 'Apply the Niu barbell move.',
    body: 'Only the active pair-of-pants region moves. The inactive collar neighborhoods stay pointwise fixed.',
    formula: 'β|Σ = tδ tB₀⁻²', kind: 'niu-move',
  },
  {
    chapter: 'barbell', duration: 6200, eyebrow: 'BARBELL STEP F',
    title: 'Cancel the two inner twists.',
    body: 'Two ambient B₀ monodromy extensions contribute tB₀². They cancel the two negative inner twists.',
    formula: 'tB₀² · (tδ tB₀⁻²) = tδ', kind: 'cancel-inner',
  },
  {
    chapter: 'barbell', duration: 5400, eyebrow: 'THE GLUING CONSEQUENCE',
    title: 'The twisted gluing becomes untwisted.',
    body: 'The product-framed ambient extension works for every positive and negative power.',
    formula: 'g₀ ∘ Φ̂ⁿ = gₙ', kind: 'gluing',
  },
  {
    chapter: 'payoff', duration: 8000, eyebrow: 'THE COMPLETE THEOREM',
    title: 'The fibration remembers. The manifold absorbs.',
    body: 'Infinitely many distinct genus-two Lefschetz fibrations live on one smooth four-manifold.',
    formula: null, kind: 'final-payoff',
  },
];

function ellipsePoint(theta, side) {
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const base = { x: CENTER.x + ELLIPSE.rx * cos, y: CENTER.y + ELLIPSE.ry * sin };
  const normal = { x: cos / ELLIPSE.rx, y: sin / ELLIPSE.ry };
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
  const samples = 180;
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
  const bottomOuter = bottom[0];
  let path = `M ${start.x.toFixed(2)} ${start.y.toFixed(2)}`;
  top.slice(1).forEach((point) => { path += ` L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`; });
  path += ' C 610 78, 735 116, 744 250';
  path += ` C 735 384, 610 422, ${bottomOuter.x.toFixed(2)} ${bottomOuter.y.toFixed(2)}`;
  bottom.slice(1).forEach((point) => { path += ` L ${point.x.toFixed(2)} ${point.y.toFixed(2)}`; });
  path += ' C 230 422, 105 384, 96 250';
  path += ` C 105 116, 230 78, ${start.x.toFixed(2)} ${start.y.toFixed(2)} Z`;
  return path;
}

function annulusCopies(power) {
  const left = 172, right = 668, top = 86, bottom = 414;
  const middle = (top + bottom) / 2;
  const period = bottom - top;
  const copies = [];
  const count = Math.max(3, Math.ceil(Math.abs(power)) + 3);
  for (let copy = -count; copy <= count; copy += 1) {
    const points = [];
    for (let index = 0; index <= 190; index += 1) {
      const s = index / 190;
      points.push(`${(left + (right - left) * s).toFixed(2)},${(middle - power * period * smooth(s) + copy * period).toFixed(2)}`);
    }
    copies.push(points.join(' '));
  }
  return copies;
}

function SurfaceScene({ showDelta = true, showCurve = true, power = 0, ghostPower = null, ghostLabel = 'a · original', isolate = false, pulse = 0, negative = false, labels = true, recap = false }) {
  const current = useMemo(() => curvePath(power), [power]);
  const ghost = useMemo(() => (ghostPower === null ? null : curvePath(ghostPower)), [ghostPower]);
  const fade = isolate ? 0.30 : 1;
  const annulusOpacity = isolate ? 0.34 + pulse * 0.30 : pulse * 0.20;
  return (
    <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label="Genus-two fiber with separating curve delta and test curve a">
      <defs>
        <linearGradient id="journey-surface" x1="0" x2="1"><stop offset="0" stopColor="#18232a" /><stop offset=".5" stopColor="#20232a" /><stop offset="1" stopColor="#281c2a" /></linearGradient>
        <filter id="journey-cyan-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <filter id="journey-pink-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
        <marker id="journey-arrow-amber" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#f6ad4a" /></marker>
      </defs>
      <path className="journey-surface-shape" style={{ opacity: fade }} d="M 76 250 C 76 118 220 62 330 148 C 370 179 470 179 510 148 C 620 62 764 118 764 250 C 764 382 620 438 510 352 C 470 321 370 321 330 352 C 220 438 76 382 76 250 Z" fill="url(#journey-surface)" />
      <ellipse className="journey-hole" cx="240" cy="250" rx="92" ry="72" style={{ opacity: fade }} />
      <ellipse className="journey-hole" cx="600" cy="250" rx="92" ry="72" style={{ opacity: fade }} />
      {(isolate || pulse > 0.01) && <ellipse className="journey-annulus" cx={CENTER.x} cy={CENTER.y} rx={ELLIPSE.rx} ry={ELLIPSE.ry} style={{ opacity: annulusOpacity }} />}
      {ghost && showCurve && <path className="journey-curve ghost" d={ghost} />}
      {showCurve && <path className="journey-curve current" d={current} filter="url(#journey-cyan-glow)" />}
      {showDelta && <><ellipse className="journey-delta-halo" cx={CENTER.x} cy={CENTER.y} rx={ELLIPSE.rx} ry={ELLIPSE.ry} filter="url(#journey-pink-glow)" /><ellipse className="journey-delta" cx={CENTER.x} cy={CENTER.y} rx={ELLIPSE.rx} ry={ELLIPSE.ry} /></>}
      {(isolate || pulse > 0.08) && <path className={`journey-twist-arrow ${negative ? 'negative' : ''}`} d={negative ? 'M 482 140 C 535 175, 538 308, 480 355' : 'M 478 355 C 535 310, 535 177, 482 140'} markerEnd="url(#journey-arrow-amber)" style={{ opacity: 0.35 + 0.65 * Math.max(pulse, isolate ? 0.8 : 0) }} />}
      {labels && showDelta && <g transform="translate(478 96)"><rect width="102" height="34" rx="17" className="journey-label-bg delta" /><text x="51" y="22" textAnchor="middle" className="journey-label delta">δ · fixed</text></g>}
      {labels && showCurve && <g transform="translate(604 362)"><rect width="128" height="34" rx="17" className="journey-label-bg curve" /><text x="64" y="22" textAnchor="middle" className="journey-label curve">{Math.abs(power) < 0.02 ? 'a · moving' : `d${power < 0 ? '⁻' : ''}${Math.abs(Math.round(power)) || ''}(a)`}</text></g>}
      {labels && ghost && <g transform="translate(110 362)"><rect width="112" height="34" rx="17" className="journey-label-bg ghost" /><text x="56" y="22" textAnchor="middle" className="journey-label ghost">{ghostLabel}</text></g>}
      {recap && <g className="journey-recap-cards"><g transform="translate(86 394)"><rect width="194" height="70" rx="18" /><text x="18" y="28" className="recap-key delta">δ</text><text x="18" y="50" className="recap-value">stays fixed</text></g><g transform="translate(323 394)"><rect width="194" height="70" rx="18" /><text x="18" y="28" className="recap-key curve">a</text><text x="18" y="50" className="recap-value">is transformed</text></g><g transform="translate(560 394)"><rect width="194" height="70" rx="18" /><text x="18" y="28" className="recap-key n">n</text><text x="18" y="50" className="recap-value">counts turns + direction</text></g></g>}
    </svg>
  );
}

function AnnulusScene({ power, pulse, fromLabel = 'a', toLabel = 'd(a)', negative = false }) {
  const copies = useMemo(() => annulusCopies(power), [power]);
  return (
    <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label="Cut-open annular neighborhood showing a Dehn twist">
      <defs><clipPath id="journey-annulus-clip"><rect x="172" y="76" width="496" height="338" rx="24" /></clipPath><filter id="journey-flat-glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter><marker id="journey-flat-arrow" markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="#f6ad4a" /></marker></defs>
      <rect x="48" y="25" width="744" height="450" rx="34" className="journey-flat-frame" /><rect x="172" y="76" width="496" height="338" rx="24" className="journey-flat-band" /><rect x="172" y="76" width="496" height="338" rx="24" className="journey-flat-pulse" style={{ opacity: 0.08 + pulse * 0.48 }} />
      <g clipPath="url(#journey-annulus-clip)"><line x1="172" x2="668" y1="245" y2="245" className="journey-flat-ghost" />{copies.map((points, index) => <polyline key={index} points={points} className="journey-flat-current" filter="url(#journey-flat-glow)" />)}<line x1="420" x2="420" y1="76" y2="414" className="journey-flat-delta-halo" /><line x1="420" x2="420" y1="76" y2="414" className="journey-flat-delta" /></g>
      <line x1="172" x2="668" y1="76" y2="76" className="journey-flat-edge" /><line x1="172" x2="668" y1="414" y2="414" className="journey-flat-edge" /><path d="M 140 92 L 140 398 M 132 104 L 140 92 L 148 104 M 132 386 L 140 398 L 148 386" className="journey-flat-identify" />
      <path d={negative ? 'M 699 150 C 746 212, 744 290, 698 346' : 'M 698 346 C 744 290, 746 212, 699 150'} className="journey-flat-twist-arrow" markerEnd="url(#journey-flat-arrow)" style={{ opacity: 0.25 + 0.75 * pulse }} />
      <text x="420" y="52" textAnchor="middle" className="journey-flat-title">annulus N(δ), cut open</text><text x="444" y="106" className="journey-flat-delta-text">δ</text><text x="195" y="225" className="journey-flat-ghost-text">{fromLabel}</text><text x="646" y="225" textAnchor="end" className="journey-flat-current-text">{toLabel}</text><text x="140" y="249" textAnchor="middle" className="journey-flat-identify-text" transform="rotate(-90 140 249)">identified edges</text><text x="420" y="450" textAnchor="middle" className="journey-flat-formula">one boundary turns through 2π; the other stays fixed</text>
    </svg>
  );
}

function MiniFiber({ x, y, scale = 0.36, power = 0, label, showCurve = true }) {
  const path = curvePath(power);
  return <g transform={`translate(${x} ${y}) scale(${scale}) translate(-420 -250)`}><path className="journey-mini-surface" d="M 76 250 C 76 118 220 62 330 148 C 370 179 470 179 510 148 C 620 62 764 118 764 250 C 764 382 620 438 510 352 C 470 321 370 321 330 352 C 220 438 76 382 76 250 Z" /><ellipse className="journey-mini-hole" cx="240" cy="250" rx="92" ry="72" /><ellipse className="journey-mini-hole" cx="600" cy="250" rx="92" ry="72" />{showCurve && <path className="journey-mini-curve" d={path} />}<ellipse className="journey-mini-delta" cx={CENTER.x} cy={CENTER.y} rx={ELLIPSE.rx} ry={ELLIPSE.ry} />{label && <text x="420" y="510" textAnchor="middle" className="journey-mini-label">{label}</text>}</g>;
}

function BlocksScene({ twisted = false, power = DEMO_N }) {
  return <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label="Two Matsumoto blocks, with the second conjugated by a power of d"><MiniFiber x={245} y={235} scale={0.40} power={0} label="F" showCurve={twisted} /><MiniFiber x={595} y={235} scale={0.40} power={twisted ? power : 0} label={twisted ? `Fᵈ${power}` : 'F'} showCurve={twisted} /><text x="420" y="250" textAnchor="middle" className="journey-block-times">·</text>{twisted && <><path d="M 525 88 C 590 42, 700 58, 735 122" className="journey-conjugation-arrow" /><text x="646" y="52" textAnchor="middle" className="journey-conjugation-label">apply dⁿ to every factor in block 2</text><rect x="276" y="405" width="288" height="58" rx="20" className="journey-word-box" /><text x="420" y="442" textAnchor="middle" className="journey-word-text">Wₙ = F Fᵈⁿ</text></>}</svg>;
}

function ClassificationQuestion() {
  return <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label="Question whether the twisted factorizations are equivalent">{[0,1,2,3].map((n,index)=><g key={n} transform={`translate(${115+index*205} 104)`}><rect width="160" height="230" rx="28" className="journey-word-card" /><text x="80" y="55" textAnchor="middle" className="journey-word-card-label">W{n}</text><path d={`M 36 118 C 72 ${86-n*7}, 104 ${150+n*8}, 126 104`} className="journey-word-card-curve" /><text x="80" y="196" textAnchor="middle" className="journey-word-card-twist">{n} twist{n===1?'':'s'}</text></g>)}<text x="420" y="400" textAnchor="middle" className="journey-question-mark">?</text><text x="420" y="450" textAnchor="middle" className="journey-question-label">can fibration equivalences erase n?</text></svg>;
}

function CompareScene({ left, right, same }) {
  return <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label={`Comparison of W${left} and W${right}`}><MiniFiber x={235} y={215} scale={0.40} power={left} label={`W${left}`} /><MiniFiber x={605} y={215} scale={0.40} power={right} label={`W${right}`} /><g transform="translate(343 365)"><rect width="154" height="72" rx="24" className={`journey-verdict ${same?'same':'different'}`} /><text x="77" y="30" textAnchor="middle" className="journey-verdict-main">{same?'SAME CLASS':'DIFFERENT'}</text><text x="77" y="52" textAnchor="middle" className="journey-verdict-sub">|{left}| {same?'=':'≠'} |{right}|</text></g></svg>;
}

function ClassificationTheorem({ advanced }) {
  return <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label="Classification theorem">{[1,2,3].map((n,index)=>{const y=105+index*105;return <g key={n}><circle cx="170" cy={y} r="39" className="journey-sign-node negative" /><circle cx="670" cy={y} r="39" className="journey-sign-node positive" /><text x="170" y={y+8} textAnchor="middle" className="journey-sign-text">−{n}</text><text x="670" y={y+8} textAnchor="middle" className="journey-sign-text">+{n}</text><path d={`M 210 ${y} C 310 ${y-34}, 530 ${y-34}, 630 ${y}`} className="journey-pair-arc" /><rect x="367" y={y-28} width="106" height="56" rx="20" className="journey-abs-box" /><text x="420" y={y+7} textAnchor="middle" className="journey-abs-text">|n| = {n}</text></g>})}<text x="420" y="424" textAnchor="middle" className="journey-classification-formula">Wₘ ≅ Wₙ  ⇔  |m| = |n|</text>{advanced&&<g className="journey-advanced-certificate"><rect x="150" y="452" width="540" height="38" rx="14" /><text x="420" y="476" textAnchor="middle">μ(Kₙ ∩ I₂) = ℤ[O_c] ⊕ n I(O_d)</text></g>}</svg>;
}

function ManifoldQuestion() {
  return <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label="Question whether different fibrations have different total spaces">{[0,1,2,3].map((n,index)=>{const x=115+index*205;return <g key={n} transform={`translate(${x} 80)`}><rect width="160" height="104" rx="24" className="journey-small-word" /><text x="80" y="62" textAnchor="middle" className="journey-small-word-text">W{n}</text><path d="M 80 112 L 80 230" className="journey-question-drop" /><circle cx="80" cy="272" r="45" className="journey-question-orb" /><text x="80" y="283" textAnchor="middle" className="journey-question-orb-text">?</text></g>})}<text x="420" y="444" textAnchor="middle" className="journey-question-label">different fibrations — different smooth 4-manifolds?</text></svg>;
}

function ManifoldAnswer() {
  return <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label="Every total space is E(1,1)">{[0,1,2,3].map((n,index)=>{const x=115+index*205;return <g key={n}><rect x={x} y="66" width="160" height="86" rx="22" className="journey-small-word" /><text x={x+80} y="119" textAnchor="middle" className="journey-small-word-text">W{n}</text><path d={`M ${x+80} 155 C ${x+80} 220, 420 210, 420 300`} className="journey-converge-line" /></g>})}<circle cx="420" cy="337" r="96" className="journey-e11-orb" /><circle cx="420" cy="337" r="61" className="journey-e11-ring" /><text x="420" y="346" textAnchor="middle" className="journey-e11-name">E(1,1)</text><text x="420" y="474" textAnchor="middle" className="journey-e11-caption">X₀ ≅⁺ X₁ ≅⁺ X₂ ≅⁺ X₃ ≅⁺ ···</text></svg>;
}

function ExtensionGoal() {
  return <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label="Goal to construct Phi"><defs><radialGradient id="journey-piece-fill" cx="40%" cy="35%"><stop offset="0" stopColor="#303b4b" /><stop offset="1" stopColor="#111721" /></radialGradient></defs><path d="M 166 250 C 166 105, 286 58, 420 82 C 554 58, 674 105, 674 250 C 674 395, 554 442, 420 418 C 286 442, 166 395, 166 250 Z" className="journey-piece" fill="url(#journey-piece-fill)" /><ellipse cx="420" cy="250" rx="198" ry="107" className="journey-fiber-slice" /><path d="M 222 250 C 222 177, 304 146, 365 194 C 388 212, 452 212, 475 194 C 536 146, 618 177, 618 250 C 618 323, 536 354, 475 306 C 452 288, 388 288, 365 306 C 304 354, 222 323, 222 250 Z" className="journey-fiber-mini" /><ellipse cx="420" cy="250" rx="35" ry="79" className="journey-goal-delta" /><path d="M 547 144 C 632 184, 650 300, 570 357" className="journey-ambient-arrow" /><text x="645" y="248" textAnchor="middle" className="journey-phi-label">Φ</text><text x="420" y="110" textAnchor="middle" className="journey-piece-label">whole Matsumoto 4-manifold piece Y</text><rect x="281" y="394" width="278" height="62" rx="21" className="journey-goal-box" /><text x="420" y="433" textAnchor="middle" className="journey-goal-formula">Φ|Σ = d</text></svg>;
}

function AbsorptionPlan({ progress }) {
  const reveal=smooth(progress); const items=[{x:126,label:'fiber twist',formula:'dⁿ'},{x:420,label:'move whole piece',formula:'Φⁿ'},{x:714,label:'gluing',formula:'g₀'}];
  return <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label="Boundary twist absorbed by an ambient motion">{items.map((item,index)=><g key={item.label} style={{opacity:0.2+0.8*clamp(reveal*2.2-index*0.48)}}><circle cx={item.x} cy="230" r="84" className={`journey-plan-orb step-${index}`} /><text x={item.x} y="223" textAnchor="middle" className="journey-plan-label">{item.label}</text><text x={item.x} y="261" textAnchor="middle" className="journey-plan-formula">{item.formula}</text></g>)}<path d="M 218 230 L 325 230" className="journey-plan-arrow" style={{opacity:clamp(reveal*2.2-0.32)}} /><path d="M 512 230 L 619 230" className="journey-plan-arrow" style={{opacity:clamp(reveal*2.2-0.84)}} /><text x="420" y="390" textAnchor="middle" className="journey-plan-caption">move one whole summand by Φⁿ, so the boundary twist is no longer in the gluing</text></svg>;
}

function BarbellBase({ showSections=true, showFirstCuff=false, showSecondCuff=false, showBar=false, showPairOfPants=false, showTwists=false, showCancellation=false, activePulse=0, resolveFirst=0, resolveSecond=0, inactive=false }) {
  return <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label="Barbell construction"><defs><filter id="journey-barbell-glow" x="-80%" y="-80%" width="260%" height="260%"><feGaussianBlur stdDeviation="6" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter><marker id="journey-twist-arrowhead" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto"><path d="M0,0 L0,6 L8,3 z" fill="context-stroke" /></marker></defs><rect x="24" y="24" width="792" height="452" rx="34" className="journey-barbell-frame" />{showPairOfPants&&<path d="M 94 250 C 94 96, 746 96, 746 250 C 746 404, 94 404, 94 250 Z" className="journey-pants-outer" />}<ellipse cx="280" cy="250" rx="118" ry="145" className={`journey-hemisphere ${showFirstCuff?'cuff':''}`} /><ellipse cx="560" cy="250" rx="118" ry="145" className={`journey-hemisphere ${showSecondCuff?'cuff':''}`} /><ellipse cx="280" cy="250" rx="78" ry="101" className="journey-b0-loop" /><ellipse cx="560" cy="250" rx="78" ry="101" className="journey-b0-loop" /><text x="280" y="257" textAnchor="middle" className="journey-b0-label">B₀⁺</text><text x="560" y="257" textAnchor="middle" className="journey-b0-label">B₀⁻</text>{showPairOfPants&&<><text x="420" y="78" textAnchor="middle" className="journey-pants-delta">δ</text><text x="420" y="434" textAnchor="middle" className="journey-pants-label">P: pair of pants</text></>}{showSections&&<g className="journey-section-pair"><path d="M 224 54 C 194 164, 240 336, 282 448" /><path d="M 616 54 C 646 164, 600 336, 558 448" /><text x="174" y="62">E₁² = −1</text><text x="666" y="62" textAnchor="end">E₂² = −1</text></g>}{resolveFirst>0&&<g style={{opacity:resolveFirst}}><circle cx="252" cy="250" r={12+16*resolveFirst} className="journey-resolution-point" filter="url(#journey-barbell-glow)" /><rect x="149" y="392" width="244" height="55" rx="18" className="journey-framing-box" /><text x="271" y="426" textAnchor="middle" className="journey-framing-text">−1 − 1 + 2 = 0</text></g>}{resolveSecond>0&&<g style={{opacity:resolveSecond}}><circle cx="588" cy="250" r={12+16*resolveSecond} className="journey-resolution-point" filter="url(#journey-barbell-glow)" /><rect x="447" y="392" width="244" height="55" rx="18" className="journey-framing-box" /><text x="569" y="426" textAnchor="middle" className="journey-framing-text">−1 − 1 + 2 = 0</text></g>}{showFirstCuff&&<text x="280" y="119" textAnchor="middle" className="journey-cuff-label">S₊² = 0</text>}{showSecondCuff&&<text x="560" y="119" textAnchor="middle" className="journey-cuff-label">S₋² = 0</text>}{showBar&&<><path d="M 398 250 L 442 250" className="journey-bar" /><path d="M 398 250 L 442 250" className="journey-bar-glow" filter="url(#journey-barbell-glow)" /><text x="420" y="229" textAnchor="middle" className="journey-bar-label">framed bar</text></>}{inactive&&<g className="journey-inactive-disks">{[[245,190],[245,310],[595,190],[595,310]].map(([x,y],index)=><g key={index}><circle cx={x} cy={y} r="24" className="journey-inactive-halo" /><circle cx={x} cy={y} r="8" className="journey-inactive-core" /></g>)}<text x="420" y="476" textAnchor="middle">blue collars fixed pointwise</text></g>}{showTwists&&<g className="journey-barbell-twists" style={{opacity:0.35+0.65*activePulse}}><path d="M 314 92 C 420 45, 526 92, 555 140" className="outer" markerEnd="url(#journey-twist-arrowhead)" /><path d="M 329 220 C 337 273, 305 318, 250 328" className="inner" markerEnd="url(#journey-twist-arrowhead)" /><path d="M 511 220 C 503 273, 535 318, 590 328" className="inner" markerEnd="url(#journey-twist-arrowhead)" /><text x="420" y="106" textAnchor="middle" className="journey-twist-plus">+ tδ</text><text x="280" y="352" textAnchor="middle" className="journey-twist-minus">− tB₀</text><text x="560" y="352" textAnchor="middle" className="journey-twist-minus">− tB₀</text></g>}{showCancellation&&<g className="journey-cancellation-arrows"><path d="M 221 319 C 194 260, 208 205, 258 176" markerEnd="url(#journey-twist-arrowhead)" /><path d="M 619 319 C 646 260, 632 205, 582 176" markerEnd="url(#journey-twist-arrowhead)" /><text x="280" y="157" textAnchor="middle">+ tB₀</text><text x="560" y="157" textAnchor="middle">+ tB₀</text></g>}</svg>;
}

function CuffScene({ which, progress }) { const reveal=smooth(progress); return <BarbellBase showSections showFirstCuff={which>=1} showSecondCuff={which>=2} resolveFirst={which===1?reveal:1} resolveSecond={which===2?reveal:0} />; }
function NiuScene({ progress }) { return <BarbellBase showSections={false} showFirstCuff showSecondCuff showBar showPairOfPants showTwists activePulse={Math.sin(Math.PI*progress)} inactive />; }

function CancellationScene({ progress }) {
  const t=smooth(progress); return <div className="journey-layered-graphic" role="img" aria-label="Cancellation of inner twists"><div className="journey-layer-base" style={{opacity:1-0.58*t}}><BarbellBase showSections={false} showFirstCuff showSecondCuff showBar showPairOfPants showTwists showCancellation inactive /></div><svg className="journey-svg journey-layer-overlay" viewBox="0 0 840 500" aria-hidden="true"><g className="journey-cancel-equation" style={{opacity:0.10+0.90*t}}><rect x="112" y="177" width="616" height="150" rx="30" /><text x="420" y="226" className="line-one">tB₀² · ( tδ tB₀⁻² )</text><text x="420" y="270" className="line-two">= tδ</text><text x="420" y="307" className="line-three">therefore Φ|Σ = d</text></g></svg></div>;
}

function GluingScene({ progress }) {
  const t=smooth(progress); return <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label="Twisted gluing becomes untwisted"><rect x="70" y="130" width="235" height="230" rx="70" className="journey-summand" /><rect x="535" y="130" width="235" height="230" rx="70" className="journey-summand" /><text x="187" y="250" textAnchor="middle" className="journey-summand-name">Y₁°</text><text x="652" y="250" textAnchor="middle" className="journey-summand-name">Y₂°</text><path d="M 305 245 L 535 245" className="journey-gluing-neck" /><text x="420" y="211" textAnchor="middle" className="journey-gluing-label" style={{opacity:1-t}}>gₙ carries dⁿ</text><path d="M 175 95 C 267 40, 361 85, 360 151" className="journey-phi-power" style={{opacity:0.15+0.85*t}} /><text x="270" y="66" textAnchor="middle" className="journey-phi-power-label" style={{opacity:0.15+0.85*t}}>move Y₁° by Φⁿ</text><text x="420" y="211" textAnchor="middle" className="journey-gluing-label clean" style={{opacity:t}}>g₀</text><rect x="229" y="391" width="382" height="66" rx="22" className="journey-gluing-equation-box" /><text x="420" y="431" textAnchor="middle" className="journey-gluing-equation">g₀ ∘ Φ̂ⁿ = gₙ</text></svg>;
}

function FinalPayoff({ progress }) {
  const t=smooth(progress); return <svg className="journey-svg" viewBox="0 0 840 500" role="img" aria-label="Complete theorem"><g transform="translate(48 58)"><rect width="334" height="372" rx="32" className="journey-final-card left" /><text x="167" y="54" textAnchor="middle" className="journey-final-kicker">DIFFERENT FIBRATIONS</text>{[0,1,2,3].map((n,index)=><g key={n} transform={`translate(${64+index*69} 110)`} style={{opacity:0.25+0.75*clamp(t*2.2-index*0.18)}}><circle r="26" className="journey-final-w" /><text y="6" textAnchor="middle" className="journey-final-w-text">W{n}</text></g>)}<text x="167" y="237" textAnchor="middle" className="journey-final-main">Wₘ ≅ Wₙ</text><text x="167" y="280" textAnchor="middle" className="journey-final-main accent">iff |m| = |n|</text><text x="167" y="332" textAnchor="middle" className="journey-final-note">Mess detects the magnitude of the twist.</text></g><g transform="translate(458 58)"><rect width="334" height="372" rx="32" className="journey-final-card right" /><text x="167" y="54" textAnchor="middle" className="journey-final-kicker">SAME SMOOTH 4-MANIFOLD</text><circle cx="167" cy="157" r={68+10*t} className="journey-final-orb" /><circle cx="167" cy="157" r={43+6*t} className="journey-final-orb-ring" /><text x="167" y="165" textAnchor="middle" className="journey-final-orb-name">E(1,1)</text><text x="167" y="260" textAnchor="middle" className="journey-final-main">Xₙ ≅⁺ E(1,1)</text><text x="167" y="302" textAnchor="middle" className="journey-final-main accent">for every n</text><text x="167" y="346" textAnchor="middle" className="journey-final-note">The ambient extension absorbs dⁿ.</text></g><text x="420" y="476" textAnchor="middle" className="journey-final-tagline">THE FIBRATION REMEMBERS THE TWIST. THE AMBIENT 4-MANIFOLD ABSORBS IT.</text></svg>;
}

function StoryGraphic({ scene, progress, advanced }) {
  switch(scene.kind){
    case 'surface-only': return <SurfaceScene showDelta={false} showCurve={false} labels={false} />;
    case 'delta': return <SurfaceScene showDelta showCurve={false} />;
    case 'curve-a': return <SurfaceScene showDelta showCurve power={0} />;
    case 'annulus': return <SurfaceScene showDelta showCurve isolate pulse={0.8} power={0} />;
    case 'twist-one': { const reveal=smooth((progress-0.30)/0.18); return <div className="journey-layered-graphic"><div className="journey-layer-base" style={{opacity:1-reveal}}><AnnulusScene power={smooth(clamp(progress/0.70))} pulse={Math.sin(Math.PI*clamp(progress/0.70))} /></div><div className="journey-layer-base" style={{opacity:reveal}}><SurfaceScene showDelta showCurve power={smooth(clamp((progress-0.20)/0.80))} ghostPower={0} ghostLabel="a · original" pulse={Math.sin(Math.PI*progress)} /></div></div>; }
    case 'twist-two': return <SurfaceScene showDelta showCurve power={1+smooth(progress)} ghostPower={0} ghostLabel="a · original" pulse={Math.sin(Math.PI*progress)} />;
    case 'twist-negative': return <SurfaceScene showDelta showCurve power={-smooth(progress)} ghostPower={0} ghostLabel="a · original" pulse={Math.sin(Math.PI*progress)} negative />;
    case 'twist-recap': return <SurfaceScene showDelta showCurve power={2} ghostPower={0} labels={false} recap />;
    case 'blocks-plain': return <BlocksScene />;
    case 'blocks-twisted': return <BlocksScene twisted power={DEMO_N} />;
    case 'classification-question': return <ClassificationQuestion />;
    case 'compare-1-2': return <CompareScene left={1} right={2} same={false} />;
    case 'compare-2-neg2': return <CompareScene left={2} right={-2} same />;
    case 'compare-3-5': return <CompareScene left={3} right={5} same={false} />;
    case 'classification-theorem': return <ClassificationTheorem advanced={advanced} />;
    case 'manifold-question': return <ManifoldQuestion />;
    case 'manifold-answer': return <ManifoldAnswer />;
    case 'extension-goal': return <ExtensionGoal />;
    case 'absorption-plan': return <AbsorptionPlan progress={progress} />;
    case 'barbell-objects': return <BarbellBase showSections showPairOfPants />;
    case 'cuff-one': return <CuffScene which={1} progress={progress} />;
    case 'cuff-two': return <CuffScene which={2} progress={progress} />;
    case 'connect-bar': return <BarbellBase showSections={false} showFirstCuff showSecondCuff showBar showPairOfPants />;
    case 'niu-move': return <NiuScene progress={progress} />;
    case 'cancel-inner': return <CancellationScene progress={progress} />;
    case 'gluing': return <GluingScene progress={progress} />;
    case 'final-payoff': return <FinalPayoff progress={progress} />;
    default: return null;
  }
}

function currentChapterIndex(sceneIndex){return CHAPTERS.findIndex((chapter)=>sceneIndex>=chapter.start&&sceneIndex<=chapter.end);}

function TheoremJourney({ onExplore, onTechnicalProof }) {
  const [sceneIndex,setSceneIndex]=useState(0); const [progress,setProgress]=useState(0); const [autoPlay,setAutoPlay]=useState(true); const [advanced,setAdvanced]=useState(false);
  const stateRef=useRef({sceneIndex:0,startedAt:0,finishedAt:null,progress:0,autoPlay:true});
  useEffect(()=>{stateRef.current.autoPlay=autoPlay;},[autoPlay]);
  useEffect(()=>{stateRef.current.sceneIndex=sceneIndex;stateRef.current.startedAt=performance.now();stateRef.current.finishedAt=null;stateRef.current.progress=0;setProgress(0);if(!SCENES[sceneIndex].proofToggle)setAdvanced(false);},[sceneIndex]);
  useEffect(()=>{let frameId;const reduceMotion=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;const tick=(now)=>{const state=stateRef.current;const scene=SCENES[state.sceneIndex];const next=reduceMotion?1:clamp((now-state.startedAt)/scene.duration);if(Math.abs(next-state.progress)>0.003||next===1){state.progress=next;setProgress(next);}if(next>=1){if(state.finishedAt===null)state.finishedAt=now;if(state.autoPlay&&now-state.finishedAt>700){if(state.sceneIndex<SCENES.length-1)setSceneIndex((current)=>Math.min(SCENES.length-1,current+1));else setAutoPlay(false);}}frameId=requestAnimationFrame(tick);};frameId=requestAnimationFrame(tick);return()=>cancelAnimationFrame(frameId);},[]);
  useEffect(()=>{const onKey=(event)=>{if(event.key==='ArrowRight'){setAutoPlay(false);setSceneIndex((current)=>Math.min(SCENES.length-1,current+1));}if(event.key==='ArrowLeft'){setAutoPlay(false);setSceneIndex((current)=>Math.max(0,current-1));}if(event.key===' '){event.preventDefault();setAutoPlay((value)=>!value);}};window.addEventListener('keydown',onKey);return()=>window.removeEventListener('keydown',onKey);},[]);
  const scene=SCENES[sceneIndex];const chapterIndex=currentChapterIndex(sceneIndex);const chapter=CHAPTERS[chapterIndex];const localScene=sceneIndex-chapter.start+1;const localTotal=chapter.end-chapter.start+1;const basicsComplete=sceneIndex>=7;const technicalAvailable=sceneIndex>=19;
  const jump=(nextIndex,keepAutoPlay=false)=>{setAutoPlay(keepAutoPlay);setSceneIndex(clamp(nextIndex,0,SCENES.length-1));};
  return <section className="guided-journey" aria-label="Guided theorem visualization"><div className="journey-chapter-bar"><div><span>CHAPTER {chapterIndex+1} / {CHAPTERS.length}</span><strong>{chapter.label}</strong></div><div className="journey-chapter-segments" aria-label="Chapters">{CHAPTERS.map((item,index)=><button key={item.key} className={index===chapterIndex?'active':index<chapterIndex?'done':''} onClick={()=>jump(item.start)} aria-label={`Go to chapter ${index+1}: ${item.label}`}><i /></button>)}</div><span className="journey-local-count">{localScene} / {localTotal}</span></div><div className="journey-copy" key={`copy-${sceneIndex}`}><span>{scene.eyebrow}</span><h1>{scene.title}</h1><p>{scene.body}</p>{scene.formula&&<div className="journey-formula">{scene.formula}</div>}{scene.proofToggle&&<button className="journey-proof-toggle" onClick={()=>setAdvanced((value)=>!value)}>{advanced?'Hide proof notation':'Show proof certificate'}</button>}{scene.kind==='classification-theorem'&&<small className="journey-integrity">The curve animation visualizes dⁿ. It does not prove inequivalence; the Mess calculation does.</small>}</div><div className="journey-stage" key={`stage-${sceneIndex}`}><StoryGraphic scene={scene} progress={progress} advanced={advanced} /></div><div className="journey-controls"><button className="journey-back" onClick={()=>jump(sceneIndex-1)} disabled={sceneIndex===0}>← Back</button><button className="journey-play" onClick={()=>{if(sceneIndex===SCENES.length-1&&!autoPlay){jump(0,true);return;}setAutoPlay((value)=>!value);}}>{autoPlay?'Pause autoplay':sceneIndex===SCENES.length-1?'Replay story':'Autoplay'}</button><div className="journey-scene-progress" aria-label={`Scene ${sceneIndex+1} of ${SCENES.length}`}><div style={{width:`${((sceneIndex+progress)/SCENES.length)*100}%`}} /></div>{basicsComplete&&sceneIndex<SCENES.length-1&&<button className="journey-explore-link" onClick={onExplore}>Explore n</button>}{technicalAvailable&&onTechnicalProof&&<button className="journey-technical-link" onClick={onTechnicalProof}>Technical proof</button>}{sceneIndex<SCENES.length-1?<button className="journey-next" onClick={()=>jump(sceneIndex+1)}>Next →</button>:<button className="journey-next final" onClick={onExplore}>Explore arbitrary n →</button>}</div></section>;
}

export default TheoremJourney;
