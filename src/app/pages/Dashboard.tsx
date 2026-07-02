import { useApp, FOUNDERS, formatCurrency } from '../store/appStore';
import KPICard from '../components/KPICard';
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, RadialBarChart, RadialBar
} from 'recharts';
import { DollarSign, Users, TrendingUp, CheckCircle, Target, Briefcase, Activity, Award, Calendar, ArrowRight, Zap } from 'lucide-react';

const HEALTH_DATA = [{ name: 'Health', value: 78, fill: '#7c3aed' }];

function HealthScore() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Business Health</p>
        <span className="text-xs text-muted-foreground">Jun 2025</span>
      </div>
      <div className="relative h-28 flex items-center justify-center">
        <ResponsiveContainer width="100%" height={112}>
          <RadialBarChart cx="50%" cy="80%" innerRadius="70%" outerRadius="100%" startAngle={180} endAngle={0} data={HEALTH_DATA}>
            <RadialBar dataKey="value" cornerRadius={6} background={{ fill: 'rgba(124,58,237,0.1)' }} />
          </RadialBarChart>
        </ResponsiveContainer>
        <div className="absolute bottom-4 text-center">
          <p className="text-3xl font-bold text-primary">78</p>
          <p className="text-xs text-muted-foreground">/100</p>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div><p className="font-bold text-emerald-400">+12%</p><p className="text-muted-foreground">MoM</p></div>
        <div><p className="font-bold text-foreground">Good</p><p className="text-muted-foreground">Status</p></div>
        <div><p className="font-bold text-amber-400">3</p><p className="text-muted-foreground">Risks</p></div>
      </div>
    </div>
  );
}

