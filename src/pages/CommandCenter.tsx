import React, { useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Filter, Globe, MapPin, Play, Search } from 'lucide-react';

type SourceName = 'gemini' | 'osm' | 'web' | 'facebook' | 'instagram' | 'google_places';
type ValidationStatus = 'draft' | 'single_source' | 'multi_source_verified' | 'needs_review' | 'approved';

interface SourceInfo {
  source: SourceName;
  discovery: boolean;
  enrichment: boolean;
  notes?: string;
}

interface BusinessRecord {
  id?: string;
  name: string;
  city?: string;
  category?: string;
  phone?: string;
  address?: string;
  website?: string;
  facebook_url?: string;
  instagram_url?: string;
  confidence_score: number;
  verification_strength: 'weak' | 'medium' | 'strong';
  validation_status: ValidationStatus;
  matched_sources: SourceName[];
  source_evidence: Array<{ source: SourceName; notes?: string; sourceUrl?: string }>;
}

const SOURCE_ORDER: SourceName[] = ['gemini', 'osm', 'web', 'facebook', 'instagram', 'google_places'];

export default function CommandCenter() {
  const [sources, setSources] = useState<SourceInfo[]>([]);
  const [selectedSources, setSelectedSources] = useState<Set<SourceName>>(new Set(['gemini', 'osm', 'web']));
  const [query, setQuery] = useState('restaurants in Baghdad');
  const [city, setCity] = useState('Baghdad');
  const [category, setCategory] = useState('restaurants');
  const [isRunning, setIsRunning] = useState(false);
  const [runLogs, setRunLogs] = useState<string[]>([]);

  const [businesses, setBusinesses] = useState<BusinessRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sourceFilter, setSourceFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const enabledSourceArray = useMemo(() => SOURCE_ORDER.filter(s => selectedSources.has(s)), [selectedSources]);

  useEffect(() => {
    fetch('/api/sources').then(r => r.json()).then(data => setSources(data.sources || [])).catch(() => setSources([]));
  }, []);

  const loadBusinesses = async (targetPage = page) => {
    const params = new URLSearchParams({ page: String(targetPage), pageSize: '8' });
    if (sourceFilter !== 'all') params.set('source', sourceFilter);
    if (statusFilter !== 'all') params.set('status', statusFilter);

    const res = await fetch(`/api/businesses?${params.toString()}`);
    const data = await res.json();
    setBusinesses(data.data || []);
    setPage(data.page || targetPage);
    setTotalPages(data.totalPages || 1);
  };

  useEffect(() => {
    loadBusinesses(1);
  }, [sourceFilter, statusFilter]);

  const runDiscovery = async () => {
    setIsRunning(true);
    setRunLogs([]);
    try {
      const res = await fetch('/api/discovery/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, city, category, sources: enabledSourceArray, limit: 20 })
      });
      const data = await res.json();
      setRunLogs((data.logs || []).map((l: any) => `[${l.step}${l.source ? `:${l.source}` : ''}] ${l.message}`));
      await loadBusinesses(1);
    } finally {
      setIsRunning(false);
    }
  };

  const toggleSource = (source: SourceName) => {
    setSelectedSources(prev => {
      const next = new Set(prev);
      if (next.has(source)) next.delete(source);
      else next.add(source);
      return next;
    });
  };

  return (
    <div className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gold">Multi-Source Iraq Discovery</h1>
          <p className="text-xs text-slate-400">Gemini → OSM → Web → Facebook → Instagram with merge/verification.</p>
        </div>
      </header>

      <section className="bg-white/5 border border-gold/20 rounded-xl p-4 space-y-4">
        <div className="grid md:grid-cols-3 gap-3">
          <input className="bg-slate-900/70 rounded px-3 py-2 text-sm" value={query} onChange={e => setQuery(e.target.value)} placeholder="Search query" />
          <input className="bg-slate-900/70 rounded px-3 py-2 text-sm" value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
          <input className="bg-slate-900/70 rounded px-3 py-2 text-sm" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" />
        </div>

        <div className="flex flex-wrap gap-2">
          {sources.map((s) => (
            <button key={s.source} onClick={() => toggleSource(s.source)} className={`px-3 py-1 rounded-full text-xs border ${selectedSources.has(s.source) ? 'bg-gold/20 border-gold text-gold' : 'border-slate-600 text-slate-300'}`}>
              {s.source}
            </button>
          ))}
        </div>

        <button disabled={isRunning || enabledSourceArray.length === 0} onClick={runDiscovery} className="px-4 py-2 rounded bg-gold text-navy font-semibold disabled:opacity-50 flex items-center gap-2">
          <Play size={16} /> {isRunning ? 'Running...' : 'Run Multi-Source Discovery'}
        </button>

        <div className="text-xs text-slate-300 space-y-1">
          {runLogs.map((log, idx) => <div key={idx}>{log}</div>)}
        </div>
      </section>

      <section className="bg-white/5 border border-gold/20 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-xs"><Filter size={14}/> Filters</div>
          <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="bg-slate-900/70 rounded px-2 py-1 text-xs">
            <option value="all">All sources</option>
            {SOURCE_ORDER.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-slate-900/70 rounded px-2 py-1 text-xs">
            <option value="all">All statuses</option>
            <option value="draft">draft</option>
            <option value="single_source">single_source</option>
            <option value="multi_source_verified">multi_source_verified</option>
            <option value="needs_review">needs_review</option>
            <option value="approved">approved</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-slate-400">
                <th className="py-2">Business</th><th>Verification</th><th>Sources</th><th>Evidence</th>
              </tr>
            </thead>
            <tbody>
              {businesses.map((b) => (
                <tr key={b.id || b.name} className="border-t border-white/10 align-top">
                  <td className="py-3">
                    <div className="font-semibold">{b.name}</div>
                    <div className="text-xs text-slate-400 flex gap-2"><MapPin size={12}/>{b.city || 'Unknown city'} · {b.category || 'Uncategorized'}</div>
                    <div className="text-xs text-slate-400">{b.phone || b.address || '-'}</div>
                  </td>
                  <td className="py-3">
                    <div className="text-xs">{Math.round((b.confidence_score || 0) * 100)}%</div>
                    <div className="text-xs">{b.verification_strength}</div>
                    <div className={`text-[10px] ${b.validation_status === 'multi_source_verified' ? 'text-green-400' : 'text-yellow-400'}`}>{b.validation_status}</div>
                  </td>
                  <td className="py-3">
                    <div className="flex flex-wrap gap-1">{b.matched_sources?.map(s => <span key={s} className="px-2 py-0.5 rounded bg-slate-800 text-[10px]">{s}</span>)}</div>
                  </td>
                  <td className="py-3 text-xs text-slate-300 space-y-1">
                    {(b.source_evidence || []).slice(0, 3).map((e, idx) => (
                      <div key={idx} className="flex items-center gap-1">
                        <CheckCircle2 size={12} className="text-green-400" /> {e.source} {e.sourceUrl ? <a href={e.sourceUrl} className="underline" target="_blank">link</a> : null}
                      </div>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between text-xs">
          <button className="px-2 py-1 border rounded disabled:opacity-40" disabled={page <= 1} onClick={() => loadBusinesses(page - 1)}>Prev</button>
          <span>Page {page} / {totalPages}</span>
          <button className="px-2 py-1 border rounded disabled:opacity-40" disabled={page >= totalPages} onClick={() => loadBusinesses(page + 1)}>Next</button>
        </div>
      </section>
    </div>
  );
}
