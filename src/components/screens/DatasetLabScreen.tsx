import React, { useMemo, useState } from 'react';
import { Database, FileUp, ShieldCheck, Download, AlertTriangle, Activity } from 'lucide-react';
import { evaluateDiseasePrevalenceBaseline, parsePairDataset, type DatasetImportResult } from '../../data/datasetPipeline';

const sampleCsv = `drug_id,disease_id,label\nCHEMBL1,MONDO:0001,positive\nCHEMBL1,MONDO:0002,negative\nCHEMBL2,MONDO:0001,positive\nCHEMBL2,MONDO:0002,negative\nCHEMBL3,MONDO:0001,positive\nCHEMBL3,MONDO:0002,negative\nCHEMBL4,MONDO:0001,positive\nCHEMBL4,MONDO:0002,negative\nCHEMBL5,MONDO:0001,positive\nCHEMBL5,MONDO:0002,negative\nCHEMBL6,MONDO:0001,positive\nCHEMBL6,MONDO:0002,negative\nCHEMBL7,MONDO:0001,positive\nCHEMBL7,MONDO:0002,negative\nCHEMBL8,MONDO:0001,positive\nCHEMBL8,MONDO:0002,negative\nCHEMBL9,MONDO:0001,positive\nCHEMBL9,MONDO:0002,negative\nCHEMBL10,MONDO:0001,positive\nCHEMBL10,MONDO:0002,negative\n`;

