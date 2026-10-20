import React, { useState } from 'react';
import { X, Search } from 'lucide-react';
import { ResearchScope } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onRunComplete: (scope: ResearchScope) => void;
}

export const NewInvestigationWizard: React.FC<Props> = ({ isOpen, onClose, onRunComplete }) => {
  const [question, setQuestion] = useState('');
  const [disease, setDisease] = useState('');
  const [target, setTarget] = useState('');
  const [compound, setCompound] = useState('');
  if (!isOpen) return null;
  const examples = [
    { disease: 'Breast cancer (ER+)', target: 'ESR1', compound: 'Tamoxifen', question: 'What human evidence and limitations are reported for tamoxifen in ER-positive breast cancer?' },
    { disease: 'Alzheimer’s disease', target: '', compound: 'Metformin', question: 'What studies have investigated metformin in Alzheimer’s disease, and what remains unknown?' },
  ];
  const fieldClass = 'mt-1 w-full rounded-lg border border-[#1C3648] bg-[#071321] p-3 text-sm text-slate-100';
  return <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-md">
    <form role="dialog" aria-modal="true" aria-labelledby="investigation-title" className="max-h-[90vh] w-full max-w-2xl space-y-5 overflow-y-auto rounded-2xl border border-[#1C3648] bg-[#0A1B2B] p-6 text-slate-200" onSubmit={event => {
      event.preventDefault();
      onRunComplete({ id: crypto.randomUUID(), question: question.trim(), disease: disease.trim(), target: target.trim(), compound: compound.trim(), query: [compound, disease, target].filter(value => value.trim()).join(' ').trim().slice(0, 280) || question.trim().slice(0, 280), createdAt: new Date().toISOString() });
    }}>
      <div className="flex items-center justify-between"><h2 id="investigation-title" className="text-lg font-bold">New Investigation</h2><button type="button" aria-label="Close investigation" onClick={onClose}><X className="h-5 w-5" /></button></div>
      <p className="text-sm text-slate-400">Ask about any disease, target or compound. Continue to live Search → select source → Fetch → researcher review → evidence brief.</p>
      <div className="flex flex-wrap gap-2">{examples.map(example => <button key={example.disease} type="button" className="rounded-lg border border-cyan-500/40 p-2 text-xs text-cyan-200" onClick={() => { setQuestion(example.question); setDisease(example.disease); setTarget(example.target); setCompound(example.compound); }}>Example: {example.disease}</button>)}</div>
      <p className="text-xs text-amber-200">Examples are research questions. They do not claim a compound treats a disease.</p>
      <label className="block text-sm">Researcher’s question<textarea required minLength={10} maxLength={2000} rows={3} value={question} onChange={e => setQuestion(e.target.value)} className={fieldClass} /></label>
      <div className="grid gap-3 sm:grid-cols-3">{[['Disease / indication', disease, setDisease], ['Target / gene (optional)', target, setTarget], ['Compound (optional)', compound, setCompound]].map(([label, value, setter]) => <label key={label as string} className="text-xs">{label as string}<input maxLength={100} value={value as string} onChange={e => (setter as (value: string) => void)(e.target.value)} className={fieldClass} /></label>)}</div>
      <p className="text-xs text-slate-400">TinyFish retrieves web pages with a server API key. ClinicalTrials.gov provides structured registry records without a key. You choose each search and source; entity resolution, screening and ranking do not run here.</p>
      <button disabled={question.trim().length < 10} className="flex items-center gap-2 rounded-lg bg-teal-400 px-4 py-3 text-sm font-bold text-[#06111F] disabled:opacity-50"><Search className="h-4 w-4" />Continue to source search</button>
    </form>
  </div>;
};
