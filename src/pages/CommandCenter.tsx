import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, Play, Square, CheckCircle2, AlertCircle, 
  Activity, Database, ShieldCheck, FileText, 
  Search, Filter, Bot, Info, CheckCircle,
  Wand2, Compass, Globe, Trash2, RefreshCw,
  LayoutDashboard, Terminal as TerminalIcon,
  CheckSquare, AlertTriangle, Download,
  MapPin, Phone, ExternalLink, MoreVertical,
  ChevronRight, X, Eye
} from 'lucide-react';
import { useSupabaseRealtime } from '../hooks/useSupabaseRealtime';
import { AgentCommander } from '../services/agentCommander';
import { Toaster, toast } from 'sonner';

const GOVERNORATES = [
  'Anbar', 'Babil', 'Baghdad', 'Basra', 'Dhi Qar', 'Diyala', 
  'Duhok', 'Erbil', 'Karbala', 'Kirkuk', 'Maysan', 'Muthanna', 
  'Najaf', 'Nineveh', 'Qadisiyah', 'Salahuddin', 'Sulaymaniyah', 'Wasit'
];

export default function CommandCenter() {
  const { recordCount } = useSupabaseRealtime();
  const [activeAgents, setActiveAgents] = useState<Set<string>>(new Set());
  const [agentStats, setAgentStats] = useState<Record<string, number>>({});

  // Mocking agent stats (record counts per region)
  useEffect(() => {
    const stats: Record<string, number> = {};
    GOVERNORATES.forEach(gov => {
      stats[gov] = Math.floor(Math.random() * 5000) + 1000;
    });
    setAgentStats(stats);
  }, []);

  const toggleAgent = async (gov: string) => {
    const next = new Set(activeAgents);
    if (next.has(gov)) {
      next.delete(gov);
      toast.info(`Stopping agent for ${gov}...`);
    } else {
      next.add(gov);
      try {
        await AgentCommander.triggerRegionalAgent(gov);
        toast.success(`Agent for ${gov} launched successfully!`);
      } catch (err) {
        toast.error(`Failed to launch agent for ${gov}`);
      }
    }
    setActiveAgents(next);
  };

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      <Toaster position="top-right" theme="dark" richColors />
      
      {/* Header */}
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-emerald-500/10">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            <Zap className="text-emerald-400 animate-pulse" size={32} />
            COMMANDER COCKPIT
          </h1>
          <p className="text-sm text-slate-400 font-medium uppercase tracking-[0.2em]">
            18-Agent Regional Operations · <span className="text-emerald-400">{recordCount.toLocaleString()}</span> Total Records
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-900/50 border border-emerald-500/20 rounded-xl">
            <Activity className="text-emerald-400" size={16} />
            <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">System Live</span>
          </div>
          <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            Global Launch
          </button>
        </div>
      </header>

      {/* 18-Agent Status Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {GOVERNORATES.map((gov) => {
          const isActive = activeAgents.has(gov);
          return (
            <motion.div
              key={gov}
              whileHover={{ scale: 1.02 }}
              onClick={() => toggleAgent(gov)}
              className={`relative p-5 rounded-2xl border transition-all cursor-pointer group ${
                isActive 
                  ? 'bg-emerald-500/10 border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.1)] animate-pulse-emerald' 
                  : 'bg-slate-900/40 border-slate-800 hover:border-emerald-500/30'
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-lg ${isActive ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                  <Bot size={20} />
                </div>
                <div className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full ${
                  isActive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-500'
                }`}>
                  {isActive ? 'Active' : 'Idle'}
                </div>
              </div>
              
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wide">{gov}</h3>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Regional Agent</p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/50 flex justify-between items-center">
                <div className="space-y-0.5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Records</div>
                  <div className="text-sm font-black text-slate-200">{agentStats[gov]?.toLocaleString() || '0'}</div>
                </div>
                {isActive && (
                  <div className="flex gap-1">
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        animate={{ height: [4, 12, 4] }}
                        transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.2 }}
                        className="w-1 bg-emerald-500 rounded-full"
                      />
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Quick Actions & Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <Activity className="text-emerald-400" size={18} />
              Real-time Pipeline
            </h2>
            <div className="flex gap-2">
              <button className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors">
                <RefreshCw size={16} />
              </button>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { label: 'Scraping', value: '84%', color: 'text-blue-400', icon: <Globe size={18} /> },
              { label: 'Cleaning', value: '92%', color: 'text-emerald-400', icon: <Wand2 size={18} /> },
              { label: 'Enriching', value: '76%', color: 'text-purple-400', icon: <Database size={18} /> }
            ].map(stat => (
              <div key={stat.label} className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl space-y-3">
                <div className="flex justify-between items-center">
                  <div className={`p-2 rounded-lg bg-slate-900 ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <span className={`text-lg font-black ${stat.color}`}>{stat.value}</span>
                </div>
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label} Phase</div>
                <div className="h-1 bg-slate-900 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: stat.value }}
                    className={`h-full ${stat.color.replace('text', 'bg')}`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
          <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
            <ShieldCheck className="text-emerald-400" size={18} />
            QC Overseer
          </h2>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Flagged for Review</div>
                <div className="text-2xl font-black text-rose-400">124</div>
              </div>
              <AlertTriangle className="text-rose-400" size={24} />
            </div>
            
            <div className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Avg Confidence</div>
                <div className="text-2xl font-black text-emerald-400">94.2%</div>
              </div>
              <CheckCircle className="text-emerald-400" size={24} />
            </div>
            
            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all border border-slate-700">
              Run Global Validation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