export const DatasetLabScreen: React.FC = () => {
  const [datasetName, setDatasetName] = useState('');
  const [version, setVersion] = useState('');
  const [license, setLicense] = useState('');
  const [sourceUrl, setSourceUrl] = useState('');
  const [imported, setImported] = useState<DatasetImportResult | null>(null);
  const [fileName, setFileName] = useState('');
  const [fileError, setFileError] = useState('');
  const evaluation = useMemo(() => imported ? evaluateDiseasePrevalenceBaseline(imported.rows) : null, [imported]);

  const importFile = async (file?: File) => {
    if (!file) return;
    setFileError('');
    if (!file.name.toLowerCase().endsWith('.csv')) { setFileError('Choose a CSV file.'); return; }
    if (file.size > 25 * 1024 * 1024) { setFileError('File exceeds the 25 MB prototype import limit.'); return; }
    const parsed = parsePairDataset(await file.text());
    setImported(parsed); setFileName(file.name);
  };

  const downloadTemplate = () => {
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([sampleCsv], { type: 'text/csv;charset=utf-8' }));
    link.download = 'rethera-pair-dataset-template.csv'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const downloadManifest = () => {
    if (!imported) return;
    const manifest = {
      dataset: { name: datasetName.trim(), version: version.trim(), license: license.trim(), sourceUrl: sourceUrl.trim() },
      import: { fileName, importedAt: new Date().toISOString(), schema: ['drug_id', 'disease_id', 'label'], acceptedPairs: imported.rows.length, duplicatesRemoved: imported.duplicates, conflictingPairsExcluded: imported.conflictingDuplicates, invalidRowsDropped: imported.droppedRows },
      evaluation: evaluation ? { method: 'disease prevalence prior', split: evaluation.split, trainPairs: evaluation.trainCount, testPairs: evaluation.testCount, heldOutDrugs: evaluation.testDrugCount, auprc: evaluation.auprc } : null,
      limitations: ['Prototype import runs in browser memory and does not upload or persist source data.', 'Labels require dataset-specific interpretation; unrecorded pairs are not presumed negative.', 'Reference baseline is not a validated therapeutic prediction model.'],
    };
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(manifest, null, 2)], { type: 'application/json;charset=utf-8' }));
    link.download = 'rethera-dataset-manifest.json'; link.click();
    window.setTimeout(() => URL.revokeObjectURL(link.href), 1000);
  };

  const metadataReady = datasetName.trim() && version.trim() && license.trim() && /^https:\/\//i.test(sourceUrl.trim());

  return <div className="space-y-6">
    <header className="flex flex-wrap items-start justify-between gap-4">
      <div><div className="flex items-center gap-2 text-teal-300"><Database className="h-5 w-5"/><span className="text-xs uppercase tracking-widest">Research data workflow</span></div>
        <h1 className="mt-2 text-2xl font-bold text-slate-100">Dataset Lab</h1>
        <p className="mt-1 max-w-3xl text-sm text-slate-400">Import a drug–disease pair table, check its identifiers and labels, then evaluate a simple reference baseline.</p>
      </div>
      <button onClick={downloadTemplate} className="inline-flex items-center gap-2 rounded-lg border border-teal-500/40 px-3 py-2 text-xs font-semibold text-teal-200 hover:bg-teal-500/10"><Download className="h-4 w-4"/>Download CSV template</button>
    </header>

    <div role="note" className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-xs leading-relaxed text-amber-100"><strong>Prototype boundary.</strong> Imported files stay in this browser session and are not uploaded to ReThera’s server or saved to Git. This baseline is a data-pipeline check, not a validated therapeutic prediction model. Dataset labels may reflect study or trial context and must not be interpreted as clinical efficacy.</div>

    <section className="rounded-2xl border border-[#1C3648] bg-[#0A1B2B] p-5 space-y-4">
      <h2 className="font-semibold text-slate-100">1. Dataset provenance</h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="text-xs text-slate-400">Dataset name<input value={datasetName} onChange={e=>setDatasetName(e.target.value)} placeholder="e.g. RePairDB" className="mt-1 block w-full rounded-lg border border-[#1C3648] bg-[#071321] p-2.5 text-sm text-slate-100"/></label>
        <label className="text-xs text-slate-400">Version / release<input value={version} onChange={e=>setVersion(e.target.value)} placeholder="e.g. v1 · 2026-09-24" className="mt-1 block w-full rounded-lg border border-[#1C3648] bg-[#071321] p-2.5 text-sm text-slate-100"/></label>
        <label className="text-xs text-slate-400">License<input value={license} onChange={e=>setLicense(e.target.value)} placeholder="Record the dataset license exactly" className="mt-1 block w-full rounded-lg border border-[#1C3648] bg-[#071321] p-2.5 text-sm text-slate-100"/></label>
        <label className="text-xs text-slate-400">Canonical source URL<input value={sourceUrl} onChange={e=>setSourceUrl(e.target.value)} placeholder="https://…" className="mt-1 block w-full rounded-lg border border-[#1C3648] bg-[#071321] p-2.5 text-sm text-slate-100"/></label>
      </div>
      <p className="text-[11px] text-slate-500">These details are recorded on screen to support reproducibility; download and keep them with your local dataset. This prototype does not persist uploaded data.</p>
    </section>

    <section className="rounded-2xl border border-[#1C3648] bg-[#0A1B2B] p-5 space-y-4">
      <h2 className="font-semibold text-slate-100">2. Validate pair table</h2>
      <p className="text-xs text-slate-400">Required columns: <code>drug_id</code>, <code>disease_id</code>, and <code>label</code>. Recognized labels: positive/negative or 1/0. Common alternatives such as chembl_id, mondo_id, outcome, and class are accepted.</p>
      <label className={`flex cursor-pointer flex-col items-center gap-2 rounded-xl border border-dashed p-8 text-center ${metadataReady ? 'border-teal-500/40 hover:bg-teal-500/5' : 'border-[#1C3648] opacity-60'}`}>
        <FileUp className="h-6 w-6 text-teal-300"/><span className="text-sm font-semibold text-slate-200">Choose a CSV dataset</span><span className="text-xs text-slate-500">Up to 25 MB · local browser processing only</span>
        <input aria-label="Choose a CSV dataset" type="file" accept=".csv,text/csv" disabled={!metadataReady} className="sr-only" onChange={e=>void importFile(e.target.files?.[0])}/>
      </label>
      {!metadataReady && <p className="text-[11px] text-amber-200">Enter dataset name, version, license, and an HTTPS source URL before importing.</p>}
      {fileError && <p role="alert" className="text-xs text-rose-300">{fileError}</p>}
      {imported && <div className="space-y-3">
        <button onClick={downloadManifest} className="rounded-lg border border-cyan-500/30 px-3 py-2 text-xs font-semibold text-cyan-200 hover:bg-cyan-500/10">Download provenance and evaluation manifest (.json)</button>
        <div className="flex flex-wrap gap-2 text-xs"><span className="rounded-lg bg-teal-500/10 px-3 py-2 text-teal-200">{fileName}</span><span className="rounded-lg bg-[#071321] px-3 py-2 text-slate-200">{imported.rows.length} accepted pairs</span><span className="rounded-lg bg-[#071321] px-3 py-2 text-slate-200">{imported.duplicates} exact duplicates removed</span><span className="rounded-lg bg-[#071321] px-3 py-2 text-slate-200">{imported.conflictingDuplicates} conflicting pairs excluded</span><span className="rounded-lg bg-[#071321] px-3 py-2 text-slate-200">{new Set(imported.rows.map(r=>r.drugId)).size} drugs · {new Set(imported.rows.map(r=>r.diseaseId)).size} diseases</span></div>
        {imported.errors.length > 0 && <div role="alert" className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3"><p className="mb-2 flex items-center gap-2 text-xs font-semibold text-amber-200"><AlertTriangle className="h-4 w-4"/>{imported.droppedRows} invalid rows excluded</p><ul className="max-h-32 space-y-1 overflow-auto text-[11px] text-amber-100">{imported.errors.map((error,i)=><li key={i}>{error}</li>)}</ul></div>}
        {imported.rows.length > 0 && <div className="overflow-x-auto rounded-lg border border-[#1C3648]"><table className="w-full text-left text-xs"><thead className="bg-[#071321] text-slate-400"><tr><th className="p-2">Drug ID</th><th className="p-2">Disease ID</th><th className="p-2">Label</th><th className="p-2">Source row</th></tr></thead><tbody>{imported.rows.slice(0,8).map(row=><tr key={`${row.drugId}-${row.diseaseId}`} className="border-t border-[#1C3648]"><td className="p-2 font-mono">{row.drugId}</td><td className="p-2 font-mono">{row.diseaseId}</td><td className="p-2">{row.label ? 'Positive' : 'Negative'}</td><td className="p-2">{row.sourceRow}</td></tr>)}</tbody></table></div>}
      </div>}
    </section>

    {imported && <section className="rounded-2xl border border-cyan-500/25 bg-[#0A1B2B] p-5 space-y-4">
      <h2 className="flex items-center gap-2 font-semibold text-slate-100"><Activity className="h-4 w-4 text-cyan-300"/>3. Reference baseline evaluation</h2>
      {!evaluation ? <p className="text-xs text-amber-200">Not enough evaluable data. Need at least three unique drugs, both labels overall, and both labels among held-out test pairs.</p> : <>
        <p className="text-xs leading-relaxed text-slate-400">Disease-prevalence prior: each pair is scored using the positive-label rate for its disease in the training set; unseen diseases receive training-set prevalence. Drugs are held out before scoring. No learned model is trained.</p>
        <div className="grid gap-3 sm:grid-cols-4">{[['Test AUPRC',evaluation.auprc.toFixed(3)],['Test pairs',evaluation.testCount],['Train pairs',evaluation.trainCount],['Train positive rate',`${(evaluation.prevalence*100).toFixed(1)}%`]].map(([label,value])=><div key={label} className="rounded-xl border border-[#1C3648] bg-[#071321] p-3"><p className="text-[10px] uppercase text-slate-500">{label}</p><p className="mt-1 text-lg font-bold text-cyan-200">{value}</p></div>)}</div>
        <div className="rounded-lg border border-[#1C3648] p-3 text-[11px] text-slate-400"><p><strong className="text-slate-300">Split:</strong> {evaluation.split}.</p><p className="mt-1">Train: {evaluation.trainDrugCount} drugs · test: {evaluation.testDrugCount} unseen drugs. AUPRC is reported because positive and negative pairs can be imbalanced; assess its value against the test-set positive prevalence ({(imported.rows.filter(r=>r.label===1).length/imported.rows.length*100).toFixed(1)}% overall) and stronger baselines before drawing conclusions.</p><p className="mt-1">Dataset: {datasetName} · {version} · {license} · <a className="text-cyan-300 underline" href={sourceUrl} target="_blank" rel="noreferrer">source</a></p></div>
      </>}
      <p className="flex items-start gap-2 text-[11px] text-amber-200"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0"/>This is an engineering reference baseline only. Drug–disease database labels may encode trial status, reporting bias, or evidence availability; unrecorded pairs must not automatically be treated as biological negatives.</p>
    </section>}
  </div>;
};
