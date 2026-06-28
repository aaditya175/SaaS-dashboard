import { useState, useMemo } from 'react';
import { api } from '../../lib/api';
import { useApp, FOUNDERS, Founder, formatCurrency } from '../store/appStore';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Target, Zap, TrendingUp, Award, Calendar, CheckSquare, Coffee, Users } from 'lucide-react';

const PERSONAL_DATA: Record<string, { weeklyGoals: string[]; todayTasks: { text: string; done: boolean }[]; radarData: any[] }> = {
  f1: {
    weeklyGoals: ['Close Finwise Capital deal', 'Onboard HealthFirst team', 'Hit ₹5L revenue milestone', 'Conduct 5 discovery calls'],
    todayTasks: [{ text: 'Call Karan Bose re: pricing', done: false }, { text: 'Review TechNova website draft', done: true }, { text: 'Prep weekly founders sync deck', done: false }, { text: 'Send 10 LinkedIn outreaches', done: true }],
    radarData: [{ subject: 'Revenue', A: 92 }, { subject: 'Outreach', A: 78 }, { subject: 'Meetings', A: 85 }, { subject: 'Tasks', A: 90 }, { subject: 'Team', A: 88 }, { subject: 'Strategy', A: 95 }],
  },
  f2: {
    weeklyGoals: ['Complete HealthFirst onboarding checklist', 'Collect NPS from 3 clients', 'Setup weekly client call cadence', 'Resolve EduPath invoice'],
    todayTasks: [{ text: 'Send onboarding email to HealthFirst', done: true }, { text: 'Follow up EduPath invoice', done: false }, { text: 'Update client satisfaction scores', done: false }, { text: 'Review project status with Rahul', done: true }],
    radarData: [{ subject: 'Revenue', A: 75 }, { subject: 'Outreach', A: 60 }, { subject: 'Meetings', A: 92 }, { subject: 'Tasks', A: 85 }, { subject: 'Team', A: 95 }, { subject: 'Strategy', A: 80 }],
  },
  f3: {
    weeklyGoals: ['Deploy Finwise Lead Gen System', 'Fix TechNova website bugs', 'Setup analytics dashboard', 'Code review for 3 PRs'],
    todayTasks: [{ text: 'Deploy staging environment', done: true }, { text: 'Fix mobile responsive issues', done: true }, { text: 'CRM API integration testing', done: false }, { text: 'Team standup @ 9AM', done: true }],
    radarData: [{ subject: 'Revenue', A: 65 }, { subject: 'Outreach', A: 40 }, { subject: 'Meetings', A: 70 }, { subject: 'Tasks', A: 95 }, { subject: 'Team', A: 85 }, { subject: 'Strategy', A: 75 }],
  },
  f4: {
    weeklyGoals: ['Launch Q3 content calendar', 'Get 500 new followers across platforms', 'Write 2 case studies', 'Plan client testimonial campaign'],
    todayTasks: [{ text: 'Schedule 5 social posts', done: false }, { text: 'Write EduPath case study draft', done: false }, { text: 'Review ad creatives for HealthFirst', done: true }, { text: 'Monthly analytics report', done: false }],
    radarData: [{ subject: 'Revenue', A: 78 }, { subject: 'Outreach', A: 95 }, { subject: 'Meetings', A: 75 }, { subject: 'Tasks', A: 72 }, { subject: 'Team', A: 80 }, { subject: 'Strategy', A: 88 }],
  },
  f5: {
    weeklyGoals: ['Close Q2 books by June 30', 'Send 3 partnership proposals', 'Review and approve all Q2 invoices', 'Quarterly financial report'],
    todayTasks: [{ text: 'Approve EduPath overdue invoice follow-up', done: false }, { text: 'Partnership call with SoftSell Agency', done: true }, { text: 'Q2 expense reconciliation', done: false }, { text: 'GST filing preparation', done: false }],
    radarData: [{ subject: 'Revenue', A: 88 }, { subject: 'Outreach', A: 55 }, { subject: 'Meetings', A: 82 }, { subject: 'Tasks', A: 78 }, { subject: 'Team', A: 70 }, { subject: 'Strategy', A: 85 }],
  },
};

const PERF_DATA = [
  { week: 'Wk 1', score: 72 },
  { week: 'Wk 2', score: 78 },
  { week: 'Wk 3', score: 75 },
  { week: 'Wk 4', score: 85 },
  { week: 'Wk 5', score: 82 },
  { week: 'Wk 6', score: 90 },
];

