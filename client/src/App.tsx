import { useEffect, useMemo, useState } from "react";
import "./App.css";

type Domain = "Page" | "Template" | "Module" | "HubDB" | "HubFS";
type NodeStatus = "healthy" | "warning" | "broken" | "orphaned";
type View =
  | "overview"
  | "dependencies"
  | "assets"
  | "content-audit"
  | "backup";

type DependencyNode = {
  id: string;
  name: string;
  domain: Domain;
  path?: string;
  status: NodeStatus;
  environment: "Production" | "Staging" | "Shared";
  sourceId?: string;
  targetId?: string;
  description: string;
};

type DependencyEdge = {
  from: string;
  to: string;
  relationship: string;
};

type ApiResponse = {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
};

const domainIcons: Record<Domain, string> = {
  Page: "P",
  Template: "T",
  Module: "M",
  HubDB: "DB",
  HubFS: "FS"
};

const viewCopy: Record<
  View,
  {
    eyebrow: string;
    title: string;
    subtitle: string;
  }
> = {
  overview: {
    eyebrow: "PORTAL INTELLIGENCE",
    title: "Senriva Overview",
    subtitle:
      "A unified view of portal dependencies, assets, content quality and recovery readiness."
  },
  dependencies: {
    eyebrow: "PORTAL INTELLIGENCE",
    title: "Dependency Mapper",
    subtitle:
      "Understand how pages, templates, modules, HubDB tables and HubFS assets depend on one another."
  },
  assets: {
    eyebrow: "ASSET INTELLIGENCE",
    title: "Asset Analyzer",
    subtitle:
      "Identify referenced, orphaned, broken and cleanup-candidate assets across HubFS and Design Manager."
  },
  "content-audit": {
    eyebrow: "CONTENT INTELLIGENCE",
    title: "Content Audit",
    subtitle:
      "Review content health, SEO quality, accessibility issues, publishing state and broken links."
  },
  backup: {
    eyebrow: "CONTINUITY",
    title: "Backup & Recovery",
    subtitle:
      "Plan dependency-aware reconstruction across HubSpot environments with source-to-target identity reconciliation."
  }
};

