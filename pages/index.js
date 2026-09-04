import Head from 'next/head';
import { useEffect, useState } from 'react';
import WebGLStage from '../components/MatsumotoWebGL';

const SCENES = [
  { tag: 'DEHN TWIST', title: 'Twist the fiber.', formula: 'Wₙ = F · Fᵈⁿ' },
  { tag: 'CLASSIFICATION', title: 'Only |n| survives.', formula: 'Wₘ ≅ Wₙ  ⇔  |m| = |n|' },
  { tag: 'EXTENSION', title: 'The twist escapes.', formula: 'Φ|Σ = d   ⇒   E = ℤ' },
  { tag: 'RESULT', title: 'One manifold. Infinite fibrations.', formula: 'Xₙ ≅⁺ E(1,1),  ∀n ∈ ℤ' },
];

export default function MatsumotoThreeD() {
  const [scene, setScene] = useState(0);
  const [twist, setTwist] = useState(2);
  const [m, setM] = useState(-3);
  const [n, setN] = useState(3);
  const [proof, setProof] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [scopeOpen, setScopeOpen] = useState(false);
  const meta = SCENES[scene];
  const equivalent = Math.abs(m) === Math.abs(n);

  useEffect(() => {
    const onKey = (event) => {
      if (event.key === 'Escape') setScopeOpen(false);
      if (scopeOpen) return;
      if (event.key === 'ArrowRight' || event.key === 'PageDown') {
        setScene((current) => Math.min(3, current + 1));
      }
      if (event.key === 'ArrowLeft' || event.key === 'PageUp') {
        setScene((current) => Math.max(0, current - 1));
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [scopeOpen]);

  useEffect(() => {
    if (scene !== 2) {
      setPlaying(false);
      return;
    }
    setProof(0);
    setPlaying(true);
  }, [scene]);

  useEffect(() => {
    if (!playing) return undefined;
    let frameId;
    let previous = performance.now();
    const advance = (now) => {
      const delta = Math.min(50, now - previous);
      previous = now;
      setProof((current) => {
        const next = Math.min(1, current + delta / 7200);
        if (next >= 1) setPlaying(false);
        return next;
      });
      frameId = requestAnimationFrame(advance);
    };
    frameId = requestAnimationFrame(advance);
    return () => cancelAnimationFrame(frameId);
  }, [playing]);

  const proofPhase = proof < 0.32
    ? 'MATCHING SPHERE'
    : proof < 0.66
      ? '−1 − 1 + 2 = 0'
      : 'BARBELL ⇒ d';

  return (
    <>
      <Head>
        <title>Matsumoto 3D</title>
        <meta
          name="description"
          content="A real-time WebGL explanation of one smooth four-manifold carrying infinitely many genus-two Lefschetz fibrations."
        />
        <meta name="theme-color" content="#05060e" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, viewport-fit=cover"
        />
      </Head>

      <div className="experience">
        <WebGLStage scene={scene} twist={twist} m={m} n={n} proof={proof} />
        <div className="vignette" />
        <div className="grain" />

        <header>
          <button className="brand" onClick={() => setScene(0)}>
            <i />
            <span>MATSUMOTO 3D</span>
          </button>
          <div className="engine"><b />REAL WEBGL</div>
          <button className="scope-button" onClick={() => setScopeOpen(true)}>
            proof + scope
          </button>
        </header>

        <main key={scene}>
          <div className="copy">
            <span>{meta.tag}</span>
            <h1>{meta.title}</h1>
            <p>{meta.formula}</p>
          </div>

          {scene === 0 && (
            <div className="controls twist-controls">
              <button onClick={() => setTwist((value) => Math.max(-6, value - 1))}>−</button>
              <strong>n = {twist}</strong>
              <button onClick={() => setTwist((value) => Math.min(6, value + 1))}>+</button>
              <input
                aria-label="Twist exponent n"
                type="range"
                min="-6"
                max="6"
                value={twist}
                onChange={(event) => setTwist(Number(event.target.value))}
              />
            </div>
          )}

          {scene === 1 && (
            <div className={`controls compare-controls ${equivalent ? 'equivalent' : 'different'}`}>
              <label>
                <span>m</span>
                <input
                  aria-label="m"
                  type="range"
                  min="-5"
                  max="5"
                  value={m}
                  onChange={(event) => setM(Number(event.target.value))}
                />
                <b>{m}</b>
              </label>
              <em>{equivalent ? '≅' : '≄'}</em>
              <label>
                <span>n</span>
                <input
                  aria-label="n"
                  type="range"
                  min="-5"
                  max="5"
                  value={n}
                  onChange={(event) => setN(Number(event.target.value))}
                />
                <b>{n}</b>
              </label>
            </div>
          )}

          {scene === 2 && (
            <div className="controls proof-controls">
              <button
                onClick={() => {
                  if (proof >= 1) setProof(0);
                  setPlaying((value) => !value);
                }}
              >
                {proof >= 1 ? '↻' : playing ? 'Ⅱ' : '▶'}
              </button>
              <input
                aria-label="Proof animation progress"
                type="range"
                min="0"
                max="1"
                step="0.001"
                value={proof}
                onChange={(event) => {
                  setPlaying(false);
                  setProof(Number(event.target.value));
                }}
              />
              <b>{proofPhase}</b>
            </div>
          )}

          {scene === 3 && (
            <div className="result-control">
              <span>W₀, W₁, W₂, …</span>
              <button onClick={() => setScopeOpen(true)}>open theorem</button>
            </div>
          )}
        </main>

        <nav aria-label="Scenes">
          {SCENES.map((item, index) => (
            <button
              key={item.tag}
              className={scene === index ? 'active' : ''}
              onClick={() => setScene(index)}
              aria-label={`Scene ${index + 1}: ${item.tag}`}
            >
              <i />
              <span>0{index + 1}</span>
            </button>
          ))}
        </nav>

        <div className="orbit-hint">drag to orbit · wheel to zoom · double-click to reset</div>

        <aside className={scopeOpen ? 'open' : ''}>
          <button className="backdrop" onClick={() => setScopeOpen(false)} aria-label="Close" />
          <section>
            <button className="close" onClick={() => setScopeOpen(false)}>×</button>
            <span>THE PRECISE CLAIM</span>
            <h2>W<sub>m</sub> ≅ W<sub>n</sub> <i>⇔</i> |m| = |n|</h2>
            <div className="theorem-grid">
              <article><b>01</b><h3>Extend</h3><p>Φ|<sub>Σ</sub> = d with product normal action, hence E = ℤ.</p></article>
              <article><b>02</b><h3>Forget the marking</h3><p>X<sub>n</sub> ≅<sup>+</sup> X<sub>0</sub> ≅<sup>+</sup> E(1,1) for every n.</p></article>
              <article><b>03</b><h3>Keep the fibration</h3><p>W₀, W₁, W₂, … are pairwise nonisomorphic oriented genus-two fibrations.</p></article>
            </div>
            <h4>transport → framing repair → square-zero cuffs → barbell → d</h4>
            <p className="warning">
              <b>Scope.</b> The diffeomorphisms are unmarked. They are not asserted to preserve the displayed fibrations, sections, fiber-sum necks, gluing coordinates, or surgery tori. The WebGL objects are explanatory 3D models, not literal four-dimensional embeddings.
            </p>
          </section>
        </aside>
      </div>
    </>
  );
}
