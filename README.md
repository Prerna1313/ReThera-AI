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

Open `http://localhost:3001` and select **Evidence Monitor**. For a repeatable demo, keep the prefilled question `Tamoxifen ESR1 resistance breast cancer clinical study`, run **Search TinyFish**, and fetch an approved result such as a PubMed Central paper. Inspect the retrieved page, then enter a researcher-authored finding summary, study type, model/population and limitations. Link the source to a candidate and target, set an initial assessment, and save it. The app groups saved live sources into apparent support, apparent challenge and context/unknown; these are human annotations, not automated scientific conclusions. Open the audit drawer to add a review note and confirm, flag or exclude the source. Use **Download source-linked evidence brief** to export the live TinyFish records in this browser as Markdown. The brief includes empty categories with a coverage caveat; an empty section does not mean no evidence exists. Live records remain in browser local storage and do not change the sample priority score. If no key is configured, the screen explains how to set one up. The API key never appears in frontend code or search/fetch responses.

The prototype uses TinyFish Search and Fetch directly; it does not use Agent or Browser. TinyFish currently lists Search and Fetch as free within provider limits. Check [TinyFish pricing](https://www.tinyfish.ai/pricing) for current quotas and terms.

## Validate and build

```sh
npx tsc --noEmit
npm run build
```

`npm run build` creates the frontend bundle. `npm start` serves the built app and TinyFish API from the same Node process; set `TINYFISH_API_KEY` as a private environment variable on the host. `npm run preview` serves only the static frontend bundle and does not provide the TinyFish API.

## Prototype scope

The candidate rankings, scientific examples, citations, graph records, and dossier are illustrative fixtures, not validated findings. TinyFish is used only for explicit Search and researcher-selected Fetch requests in Evidence Monitor. Retrieved text is stored without automated scientific interpretation. The optional evidence brief fields are written by the researcher, remain pending review and are exported with source provenance; the app does not generate summaries or determine support/contradiction. The live evidence ledger is stored in browser local storage. Researcher-linked sources appear on the selected candidate's detail page but do not alter the sample candidate ranking or static example dossier. No scientific models are connected; molecule-generation and ADMET predictions are not performed.

The workbench demonstrates one breast cancer investigation. Target and clinical-status filters operate on the supplied sample candidates. TinyFish search results are limited to HTTPS sources on the server's approved domain list: PubMed, Europe PMC, ClinicalTrials.gov, FDA, PubChem, and Open Targets. Empty results, unavailable credentials, and provider errors are surfaced in the interface. No LLM extraction or automatic support/contradiction assignment is performed.

ReThera Discover is a future concept for computational molecule generation and optimization. The prototype does not establish safety, efficacy, or clinical benefit.

## Project layout

- `src/components/screens`: research workflow screens
- `src/components/scientific`: scientific visualizations
- `src/components/layout`: navigation and help
- `src/data/mockData.ts`: illustrative records
- `server/index.mjs`: same-origin server, TinyFish proxy, source policy, and production static-file serving
- `src/types`: application data types
- `figma-plugin`: design export plugin
