# ReThera AI

**Evidence-driven intelligence for therapeutic discovery.**

ReThera AI is a research platform prototype for exploring drug-repurposing hypotheses. It brings researcher-guided biomedical source discovery, evidence review, molecular similarity, and dataset evaluation into one workflow. The goal is to help researchers decide what may be worth investigating next, with sources and uncertainty visible throughout.

**Reimagining Therapeutics with AI** captures the proposed brand meaning: reposition existing therapies, connect therapeutic evidence, and apply AI to help researchers explore new hypotheses.

> ReThera AI organizes research evidence and exploratory analyses. It does not establish that a candidate is safe or effective, and it is not a clinical decision system.

## What the prototype can do today

- Start a disease- or target-focused investigation and carry its question into source discovery.
- Search TinyFish for biomedical material and fetch a source selected by the researcher. ClinicalTrials.gov records can also be searched and retrieved through its public API.
- Review retrieved material, add a researcher-authored assessment, record a review decision, and export a source-linked Markdown evidence brief.
- Inspect live evidence separately from illustrative sample records. Researcher-entered entity links lead back to their source and audit trail.
- Calculate RDKit Morgan fingerprint similarity (radius 2, 2,048 bits) and Tanimoto coefficients across structures in the prototype compound library.
- Import a drug–disease pair CSV in Dataset Lab, validate identifiers and binary labels, identify exact and conflicting duplicates, and export a dataset provenance/evaluation manifest.
- Run a transparent disease-prevalence reference baseline with a deterministic drug-held-out split to exercise the evaluation pipeline.

The sample candidate rankings, pharmacology, ADMET values, original graph relationships, and example dossiers are illustrative interface data. Live source retrieval and structural similarity are implemented; the biological meaning of any candidate still requires expert assessment and appropriate experimental validation.

## How a research session works

1. Choose **New Investigation** and enter a research question with any known disease, target, or compound context.
2. Open **Evidence Monitor** and select TinyFish Search / Fetch or ClinicalTrials.gov. Search explicitly, then choose a source to retrieve.
3. Review the returned page material and source context. Record the finding, study context, limitations, and what remains unknown.
4. Save the source to the evidence ledger. It begins as **Needs Review** until a researcher confirms, flags, or excludes it.
5. Open **Reports** to export a question-specific Markdown brief with source details, researcher notes, review status, and audit history.

An investigation question or source confirmation does not automatically infer a biological relationship or change the illustrative candidate scores.

## TinyFish and source integrations

TinyFish is used for researcher-directed biomedical source discovery and retrieval. The server filters search results to approved HTTPS biomedical domains and validates selected URLs and redirects before saving material. Fetch requests fresh content and preserves the returned source context. ReThera does not automatically interpret fetched scientific text.

The ClinicalTrials.gov integration uses the public API v2. It preserves registry identifiers and context such as trial dates, status, sponsor, phase, conditions, interventions, and results availability. A trial's registration or status is not evidence of efficacy.

Provider errors are surfaced to the researcher. Failed or empty searches and fetches do not create evidence records, and the app does not retry provider requests automatically.

References: [TinyFish Search](https://docs.tinyfish.ai/search-api) · [TinyFish Fetch](https://docs.tinyfish.ai/fetch-api) · [ClinicalTrials.gov API](https://clinicaltrials.gov/data-api/api) · [PubChem PUG REST](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest).

## Dataset Lab

Dataset Lab accepts CSV files with drug identifier, disease identifier, and binary label columns. It recognizes common names such as `chembl_id`, `mondo_id`, `outcome`, and `class`; labels can be positive / negative or 1 / 0. It reports malformed rows, removes repeated pairs, and excludes a pair if duplicate rows disagree on its label.

Before importing, provide the dataset name, release/version, license, and canonical HTTPS source URL. The workflow exports these details with the import counts and evaluation metadata as a JSON manifest. CSV processing currently happens in browser memory; uploaded source data is not sent to the ReThera server or persisted by the app.

The reference evaluation scores each test pair from the positive-label frequency for its disease in the training data, falling back to overall training prevalence for unseen diseases. Drugs are held out from training before scoring, and AUPRC is reported when the test data supports it. This is a transparent pipeline baseline, not a trained therapeutic prediction model. Interpret labels according to the dataset's documentation; an unrecorded pair is not automatically a negative example.

Download the CSV template in the app to see the expected structure. A small example is included only to exercise the workflow; it is not scientific evidence.

## Technical approach

- **Frontend:** React, TypeScript, Vite, Tailwind CSS.
- **Application server:** Node.js same-origin API and static-file server.
- **Evidence discovery:** TinyFish Search and Fetch; ClinicalTrials.gov API v2.
- **Cheminformatics:** RDKit.js WebAssembly, Morgan fingerprints, and Tanimoto similarity.
- **Dataset evaluation:** in-browser CSV validation and a disease-prevalence baseline with drug-held-out evaluation.
- **Persistence:** researcher profile, active investigation, and saved live evidence use browser local storage. Dataset uploads remain in memory for the current session.

### Next development phase

The planned research program is to add licensed, versioned biomedical datasets and robust identifier mapping; build evidence-path and entity-resolution services; compare stronger, clearly specified baselines; train and calibrate drug–target or drug–disease models; evaluate them with leakage-aware cold-start splits and external validation; and involve domain researchers in reviewing evidence and hypotheses. Each stage should retain provenance, preserve contradictory findings, and report its evaluation protocol before model outputs are presented as candidate prioritization.

## Run locally

Use a supported Node.js version from `package.json` and npm.

```powershell
npm ci
Copy-Item .env.example .env
# Add TINYFISH_API_KEY to .env to enable TinyFish in the standalone app.
npm run dev
```

Open [http://localhost:3001](http://localhost:3001). ClinicalTrials.gov access does not require a key. Keep `.env` private. Codex MCP OAuth credentials are separate from the standalone app's server credential.

For a production build:

```sh
npm run build
```

Run the production server with the built frontend:

```powershell
$env:NODE_ENV = "production"
npm start
```

On macOS / Linux, use `NODE_ENV=production npm start`.

`npm run preview` serves static frontend files and does not provide the research APIs.

## Validate

```sh
npm test
npm run typecheck
npm run build
```

Tests cover provider error handling, TinyFish response validation, ClinicalTrials.gov records, investigation-to-review flow, evidence provenance, graph source links, molecular similarity, and dataset parsing and evaluation. Provider tests use injected responses and do not require live credentials.

## Project structure

```text
src/
  components/screens/      Research workflows, including Dataset Lab
  components/modals/       Investigation and evidence review flows
  data/datasetPipeline.ts  CSV validation and held-out baseline
  data/evidence.ts         Evidence provenance and Markdown brief export
  data/molecularSimilarity.ts  RDKit fingerprints and Tanimoto similarity
  data/mockData.ts         Clearly illustrative interface fixtures
server/
  index.mjs                Same-origin API and static server
  research.mjs             TinyFish and ClinicalTrials.gov adapters
tests/                     UI and data-pipeline tests
```

## Data handling

Live evidence is stored in the current browser's local storage. Fetched TinyFish content is capped at 30,000 characters and carries a truncation indicator; provider-returned material may not contain the full publication. ClinicalTrials.gov responses retain registry context. Downloaded briefs include only saved live records and clearly identify researcher annotations. They are selected-source research notes, not systematic reviews.

The technical proposal document and `data/local/` are excluded by `.gitignore`; do not add private credentials or licensed datasets to the repository.