function App() {
  const [nodes, setNodes] = useState<DependencyNode[]>([]);
  const [edges, setEdges] = useState<DependencyEdge[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [search, setSearch] = useState("");
  const [domain, setDomain] = useState("All");
  const [status, setStatus] = useState("All");
  const [connected, setConnected] = useState(false);
  const [activeView, setActiveView] = useState<View>("dependencies");

  useEffect(() => {
    fetch("/api/dependencies")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Dependency API unavailable");
        }

        return response.json();
      })
      .then((data: ApiResponse) => {
        setNodes(data.nodes);
        setEdges(data.edges);
        setSelectedId(data.nodes[0]?.id ?? "");
        setConnected(true);
      })
      .catch(() => setConnected(false));
  }, []);

  const selected = nodes.find((node) => node.id === selectedId);

  const filteredNodes = useMemo(() => {
    return nodes.filter((node) => {
      const searchValue = search.toLowerCase();

      const matchesSearch =
        node.name.toLowerCase().includes(searchValue) ||
        node.path?.toLowerCase().includes(searchValue);

      const matchesDomain = domain === "All" || node.domain === domain;
      const matchesStatus = status === "All" || node.status === status;

      return matchesSearch && matchesDomain && matchesStatus;
    });
  }, [nodes, search, domain, status]);

  const outgoing = selected
    ? edges
        .filter((edge) => edge.from === selected.id)
        .map((edge) => ({
          edge,
          node: nodes.find((node) => node.id === edge.to)
        }))
        .filter((item) => item.node)
    : [];

  const incoming = selected
    ? edges
        .filter((edge) => edge.to === selected.id)
        .map((edge) => ({
          edge,
          node: nodes.find((node) => node.id === edge.from)
        }))
        .filter((item) => item.node)
    : [];

  const totalAssets = nodes.length;
  const broken = nodes.filter((node) => node.status === "broken").length;
  const orphaned = nodes.filter((node) => node.status === "orphaned").length;
  const warnings = nodes.filter((node) => node.status === "warning").length;
  const healthy = nodes.filter((node) => node.status === "healthy").length;
  const mapped = nodes.filter((node) => node.sourceId && node.targetId).length;

  const impactCount = selected
    ? new Set([
        ...incoming.map((item) => item.node?.id),
        ...outgoing.map((item) => item.node?.id)
      ]).size
    : 0;

  const currentCopy = viewCopy[activeView];

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">S</div>

          <div>
            <strong>Senriva</strong>
            <span>Portal Intelligence</span>
          </div>
        </div>

        <nav>
          <NavButton
            label="Overview"
            icon="⌂"
            active={activeView === "overview"}
            onClick={() => setActiveView("overview")}
          />

          <NavButton
            label="Dependencies"
            icon="⌘"
            active={activeView === "dependencies"}
            onClick={() => setActiveView("dependencies")}
          />

          <NavButton
            label="Assets"
            icon="▦"
            active={activeView === "assets"}
            onClick={() => setActiveView("assets")}
          />

          <NavButton
            label="Content Audit"
            icon="✓"
            active={activeView === "content-audit"}
            onClick={() => setActiveView("content-audit")}
          />

          <NavButton
            label="Backup & Recovery"
            icon="↻"
            active={activeView === "backup"}
            onClick={() => setActiveView("backup")}
          />
        </nav>

        <div className="sidebar-footer">
          <span className="demo-dot" />
          Fictional demo portal
        </div>
      </aside>

      <main>
        <header className="topbar">
          <div>
            <p className="eyebrow">{currentCopy.eyebrow}</p>
            <h1>{currentCopy.title}</h1>
            <p className="subtitle">{currentCopy.subtitle}</p>
          </div>

          <div className={`connection-badge ${connected ? "connected" : ""}`}>
            <span />
            {connected ? "API connected" : "API unavailable"}
          </div>
        </header>

        {activeView === "overview" && (
          <OverviewView
            totalAssets={totalAssets}
            relationships={edges.length}
            mapped={mapped}
            healthy={healthy}
            warnings={warnings}
            orphaned={orphaned}
            broken={broken}
            setActiveView={setActiveView}
          />
        )}

        {activeView === "dependencies" && (
          <DependencyView
            nodes={nodes}
            edges={edges}
            filteredNodes={filteredNodes}
            selected={selected}
            selectedId={selectedId}
            search={search}
            domain={domain}
            status={status}
            outgoing={outgoing}
            incoming={incoming}
            totalAssets={totalAssets}
            mapped={mapped}
            orphaned={orphaned}
            broken={broken}
            impactCount={impactCount}
            setSelectedId={setSelectedId}
            setSearch={setSearch}
            setDomain={setDomain}
            setStatus={setStatus}
          />
        )}

        {activeView === "assets" && (
          <AssetsView
            nodes={nodes}
            healthy={healthy}
            warnings={warnings}
            orphaned={orphaned}
            broken={broken}
          />
        )}

        {activeView === "content-audit" && <ContentAuditView />}

        {activeView === "backup" && (
          <BackupView
            nodes={nodes}
            mapped={mapped}
            broken={broken}
            warnings={warnings}
          />
        )}
      </main>
    </div>
  );
}

function NavButton({
  label,
  icon,
  active,
  onClick
}: {
  label: string;
  icon: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`nav-item ${active ? "active" : ""}`}
      onClick={onClick}
      type="button"
    >
      <span>{icon}</span>
      {label}
    </button>
  );
}

