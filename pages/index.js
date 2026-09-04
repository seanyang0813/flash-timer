import Head from 'next/head';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import DehnTwistWebGL from '../components/DehnTwistWebGL';
import FlattenTwist from '../components/FlattenTwist';
import BarbellProof from '../components/BarbellProof';
import TheoremStory from '../components/TheoremStory';

const MIN_N = -6;
const MAX_N = 6;
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const ease = (value) => {
  const t = clamp(value, 0, 1);
  return t * t * (3 - 2 * t);
};

function useSteppedTwist(target, instant) {
  const animationRef = useRef({
    target,
    value: target,
    from: target,
    to: target,
    phase: 1,
    active: false,
    waitUntil: 0,
    instant,
  });
  const [visual, setVisual] = useState({
    value: target,
    pulse: 0,
    from: target,
    to: target,
    animating: false,
  });

  useEffect(() => {
    const state = animationRef.current;
    state.target = target;
    state.instant = instant;
    if (instant) {
      state.value = target;
      state.from = target;
      state.to = target;
      state.phase = 1;
      state.active = false;
      setVisual({ value: target, pulse: 0, from: target, to: target, animating: false });
    }
  }, [target, instant]);

  useEffect(() => {
    let frameId;
    let previous = performance.now();
    const reducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

    const frame = (now) => {
      const state = animationRef.current;
      const delta = Math.min(50, now - previous);
      previous = now;

      if (state.instant || reducedMotion) {
        if (state.value !== state.target || state.active) {
          state.value = state.target;
          state.from = state.target;
          state.to = state.target;
          state.phase = 1;
          state.active = false;
          setVisual({ value: state.target, pulse: 0, from: state.target, to: state.target, animating: false });
        }
        frameId = requestAnimationFrame(frame);
        return;
      }

      if (!state.active && now >= state.waitUntil && Math.round(state.value) !== state.target) {
        state.from = Math.round(state.value);
        state.to = state.from + Math.sign(state.target - state.from);
        state.phase = 0;
        state.active = true;
      }

      if (state.active) {
        state.phase = Math.min(1, state.phase + delta / 1120);
        const curvePhase = ease(clamp((state.phase - 0.12) / 0.76, 0, 1));
        state.value = state.from + (state.to - state.from) * curvePhase;
        const pulse = Math.sin(Math.PI * state.phase);
        setVisual({
          value: state.value,
          pulse,
          from: state.from,
          to: state.to,
          animating: true,
        });

        if (state.phase >= 1) {
          state.value = state.to;
          state.active = false;
          state.waitUntil = now + 135;
          setVisual({
            value: state.value,
            pulse: 0,
            from: state.to,
            to: state.to,
            animating: state.value !== state.target,
          });
        }
      }

      frameId = requestAnimationFrame(frame);
    };

    frameId = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(frameId);
  }, []);

  return visual;
}

function Power({ base = 'd', exponent }) {
  return <>{base}<sup>{exponent}</sup></>;
}

function WordFormula({ n }) {
  return (
    <span>
      W<sub>{n}</sub> = F F<sup><Power exponent={n} /></sup>
    </span>
  );
}

