// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { findSimilarMolecules, getRDKitVersion } from '../src/data/molecularSimilarity';
import { mockCandidates } from '../src/data/mockData';

describe('RDKit molecular similarity', () => {
  it('uses valid RDKit Morgan fingerprints and returns a deterministic similarity ranking', async () => {
    const compounds = [
      { id: 'ethanol', name: 'Ethanol', smiles: 'CCO', known_indication: 'Fixture A' },
      { id: 'ethylamine', name: 'Ethylamine', smiles: 'CCN', known_indication: 'Fixture B' },
      { id: 'benzene', name: 'Benzene', smiles: 'c1ccccc1', known_indication: 'Fixture C' },
    ];

    expect(await getRDKitVersion()).toMatch(/^\d{4}\.\d+\.\d+$/);
    const results = await findSimilarMolecules('CCO', compounds, 'ethanol');
    expect(results).toHaveLength(2);
    expect(results[0].name).toBe('Ethylamine');
    expect(results[0].similarity).toBeGreaterThan(results[1].similarity);
    expect(results.every(result => result.similarity >= 0 && result.similarity <= 1)).toBe(true);
  });

  it('rejects invalid query structures instead of returning fixture values', async () => {
    await expect(findSimilarMolecules('not-a-smiles', [], 'none')).rejects.toThrow(/invalid SMILES/i);
  });

  it('calculates similarity over the prototype compound structures, excluding the selected compound', async () => {
    const results = await findSimilarMolecules(mockCandidates[0].smiles, mockCandidates, mockCandidates[0].id);
    expect(results.length).toBeGreaterThan(0);
    expect(results.some(result => result.id === mockCandidates[0].id)).toBe(false);
    expect(results.every(result => Number.isFinite(result.similarity) && result.similarity >= 0 && result.similarity <= 1)).toBe(true);
  });
});