function OverviewView({
  totalAssets,
  relationships,
  mapped,
  healthy,
  warnings,
  orphaned,
  broken,
  setActiveView
}: {
  totalAssets: number;
  relationships: number;
  mapped: number;
  healthy: number;
  warnings: number;
  orphaned: number;
  broken: number;
  setActiveView: (view: View) => void;
}) {
  return (
    <>
      <section className="metric-grid">
        <Metric
          label="Tracked assets"
          value={totalAssets}
          detail="Across portal domains"
        />

        <Metric
          label="Relationships"
          value={relationships}
          detail="Resolved dependency edges"
        />

        <Metric
          label="Mapped identities"
          value={mapped}
          detail="Source → target IDs"
        />

        <Metric
          label="Needs attention"
          value={warnings + broken}
          detail="Warnings and blockers"
          tone="warning"
        />

        <Metric
          label="Orphaned"
          value={orphaned}
          detail="No active dependents"
          tone="danger"
        />
      </section>

      <section className="module-grid">
        <ModuleCard
          eyebrow="DEPENDENCIES"
          title="Dependency Mapper"
          description="Trace relationships between pages, templates, modules, HubDB tables and HubFS assets."
          stat={`${relationships} relationships`}
          onClick={() => setActiveView("dependencies")}
        />

        <ModuleCard
          eyebrow="ASSETS"
          title="Asset Analyzer"
          description="Identify active, orphaned, stale and cleanup-candidate assets without relying on age alone."
          stat={`${orphaned} orphaned assets`}
          onClick={() => setActiveView("assets")}
        />

        <ModuleCard
          eyebrow="CONTENT"
          title="Content Audit"
          description="Review SEO, accessibility, publishing state, broken links and content quality."
          stat="CMS health analysis"
          onClick={() => setActiveView("content-audit")}
        />

        <ModuleCard
          eyebrow="CONTINUITY"
          title="Backup & Recovery"
          description="Reconstruct portal dependencies across accounts while reconciling target identities."
          stat={`${mapped} mapped identities`}
          onClick={() => setActiveView("backup")}
        />
      </section>

      <section className="overview-health-panel">
        <div>
          <p className="eyebrow">PORTAL HEALTH</p>
          <h2>Current dependency state</h2>
        </div>

        <div className="health-row">
          <HealthStat label="Healthy" value={healthy} kind="healthy" />
          <HealthStat label="Warnings" value={warnings} kind="warning" />
          <HealthStat label="Orphaned" value={orphaned} kind="orphaned" />
          <HealthStat label="Broken" value={broken} kind="broken" />
        </div>
      </section>
    </>
  );
}