function ActivityFeed() {
  const { activityLog } = useApp();
  
  const getTimeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };
  
  const items = activityLog.length > 0 
    ? activityLog.slice(0, 8).map(a => ({
        icon: a.icon || '📋',
        text: `${a.founderName}: ${a.details}`,
        time: getTimeAgo(a.createdAt)
      }))
    : [
        { icon: '📋', text: 'No activity yet. Start by adding leads in the CRM!', time: 'now' }
      ];
  
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Team Activity</p>
        <Activity className="w-4 h-4 text-muted-foreground" />
      </div>
      <div className="space-y-3">
        {items.map((item, i) => (
          <div key={i} className="flex items-start gap-3">
            <span className="text-base leading-none mt-0.5">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-foreground leading-relaxed">{item.text}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{item.time}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuarterlyGoals() {
  const goals = [
    { label: 'Revenue Target', current: 1383000, target: 2000000, color: '#7c3aed' },
    { label: 'New Clients', current: 4, target: 8, color: '#06b6d4' },
    { label: 'Leads Generated', current: 157, target: 200, color: '#10b981' },
    { label: 'Proposals Sent', current: 24, target: 30, color: '#f59e0b' },
  ];
  return (
    <div className="rounded-xl border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-foreground">Q2 Goals</p>
        <span className="text-xs text-primary font-medium">Jun 28 — 3 days left</span>
      </div>
      <div className="space-y-4">
        {goals.map((g, i) => {
          const pct = Math.min(100, Math.round((g.current / g.target) * 100));
          return (
            <div key={i}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="text-foreground">{g.label}</span>
                <span className="text-muted-foreground">
                  {typeof g.current === 'number' && g.current > 10000
                    ? `${formatCurrency(g.current)} / ${formatCurrency(g.target)}`
                    : `${g.current} / ${g.target}`
                  } <span className="font-semibold text-foreground">{pct}%</span>
                </span>
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${pct}%`, backgroundColor: g.color }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-medium text-foreground">
            {p.name !== 'leads' && p.name !== 'won' ? formatCurrency(p.value) : p.value}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const { leads, projects, clients, transactions, currentFounder, founders } = useApp();
  const won = leads.filter(l => l.stage === 'Won').length;
  const totalLeads = leads.length;
  const winRate = totalLeads > 0 ? Math.round((won / totalLeads) * 100) : 0;
  const activeClients = clients.filter(c => c.status === 'active').length;
  const totalRevenue = transactions.filter(t => t.type === 'revenue' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const profit = totalRevenue - totalExpenses;
  const pending = transactions.filter(t => t.status === 'pending' || t.status === 'overdue').reduce((s, t) => s + t.amount, 0);
  const activeProjects = projects.filter(p => p.status === 'in_progress').length;

  // Dynamic Chart Data Computations
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const dynamicRevenueChartData = monthNames.slice(0, new Date().getMonth() + 1).map(monthStr => {
    const monthIndex = monthNames.indexOf(monthStr) + 1;
    const monthStrPadded = monthIndex.toString().padStart(2, '0');
    const txsInMonth = transactions.filter(t => t.date.startsWith(`2025-${monthStrPadded}`));
    const rev = txsInMonth.filter(t => t.type === 'revenue').reduce((s, t) => s + t.amount, 0);
    const exp = txsInMonth.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    return { month: monthStr, revenue: rev, expenses: exp, profit: rev - exp };
  });

  const dynamicLeadChartData = monthNames.slice(0, new Date().getMonth() + 1).map(monthStr => {
    const monthIndex = monthNames.indexOf(monthStr) + 1;
    const monthStrPadded = monthIndex.toString().padStart(2, '0');
    const leadsInMonth = leads.filter(l => l.createdAt.startsWith(`2025-${monthStrPadded}`));
    return { month: monthStr, leads: leadsInMonth.length, won: leadsInMonth.filter(l => l.stage === 'Won').length };
  });

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const founder = founders.find(f => f.id === currentFounder) || founders[0] || FOUNDERS[0];

  const quotes = [
    "Success is not final, failure is not fatal — it is the courage to continue that counts.",
    "The secret of getting ahead is getting started.",
    "Work hard in silence, let success be your noise.",
  ];

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Welcome banner */}
      <div className="rounded-2xl bg-gradient-to-r from-primary/20 via-violet-500/10 to-transparent border border-primary/20 p-6 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-primary font-semibold uppercase tracking-widest mb-1">Saturday, June 28, 2025</p>
          <h1 className="text-2xl font-bold text-foreground font-display">{greeting}, {founder.name.split(' ')[0]} 👋</h1>
          <p className="text-sm text-muted-foreground mt-1">You have <span className="text-foreground font-semibold">3 follow-ups</span> pending and <span className="text-foreground font-semibold">1 meeting</span> today.</p>
        </div>
        <div className="hidden md:block text-right max-w-xs">
          <Zap className="w-6 h-6 text-primary ml-auto mb-2" />
          <p className="text-xs text-muted-foreground italic">"{quotes[0]}"</p>
        </div>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
        <KPICard title="Total Revenue" value={formatCurrency(totalRevenue)} change={18} icon={<DollarSign className="w-5 h-5 text-violet-400" />} iconBg="bg-violet-500/10" />
        <KPICard title="Net Profit" value={formatCurrency(profit)} change={22} icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} iconBg="bg-emerald-500/10" highlight />
        <KPICard title="Pending Payments" value={formatCurrency(pending)} change={-5} icon={<Target className="w-5 h-5 text-amber-400" />} iconBg="bg-amber-500/10" />
        <KPICard title="Active Clients" value={String(activeClients)} change={12} icon={<Briefcase className="w-5 h-5 text-cyan-400" />} iconBg="bg-cyan-500/10" />
        <KPICard title="Total Leads" value={String(totalLeads)} change={8} icon={<Users className="w-5 h-5 text-blue-400" />} iconBg="bg-blue-500/10" />
        <KPICard title="Win Rate" value={`${winRate}%`} change={5} icon={<Award className="w-5 h-5 text-yellow-400" />} iconBg="bg-yellow-500/10" />
        <KPICard title="Active Projects" value={String(activeProjects)} change={0} trend="neutral" icon={<CheckCircle className="w-5 h-5 text-purple-400" />} iconBg="bg-purple-500/10" />
        <KPICard title="Proposals Sent" value="24" change={15} icon={<Calendar className="w-5 h-5 text-pink-400" />} iconBg="bg-pink-500/10" />
        <KPICard title="Meetings Booked" value="18" change={10} icon={<Activity className="w-5 h-5 text-indigo-400" />} iconBg="bg-indigo-500/10" />
        <KPICard title="Outreach Sent" value="521" change={23} icon={<ArrowRight className="w-5 h-5 text-teal-400" />} iconBg="bg-teal-500/10" />
        <KPICard title="Avg Project Value" value={formatCurrency(146250)} change={8} icon={<DollarSign className="w-5 h-5 text-rose-400" />} iconBg="bg-rose-500/10" />
        <KPICard title="Monthly Burn" value={formatCurrency(85500)} change={-3} trend="up" icon={<TrendingUp className="w-5 h-5 text-orange-400" />} iconBg="bg-orange-500/10" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue chart */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-foreground">Revenue & Profit</p>
              <p className="text-xs text-muted-foreground">Jan – Jun 2025</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-violet-500" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Profit</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={dynamicRevenueChartData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="revenue" name="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="profit" name="profit" stroke="#10b981" strokeWidth={2} fill="url(#profGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Health score */}
        <HealthScore />
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Lead chart */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">Lead Growth</p>
            <span className="text-xs text-muted-foreground">6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={dynamicLeadChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="leads" name="leads" fill="#4f46e5" radius={[3, 3, 0, 0]} />
              <Bar dataKey="won" name="won" fill="#10b981" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quarterly goals */}
        <QuarterlyGoals />

        {/* Activity feed */}
        <ActivityFeed />
      </div>

      {/* Founder leaderboard snippet */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-semibold text-foreground">Founder Performance — This Month</p>
          <span className="text-xs text-primary cursor-pointer hover:underline">View full leaderboard →</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {FOUNDERS.map((f, i) => (
            <div key={f.id} className={`rounded-xl p-4 border flex flex-col gap-2 ${i === 0 ? 'border-primary/30 bg-primary/5' : 'border-border bg-muted/30'}`}>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full text-xs font-bold flex items-center justify-center text-white" style={{ backgroundColor: f.color }}>
                  {f.initials}
                </div>
                <div>
                  <p className="text-xs font-semibold text-foreground">{f.name.split(' ')[0]}</p>
                  <p className="text-[10px] text-muted-foreground">Lv.{f.level} · {f.xp.toLocaleString()} XP</p>
                </div>
                {i === 0 && <span className="ml-auto text-base">🥇</span>}
              </div>
              <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${Math.round((f.xp / 5000) * 100)}%`, backgroundColor: f.color }} />
              </div>
              <div className="flex justify-between text-[10px] text-muted-foreground">
                <span>Score: <span className="font-semibold text-foreground">{f.score}</span></span>
                <span>{f.streak}🔥</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
