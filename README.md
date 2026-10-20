# ReThera AI

Evidence-driven intelligence for therapeutic discovery.

ReThera AI is a React prototype for evidence-backed drug-repurposing research. Its screens demonstrate candidate prioritization, biomedical relationships, supporting and contradictory evidence, and research dossiers.

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
