import React, { useState, useMemo, useEffect } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table';
import { 
  Search, Filter, Eye, CheckCircle2, XCircle, 
  AlertTriangle, ChevronLeft, ChevronRight,
  MoreVertical, Download, ExternalLink,
  MapPin, Phone, Globe, Wand2, ShieldCheck,
  X, Save, RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { supabase } from '../lib/supabase';
import { AgentCommander, BusinessRecord } from '../services/agentCommander';
import { toast } from 'sonner';

const columnHelper = createColumnHelper<any>();

export default function ReviewTable() {
  const [data, setData] = useState<any[]>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: businesses, error } = await supabase
      .from('businesses')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      toast.error('Failed to fetch businesses');
    } else {
      setData(businesses || []);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApprove = async (record: any) => {
    try {
      await AgentCommander.manualOverride(record.id, { is_verified: true });
      toast.success(`Approved ${record.name.en}`);
      fetchData();
      setIsDrawerOpen(false);
    } catch (err) {
      toast.error('Failed to approve record');
    }
  };

  const handleReject = async (record: any) => {
    try {
      await AgentCommander.manualOverride(record.id, { needs_review: true, is_verified: false });
      toast.warning(`Flagged ${record.name.en} for re-processing`);
      fetchData();
      setIsDrawerOpen(false);
    } catch (err) {
      toast.error('Failed to reject record');
    }
  };

  const columns = useMemo(() => [
    columnHelper.accessor('name.en', {
      header: 'Business Name',
      cell: info => (
        <div className="flex flex-col">
          <span className="font-bold text-slate-100">{info.getValue()}</span>
          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{info.row.original.category}</span>
        </div>
      ),
    }),
    columnHelper.accessor('governorate', {
      header: 'Governorate',
      cell: info => (
        <div className="flex items-center gap-2">
          <MapPin size={14} className="text-emerald-400" />
          <span className="text-xs font-medium text-slate-300">{info.getValue()}</span>
        </div>
      ),
    }),
    columnHelper.accessor('confidence_score', {
      header: 'Confidence',
      cell: info => {
        const score = info.getValue() * 100;
        const color = score >= 85 ? 'text-emerald-400' : score >= 70 ? 'text-amber-400' : 'text-rose-400';
        return (
          <div className="flex items-center gap-2">
            <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden">
              <div className={`h-full ${color.replace('text', 'bg')}`} style={{ width: `${score}%` }} />
            </div>
            <span className={`text-xs font-black ${color}`}>{score.toFixed(1)}%</span>
          </div>
        );
      },
    }),
    columnHelper.accessor('is_verified', {
      header: 'Status',
      cell: info => (
        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
          info.getValue() 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
        }`}>
          {info.getValue() ? <CheckCircle2 size={12} /> : <AlertTriangle size={12} />}
          {info.getValue() ? 'Verified' : 'Review'}
        </div>
      ),
    }),
    columnHelper.display({
      id: 'actions',
      header: '',
      cell: info => (
        <button 
          onClick={() => {
            setSelectedRecord(info.row.original);
            setIsDrawerOpen(true);
          }}
          className="p-2 bg-slate-800 hover:bg-emerald-500 text-slate-400 hover:text-slate-950 rounded-lg transition-all"
        >
          <Eye size={16} />
        </button>
      ),
    }),
  ], []);

  const table = useReactTable({
    data,
    columns,
    state: { globalFilter },
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="p-4 md:p-8 space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-white tracking-tighter uppercase">Visual Review Hub</h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Unified Agent Data Verification</p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
            <input
              type="text"
              value={globalFilter ?? ''}
              onChange={e => setGlobalFilter(e.target.value)}
              placeholder="Search records..."
              className="w-full pl-10 pr-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 transition-all"
            />
          </div>
          <button className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors">
            <Filter size={20} />
          </button>
          <button onClick={fetchData} className="p-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors">
            <RefreshCw size={20} className={isLoading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              {table.getHeaderGroups().map(headerGroup => (
                <tr key={headerGroup.id} className="border-b border-slate-800 bg-slate-900/50">
                  {headerGroup.headers.map(header => (
                    <th key={header.id} className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            <tbody>
              {table.getRowModel().rows.map(row => (
                <tr key={row.id} className="border-b border-slate-800/50 hover:bg-emerald-500/5 transition-colors group">
                  {row.getVisibleCells().map(cell => (
                    <td key={cell.id} className="px-6 py-4">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="px-6 py-4 bg-slate-900/50 border-t border-slate-800 flex items-center justify-between">
          <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
            Showing {table.getRowModel().rows.length} of {data.length} records
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="p-1.5 bg-slate-800 rounded-lg text-slate-400 disabled:opacity-30 transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button 
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="p-1.5 bg-slate-800 rounded-lg text-slate-400 disabled:opacity-30 transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Side Drawer */}
      <AnimatePresence>
        {isDrawerOpen && selectedRecord && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDrawerOpen(false)}
              className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl z-50 overflow-y-auto custom-scrollbar"
            >
              <div className="p-8 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-xl font-black text-white uppercase tracking-tight">{selectedRecord.name.en}</h2>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-emerald-400 font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {selectedRecord.category}
                      </span>
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">ID: {selectedRecord.id.slice(0, 8)}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsDrawerOpen(false)}
                    className="p-2 hover:bg-slate-800 rounded-xl text-slate-500 transition-colors"
                  >
                    <X size={24} />
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                      <Globe size={14} /> Scraped Photo
                    </h3>
                    <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative group">
                      {selectedRecord.scraped_photo_url ? (
                        <img 
                          src={selectedRecord.scraped_photo_url} 
                          alt="Scraped" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-700">
                          <Download size={32} />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest flex items-center gap-2">
                      <Wand2 size={14} /> AI Processed
                    </h3>
                    <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-800 p-4 overflow-y-auto custom-scrollbar">
                      <pre className="text-[10px] text-emerald-400/80 font-mono leading-relaxed">
                        {JSON.stringify(selectedRecord.ai_processed_data || { status: 'No data' }, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <h3 className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Data Fields</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { label: 'Arabic Name', value: selectedRecord.name.ar, icon: <Globe size={16} /> },
                      { label: 'Kurdish Name', value: selectedRecord.name.ku, icon: <Globe size={16} /> },
                      { label: 'WhatsApp', value: selectedRecord.whatsapp, icon: <Phone size={16} /> },
                      { label: 'Location', value: `${selectedRecord.latitude}, ${selectedRecord.longitude}`, icon: <MapPin size={16} /> },
                    ].map(field => (
                      <div key={field.label} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-1">
                        <div className="text-[10px] text-slate-600 font-bold uppercase tracking-widest flex items-center gap-2">
                          {field.icon} {field.label}
                        </div>
                        <div className="text-sm font-bold text-slate-200">{field.value || 'N/A'}</div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-8 border-t border-slate-800 flex gap-4">
                  <button 
                    onClick={() => handleApprove(selectedRecord)}
                    className="flex-1 py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)]"
                  >
                    <CheckCircle2 size={18} /> Approve Record
                  </button>
                  <button 
                    onClick={() => handleReject(selectedRecord)}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-black text-xs uppercase tracking-widest rounded-2xl transition-all border border-slate-700 flex items-center justify-center gap-2"
                  >
                    <RefreshCw size={18} /> Flag for Review
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
