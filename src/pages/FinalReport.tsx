import React from 'react';
import { 
  BarChart3, Database, FileCheck, FileJson, 
  FileText, CheckCircle2, Bot, Activity,
  Download, Share2, Printer, Calendar,
  TrendingUp, ShieldCheck, Zap
} from 'lucide-react';
import { motion } from 'motion/react';

export default function FinalReport() {
  const metrics = [
    { label: 'Total Records Loaded', value: '28,430', icon: <Database size={24} />, color: 'text-blue-400' },
    { label: 'Duplicates Removed', value: '3,100', icon: <FileText size={24} />, color: 'text-rose-400' },
    { label: 'Businesses Enriched', value: '25,200', icon: <FileJson size={24} />, color: 'text-purple-400' },
    { label: 'Postcards Generated', value: '24,900', icon: <FileCheck size={24} />, color: 'text-pink-400' },
    { label: 'Approved by QC', value: '23,870', icon: <CheckCircle2 size={24} />, color: 'text-emerald-400' },
  ];

  const systemStats = [
    { label: 'Active Agents', value: '12', icon: <Bot size={20} />, color: 'text-cyan-400' },
    { label: 'Tasks Completed', value: '4,220', icon: <Activity size={20} />, color: 'text-amber-400' },
  ];

  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-8 border-b border-emerald-500/10">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-white tracking-tighter flex items-center gap-3">
            <BarChart3 className="text-emerald-400" size={32} />
            FINAL REPORT
          </h1>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">System Intelligence & Pipeline Performance</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors">
            <Printer size={20} />
          </button>
          <button className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors">
            <Share2 size={20} />
          </button>
          <button className="flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)]">
            <Download size={18} /> Export PDF
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        {metrics.map((metric, i) => (
          <motion.div 
            key={metric.label}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-emerald-500/30 transition-all group"
          >
            <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-emerald-500/30 transition-all w-fit ${metric.color}`}>
              {metric.icon}
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-white tracking-tight">{metric.value}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest leading-tight">{metric.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <Activity className="text-emerald-400" size={18} />
              System Performance
            </h2>
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold uppercase tracking-widest">
              <Calendar size={14} /> Last 30 Days
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {systemStats.map((stat, i) => (
              <div key={stat.label} className="flex items-center justify-between p-6 bg-slate-950/50 rounded-2xl border border-slate-800 group hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`p-3 bg-slate-900 rounded-xl ${stat.color}`}>
                    {stat.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{stat.label}</span>
                </div>
                <span className="text-3xl font-black text-white">{stat.value}</span>
              </div>
            ))}
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-end">
              <div className="space-y-1">
                <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Data Integrity Score</div>
                <div className="text-2xl font-black text-emerald-400">98.4%</div>
              </div>
              <TrendingUp className="text-emerald-400" size={24} />
            </div>
            <div className="h-2 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '98.4%' }}
                className="h-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"
              />
            </div>
          </div>
        </div>

        <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-8 space-y-6">
          <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
            <ShieldCheck className="text-emerald-400" size={18} />
            Regional Breakdown
          </h2>
          
          <div className="space-y-4 custom-scrollbar max-h-[300px] pr-2">
            {[
              { region: 'Baghdad', count: 8420, status: 'Completed', color: 'bg-emerald-500' },
              { region: 'Erbil', count: 6150, status: 'Completed', color: 'bg-emerald-500' },
              { region: 'Basra', count: 5890, status: 'In Progress', color: 'bg-blue-500' },
              { region: 'Nineveh', count: 4230, status: 'Queued', color: 'bg-slate-700' },
              { region: 'Sulaymaniyah', count: 3870, status: 'Completed', color: 'bg-emerald-500' }
            ].map((row, i) => (
              <div key={i} className="flex items-center justify-between p-4 bg-slate-950/50 border border-slate-800 rounded-xl group hover:border-emerald-500/30 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${row.color}`} />
                  <span className="text-xs font-black uppercase tracking-widest text-slate-200">{row.region}</span>
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-xs font-black text-slate-400">{row.count.toLocaleString()}</span>
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded border ${
                    row.status === 'Completed' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-500/5' :
                    row.status === 'In Progress' ? 'text-blue-400 border-blue-500/20 bg-blue-500/5' :
                    'text-slate-500 border-slate-700 bg-slate-800'
                  }`}>
                    {row.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
          
          <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all border border-slate-700">
            View Detailed Regional Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
