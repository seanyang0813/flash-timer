import Head from 'next/head';
import { useMemo, useRef, useState } from 'react';
import ProofDependencyGraph from '../components/ProofDependencyGraph';
import ProofNodeInspector from '../components/ProofNodeInspector';
import ClassificationProofBranch from '../components/ClassificationProofBranch';
import ExtensionProofBranch from '../components/ExtensionProofBranch';
import {
  ARTIFACTS,
  NODES,
  SOURCES,
  STATUS_META,
} from '../lib/proofInspectorData';

const MACHINE_CHECKS = [
  'mapping-class and braid words',
  'integral homology matrices',
  'splitting profiles and Plücker data',
  'Mess coefficient and divisibility arithmetic',
  'partial-versus-full cap comparison',
  'framing and exponent arithmetic',
  'sign-equivalence replays and block-shuttle certificates',
  'boundary gluing-map bookkeeping',
];

const HUMAN_GEOMETRY = [
  'matching-sphere embeddedness',
  'section-resolution geometry and signed intersections',
  'construction of the two framed square-zero cuffs',
  'barbell implantation into the Matsumoto pair',
  'relative tubular-neighborhood straightening',
  'product-framed ambient monodromy extension',
  'smooth descent of the piecewise map through the fiber sum',
  'branched-cover identification of X₀ with E(1,1)',
];

