import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, Zap, ShieldCheck, 
  FileText, History, Compass, Globe,
  Database, Search, MapPin, LogOut
} from 'lucide-react';
import { motion } from 'motion/react';

const navItems = [
  { icon: Zap, label: 'Command Center', path: '/command' },
  { icon: LayoutDashboard, label: 'Overview', path: '/overview' },
  { icon: ShieldCheck, label: 'Visual Review', path: '/review' },
  { icon: Compass, label: 'Discovery Feed', path: '/discovery' },
  { icon: FileText, label: 'Final Report', path: '/report' },
  { icon: History, label: 'Pilot Runs', path: '/pilot' },
];

export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-950 border-r border-emerald-500/10 flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-emerald-500/10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)]">
            <Compass className="text-slate-950" size={24} />
          </div>
          <div className="space-y-0.5">
            <h1 className="text-lg font-black text-white tracking-tighter uppercase">Iraq Compass</h1>
            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">AI Operations</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-xl transition-all group ${
                isActive
                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.05)]'
                  : 'text-slate-500 hover:bg-slate-900 hover:text-slate-300'
              }`
            }
          >
            <item.icon size={20} />
            <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-6 border-t border-emerald-500/10 bg-slate-950/50">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Network Status</span>
            <div className="flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
              <span className="text-[8px] text-emerald-400 font-black uppercase tracking-widest">Online</span>
            </div>
          </div>
          
          <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] text-slate-600 font-bold uppercase tracking-widest">Records Scraped</span>
              <Database size={12} className="text-emerald-500" />
            </div>
            <div className="text-lg font-black text-slate-200 tracking-tight">74,049</div>
            <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: '65%' }}
                className="h-full bg-emerald-500"
              />
            </div>
          </div>

          <button className="flex items-center gap-3 w-full p-3 text-slate-600 hover:text-rose-400 hover:bg-rose-400/10 rounded-xl transition-all text-[10px] font-black uppercase tracking-widest border border-transparent hover:border-rose-400/20">
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
