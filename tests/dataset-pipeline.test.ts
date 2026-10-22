import { describe, expect, it } from 'vitest';
import { evaluateDiseasePrevalenceBaseline, parsePairDataset } from '../src/data/datasetPipeline';

describe('dataset intake and reference baseline', () => {
  it('normalizes identifiers, maps common headers, drops invalid rows, and removes duplicate pairs', () => {
    const result = parsePairDataset('ChEMBL ID,MONDO ID,outcome,note\nchembl1,mondo:1,positive,"context, with comma"\nCHEMBL1,MONDO:1,positive,duplicate\nCHEMBL2,MONDO:2,maybe,invalid\n');
    expect(result.rows).toEqual([{ drugId: 'CHEMBL1', diseaseId: 'MONDO:1', label: 1, sourceRow: 2 }]);
    expect(result.duplicates).toBe(1);
    expect(result.droppedRows).toBe(1);
    expect(result.errors[0]).toContain('Row 4');
  });

  it('rejects files without the required identifier and label columns', () => {
    const result = parsePairDataset('compound,condition\nA,B');
    expect(result.rows).toHaveLength(0);
    expect(result.errors.join(' ')).toContain('Missing binary label column');
  });

  it('excludes a pair when duplicate rows disagree on the label', () => {
    const result = parsePairDataset('drug_id,disease_id,label\nD1,X,positive\nD1,X,negative\nD2,Y,positive');
    expect(result.rows.map(row => row.drugId)).toEqual(['D2']);
    expect(result.conflictingDuplicates).toBe(1);
    expect(result.errors.join(' ')).toContain('conflicting labels');
  });

  it('evaluates a disease prevalence baseline on drugs fully held out from training', () => {
    const csv = ['drug_id,disease_id,label', ...Array.from({ length: 10 }, (_, i) => `D${i},X,positive`), ...Array.from({ length: 10 }, (_, i) => `D${i},Y,negative`)].join('\n');
    const imported = parsePairDataset(csv);
    const result = evaluateDiseasePrevalenceBaseline(imported.rows);
    expect(result).not.toBeNull();
    expect(result?.trainDrugCount).toBe(8);
    expect(result?.testDrugCount).toBe(2);
    expect(result?.testCount).toBe(4);
    expect(result?.auprc).toBe(1);
  });

  it('declines to report AUPRC if the held-out set contains one class only', () => {
    const rows = Array.from({ length: 6 }, (_, i) => ({ drugId: `D${i}`, diseaseId: 'X', label: (i === 0 || i === 5 ? 1 : 0) as 0 | 1, sourceRow: i + 2 }));
    expect(evaluateDiseasePrevalenceBaseline(rows)).toBeNull();
  });
});
