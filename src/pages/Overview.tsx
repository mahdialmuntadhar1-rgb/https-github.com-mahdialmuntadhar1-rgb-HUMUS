import { useEffect, useState } from 'react';
import { Database, CheckCircle, AlertTriangle, Bot, Activity, MapPin, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { supabase } from '../lib/supabase';
import ChartContainer from '../components/ChartContainer';

interface Stats {
  total: number;
  verified: number;
  pending: number;
  activeAgents: number;
  byCity: { city: string; count: number }[];
  byCategory: { category: string; count: number }[];
  recent: any[];
}

export default function Overview() {
  const [stats, setStats] = useState<Stats>({
    total: 0,
    verified: 0,
    pending: 0,
    activeAgents: 0,
    byCity: [],
    byCategory: [],
    recent: []
  });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState(new Date());

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 10000);
    return () => clearInterval(interval);
  }, []);

  async function fetchStats() {
    try {
      const { count: total } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true });

      const { count: verified } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'verified');

      const { count: pending } = await supabase
        .from('businesses')
        .select('*', { count: 'exact', head: true })
        .eq('verification_status', 'pending');

      const { data: agents } = await supabase
        .from('agents')
        .select('*')
        .eq('status', 'running');

      const { data: allBusinesses } = await supabase
        .from('businesses')
        .select('city, category');

      const cityCounts: Record<string, number> = {};
      const categoryCounts: Record<string, number> = {};

      allBusinesses?.forEach(biz => {
        cityCounts[biz.city] = (cityCounts[biz.city] || 0) + 1;
        categoryCounts[biz.category] = (categoryCounts[biz.category] || 0) + 1;
      });

      const byCity = Object.entries(cityCounts)
        .map(([city, count]) => ({ city, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const byCategory = Object.entries(categoryCounts)
        .map(([category, count]) => ({ category, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const { data: recent } = await supabase
        .from('businesses')
        .select('*')
        .order('scraped_at', { ascending: false })
        .limit(5);

      setStats({
        total: total || 0,
        verified: verified || 0,
        pending: pending || 0,
        activeAgents: agents?.length || 0,
        byCity: byCity || [],
        byCategory: byCategory || [],
        recent: recent || []
      });
      setLastUpdate(new Date());
      setLoading(false);
    } catch (err) {
      console.error('Failed to fetch stats:', err);
      setLoading(false);
    }
  }

  const statCards = [
    { label: 'Total Records', value: stats.total.toLocaleString(), icon: <Database className="text-blue-400" /> },
    { label: 'Verified', value: stats.verified.toLocaleString(), icon: <CheckCircle className="text-green-400" /> },
    { label: 'Pending QC', value: stats.pending.toLocaleString(), icon: <AlertTriangle className="text-orange-400" /> },
    { label: 'Active Agents', value: stats.activeAgents.toString(), icon: <Bot className="text-purple-400" /> }
  ];

  return (
    <div className="p-8 space-y-8">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gold uppercase tracking-widest">System Overview</h1>
          <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest">
            Live Dashboard • Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Activity className="w-4 h-4 text-green-400 animate-pulse" />
          <span className="text-xs text-green-400 uppercase tracking-widest">Live</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <div key={i} className="bg-white/5 border border-gold/10 rounded-xl p-6 hover:bg-white/10 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <div className="text-2xl font-bold text-white">{loading ? '...' : stat.value}</div>
                <div className="text-[10px] text-slate-500 uppercase tracking-widest mt-2">{stat.label}</div>
              </div>
              {stat.icon}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/5 border border-gold/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="w-4 h-4 text-gold" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Top Cities</h3>
          </div>
          {loading ? (
            <div className="text-slate-500 text-sm">Loading...</div>
          ) : stats.byCity.length === 0 ? (
            <div className="text-slate-500 text-sm italic">No data yet</div>
          ) : (
            /* ChartContainer gives ResponsiveContainer a real pixel height so it
               never measures -1.  Do NOT remove or replace this wrapper with a
               flex/grid container that has no explicit height. */
            <ChartContainer height={220}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byCity} margin={{ top: 4, right: 8, bottom: 24, left: 0 }}>
                  <XAxis
                    dataKey="city"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} width={32} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0', fontSize: 12 }}
                    itemStyle={{ color: '#34d399' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.byCity.map((_entry, i) => (
                      <Cell key={i} fill={i === 0 ? '#10b981' : '#1e293b'} stroke="#334155" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>

        <div className="bg-white/5 border border-gold/10 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-4 h-4 text-gold" />
            <h3 className="text-sm font-bold text-white uppercase tracking-widest">Top Categories</h3>
          </div>
          {loading ? (
            <div className="text-slate-500 text-sm">Loading...</div>
          ) : stats.byCategory.length === 0 ? (
            <div className="text-slate-500 text-sm italic">No data yet</div>
          ) : (
            <ChartContainer height={220}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.byCategory} margin={{ top: 4, right: 8, bottom: 24, left: 0 }}>
                  <XAxis
                    dataKey="category"
                    tick={{ fill: '#94a3b8', fontSize: 10 }}
                    angle={-30}
                    textAnchor="end"
                    interval={0}
                  />
                  <YAxis tick={{ fill: '#64748b', fontSize: 10 }} width={32} />
                  <Tooltip
                    contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8 }}
                    labelStyle={{ color: '#e2e8f0', fontSize: 12 }}
                    itemStyle={{ color: '#60a5fa' }}
                  />
                  <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                    {stats.byCategory.map((_entry, i) => (
                      <Cell key={i} fill={i === 0 ? '#3b82f6' : '#1e293b'} stroke="#334155" />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          )}
        </div>
      </div>

      <div className="bg-white/5 border border-gold/10 rounded-xl p-6">
        <h3 className="text-sm font-bold text-white uppercase tracking-widest mb-4">Recently Collected</h3>
        {loading ? (
          <div className="text-slate-500 text-sm">Loading...</div>
        ) : stats.recent.length === 0 ? (
          <div className="text-slate-500 text-sm italic">No businesses collected yet. Run: npm run test:production</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left border-b border-gold/10">
                  <th className="pb-2 text-xs text-slate-500 uppercase tracking-widest">Business</th>
                  <th className="pb-2 text-xs text-slate-500 uppercase tracking-widest">Category</th>
                  <th className="pb-2 text-xs text-slate-500 uppercase tracking-widest">City</th>
                  <th className="pb-2 text-xs text-slate-500 uppercase tracking-widest">Source</th>
                  <th className="pb-2 text-xs text-slate-500 uppercase tracking-widest">Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.recent.map((biz, i) => (
                  <tr key={i} className="border-b border-gold/5 last:border-0">
                    <td className="py-3 text-white">{biz.business_name || biz.name}</td>
                    <td className="py-3 text-slate-400 capitalize">{biz.category}</td>
                    <td className="py-3 text-slate-400">{biz.city}</td>
                    <td className="py-3 text-slate-400">{biz.source_name || 'Unknown'}</td>
                    <td className="py-3">
                      <span className={`text-xs px-2 py-1 rounded ${
                        biz.verification_status === 'verified' 
                          ? 'bg-green-500/20 text-green-400' 
                          : 'bg-orange-500/20 text-orange-400'
                      }`}>
                        {biz.verification_status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
