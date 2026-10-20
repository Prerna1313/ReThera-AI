# ReThera AI

Evidence-driven intelligence for therapeutic discovery.

ReThera AI is a React prototype for evidence-backed drug-repurposing research. Its screens demonstrate candidate prioritization, biomedical relationships, supporting and contradictory evidence, and research dossiers.

## Brand meaning

**Reimagining Therapeutics with AI** is the proposed brand meaning.

- **Re — Repurpose & Reposition:** investigate existing drugs beyond their original indications.
- **Thera — Therapeutics:** connect medicines, targets, diseases, and evidence.
- **AI — Artificial Intelligence:** integrate evidence, connect biological relationships, prioritize hypotheses, and identify research gaps.

This interpretation is proposed brand positioning; the technical proposal does not establish an official acronym expansion.

**Mission:** Turn fragmented biomedical knowledge into traceable drug-repurposing hypotheses.

**Vision:** Help researchers investigate promising therapeutic possibilities more efficiently, transparently, and systematically.

The intended workflow brings together biomedical databases, experimental findings, publications, clinical-trial records, and newer sources retrieved through TinyFish. Researchers can inspect the evidence for and against a candidate before producing a traceable report. This describes the product direction; see the prototype limitations below for what is implemented.

## Run locally

Requires Node.js and npm.

```sh
npm ci
npm run dev
```

## Validate and build

```sh
npx tsc --noEmit
npm run build
```

`npm run preview` serves the production build locally.

## Prototype scope

The application uses illustrative mock data. Scores, citations, molecular illustrations, and evidence updates have not been scientifically validated. TinyFish and scientific models are not connected. Evidence refresh simulates a delay, and dossier export currently displays a notification rather than generating a file.

The workbench demonstrates one breast cancer investigation. Target and clinical-status filters operate on the supplied demo candidates. Other disease investigations, real source retrieval, persistent investigations, and downloadable dossiers require further implementation.

ReThera Discover is a future concept for computational molecule generation and optimization. The prototype does not establish safety, efficacy, or clinical benefit.

## Project layout

- `src/components/screens`: research workflow screens
- `src/components/scientific`: scientific visualizations
- `src/components/layout`: navigation and help
- `src/data/mockData.ts`: illustrative records
- `src/types`: application data types
- `figma-plugin`: design export plugin