function FounderTab({ founder, data }: { founder: Founder; data: typeof PERSONAL_DATA['f1'] }) {
  const [newTask, setNewTask] = useState('');
  const [tasks, setTasks] = useState(data.todayTasks);
  const completedTasks = tasks.filter(t => t.done).length;

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5" style={{ borderColor: `${founder.color}30`, background: `linear-gradient(135deg, ${founder.color}08, transparent)` }}>
        <div className="w-16 h-16 rounded-2xl text-2xl font-bold text-white flex items-center justify-center flex-shrink-0" style={{ backgroundColor: founder.color }}>
          {founder.initials}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-foreground font-display">{founder.name}</h2>
          <p className="text-sm text-muted-foreground">{founder.role}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-sm font-semibold" style={{ color: founder.color }}>Level {founder.level}</span>
            <span className="text-xs text-muted-foreground">{founder.xp.toLocaleString()} XP</span>
            <span className="text-xs text-muted-foreground">{founder.streak} day streak 🔥</span>
            <div className="flex gap-1">{founder.badges.map((b, i) => <span key={i} className="text-base">{b}</span>)}</div>
          </div>
        </div>
        {/* Productivity score */}
        <div className="text-center">
          <p className="text-4xl font-bold font-display" style={{ color: founder.color }}>{founder.score}</p>
          <p className="text-xs text-muted-foreground">Productivity Score</p>
          <p className="text-xs font-semibold text-emerald-400 mt-0.5">+5 this week</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Revenue Generated', value: formatCurrency(founder.revenue), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Outreach Done', value: String(founder.outreach), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Meetings This Month', value: String(founder.meetings), icon: Calendar, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'XP Points', value: founder.xp.toLocaleString(), icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}><k.icon className={`w-4.5 h-4.5 ${k.color}`} /></div>
            <div><p className="text-lg font-bold text-foreground font-display">{k.value}</p><p className="text-xs text-muted-foreground">{k.label}</p></div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's tasks */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-foreground">Today's Tasks</p>
            <span className="text-xs text-muted-foreground">{completedTasks}/{tasks.length} done</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${tasks.length ? (completedTasks / tasks.length) * 100 : 0}%` }} />
          </div>
          <div className="space-y-2">
            {tasks.map((t, i) => (
              <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <button
                  onClick={() => setTasks(prev => prev.map((x, j) => j === i ? { ...x, done: !x.done } : x))}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${t.done ? 'border-primary bg-primary' : 'border-border hover:border-primary'}`}
                >
                  {t.done && <CheckSquare className="w-3 h-3 text-white" />}
                </button>
                <span className={`text-sm flex-1 ${t.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.text}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && newTask.trim()) { setTasks(p => [...p, { text: newTask.trim(), done: false }]); setNewTask(''); }}} placeholder="Add a task..." className="flex-1 h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <button onClick={() => { if (newTask.trim()) { setTasks(p => [...p, { text: newTask.trim(), done: false }]); setNewTask(''); }}} className="h-9 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium">Add</button>
          </div>
        </div>

        {/* Performance radar */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Performance Radar</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={data.radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <Radar dataKey="A" stroke={founder.color} fill={founder.color} fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly goals */}
        <div className="rounded-xl border border-border bg-card p-5">
          <div className="flex items-center gap-2 mb-3"><Target className="w-4 h-4 text-primary" /><p className="text-sm font-semibold text-foreground">Weekly Goals</p></div>
          <div className="space-y-2">
            {data.weeklyGoals.map((g, i) => (
              <div key={i} className="flex items-start gap-2 p-2 rounded-lg bg-muted/30">
                <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                <span className="text-sm text-foreground">{g}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Performance trend */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-3">6-Week Performance</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={PERF_DATA}>
              <defs>
                <linearGradient id={`grad-${founder.id}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={founder.color} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={founder.color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="week" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }} />
              <Area type="monotone" dataKey="score" stroke={founder.color} strokeWidth={2} fill={`url(#grad-${founder.id})`} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

export default function Founders() {
  const { currentFounder, setCurrentFounder, founders, setFounders } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newFounder, setNewFounder] = useState({ name: '', role: '', color: '#3b82f6', initials: '' });

  const activeFounder = founders.find(f => f.id === currentFounder);
  const isSuperAdmin = activeFounder?.role === 'Super Admin';

  const handleAdd = async () => {
    try {
      const created = await api.post('/founders', newFounder);
      setFounders([...founders, created]);
      setShowAdd(false);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Founder tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {founders.map(f => (
          <button
            key={f.id}
            onClick={() => setCurrentFounder(f.id)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl border text-sm font-medium whitespace-nowrap transition-all flex-shrink-0 ${
              currentFounder === f.id
                ? 'border-primary/40 bg-primary/10 text-primary'
                : 'border-border bg-card text-muted-foreground hover:border-primary/20 hover:text-foreground'
            }`}
          >
            <div className="w-6 h-6 rounded-full text-[10px] font-bold text-white flex items-center justify-center" style={{ backgroundColor: f.color }}>{f.initials}</div>
            {f.name.split(' ')[0]}
            {currentFounder === f.id && <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Lv.{f.level || 1}</span>}
          </button>
        ))}
        {isSuperAdmin && (
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm font-medium">
            + Add Founder
          </button>
        )}
      </div>

      {showAdd && isSuperAdmin && (
        <div className="bg-card border border-border rounded-xl p-6">
          <h3 className="text-lg font-bold mb-4">Add New Founder</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <input placeholder="Name" value={newFounder.name} onChange={e => setNewFounder({ ...newFounder, name: e.target.value })} className="px-3 py-2 bg-input-background border border-border rounded-lg" />
            <input placeholder="Role" value={newFounder.role} onChange={e => setNewFounder({ ...newFounder, role: e.target.value })} className="px-3 py-2 bg-input-background border border-border rounded-lg" />
            <input placeholder="Initials (e.g. JD)" value={newFounder.initials} onChange={e => setNewFounder({ ...newFounder, initials: e.target.value })} className="px-3 py-2 bg-input-background border border-border rounded-lg" />
            <input type="color" value={newFounder.color} onChange={e => setNewFounder({ ...newFounder, color: e.target.value })} className="h-10 w-full rounded-lg cursor-pointer" />
          </div>
          <button onClick={handleAdd} className="px-4 py-2 bg-primary text-white rounded-lg">Save Founder</button>
        </div>
      )}

      {/* Selected founder content */}
      {founders.map(f => currentFounder === f.id && (
        <FounderTab key={f.id} founder={f} data={PERSONAL_DATA[f.id] || PERSONAL_DATA['f1']} />
      ))}
    </div>
  );
}
