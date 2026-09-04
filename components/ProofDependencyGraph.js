import {
  CLASSIFICATION_NODE_IDS,
  EXTENSION_NODE_IDS,
  NODES,
  STATUS_META,
} from '../lib/proofInspectorData';

function GraphNode({ nodeId, selectedId, hostile, onSelect }) {
  const node = NODES[nodeId];
  const status = STATUS_META[node.status] || STATUS_META.mixed;
  return (
    <button
      type="button"
      className={`proof-graph-node ${node.branch} ${selectedId === nodeId ? 'selected' : ''}`}
      onClick={() => onSelect(nodeId)}
      aria-pressed={selectedId === nodeId}
    >
      <span className={`proof-node-status ${status.tone}`}>{status.label}</span>
      <strong>{node.title}</strong>
      <code>{node.short}</code>
      {hostile && (
        <small>
          <b>Failure?</b> {node.audit.question}
        </small>
      )}
    </button>
  );
}

function GraphBranch({ title, subtitle, nodeIds, selectedId, hostile, onSelect }) {
  return (
    <section className={`proof-graph-branch ${NODES[nodeIds[0]].branch}`}>
      <header>
        <span>{subtitle}</span>
        <h3>{title}</h3>
      </header>
      <div className="proof-graph-stack">
        {nodeIds.map((nodeId, index) => (
          <div className="proof-graph-step" key={nodeId}>
            <GraphNode
              nodeId={nodeId}
              selectedId={selectedId}
              hostile={hostile}
              onSelect={onSelect}
            />
            {index < nodeIds.length - 1 && <i className="proof-graph-arrow" aria-hidden="true" />}
          </div>
        ))}
      </div>
    </section>
  );
}

function ProofDependencyGraph({ selectedId, hostile, onSelect }) {
  return (
    <div className="proof-graph" aria-label="Top-level proof dependency graph">
      <GraphBranch
        title="Mess detects the twist"
        subtitle="Classification branch"
        nodeIds={CLASSIFICATION_NODE_IDS}
        selectedId={selectedId}
        hostile={hostile}
        onSelect={onSelect}
      />
      <GraphBranch
        title="Barbell absorbs the twist"
        subtitle="Extension branch"
        nodeIds={EXTENSION_NODE_IDS}
        selectedId={selectedId}
        hostile={hostile}
        onSelect={onSelect}
      />
    </div>
  );
}

export default ProofDependencyGraph;
