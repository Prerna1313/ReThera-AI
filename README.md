# ReThera AI

Evidence-driven intelligence for therapeutic discovery.

ReThera AI is a prototype for evidence-backed drug-repurposing research. It combines a sample candidate-ranking interface with a live, researcher-reviewed TinyFish Search and Fetch workflow.

**Reimagining Therapeutics with AI** is the proposed brand meaning.

- **Re — Repurpose & Reposition:** investigate existing drugs beyond their original indications.
- **Thera — Therapeutics:** connect medicines, targets, diseases, and evidence.
- **AI — Artificial Intelligence:** integrate evidence, connect biological relationships, prioritize hypotheses, and identify research gaps.

**Mission:** Turn fragmented biomedical knowledge into traceable drug-repurposing hypotheses.

**Vision:** Help researchers investigate promising therapeutic possibilities more efficiently, transparently, and systematically.

The intended workflow brings together biomedical databases, experimental findings, publications, clinical-trial records, and newer sources retrieved through TinyFish. Researchers can inspect the evidence for and against a candidate before producing a traceable report. This describes the product direction; see the prototype limitations below for what is implemented till now.

## Run locally

Requires Node.js 20.6+ and npm. To enable TinyFish, copy `.env.example` to `.env` and add your own API key. The key is read by the local Node server and is never sent to the browser.

```powershell
npm ci
Copy-Item .env.example .env
# Edit .env and replace the example value with your TinyFish API key.
npm run dev
```

The OAuth connection configured for Codex's MCP tools is separate from this standalone app's server credential. The local app currently authenticates its TinyFish Search and Fetch requests with `TINYFISH_API_KEY`; it does not inherit Codex's OAuth session.

Open `http://localhost:3001` and select **Evidence Monitor**. Follow the four-step guide: search a biomedical question (for example `metformin Alzheimer disease clinical study`), fetch a selected result, inspect the source and enter a researcher-authored brief, then save and review it in the audit drawer. Disease and target links are optional. Saved sources stay marked for review until a researcher checks them; assessments are human annotations, not automated scientific conclusions. Saved TinyFish sources and their researcher-entered links appear as source nodes and inspectable edges in **Knowledge Graph**. Use **Download source-linked evidence brief** to export the live TinyFish records in this browser as Markdown. Live records remain in browser local storage and do not change the sample priority score. If no key is configured, the screen explains how to set one up. The API key never appears in frontend code or search/fetch responses.

The repurposing workbench now filters the illustrative compound set across its sample known indications. This is a small cross-indication demo library, not a validated screening run. The new-investigation form accepts any disease or target as a researcher-entered scope; its pipeline animation is a UI walkthrough and does not run database queries. For compound structures, 2D images and available 3D conformers are loaded from PubChem PUG REST using the compound CID; the rotating 3D view draws PubChem's conformer coordinates. Availability depends on PubChem having a conformer for that record. See [PubChem PUG REST](https://pubchem.ncbi.nlm.nih.gov/docs/pug-rest).

The prototype uses TinyFish Search and Fetch directly; it does not use Agent or Browser. TinyFish currently lists Search and Fetch as free within provider limits. Check [TinyFish pricing](https://www.tinyfish.ai/pricing) for current quotas and terms.

## Validate and build

```sh
npx tsc --noEmit
npm run build
```

`npm run build` creates the frontend bundle. `npm start` serves the built app and TinyFish API from the same Node process; set `TINYFISH_API_KEY` as a private environment variable on the host. `npm run preview` serves only the static frontend bundle and does not provide the TinyFish API.

## Prototype scope

The candidate rankings, scientific examples, citations, graph records, and dossier are illustrative fixtures, not validated findings. TinyFish is used only for explicit Search and researcher-selected Fetch requests in Evidence Monitor. Retrieved text is stored without automated scientific interpretation. The optional evidence brief fields are written by the researcher, remain pending review and are exported with source provenance; the app does not generate summaries or determine support/contradiction. The live evidence ledger is stored in browser local storage. Researcher-linked sources appear on the selected candidate's detail page but do not alter the sample candidate ranking or static example dossier. No scientific models are connected; molecule-generation and ADMET predictions are not performed.

The TinyFish workflow can investigate different biomedical topics, but its results are not automatically interpreted, and it does not create validated disease-specific candidate rankings. Workbench filters operate on the supplied sample candidates. TinyFish search results are limited to HTTPS sources on the server's approved domain list: PubMed, Europe PMC, ClinicalTrials.gov, FDA, PubChem, and Open Targets. Empty results, unavailable credentials, and provider errors are surfaced in the interface. No LLM extraction or automatic support/contradiction assignment is performed. The knowledge graph's original nodes, relationships, and confidence values remain illustrative sample data; live source links added to the graph are researcher-entered annotations and do not validate a biomedical relationship.

ReThera Discover is a future concept for computational molecule generation and optimization. The prototype does not establish safety, efficacy, or clinical benefit.

## Project layout

- `src/components/screens`: research workflow screens
- `src/components/scientific`: scientific visualizations
- `src/components/layout`: navigation and help
- `src/data/mockData.ts`: illustrative records
- `server/index.mjs`: same-origin server, TinyFish proxy, source policy, and production static-file serving
- `src/types`: application data types
- `figma-plugin`: design export plugin
