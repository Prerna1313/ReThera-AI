export type NavigationTab = 
  | 'dashboard'
  | 'repurposing'
  | 'knowledge-graph'
  | 'compounds'
  | 'evidence-monitor'
  | 'reports'
  | 'candidate-details'
  | 'discover-preview'
  | 'settings';

export interface ResearcherProfile {
  displayName: string;
  credentials: string;
  role: string;
  email: string;
  institution: string;
}

export type EvidenceCategory = 
  | 'E0: Unclassified source'
  | 'E1: Human / Regulatory'
  | 'E2: In Vivo'
  | 'E3: In Vitro / Assay'
  | 'E4: Computational'
  | 'E5: Inferred / Hypothesis';

export type EvidenceDirection = 
  | 'supports'
  | 'contradicts'
  | 'contextual'
  | 'unclear';

export type ReviewStatus = 
  | 'Needs Review'
  | 'Reviewed / Source Confirmed'
  | 'Contradictory Finding'
  | 'Rejected / Irrelevant'
  | 'Partial / Access Limited';

export interface FactorScores {
  biological_support: number;       // 25%
  measured_pharmacology: number;    // 25%
  computational_support: number;    // 15%
  human_development_context: number;// 10%
  live_evidence_relevance: number;  // 10%
  evidence_coverage: number;        // 15%
}

export interface Candidate {
  id: string;
  rank: number;
  name: string;
  chembl_id: string;
  pubchem_cid: string;
  formula: string;
  mw: number;
  logp: number;
  hbd: number;
  hba: number;
  tpsa: number;
  rotatable_bonds: number;
  smiles: string;
  inchikey: string;
  known_indication: string;
  predicted_target: string;
  target_id: string;
  priority_score: number;
  factor_scores: FactorScores;
  clinical_status: 'Approved' | 'Phase III' | 'Phase II' | 'Investigational';
  contradiction_flag: boolean;
  contradiction_count: number;
  evidence_count: number;
  last_updated: string;
  rationale: string;
  admet: {
    absorption: 'High' | 'Good' | 'Moderate' | 'Low';
    distribution: 'Good' | 'Moderate' | 'Poor';
    metabolism: 'Good' | 'Moderate' | 'Poor';
    excretion: 'Good' | 'Moderate' | 'Poor';
    toxicity: 'Low Risk' | 'Moderate Risk' | 'High Risk';
  };
  targets: Array<{
    name: string;
    symbol: string;
    uniprot: string;
    affinity_type: string;
    affinity_value: string;
    source: string;
  }>;
  supporting_evidence: Array<{
    id: string;
    title: string;
    citation: string;
    claim: string;
    category: EvidenceCategory;
    direction: EvidenceDirection;
  }>;
  contradictory_evidence: Array<{
    id: string;
    title: string;
    citation: string;
    claim: string;
    category: EvidenceCategory;
    direction: EvidenceDirection;
  }>;
  evidence_gaps: Array<{
    id: string;
    title: string;
    description: string;
  }>;
  similar_compounds: Array<{
    name: string;
    similarity: number;
    status: string;
  }>;
}

export interface EvidenceRecord {
  id: string;
  title: string;
  url: string;
  source_provider: string;
  published_date: string;
  retrieved_date: string;
  linked_compounds: string[];
  linked_targets: string[];
  linked_diseases: string[];
  claim: string;
  category: EvidenceCategory;
  direction: EvidenceDirection;
  review_status: ReviewStatus;
  extraction_confidence?: number;
  limitations: string;
  reviewer_notes?: string;
  researcher_brief?: {
    finding: string;
    study_type: string;
    model_population: string;
    limitations: string;
  };
  audit_trail: string[];
}

export interface GraphNode {
  id: string;
  label: string;
  sublabel: string;
  type: 'disease' | 'target' | 'compound' | 'pathway' | 'publication' | 'trial';
  x: number;
  y: number;
  radius: number;
  color: string;
  border_color: string;
  meta: Record<string, any>;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label: string;
  direction: string;
  confidence: number;
  evidence_ids: string[];
}

export interface Investigation {
  id: string;
  title: string;
  disease_name: string;
  disease_id: string;
  target_name: string;
  target_id: string;
  status: 'Running' | 'Completed' | 'Queued' | 'Partial' | 'Failed';
  progress?: number;
  type: 'Repurposing' | 'Target analysis' | 'De novo generation' | 'Evidence refresh';
  last_updated: string;
  candidates_count: number;
  snapshot_version: string;
}

export interface DataSource {
  name: string;
  provider: string;
  purpose: string;
  type: 'Structured DB' | 'Registry' | 'Live Web API' | 'Regulatory' | 'Benchmark';
  status: 'Connected (Demo)' | 'Live API' | 'Operational' | 'Syncing';
  records_count: string;
  last_retrieval: string;
  license_terms: string;
  warnings?: string;
}
