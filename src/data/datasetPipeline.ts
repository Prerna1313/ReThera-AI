export interface PairRow {
  drugId: string;
  diseaseId: string;
  label: 0 | 1;
  sourceRow: number;
}

export interface DatasetImportResult {
  rows: PairRow[];
  errors: string[];
  duplicates: number;
  conflictingDuplicates: number;
  droppedRows: number;
}

// Small RFC-4180-style parser that supports quoted commas, escaped quotes and CRLF.
function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    if (quoted && char === '"' && text[i + 1] === '"') { cell += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (!quoted && char === ',') { row.push(cell); cell = ''; }
    else if (!quoted && (char === '\n' || char === '\r')) {
      if (char === '\r' && text[i + 1] === '\n') i += 1;
      row.push(cell); cell = '';
      if (row.some(value => value.trim())) rows.push(row);
      row = [];
    } else cell += char;
  }
  row.push(cell);
  if (row.some(value => value.trim())) rows.push(row);
  return rows;
}

const normalizeHeader = (header: string) => header.trim().toLowerCase().replace(/[\s-]+/g, '_');
const normalizedId = (value: string) => value.trim().toUpperCase();

export function parsePairDataset(csv: string): DatasetImportResult {
  const parsed = parseCsv(csv);
  if (!parsed.length) return { rows: [], errors: ['CSV is empty.'], duplicates: 0, conflictingDuplicates: 0, droppedRows: 0 };
  const headers = parsed[0].map(normalizeHeader);
  const find = (names: string[]) => headers.findIndex(header => names.includes(header));
  const drugColumn = find(['drug_id', 'drug', 'compound_id', 'compound', 'chembl_id', 'drugbank_id']);
  const diseaseColumn = find(['disease_id', 'disease', 'indication', 'mondo_id', 'mesh_id']);
  const labelColumn = find(['label', 'outcome', 'class', 'is_positive']);
  const errors: string[] = [];
  if (drugColumn < 0) errors.push('Missing drug identifier column (for example drug_id or chembl_id).');
  if (diseaseColumn < 0) errors.push('Missing disease identifier column (for example disease_id or mondo_id).');
  if (labelColumn < 0) errors.push('Missing binary label column (label: positive/negative or 1/0).');
  if (errors.length) return { rows: [], errors, duplicates: 0, conflictingDuplicates: 0, droppedRows: parsed.length - 1 };

  const rows: PairRow[] = [], seen = new Map<string, PairRow>(), conflicted = new Set<string>();
  let duplicates = 0, conflictingDuplicates = 0, droppedRows = 0;
  parsed.slice(1).forEach((cells, index) => {
    const line = index + 2;
    const drugId = normalizedId(cells[drugColumn] || ''), diseaseId = normalizedId(cells[diseaseColumn] || '');
    const rawLabel = (cells[labelColumn] || '').trim().toLowerCase();
    const label: 0 | 1 | null = ['1', 'positive', 'pos', 'true', 'yes'].includes(rawLabel) ? 1
      : ['0', 'negative', 'neg', 'false', 'no'].includes(rawLabel) ? 0 : null;
    if (!drugId || !diseaseId || label === null) {
      errors.push(`Row ${line}: missing identifier or unrecognized label “${cells[labelColumn] || ''}”.`);
      droppedRows += 1;
      return;
    }
    const key = `${drugId}\u0000${diseaseId}`;
    if (conflicted.has(key)) return;
    const existing = seen.get(key);
    if (existing) {
      if (existing.label === label) duplicates += 1;
      else {
        conflictingDuplicates += 1;
        errors.push(`Rows ${existing.sourceRow} and ${line}: conflicting labels for ${drugId} / ${diseaseId}; pair excluded.`);
        const rowIndex = rows.indexOf(existing);
        if (rowIndex >= 0) rows.splice(rowIndex, 1);
        conflicted.add(key);
      }
      return;
    }
    const accepted = { drugId, diseaseId, label, sourceRow: line };
    seen.set(key, accepted);
    rows.push(accepted);
  });
  return { rows, errors, duplicates, conflictingDuplicates, droppedRows };
}

export interface BaselineEvaluation {
  trainCount: number;
  testCount: number;
  trainDrugCount: number;
  testDrugCount: number;
  prevalence: number;
  auprc: number;
  split: string;
}

// Deterministic drug-held-out split; disease-frequency prior is intentionally a simple baseline.
export function evaluateDiseasePrevalenceBaseline(rows: PairRow[]): BaselineEvaluation | null {
  const drugs = [...new Set(rows.map(row => row.drugId))].sort();
  if (drugs.length < 3 || new Set(rows.map(row => row.label)).size < 2) return null;
  const testDrugs = new Set(drugs.filter((_, index) => index % 5 === 0));
  const train = rows.filter(row => !testDrugs.has(row.drugId));
  const test = rows.filter(row => testDrugs.has(row.drugId));
  if (!test.length || new Set(test.map(row => row.label)).size < 2 || !train.length) return null;
  const byDisease = new Map<string, { positives: number; total: number }>();
  train.forEach(row => {
    const count = byDisease.get(row.diseaseId) || { positives: 0, total: 0 };
    count.positives += row.label; count.total += 1; byDisease.set(row.diseaseId, count);
  });
  const prevalence = train.reduce((sum, row) => sum + row.label, 0) / train.length;
  const ranked = test.map(row => ({ label: row.label, score: byDisease.has(row.diseaseId)
    ? (byDisease.get(row.diseaseId)!.positives / byDisease.get(row.diseaseId)!.total) : prevalence }))
    .sort((a, b) => b.score - a.score);
  const positives = ranked.reduce((sum, row) => sum + row.label, 0);
  let seenPositive = 0, precisionSum = 0;
  ranked.forEach((row, index) => { if (row.label) { seenPositive += 1; precisionSum += seenPositive / (index + 1); } });
  return {
    trainCount: train.length, testCount: test.length,
    trainDrugCount: new Set(train.map(row => row.drugId)).size,
    testDrugCount: new Set(test.map(row => row.drugId)).size,
    prevalence, auprc: precisionSum / positives,
    split: 'Deterministic 80/20-style drug holdout (sorted drug IDs; every fifth drug held out)',
  };
}
