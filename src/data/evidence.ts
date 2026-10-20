import type { EvidenceRecord } from '../types';

// Legacy TinyFish records remain live; fixtures never become live through a source URL.
export const isLiveEvidence = (record: EvidenceRecord) => record.provenance === 'live' ||
  (record.provenance == null && record.source_provider === 'TinyFish Search & Fetch');

export function evidenceBrief(records: EvidenceRecord[], question?: string): string {
  const live = records.filter(isLiveEvidence);
  return [
    '# ReThera AI — Source-linked evidence brief',
    `Exported: ${new Date().toISOString()}`, '',
    'Researcher-authored assessment. Source confirmation and entity links do not establish a biological relationship, efficacy or safety.',
    'Only saved live records are included. This is a selected-source brief, not a systematic review. Missing evidence does not mean no evidence exists.', '',
    ...(question ? [`Research question: ${question}`, ''] : []),
    ...live.flatMap(record => [
      `## ${record.title}`, '',
      `Research question: ${record.research_question || 'Not recorded (legacy record)'}`,
      `Investigation ID: ${record.investigation_id || 'Not recorded (legacy record)'}`,
      `Source URL: ${record.url}`,
      `Provider: ${record.source_provider}`,
      `Published / first submitted: ${record.published_date}`,
      `Retrieved at (UTC): ${record.retrieved_date}`,
      `Search query: ${record.search_query || 'Not recorded (legacy record)'}`,
      `Search retrieved at (UTC): ${record.search_retrieved_at || 'Not recorded'}`,
      `Researcher: ${record.researcher || 'Not recorded'}`,
      `Researcher-entered entities: ${[...record.linked_compounds, ...record.linked_targets, ...record.linked_diseases].join('; ') || 'None'}`,
      `Review status: ${record.review_status}`,
      `Reviewed by / at: ${record.reviewed_by || 'Pending'} / ${record.reviewed_at || 'Pending'}`,
      `Researcher assessment: ${record.direction}`,
      `Evidence category: ${record.category}`,
      `Finding: ${record.researcher_brief?.finding || 'Not assessed'}`,
      `Study type: ${record.researcher_brief?.study_type || 'Not assessed'}`,
      `Model / population: ${record.researcher_brief?.model_population || 'Not assessed'}`,
      `Limitations: ${record.researcher_brief?.limitations || record.limitations}`,
      `What remains unknown: ${record.researcher_brief?.unknowns || 'Not recorded; relevance, study quality and clinical implications still require assessment.'}`,
      `Reviewer notes: ${record.reviewer_notes || 'None'}`, '',
      '### Source record context', JSON.stringify(record.source_context || {}, null, 2), '',
      '### Fetched material (not interpreted)',
      record.content_truncated ? 'Material truncated at 30,000 characters. Consult the source for the rest.' : 'Material saved as returned by the provider; it may not include full publication text.',
      // Quote the material so headings in the fetched page cannot masquerade as brief sections.
      ...record.claim.split('\n').map(line => `> ${line}`), '',
      '### Audit trail', ...record.audit_trail.map(line => `- ${line}`), '',
    ]),
    ...(!live.length ? ['No saved live sources for this investigation.'] : []),
  ].join('\n');
}

export function downloadBrief(records: EvidenceRecord[], question?: string) {
  const url = URL.createObjectURL(new Blob([evidenceBrief(records, question)], { type: 'text/markdown;charset=utf-8' }));
  const link = document.createElement('a');
  link.href = url;
  link.download = 'rethera-evidence-brief.md';
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
