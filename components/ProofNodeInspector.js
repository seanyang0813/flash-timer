import { useEffect, useState } from 'react';
import { NODES, SOURCES, STATUS_META } from '../lib/proofInspectorData';

function DetailBlock({ label, children, className = '' }) {
  return (
    <section className={`inspector-block ${className}`}>
      <h4>{label}</h4>
      {children}
    </section>
  );
}

function CheckList({ items, type }) {
  if (!items?.length) return <p className="inspector-empty">None recorded.</p>;
  return (
    <ul className={`inspector-checks ${type}`}>
      {items.map((item) => <li key={item}>{item}</li>)}
    </ul>
  );
}

function SourceCard({ source }) {
  if (!source) return null;
  return (
    <a className="inspector-source-card" href={source.url} target="_blank" rel="noreferrer">
      <span>{source.kind}</span>
      <strong>{source.author}</strong>
      <em>{source.title}</em>
      <small>{source.locator}</small>
      <p>{source.role}</p>
      <b>Open source ↗</b>
    </a>
  );
}

function ProofNodeInspector({ nodeId, hostile, onCloseMobile }) {
  const node = NODES[nodeId] || NODES.family;
  const status = STATUS_META[node.status] || STATUS_META.mixed;
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setCopied(false);
  }, [nodeId]);

  const copyEquation = async () => {
    try {
      await navigator.clipboard.writeText(node.equation);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch (_error) {
      setCopied(false);
    }
  };

  return (
    <aside className={`proof-node-inspector ${hostile ? 'hostile' : ''}`} aria-live="polite">
      <header className="inspector-header">
        <div>
          <span className={`proof-node-status ${status.tone}`}>{status.label}</span>
          <small>{node.branch === 'classification' ? 'Mess branch' : 'Extension branch'}</small>
          <h3>{node.title}</h3>
        </div>
        {onCloseMobile && (
          <button type="button" className="inspector-mobile-close" onClick={onCloseMobile} aria-label="Close claim inspector">×</button>
        )}
      </header>

      {hostile && (
        <div className="hostile-banner">
          <span>HOSTILE AUDIT</span>
          <strong>{node.audit.question}</strong>
        </div>
      )}

      <div className="inspector-scroll">
        <DetailBlock label="Claim">
          <p>{node.claim}</p>
        </DetailBlock>

        <DetailBlock label="Inputs">
          <ul className="inspector-inputs">
            {node.inputs.map((input) => <li key={input}>{input}</li>)}
          </ul>
        </DetailBlock>

        <DetailBlock label="Exact equation" className="equation-block">
          <pre><code>{node.equation}</code></pre>
          <button type="button" onClick={copyEquation}>{copied ? 'Copied' : 'Copy'}</button>
        </DetailBlock>

        <DetailBlock label="Why it follows">
          <p>{node.why}</p>
        </DetailBlock>

        <DetailBlock label="Source / lemma">
          <div className="inspector-sources">
            {node.sources.map((sourceId) => <SourceCard key={sourceId} source={SOURCES[sourceId]} />)}
          </div>
        </DetailBlock>

        <div className="inspector-evidence-grid">
          <DetailBlock label="Machine check" className="machine-block">
            <CheckList items={node.machine} type="machine" />
          </DetailBlock>
          <DetailBlock label="Human geometry" className="human-block">
            <CheckList items={node.human} type="human" />
          </DetailBlock>
        </div>

        <DetailBlock label="Failure mode" className="failure-block">
          <p>{node.audit.failure}</p>
        </DetailBlock>

        <DetailBlock label="How the concern is resolved" className="resolution-block">
          <p>{node.audit.resolution}</p>
        </DetailBlock>
      </div>
    </aside>
  );
}

export default ProofNodeInspector;
