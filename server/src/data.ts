export type DependencyDomain =
  | "Page"
  | "Template"
  | "Module"
  | "HubDB"
  | "HubFS";

export type DependencyNode = {
  id: string;
  name: string;
  domain: DependencyDomain;
  path?: string;
  status: "healthy" | "warning" | "broken" | "orphaned";
  environment: "Production" | "Staging" | "Shared";
  sourceId?: string;
  targetId?: string;
  description: string;
};

export type DependencyEdge = {
  from: string;
  to: string;
  relationship: string;
};

export const nodes: DependencyNode[] = [
  {
    id: "page-investor-resources",
    name: "Investor Resources",
    domain: "Page",
    path: "/resources",
    status: "healthy",
    environment: "Production",
    sourceId: "190784902405",
    targetId: "215848907846",
    description: "Primary investor resource landing page."
  },
  {
    id: "page-fund-detail",
    name: "Fund Detail",
    domain: "Page",
    path: "/funds/example-growth-fund",
    status: "warning",
    environment: "Production",
    sourceId: "190784902998",
    targetId: "215848908231",
    description: "Dynamic fund detail page driven by HubDB data."
  },
  {
    id: "page-staging-campaign",
    name: "Campaign Landing Page",
    domain: "Page",
    path: "/campaigns/fall-outlook",
    status: "healthy",
    environment: "Staging",
    sourceId: "190784903441",
    targetId: "215848909012",
    description: "Staged campaign landing page."
  },
  {
    id: "template-standard",
    name: "Standard Page Template",
    domain: "Template",
    path: "/senriva-demo/templates/standard-page.html",
    status: "healthy",
    environment: "Shared",
    sourceId: "9823101",
    targetId: "11029342",
    description: "Reusable page template used across standard content pages."
  },
  {
    id: "template-fund-detail",
    name: "Fund Detail Template",
    domain: "Template",
    path: "/senriva-demo/templates/fund-detail.html",
    status: "healthy",
    environment: "Shared",
    sourceId: "9823102",
    targetId: "11029343",
    description: "Template for HubDB-backed fund pages."
  },
  {
    id: "module-resource-library",
    name: "Resource Library",
    domain: "Module",
    path: "/senriva-demo/modules/resource-library",
    status: "healthy",
    environment: "Shared",
    sourceId: "4421101",
    targetId: "5518821",
    description: "Custom module rendering categorized resource content."
  },
  {
    id: "module-fund-profile",
    name: "Fund Profile",
    domain: "Module",
    path: "/senriva-demo/modules/fund-profile",
    status: "warning",
    environment: "Shared",
    sourceId: "4421102",
    targetId: "5518822",
    description: "Custom module consuming HubDB fund data."
  },
  {
    id: "module-legacy-banner",
    name: "Legacy Promotional Banner",
    domain: "Module",
    path: "/legacy/modules/promo-banner",
    status: "orphaned",
    environment: "Shared",
    sourceId: "4421199",
    description: "Legacy module with no active dependents."
  },
  {
    id: "hubdb-resources",
    name: "Resource Library",
    domain: "HubDB",
    path: "table: resource_library",
    status: "healthy",
    environment: "Shared",
    sourceId: "8842011",
    targetId: "9923001",
    description: "Structured resource metadata used by the Resource Library module."
  },
  {
    id: "hubdb-funds",
    name: "Fund Data",
    domain: "HubDB",
    path: "table: fund_data",
    status: "warning",
    environment: "Shared",
    sourceId: "8842012",
    targetId: "9923002",
    description: "Fund metadata consumed by fund templates and custom modules."
  },
  {
    id: "hubfs-hero",
    name: "resources-hero.jpg",
    domain: "HubFS",
    path: "/images/resources/resources-hero.jpg",
    status: "healthy",
    environment: "Shared",
    sourceId: "7711001",
    targetId: "8802101",
    description: "Hero image referenced by the Investor Resources page."
  },
  {
    id: "hubfs-factsheet",
    name: "example-fund-factsheet.pdf",
    domain: "HubFS",
    path: "/documents/funds/example-fund-factsheet.pdf",
    status: "healthy",
    environment: "Shared",
    sourceId: "7711002",
    targetId: "8802102",
    description: "Fund document referenced from HubDB content."
  },
  {
    id: "hubfs-old-logo",
    name: "legacy-campaign-logo.png",
    domain: "HubFS",
    path: "/legacy/images/legacy-campaign-logo.png",
    status: "orphaned",
    environment: "Shared",
    sourceId: "7711999",
    description: "Historical asset preserved in archive but not referenced by current content."
  },
  {
    id: "hubfs-missing",
    name: "quarterly-commentary.pdf",
    domain: "HubFS",
    path: "/documents/quarterly-commentary.pdf",
    status: "broken",
    environment: "Shared",
    sourceId: "7711888",
    description: "Referenced asset is missing from the current target inventory."
  }
];

export const edges: DependencyEdge[] = [
  {
    from: "page-investor-resources",
    to: "template-standard",
    relationship: "uses template"
  },
  {
    from: "page-investor-resources",
    to: "module-resource-library",
    relationship: "contains module"
  },
  {
    from: "page-investor-resources",
    to: "hubfs-hero",
    relationship: "references asset"
  },
  {
    from: "module-resource-library",
    to: "hubdb-resources",
    relationship: "queries table"
  },
  {
    from: "hubdb-resources",
    to: "hubfs-factsheet",
    relationship: "references file"
  },
  {
    from: "page-fund-detail",
    to: "template-fund-detail",
    relationship: "uses template"
  },
  {
    from: "page-fund-detail",
    to: "module-fund-profile",
    relationship: "contains module"
  },
  {
    from: "module-fund-profile",
    to: "hubdb-funds",
    relationship: "queries table"
  },
  {
    from: "page-fund-detail",
    to: "hubfs-missing",
    relationship: "references asset"
  },
  {
    from: "page-staging-campaign",
    to: "template-standard",
    relationship: "uses template"
  }
];
