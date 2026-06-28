import { useApp, FOUNDERS, REVENUE_CHART_DATA, LEAD_CHART_DATA, formatCurrency } from '../store/appStore';
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Funnel, FunnelChart, LabelList
} from 'recharts';
import { TrendingUp, Users, Award, Target, BarChart3 } from 'lucide-react';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-medium">{typeof p.value === 'number' && p.value > 1000 ? formatCurrency(p.value) : p.value}</span>
        </div>
      ))}
    </div>
  );
};

const FUNNEL_DATA = [
  { value: 521, name: 'Outreach Sent', fill: '#7c3aed' },
  { value: 157, name: 'Responses', fill: '#6d28d9' },
  { value: 68, name: 'Discovery Calls', fill: '#5b21b6' },
  { value: 32, name: 'Proposals Sent', fill: '#4c1d95' },
  { value: 11, name: 'Deals Closed', fill: '#3b0764' },
];

const SOURCE_DATA = [
  { name: 'LinkedIn', value: 38 },
  { name: 'Referral', value: 25 },
  { name: 'Cold Email', value: 20 },
  { name: 'Content', value: 12 },
  { name: 'Other', value: 5 },
];

const PIE_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

const MONTHLY_COMPARISON = [
  { month: 'Jan', thisYear: 285000, lastYear: 210000 },
  { month: 'Feb', thisYear: 320000, lastYear: 245000 },
  { month: 'Mar', thisYear: 298000, lastYear: 270000 },
  { month: 'Apr', thisYear: 415000, lastYear: 290000 },
  { month: 'May', thisYear: 380000, lastYear: 315000 },
  { month: 'Jun', thisYear: 485000, lastYear: 340000 },
];

const OUTREACH_DATA = [
  { week: 'Wk 1', emails: 85, linkedin: 62, calls: 18 },
  { week: 'Wk 2', emails: 92, linkedin: 78, calls: 24 },
  { week: 'Wk 3', emails: 68, linkedin: 55, calls: 15 },
  { week: 'Wk 4', emails: 105, linkedin: 88, calls: 28 },
  { week: 'Wk 5', emails: 91, linkedin: 72, calls: 21 },
  { week: 'Wk 6', emails: 80, linkedin: 65, calls: 19 },
];

function ChartCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-4">
        <p className="text-sm font-semibold text-foreground">{title}</p>
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