function DependencyView({
  nodes,
  edges,
  filteredNodes,
  selected,
  selectedId,
  search,
  domain,
  status,
  outgoing,
  incoming,
  totalAssets,
  mapped,
  orphaned,
  broken,
  impactCount,
  setSelectedId,
  setSearch,
  setDomain,
  setStatus
}: {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
  filteredNodes: DependencyNode[];
  selected: DependencyNode | undefined;
  selectedId: string;
  search: string;
  domain: string;
  status: string;
  outgoing: {
    edge: DependencyEdge;
    node: DependencyNode | undefined;
  }[];
  incoming: {
    edge: DependencyEdge;
    node: DependencyNode | undefined;
  }[];
  totalAssets: number;
  mapped: number;
  orphaned: number;
  broken: number;
  impactCount: number;
  setSelectedId: (id: string) => void;
  setSearch: (value: string) => void;
  setDomain: (value: string) => void;
  setStatus: (value: string) => void;
}) {
  return (
    <>
      <section className="metric-grid">
        <Metric
          label="Tracked assets"
          value={totalAssets}
          detail="Across five HubSpot domains"
        />

        <Metric
          label="Relationships"
          value={edges.length}
          detail="Resolved dependency edges"
        />

        <Metric
          label="Mapped identities"
          value={mapped}
          detail="Source → target IDs"
        />

        <Metric
          label="Orphaned"
          value={orphaned}
          detail="No active dependents"
          tone="warning"
        />

        <Metric
          label="Broken"
          value={broken}
          detail="Missing dependency targets"
          tone="danger"
        />
      </section>

      <section className="workspace">
        <div className="inventory-panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">DEPENDENCY INVENTORY</p>
              <h2>Portal assets</h2>
            </div>

            <span className="count-badge">{filteredNodes.length}</span>
          </div>

          <div className="filters">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search assets or paths..."
            />

            <select
              value={domain}
              onChange={(event) => setDomain(event.target.value)}
            >
              <option>All</option>
              <option>Page</option>
              <option>Template</option>
              <option>Module</option>
              <option>HubDB</option>
              <option>HubFS</option>
            </select>

            <select
              value={status}
              onChange={(event) => setStatus(event.target.value)}
            >
              <option>All</option>
              <option value="healthy">Healthy</option>
              <option value="warning">Warning</option>
              <option value="broken">Broken</option>
              <option value="orphaned">Orphaned</option>
            </select>
          </div>

          <div className="asset-list">
            {filteredNodes.map((node) => (
              <button
                key={node.id}
                className={`asset-row ${
                  selectedId === node.id ? "selected" : ""
                }`}
                onClick={() => setSelectedId(node.id)}
                type="button"
              >
                <div className={`domain-icon ${node.domain.toLowerCase()}`}>
                  {domainIcons[node.domain]}
                </div>

                <div className="asset-info">
                  <strong>{node.name}</strong>
                  <span>{node.path}</span>
                </div>

                <div className="asset-meta">
                  <span className="environment">{node.environment}</span>
                  <span className={`status ${node.status}`}>
                    {node.status}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <aside className="detail-panel">
          {selected ? (
            <>
              <div className="detail-header">
                <div
                  className={`domain-icon large ${selected.domain.toLowerCase()}`}
                >
                  {domainIcons[selected.domain]}
                </div>

                <div>
                  <p className="eyebrow">{selected.domain}</p>
                  <h2>{selected.name}</h2>
                  <p>{selected.description}</p>
                </div>
              </div>

              <div className="impact-card">
                <div>
                  <span>Dependency impact</span>
                  <strong>{impactCount}</strong>
                </div>

                <p>
                  Direct relationships that could be affected if this asset
                  changes or disappears.
                </p>
              </div>

              {(selected.sourceId || selected.targetId) && (
                <div className="mapping-card">
                  <div className="section-title">
                    <span>Identity reconciliation</span>
                    <span className="mapped-label">
                      {selected.targetId ? "Mapped" : "Pending"}
                    </span>
                  </div>

                  <div className="mapping-flow">
                    <div>
                      <span>Source ID</span>
                      <code>{selected.sourceId ?? "—"}</code>
                    </div>

                    <b>→</b>

                    <div>
                      <span>Target ID</span>
                      <code>{selected.targetId ?? "Not mapped"}</code>
                    </div>
                  </div>
                </div>
              )}

              <RelationshipSection
                title="Depends on"
                items={outgoing}
                onSelect={setSelectedId}
              />

              <RelationshipSection
                title="Used by"
                items={incoming}
                onSelect={setSelectedId}
              />

              {outgoing.length === 0 && incoming.length === 0 && (
                <div className="empty-state">
                  <strong>No active relationships</strong>
                  <p>
                    This asset is currently isolated from the dependency graph.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="empty-state">
              Select an asset to inspect its dependencies.
            </div>
          )}
        </aside>
      </section>

      <section className="bottom-grid">
        <div className="insight-card">
          <p className="eyebrow">RECONSTRUCTION INTELLIGENCE</p>
          <h3>Dependency-first restore planning</h3>

          <p>
            Senriva can use dependency relationships to determine safe
            reconstruction order before pages are restored into another HubSpot
            account.
          </p>

          <div className="restore-flow">
            <span>HubFS</span>
            <b>→</b>
            <span>Design Manager</span>
            <b>→</b>
            <span>HubDB</span>
            <b>→</b>
            <span>Pages</span>
            <b>→</b>
            <span>Verify</span>
          </div>
        </div>

        <div className="insight-card">
          <p className="eyebrow">SAFE CLEANUP</p>
          <h3>Know what an asset affects first</h3>

          <p>
            Orphan detection and dependency impact analysis provide the
            foundation for safe archive and cleanup workflows without relying
            on age alone.
          </p>
        </div>
      </section>
    </>
  );
}

function AssetsView({
  nodes,
  healthy,
  warnings,
  orphaned,
  broken
}: {
  nodes: DependencyNode[];
  healthy: number;
  warnings: number;
  orphaned: number;
  broken: number;
}) {
  const assetNodes = nodes.filter(
    (node) =>
      node.domain === "HubFS" ||
      node.domain === "Module" ||
      node.domain === "Template"
  );

  return (
    <>
      <section className="metric-grid">
        <Metric
          label="Tracked assets"
          value={assetNodes.length}
          detail="HubFS and Design Manager"
        />

        <Metric
          label="Healthy"
          value={healthy}
          detail="Resolved dependencies"
        />

        <Metric
          label="Warnings"
          value={warnings}
          detail="Needs review"
          tone="warning"
        />

        <Metric
          label="Orphaned"
          value={orphaned}
          detail="No active references"
          tone="warning"
        />

        <Metric
          label="Broken"
          value={broken}
          detail="Missing dependencies"
          tone="danger"
        />
      </section>

      <section className="feature-view-grid">
        <div className="feature-panel feature-panel-large">
          <p className="eyebrow">ASSET CLEANUP ANALYZER</p>
          <h2>Dependency-aware cleanup</h2>

          <p className="feature-copy">
            Senriva distinguishes complete archive inventory from assets that
            are actively referenced by pages, templates, modules and HubDB
            content. This allows cleanup decisions to be based on actual usage
            rather than file age alone.
          </p>

          <div className="feature-table">
            <div className="feature-table-header">
              <span>Asset</span>
              <span>Domain</span>
              <span>Usage</span>
              <span>Status</span>
            </div>

            {assetNodes.map((node) => {
              const usageCount = nodes.length
                ? node.status === "orphaned"
                  ? 0
                  : node.status === "broken"
                    ? 1
                    : Math.max(
                        1,
                        node.id
                          .split("")
                          .reduce((sum, char) => sum + char.charCodeAt(0), 0) %
                          7
                      )
                : 0;

              return (
                <div className="feature-table-row" key={node.id}>
                  <div>
                    <strong>{node.name}</strong>
                    <small>{node.path}</small>
                  </div>

                  <span>{node.domain}</span>
                  <span>{usageCount}</span>

                  <span className={`status ${node.status}`}>
                    {node.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="feature-side-stack">
          <FeatureInfoCard
            eyebrow="SAFE CLEANUP"
            title="Preview before removal"
            text="A future live implementation can require dependency review and explicit confirmation before any destructive portal action."
          />

          <FeatureInfoCard
            eyebrow="ARCHIVE AWARE"
            title="Preserve historical assets"
            text="An asset can disappear from the current portal while remaining preserved in historical backup storage."
          />

          <FeatureInfoCard
            eyebrow="NEXT MODULE"
            title="Standalone analyzer"
            text="This view becomes the foundation of the dedicated Senriva Asset Cleanup Analyzer demo."
          />
        </div>
      </section>
    </>
  );
}

function ContentAuditView() {
  return (
    <section className="feature-view-grid">
      <div className="feature-panel feature-panel-large">
        <p className="eyebrow">CMS HEALTH</p>
        <h2>Content quality intelligence</h2>

        <p className="feature-copy">
          The Content Audit module reviews publishing state, SEO health,
          accessibility, broken links and content requiring attention.
        </p>

        <div className="audit-preview-grid">
          <PreviewMetric label="Content items" value="10" />
          <PreviewMetric label="Needs review" value="3" />
          <PreviewMetric label="Accessibility" value="15" />
          <PreviewMetric label="Broken links" value="8" />
          <PreviewMetric label="Average SEO" value="83%" />
          <PreviewMetric label="API state" value="Connected" />
        </div>

        <div className="module-note">
          <strong>Existing standalone module</strong>
          <p>
            This functionality already exists as the CMS Content Audit
            Dashboard and can later be connected to the shared Senriva HubSpot
            data layer.
          </p>
        </div>
      </div>

      <div className="feature-side-stack">
        <FeatureInfoCard
          eyebrow="SEO"
          title="Metadata and page health"
          text="Identify weak SEO scores, missing metadata and pages that need optimization."
        />

        <FeatureInfoCard
          eyebrow="ACCESSIBILITY"
          title="Issue visibility"
          text="Surface accessibility issues alongside the content and dependencies they affect."
        />

        <FeatureInfoCard
          eyebrow="OPERATIONS"
          title="One portal view"
          text="Combine audit findings with dependency, asset and recovery intelligence."
        />
      </div>
    </section>
  );
}

function BackupView({
  nodes,
  mapped,
  broken,
  warnings
}: {
  nodes: DependencyNode[];
  mapped: number;
  broken: number;
  warnings: number;
}) {
  const readiness =
    nodes.length === 0
      ? 0
      : Math.round(
          ((nodes.length - broken - warnings * 0.5) / nodes.length) * 100
        );

  return (
    <>
      <section className="metric-grid">
        <Metric
          label="Captured assets"
          value={nodes.length}
          detail="Demo reconstruction scope"
        />

        <Metric
          label="Identity mappings"
          value={mapped}
          detail="Source → target"
        />

        <Metric
          label="Warnings"
          value={warnings}
          detail="Review before execution"
          tone="warning"
        />

        <Metric
          label="Blockers"
          value={broken}
          detail="Must resolve first"
          tone="danger"
        />

        <Metric
          label="Readiness"
          value={readiness}
          detail="Illustrative demo score"
        />
      </section>

      <section className="feature-view-grid">
        <div className="feature-panel feature-panel-large">
          <p className="eyebrow">DEPENDENCY RECONSTRUCTION ENGINE</p>
          <h2>Cross-account reconstruction plan</h2>

          <p className="feature-copy">
            Restore dependencies in deterministic order, capture
            target-generated identities and reconcile dependent references
            before considering the reconstruction complete.
          </p>

          <div className="recovery-phases">
            <RecoveryPhase
              number="01"
              title="HubFS"
              text="Restore or reuse files and establish target asset mappings."
              state="Ready"
            />

            <RecoveryPhase
              number="02"
              title="Design Manager"
              text="Reconstruct templates, modules and source dependencies."
              state="Ready"
            />

            <RecoveryPhase
              number="03"
              title="HubDB"
              text="Create or reuse schemas and reconcile generated table identities."
              state="Mapping"
            />

            <RecoveryPhase
              number="04"
              title="Pages"
              text="Rewrite dependency references and restore dependent content last."
              state="Gated"
            />

            <RecoveryPhase
              number="05"
              title="Verification"
              text="Validate target inventory, references and reconstruction fidelity."
              state="Pending"
            />
          </div>
        </div>

        <div className="feature-side-stack">
          <FeatureInfoCard
            eyebrow="IDENTITY RECONCILIATION"
            title={`${mapped} mappings detected`}
            text="Source IDs cannot be assumed to exist in the destination portal. Senriva records and reconciles the identities generated by the target."
          />

          <FeatureInfoCard
            eyebrow="SAFETY"
            title="Dependency-first execution"
            text="Pages remain gated until required HubFS, Design Manager and HubDB dependencies are available."
          />

          <FeatureInfoCard
            eyebrow="VERIFICATION"
            title="Restore is not the finish line"
            text="Post-restore verification is treated as a dedicated reconstruction phase."
          />
        </div>
      </section>
    </>
  );
}

function ModuleCard({
  eyebrow,
  title,
  description,
  stat,
  onClick
}: {
  eyebrow: string;
  title: string;
  description: string;
  stat: string;
  onClick: () => void;
}) {
  return (
    <button className="module-card" onClick={onClick} type="button">
      <p className="eyebrow">{eyebrow}</p>
      <h2>{title}</h2>
      <p>{description}</p>
      <span>{stat} →</span>
    </button>
  );
}

function HealthStat({
  label,
  value,
  kind
}: {
  label: string;
  value: number;
  kind: NodeStatus;
}) {
  return (
    <div className="health-stat">
      <span className={`health-dot ${kind}`} />
      <div>
        <strong>{value}</strong>
        <span>{label}</span>
      </div>
    </div>
  );
}

function FeatureInfoCard({
  eyebrow,
  title,
  text
}: {
  eyebrow: string;
  title: string;
  text: string;
}) {
  return (
    <div className="feature-info-card">
      <p className="eyebrow">{eyebrow}</p>
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}

function PreviewMetric({
  label,
  value
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="preview-metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function RecoveryPhase({
  number,
  title,
  text,
  state
}: {
  number: string;
  title: string;
  text: string;
  state: string;
}) {
  return (
    <div className="recovery-phase">
      <div className="phase-number">{number}</div>

      <div className="phase-copy">
        <strong>{title}</strong>
        <span>{text}</span>
      </div>

      <div className="phase-state">{state}</div>
    </div>
  );
}

function Metric({
  label,
  value,
  detail,
  tone
}: {
  label: string;
  value: number;
  detail: string;
  tone?: "warning" | "danger";
}) {
  return (
    <div className={`metric-card ${tone ?? ""}`}>
      <span>{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function RelationshipSection({
  title,
  items,
  onSelect
}: {
  title: string;
  items: {
    edge: DependencyEdge;
    node: DependencyNode | undefined;
  }[];
  onSelect: (id: string) => void;
}) {
  if (!items.length) {
    return null;
  }

  return (
    <div className="relationship-section">
      <div className="section-title">
        <span>{title}</span>
        <span>{items.length}</span>
      </div>

      {items.map(({ edge, node }) =>
        node ? (
          <button
            key={`${edge.from}-${edge.to}`}
            className="relationship-row"
            onClick={() => onSelect(node.id)}
            type="button"
          >
            <div className={`domain-icon small ${node.domain.toLowerCase()}`}>
              {domainIcons[node.domain]}
            </div>

            <div>
              <strong>{node.name}</strong>
              <span>{edge.relationship}</span>
            </div>

            <span className={`status ${node.status}`}>{node.status}</span>
          </button>
        ) : null
      )}
    </div>
  );
}

export default App;