export default function MatsumotoClarity() {
  const router = useRouter();
  const explorerRef = useRef(null);
  const [selectedN, setSelectedN] = useState(0);
  const [view, setView] = useState('3d');
  const [clean, setClean] = useState(false);
  const [proofOpen, setProofOpen] = useState(false);

  useEffect(() => {
    if (!router.isReady) return;
    const rawN = Array.isArray(router.query.n) ? router.query.n[0] : router.query.n;
    const parsedN = Number.parseInt(rawN ?? '0', 10);
    if (Number.isFinite(parsedN)) setSelectedN(clamp(parsedN, MIN_N, MAX_N));
    const rawView = Array.isArray(router.query.view) ? router.query.view[0] : router.query.view;
    setView(rawView === 'flat' ? 'flat' : '3d');
    const rawClean = Array.isArray(router.query.clean) ? router.query.clean[0] : router.query.clean;
    setClean(rawClean === '1');
  }, [router.isReady, router.query.clean, router.query.n, router.query.view]);

  useEffect(() => {
    if (!router.isReady || clean || typeof window === 'undefined') return;
    const url = new URL(window.location.href);
    url.searchParams.set('n', String(selectedN));
    url.searchParams.set('view', view === 'flat' ? 'flat' : '3d');
    url.searchParams.delete('clean');
    window.history.replaceState(null, '', url.toString());
  }, [clean, router.isReady, selectedN, view]);

  const visual = useSteppedTwist(selectedN, clean);
  const absoluteN = Math.abs(selectedN);
  const displayedStep = visual.animating ? visual.to : selectedN;
  const messLabel = selectedN < 0 ? 'Mess content magnitude' : 'Mess content';

  const visualElement = view === 'flat'
    ? (
      <FlattenTwist
        twist={visual.value}
        pulse={visual.pulse}
        targetN={displayedStep}
        clean={clean}
      />
    )
    : (
      <DehnTwistWebGL
        twist={visual.value}
        pulse={visual.pulse}
        targetN={displayedStep}
        clean={clean}
      />
    );

  const openExplorer = () => {
    setSelectedN(3);
    window.requestAnimationFrame(() => {
      explorerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  };

  if (clean) {
    return (
      <>
        <Head>
          <title>Dehn twist d^{selectedN}</title>
          <meta name="theme-color" content="#05070c" />
          <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
        </Head>
        <main className="clean-capture">{visualElement}</main>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>Matsumoto power twists — visual theorem</title>
        <meta
          name="description"
          content="An eight-frame geometric story of the separating Dehn twist d^n, the |n| fibration classification, and the fixed total space E(1,1)."
        />
        <meta name="theme-color" content="#05070c" />
        <meta
          name="viewport"
          content="width=device-width,initial-scale=1,viewport-fit=cover,interactive-widget=resizes-content"
        />
      </Head>

      <div className="clarity-page">
        <header className="clarity-header">
          <button className="clarity-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <i />
            <span>MATSUMOTO POWER TWISTS</span>
          </button>
          <div className="header-actions">
            <button onClick={openExplorer}>Explore n</button>
            <button className="primary" onClick={() => setProofOpen(true)}>Barbell proof</button>
          </div>
        </header>

        <TheoremStory
          onExplore={openExplorer}
          onProof={() => setProofOpen(true)}
        />

        <section ref={explorerRef} id="explore" className="explorer-anchor">
          <div className="explorer-heading">
            <div>
              <span>AFTER THE STORY</span>
              <h2>Explore arbitrary n.</h2>
            </div>
            <p>
              The guided sequence uses n = 3 so each geometric transition is visible. Here the same annular transformation is evaluated for every integer from −6 to 6.
            </p>
            <div className="view-toggle" aria-label="Visualization mode">
              <button className={view === '3d' ? 'active' : ''} onClick={() => setView('3d')}>3D surface</button>
              <button className={view === 'flat' ? 'active' : ''} onClick={() => setView('flat')}>Flatten twist</button>
            </div>
          </div>
        </section>

        <main className="theorem-layout explorer-layout">
          <section className="visual-card">
            <div className="visual-card-header">
              <span>{view === '3d' ? 'ORBITABLE SURFACE MODEL' : 'ANNULAR COORDINATE MODEL'}</span>
              <div className="curve-key" aria-label="Curve legend">
                <span><i className="delta" />δ fixed</span>
                <span><i className="current" />d<sup>n</sup>(a)</span>
                <span><i className="ghost" />original a</span>
              </div>
            </div>

            <div className="visual-stage">
              {visualElement}
              <div className={`visual-transition ${visual.animating ? 'on' : ''}`}>
                annulus active: d<sup>{visual.from}</sup>(a) → d<sup>{visual.to}</sup>(a)
              </div>
            </div>

            <div className="n-control">
              <button
                onClick={() => setSelectedN((value) => Math.max(MIN_N, value - 1))}
                disabled={selectedN === MIN_N}
                aria-label="Decrease n"
              >
                −
              </button>
              <div className="n-value">
                <span>exploration control</span>
                <strong>n = {selectedN}</strong>
              </div>
              <button
                onClick={() => setSelectedN((value) => Math.min(MAX_N, value + 1))}
                disabled={selectedN === MAX_N}
                aria-label="Increase n"
              >
                +
              </button>
              <label className="n-slider-wrap">
                <span>{MIN_N}</span>
                <input
                  type="range"
                  min={MIN_N}
                  max={MAX_N}
                  step="1"
                  value={selectedN}
                  onChange={(event) => setSelectedN(Number(event.target.value))}
                  aria-label="Select Dehn twist exponent n"
                />
                <span>+{MAX_N}</span>
              </label>
            </div>
          </section>

          <aside className="certificate-card">
            <span>THEOREM CERTIFICATE</span>
            <div className="certificate-formula"><WordFormula n={selectedN} /></div>
            <dl className="certificate-rows">
              <div><dt>Selected n</dt><dd>{selectedN}</dd></div>
              <div><dt>Twist</dt><dd><Power exponent={selectedN} /></dd></div>
              <div><dt>{messLabel}</dt><dd>{absoluteN}</dd></div>
              <div><dt>Fibration class</dt><dd className="highlight">|n| = {absoluteN}</dd></div>
            </dl>
            {selectedN < 0 && (
              <p className="negative-note">Same fibration class as n = +{absoluteN}; the visible twist direction is reversed.</p>
            )}
            <p className="integrity-note">
              <b>Visual evidence:</b> the chosen test curve a is transformed by the standard annular formula. <b>Theorem evidence:</b> Mess abelianization—not this one curve—proves W<sub>m</sub> ≅ W<sub>n</sub> iff |m| = |n|.
            </p>
          </aside>

          <section className="contrast-card" aria-label="Different fibrations on the same smooth manifold">
            <div className="contrast-side">
              <div className="fibration-glyph"><span>|n|={absoluteN}</span></div>
              <div>
                <span className="contrast-label">MESS DETECTS THE TWIST</span>
                <h3>Different fibrations</h3>
                <p><WordFormula n={selectedN} /></p>
              </div>
            </div>

            <div className="absorb-arrow">
              <b>ambient extension</b>
              <i />
              <span>Φ<sup>{selectedN}</sup> absorbs d<sup>{selectedN}</sup></span>
            </div>

            <div className="contrast-side">
              <div className="elliptic-glyph">E(1,1)</div>
              <div>
                <span className="contrast-label">THE BARBELL ABSORBS THE TWIST</span>
                <h3>Same smooth 4-manifold</h3>
                <p>X<sub>{selectedN}</sub> ≅<sup>+</sup> E(1,1)</p>
              </div>
            </div>
          </section>

          <button className="proof-launch" onClick={() => setProofOpen(true)}>
            Why can the manifold absorb the twist?
          </button>
        </main>

        <BarbellProof open={proofOpen} onClose={() => setProofOpen(false)} n={selectedN} />
      </div>
    </>
  );
}
