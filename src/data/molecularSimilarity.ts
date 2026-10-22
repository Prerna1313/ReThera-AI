import initRDKitModule, { type MainModule, type Mol } from '@rdkit/rdkit';
import rdkitWasmUrl from '@rdkit/rdkit/RDKit_minimal.wasm?url';

export interface SimilarMolecule {
  id: string;
  name: string;
  similarity: number;
  knownIndication: string;
  smiles: string;
}

interface MoleculeInput {
  id: string;
  name: string;
  smiles: string;
  known_indication: string;
}

let rdkitPromise: Promise<MainModule> | null = null;

function getRDKit(): Promise<MainModule> {
  const nodeProcess = (globalThis as typeof globalThis & { process?: { cwd?: () => string } }).process;
  const nodeRoot = typeof window === 'undefined' ? nodeProcess?.cwd?.().replace(/\\/g, '/') : undefined;
  const wasmLocation = nodeRoot
    ? `file:///${nodeRoot.replace(/^\/+/, '')}/node_modules/@rdkit/rdkit/dist/RDKit_minimal.wasm`
    : rdkitWasmUrl;
  rdkitPromise ??= initRDKitModule({ locateFile: () => wasmLocation });
  return rdkitPromise;
}

function fingerprint(mol: Mol): Uint8Array {
  return new Uint8Array(mol.get_morgan_fp_as_uint8array(JSON.stringify({ radius: 2, nBits: 2048 })) as Uint8Array);
}

function tanimoto(left: Uint8Array, right: Uint8Array): number {
  if (left.length !== right.length) throw new Error('RDKit returned incompatible Morgan fingerprints.');
  let intersection = 0;
  let union = 0;
  for (let index = 0; index < left.length; index += 1) {
    const a = left[index];
    const b = right[index];
    let shared = a & b;
    let combined = a | b;
    while (shared) { intersection += shared & 1; shared >>>= 1; }
    while (combined) { union += combined & 1; combined >>>= 1; }
  }
  return union === 0 ? 1 : intersection / union;
}

export async function findSimilarMolecules(querySmiles: string, library: MoleculeInput[], excludeId?: string): Promise<SimilarMolecule[]> {
  const rdkit = await getRDKit();
  const query = rdkit.get_mol(querySmiles);
  if (!query?.is_valid()) {
    query?.delete();
    throw new Error('This compound has an invalid SMILES structure, so RDKit could not calculate similarity.');
  }

  try {
    const queryFingerprint = fingerprint(query);
    return library.flatMap(candidate => {
      if (candidate.id === excludeId || !candidate.smiles) return [];
      const molecule = rdkit.get_mol(candidate.smiles);
      if (!molecule?.is_valid()) {
        molecule?.delete();
        return [];
      }
      try {
        return [{
          id: candidate.id,
          name: candidate.name,
          similarity: tanimoto(queryFingerprint, fingerprint(molecule)),
          knownIndication: candidate.known_indication,
          smiles: candidate.smiles,
        }];
      } finally {
        molecule.delete();
      }
    }).sort((a, b) => b.similarity - a.similarity || a.name.localeCompare(b.name));
  } finally {
    query.delete();
  }
}

export function getRDKitVersion(): Promise<string> {
  return getRDKit().then(rdkit => rdkit.version());
}