function scrollToId(id) {
  const element = document.getElementById(id);
  element?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function StatusLegend() {
  return (
    <div className="proof-status-legend" aria-label="Evidence status legend">
      {Object.entries(STATUS_META).map(([key, item]) => (
        <span key={key}><i className={item.tone} />{item.label}</span>
      ))}
    </div>
  );
}

function SourceDirectory() {
  const sources = useMemo(() => Object.values(SOURCES), []);
  return (
    <section id="source-directory" className="proof-wide-section source-directory-section">
      <header className="proof-section-header compact">
        <div>
          <span>SOURCE DIRECTORY</span>
          <h2>Every imported result has a precise role</h2>
          <p>External sources open in a new tab; project reports open as static verification notes.</p>
        </div>
      </header>
      <div className="source-directory-grid">
        {sources.map((source) => (
          <a key={source.id} href={source.url} target="_blank" rel="noreferrer" className="source-directory-card">
            <span>{source.kind}</span>
            <strong>{source.author}</strong>
            <em>{source.title}</em>
            <small>{source.locator}</small>
            <p>{source.role}</p>
            <b>Open ↗</b>
          </a>
        ))}
      </div>
    </section>
  );
}

function VerificationStatus() {
  return (
    <section id="verification-status" className="proof-wide-section verification-status-section">
      <header className="proof-section-header compact">
        <div>
          <span>VERIFICATION STATUS</span>
          <h2>What is checked, and what remains geometry?</h2>
          <p>The page deliberately refuses to collapse exact computation and differential topology into one “verified” badge.</p>
        </div>
      </header>
      <div className="verification-status-grid">
        <article className="machine-status-card">
          <span>MACHINE-CHECKED</span>
          <h3>Exact algebra and bookkeeping</h3>
          <ul>{MACHINE_CHECKS.map((item) => <li key={item}>{item}</li>)}</ul>
          <p>These checks support the encoded words, matrices, coefficients, profiles, signs, and compositions. They do not prove the geometric implantation.</p>
        </article>
        <article className="human-status-card">
          <span>HUMAN GEOMETRY</span>
          <h3>Ordinary geometric arguments</h3>
          <ul>{HUMAN_GEOMETRY.map((item) => <li key={item}>{item}</li>)}</ul>
          <p>These are mathematical proof obligations justified by geometric arguments and cited theorems—not Lean theorems and not consequences of a test count.</p>
        </article>
      </div>
    </section>
  );
}

function ArtifactPanel() {
  if (!ARTIFACTS.length) return null;
  const primary = ARTIFACTS[0];
  return (
    <section id="artifacts" className="proof-wide-section artifact-section">
      <header className="proof-section-header compact">
        <div>
          <span>CONFIGURED ARTIFACTS</span>
          <h2>Open the evidence without searching the repository</h2>
          <p>Only links that are actually present in this deployment are shown.</p>
        </div>
        <a className="open-artifact-button" href={primary.href} target="_blank" rel="noreferrer">Open verification artifact ↗</a>
      </header>
      <div className="artifact-grid">
        {ARTIFACTS.map((artifact) => (
          <a key={artifact.href} href={artifact.href} target="_blank" rel="noreferrer" className="artifact-card">
            <span>{artifact.label}</span>
            <strong>{artifact.title}</strong>
            <p>{artifact.note}</p>
            <b>Open ↗</b>
          </a>
        ))}
      </div>
    </section>
  );
}

function TheoremContrast() {
  return (
    <section className="proof-wide-section theorem-contrast-section">
      <header className="proof-section-header compact">
        <div>
          <span>THEOREM CONTRAST</span>
          <h2>Intrinsically visible. Extrinsically absorbable.</h2>
        </div>
      </header>
      <div className="theorem-contrast-table">
        <article className="fibration-column">
          <span>FIBRATION</span>
          <h3>The parameter |n| survives</h3>
          <dl>
            <div><dt>detector</dt><dd>Mess abelianization of Kₙ∩I₂</dd></div>
            <div><dt>key term</dt><dd>n I(O<sub>d</sub>)</dd></div>
            <div><dt>classification</dt><dd>Wₘ ~ Wₙ iff |m|=|n|</dd></div>
          </dl>
        </article>
        <div className="contrast-divider"><i /><b>same dⁿ</b><i /></div>
        <article className="ambient-column">
          <span>AMBIENT MANIFOLD</span>
          <h3>The twist extends over Y</h3>
          <dl>
            <div><dt>absorber</dt><dd>product-framed Φ with Φ|Σ=d</dd></div>
            <div><dt>gluing identity</dt><dd>g₀○Φ̂ⁿ=gₙ</dd></div>
            <div><dt>total space</dt><dd>Xₙ≅⁺E(1,1) for all n</dd></div>
          </dl>
        </article>
      </div>
      <p className="contrast-tagline">The fibration remembers the twist. The ambient four-manifold absorbs it.</p>
    </section>
  );
}

export default function ProofInspectorPage() {
  const [selectedId, setSelectedId] = useState('mess-formula');
  const [hostile, setHostile] = useState(false);
  const inspectorRef = useRef(null);

  const selectNode = (nodeId) => {
    if (!NODES[nodeId]) return;
    setSelectedId(nodeId);
    if (typeof window !== 'undefined' && window.innerWidth < 980) {
      window.requestAnimationFrame(() => inspectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  };

  return (
    <>
      <Head>
        <title>Proof inspector — Matsumoto power twists</title>
        <meta
          name="description"
          content="Interactive proof debugger for the |n| classification of Matsumoto power-twist fibrations and the barbell extension fixing their smooth total space."
        />
        <meta name="theme-color" content="#090b11" />
        <meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover" />
      </Head>

      <div className={`proof-page ${hostile ? 'hostile-mode' : ''}`}>
        <header className="proof-page-nav">
          <a href="/" className="proof-back-link">← Main visualization</a>
          <span>MATHEMATICAL NOTEBOOK</span>
          <div className="audit-mode-toggle" role="group" aria-label="Audit mode">
            <button className={!hostile ? 'active' : ''} onClick={() => setHostile(false)}>Normal proof</button>
            <button className={hostile ? 'active hostile' : ''} onClick={() => setHostile(true)}>Hostile audit</button>
          </div>
        </header>

        <main className="proof-page-main">
          <section className="proof-hero">
            <div className="proof-hero-copy">
              <span>PROOF INSPECTOR</span>
              <h1>Proof inspector</h1>
              <p>Why the fibrations distinguish |n|, while the total space remains E(1,1).</p>
            </div>
            <div className="proof-theorem-pair">
              <article className="classification-theorem-card">
                <span>FIBRATION CLASSIFICATION</span>
                <code>Wₘ ~<sub>H,conj</sub> Wₙ</code>
                <b>iff</b>
                <code>|m| = |n|</code>
              </article>
              <article className="total-space-theorem-card">
                <span>UNMARKED TOTAL SPACE</span>
                <code>Xₙ ≅⁺ E(1,1)</code>
                <b>for every n ∈ ℤ</b>
              </article>
            </div>
            <div className="mechanism-buttons">
              <button onClick={() => scrollToId('classification-branch')}><i />Mess detects the twist</button>
              <button onClick={() => scrollToId('extension-branch')}><i />Barbell absorbs the twist</button>
            </div>
            <StatusLegend />
          </section>

          <section className="proof-architecture-section">
            <header className="proof-section-header compact">
              <div>
                <span>TOP-LEVEL PROOF GRAPH</span>
                <h2>Click any dependency to audit it</h2>
                <p>The graph shows architecture; the sticky inspector exposes the exact claim, source, evidence type, and failure mode.</p>
              </div>
            </header>
            <div className="proof-workbench">
              <div className="proof-graph-column">
                <ProofDependencyGraph selectedId={selectedId} hostile={hostile} onSelect={selectNode} />
              </div>
              <div className="proof-inspector-column" ref={inspectorRef}>
                <ProofNodeInspector nodeId={selectedId} hostile={hostile} />
              </div>
            </div>
          </section>

          <ClassificationProofBranch hostile={hostile} onSelect={selectNode} />
          <ExtensionProofBranch hostile={hostile} onSelect={selectNode} />
          <TheoremContrast />
          <VerificationStatus />
          <ArtifactPanel />
          <SourceDirectory />
        </main>

        <footer className="proof-page-footer">
          <a href="/">Return to the transformation-first visualization</a>
          <span>No claim that the diffeomorphisms preserve the displayed fibrations, sections, necks, gluing coordinates, or surgery tori.</span>
        </footer>
      </div>
    </>
  );
}