export default function Analytics() {
  const { leads, projects, clients } = useApp();

  const winRate = leads.length ? Math.round((leads.filter(l => l.stage === 'Won').length / leads.length) * 100) : 0;
  const avgDealValue = leads.length ? Math.round(leads.reduce((s, l) => s + l.value, 0) / leads.length) : 0;

  // Conversion rate by source
  const sourceConversion = ['LinkedIn', 'Referral', 'Cold Outreach', 'Content Marketing', 'Social Media'].map(source => {
    const sourceLeads = leads.filter(l => l.source === source);
    const won = sourceLeads.filter(l => l.stage === 'Won').length;
    return { source, leads: sourceLeads.length, won, rate: sourceLeads.length ? Math.round((won / sourceLeads.length) * 100) : 0 };
  }).filter(d => d.leads > 0);

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Summary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Win Rate', value: `${winRate}%`, change: '+5%', icon: Target, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Avg Deal Value', value: formatCurrency(avgDealValue), change: '+8%', icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Total Leads (Q2)', value: String(leads.length), change: '+28%', icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Project Completion', value: `${Math.round((projects.filter(p => p.status === 'completed').length / (projects.length || 1)) * 100)}%`, change: '+12%', icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center`}><k.icon className={`w-5 h-5 ${k.color}`} /></div>
            <div>
              <p className="text-xl font-bold text-foreground font-display">{k.value}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{k.label}</span>
                <span className="text-[10px] font-semibold text-emerald-400">{k.change}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue comparison & funnel */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <ChartCard title="Year-over-Year Revenue" subtitle="2025 vs 2024">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={MONTHLY_COMPARISON}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line type="monotone" dataKey="thisYear" name="2025" stroke="#7c3aed" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="lastYear" name="2024" stroke="#7b7b9e" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
          <div className="flex items-center gap-4 mt-2 text-xs">
            <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-violet-500 inline-block" />2025 (+42%)</span>
            <span className="flex items-center gap-1.5"><span className="w-3 border-t border-dashed border-muted-foreground inline-block" />2024</span>
          </div>
        </ChartCard>

        <ChartCard title="Sales Funnel" subtitle="Q2 2025 conversion rates">
          <div className="space-y-2">
            {FUNNEL_DATA.map((stage, i) => {
              const pct = Math.round((stage.value / FUNNEL_DATA[0].value) * 100);
              return (
                <div key={i}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-foreground">{stage.name}</span>
                    <span className="text-muted-foreground">{stage.value} ({pct}%)</span>
                  </div>
                  <div className="h-7 bg-muted rounded-lg overflow-hidden">
                    <div className="h-full rounded-lg flex items-center px-3 transition-all" style={{ width: `${pct}%`, backgroundColor: stage.fill }}>
                      {pct > 15 && <span className="text-[10px] text-white font-semibold">{stage.value}</span>}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartCard>
      </div>

      {/* Lead sources & outreach */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <ChartCard title="Lead Sources" subtitle="By channel">
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={SOURCE_DATA} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={2} dataKey="value">
                {SOURCE_DATA.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-1">
            {SOURCE_DATA.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5"><div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} /><span className="text-muted-foreground">{d.name}</span></div>
                <span className="font-medium text-foreground">{d.value}%</span>
              </div>
            ))}
          </div>
        </ChartCard>

        <div className="lg:col-span-2">
          <ChartCard title="Weekly Outreach Activity" subtitle="Emails, LinkedIn, Calls">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={OUTREACH_DATA}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="emails" name="Emails" fill="#7c3aed" radius={[3,3,0,0]} stackId="a" />
                <Bar dataKey="linkedin" name="LinkedIn" fill="#06b6d4" radius={[0,0,0,0]} stackId="a" />
                <Bar dataKey="calls" name="Calls" fill="#10b981" radius={[3,3,0,0]} stackId="a" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </div>
      </div>

      {/* Founder contribution */}
      <ChartCard title="Founder Revenue Contribution" subtitle="Individual performance this quarter">
        <div className="space-y-3">
          {FOUNDERS.sort((a, b) => b.revenue - a.revenue).map((f, i) => {
            const total = FOUNDERS.reduce((s, x) => s + x.revenue, 0);
            const pct = Math.round((f.revenue / total) * 100);
            return (
              <div key={f.id} className="flex items-center gap-4">
                <div className="w-7 h-7 rounded-full text-xs font-bold text-white flex items-center justify-center flex-shrink-0" style={{ backgroundColor: f.color }}>{f.initials}</div>
                <div className="flex-1">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="font-medium text-foreground">{f.name}</span>
                    <span className="text-muted-foreground">{formatCurrency(f.revenue)} ({pct}%)</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, backgroundColor: f.color }} />
                  </div>
                </div>
                {i === 0 && <span className="text-base flex-shrink-0">🥇</span>}
              </div>
            );
          })}
        </div>
      </ChartCard>

      {/* Source conversion */}
      {sourceConversion.length > 0 && (
        <ChartCard title="Conversion Rate by Source" subtitle="Leads → Won deals">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border">
                <th className="text-left pb-2 text-xs font-semibold text-muted-foreground">Source</th>
                <th className="text-center pb-2 text-xs font-semibold text-muted-foreground">Leads</th>
                <th className="text-center pb-2 text-xs font-semibold text-muted-foreground">Won</th>
                <th className="text-left pb-2 text-xs font-semibold text-muted-foreground">Conversion</th>
              </tr></thead>
              <tbody>
                {sourceConversion.map(d => (
                  <tr key={d.source} className="border-b border-border/50">
                    <td className="py-2 font-medium text-foreground">{d.source}</td>
                    <td className="py-2 text-center text-muted-foreground">{d.leads}</td>
                    <td className="py-2 text-center text-emerald-400 font-semibold">{d.won}</td>
                    <td className="py-2">
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${d.rate}%` }} /></div>
                        <span className="text-xs font-semibold text-foreground">{d.rate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      )}
    </div>
  );
}
