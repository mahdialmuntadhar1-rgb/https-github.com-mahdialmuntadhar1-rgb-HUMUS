import React from 'react';
import { 
  LayoutDashboard, TrendingUp, Users, Map, 
  Database, CheckCircle, AlertTriangle, Bot,
  ArrowUpRight, ArrowDownRight, Activity,
  Globe, Zap, ShieldCheck
} from 'lucide-react';
import { motion } from 'motion/react';

export default function Overview() {
  return (
    <div className="p-4 md:p-8 space-y-8 max-w-7xl mx-auto">
      <header className="space-y-1">
        <h1 className="text-2xl font-black text-white tracking-tighter uppercase">System Overview</h1>
        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Nationwide Directory Status & Intelligence</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Records', value: '74,049', icon: <Database />, color: 'text-emerald-400', trend: '+12.5%', isUp: true },
          { label: 'Verified', value: '52,120', icon: <CheckCircle />, color: 'text-blue-400', trend: '+8.2%', isUp: true },
          { label: 'Pending QC', value: '12,430', icon: <AlertTriangle />, color: 'text-amber-400', trend: '-2.4%', isUp: false },
          { label: 'Active Agents', value: '6', icon: <Bot />, color: 'text-purple-400', trend: 'Stable', isUp: true }
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-emerald-500/30 transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className={`p-3 rounded-xl bg-slate-950 border border-slate-800 group-hover:border-emerald-500/30 transition-all ${stat.color}`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${stat.isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
                {stat.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                {stat.trend}
              </div>
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-black text-white tracking-tight">{stat.value}</div>
              <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{stat.label}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Map Placeholder */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-3xl p-8 h-[500px] relative overflow-hidden group">
          <div className="absolute inset-0 bg-slate-950/50 flex flex-col items-center justify-center space-y-4">
            <div className="p-6 bg-slate-900 border border-slate-800 rounded-full group-hover:border-emerald-500/30 transition-all">
              <Globe size={48} className="text-slate-700 group-hover:text-emerald-500/50 transition-all" />
            </div>
            <div className="text-center space-y-1">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">Governorate Intelligence Map</h3>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Interactive spatial distribution visualization</p>
            </div>
          </div>
          {/* Decorative elements */}
          <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-emerald-500 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/4 right-1/4 w-32 h-32 bg-blue-500 rounded-full blur-[100px]" />
          </div>
        </div>

        {/* Side Panel */}
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 space-y-6">
            <h2 className="text-sm font-black text-white uppercase tracking-[0.2em] flex items-center gap-3">
              <Activity className="text-emerald-400" size={18} />
              Live Feed
            </h2>
            <div className="space-y-4">
              {[
                { agent: 'Baghdad', action: 'Scraped 42 records', time: '2m ago', icon: <Zap size={14} /> },
                { agent: 'Erbil', action: 'Cleaned 12 records', time: '5m ago', icon: <ShieldCheck size={14} /> },
                { agent: 'Basra', action: 'Enriched 8 records', time: '12m ago', icon: <Globe size={14} /> }
              ].map((log, i) => (
                <div key={i} className="flex items-start gap-4 p-3 bg-slate-950/50 border border-slate-800 rounded-xl group hover:border-emerald-500/30 transition-all">
                  <div className="p-2 bg-slate-900 rounded-lg text-emerald-400">
                    {log.icon}
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="text-[10px] text-slate-200 font-black uppercase tracking-widest">{log.agent} Agent</div>
                    <div className="text-[10px] text-slate-500 font-medium">{log.action}</div>
                  </div>
                  <div className="text-[8px] text-slate-600 font-bold uppercase tracking-widest">{log.time}</div>
                </div>
              ))}
            </div>
            <button className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-[10px] uppercase tracking-widest rounded-xl transition-all border border-slate-700">
              View All Logs
            </button>
          </div>

          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500 rounded-lg text-slate-950">
                <ShieldCheck size={18} />
              </div>
              <h2 className="text-sm font-black text-emerald-400 uppercase tracking-widest">Network Health</h2>
            </div>
            <p className="text-[10px] text-emerald-400/60 font-medium leading-relaxed">
              All 18 regional agents are operating within normal parameters. Data integrity score is currently at 98.4%.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
