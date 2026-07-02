import { useState, useMemo } from 'react';
import { api } from '../../lib/api';
import { useApp, Founder, formatCurrency } from '../store/appStore';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Target, Zap, TrendingUp, Award, Calendar, CheckSquare, Coffee, Users, Edit2, Trash2 } from 'lucide-react';
import Modal, { ConfirmDialog } from '../components/Modal';

const DEFAULT_RADAR_DATA = [
  { subject: 'Revenue', A: 75 },
  { subject: 'Outreach', A: 65 },
  { subject: 'Meetings', A: 80 },
  { subject: 'Tasks', A: 85 },
  { subject: 'Team', A: 90 },
  { subject: 'Strategy', A: 85 },
];

const DEFAULT_PERF_DATA = [
  { week: 'Wk 1', score: 70 },
  { week: 'Wk 2', score: 75 },
  { week: 'Wk 3', score: 72 },
  { week: 'Wk 4', score: 85 },
  { week: 'Wk 5', score: 80 },
  { week: 'Wk 6', score: 90 },
];

function FounderTab({
  founder,
  isSuperAdmin,
  currentLoggedInId,
  onEdit,
  onDelete,
  onUpdate
}: {
  founder: Founder;
  isSuperAdmin: boolean;
  currentLoggedInId: string;
  onEdit: () => void;
  onDelete: () => void;
  onUpdate: (fields: Partial<Founder>) => void;
}) {
  const { leads, meetings } = useApp();
  const [newTask, setNewTask] = useState('');
  const [newGoal, setNewGoal] = useState('');

  const computedRevenue = useMemo(() => {
    return leads
      .filter(l => l.stage === 'Won' && l.assignee?.toLowerCase() === founder.name?.toLowerCase())
      .reduce((sum, l) => sum + (l.value || 0), 0);
  }, [leads, founder.name]);

  const computedOutreach = useMemo(() => {
    return leads.filter(l => l.assignee?.toLowerCase() === founder.name?.toLowerCase()).length;
  }, [leads, founder.name]);

  const computedMeetings = useMemo(() => {
    const firstName = founder.name.split(' ')[0].toLowerCase();
    return meetings.filter(m => 
      m.participants.some(p => p.toLowerCase() === founder.name.toLowerCase() || p.toLowerCase().includes(firstName))
    ).length;
  }, [meetings, founder.name]);

  const tasks = founder.todayTasks || [];
  const weeklyGoals = founder.weeklyGoals || [];
  const completedTasks = tasks.filter(t => t.done).length;

  const handleToggleTask = (idx: number) => {
    const updated = tasks.map((t, i) => i === idx ? { ...t, done: !t.done } : t);
    onUpdate({ todayTasks: updated });
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      const updated = [...tasks, { text: newTask.trim(), done: false }];
      onUpdate({ todayTasks: updated });
      setNewTask('');
    }
  };

  const handleDeleteTask = (idx: number) => {
    const updated = tasks.filter((_, i) => i !== idx);
    onUpdate({ todayTasks: updated });
  };

  const handleAddGoal = () => {
    if (newGoal.trim()) {
      const updated = [...weeklyGoals, newGoal.trim()];
      onUpdate({ weeklyGoals: updated });
      setNewGoal('');
    }
  };

  const handleDeleteGoal = (idx: number) => {
    const updated = weeklyGoals.filter((_, i) => i !== idx);
    onUpdate({ weeklyGoals: updated });
  };

  const radarData = founder.radarData?.length ? founder.radarData : DEFAULT_RADAR_DATA;
  const performanceTrend = founder.performanceTrend?.length ? founder.performanceTrend : DEFAULT_PERF_DATA;

  const canEdit = isSuperAdmin || (currentLoggedInId === founder.id);
  const canDelete = isSuperAdmin && (currentLoggedInId !== founder.id);

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="group rounded-2xl border p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5" style={{ borderColor: `${founder.color}30`, background: `linear-gradient(135deg, ${founder.color}08, transparent)` }}>
        <div className="w-16 h-16 rounded-2xl text-2xl font-bold text-white flex items-center justify-center flex-shrink-0" style={{ backgroundColor: founder.color }}>
          {founder.initials}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-foreground font-display">{founder.name}</h2>
            {canEdit && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={onEdit} className="p-1 hover:bg-muted rounded text-muted-foreground"><Edit2 className="w-4 h-4"/></button>
                {canDelete && (
                  <button onClick={onDelete} className="p-1 hover:bg-red-500/20 text-red-500 rounded"><Trash2 className="w-4 h-4"/></button>
                )}
              </div>
            )}
          </div>
          <p className="text-sm text-muted-foreground">{founder.role}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="text-sm font-semibold" style={{ color: founder.color }}>Level {founder.level || 1}</span>
            <span className="text-xs text-muted-foreground">{(founder.xp || 0).toLocaleString()} XP</span>
            <span className="text-xs text-muted-foreground">{founder.streak || 0} day streak 🔥</span>
            <div className="flex gap-1">{(founder.badges || []).map((b, i) => <span key={i} className="text-base">{b}</span>)}</div>
          </div>
        </div>
        {/* Productivity score */}
        <div className="text-center">
          <p className="text-4xl font-bold font-display" style={{ color: founder.color }}>{founder.score || 0}</p>
          <p className="text-xs text-muted-foreground">Productivity Score</p>
          <p className="text-xs font-semibold text-emerald-400 mt-0.5">+5 this week</p>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Revenue Generated', value: formatCurrency(computedRevenue || founder.revenue || 0), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Outreach Done', value: String(computedOutreach || founder.outreach || 0), icon: Users, color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { label: 'Meetings This Month', value: String(computedMeetings || founder.meetings || 0), icon: Calendar, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'XP Points', value: (founder.xp || 0).toLocaleString(), icon: Award, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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
              <div key={i} className="group/task flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleToggleTask(i)}
                    className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors flex-shrink-0 ${t.done ? 'border-primary bg-primary' : 'border-border hover:border-primary'}`}
                  >
                    {t.done && <CheckSquare className="w-3 h-3 text-white" />}
                  </button>
                  <span className={`text-sm ${t.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{t.text}</span>
                </div>
                <button
                  onClick={() => handleDeleteTask(i)}
                  className="opacity-0 group-hover/task:opacity-100 p-1 hover:bg-red-500/20 text-red-500 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={newTask} onChange={e => setNewTask(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') handleAddTask(); }} placeholder="Add a task..." className="flex-1 h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
            <button onClick={handleAddTask} className="h-9 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium">Add</button>
          </div>
        </div>

        {/* Performance radar */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Performance Radar</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="rgba(255,255,255,0.08)" />
              <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--muted-foreground)' }} />
              <Radar dataKey="A" stroke={founder.color} fill={founder.color} fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly goals */}
        <div className="rounded-xl border border-border bg-card p-5 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <Target className="w-4 h-4 text-primary" />
            <p className="text-sm font-semibold text-foreground">Weekly Goals</p>
          </div>
          <div className="space-y-2">
            {weeklyGoals.map((g, i) => (
              <div key={i} className="group/goal flex items-center justify-between p-2 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors">
                <div className="flex items-start gap-2">
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{i + 1}</span>
                  <span className="text-sm text-foreground leading-relaxed">{g}</span>
                </div>
                <button
                  onClick={() => handleDeleteGoal(i)}
                  className="opacity-0 group-hover/goal:opacity-100 p-1 hover:bg-red-500/20 text-red-500 rounded"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <input
              value={newGoal}
              onChange={e => setNewGoal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') handleAddGoal(); }}
              placeholder="Add a weekly goal..."
              className="flex-1 h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button onClick={handleAddGoal} className="h-9 px-3 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium">Add</button>
          </div>
        </div>

        {/* Performance trend */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-3">6-Week Performance</p>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={performanceTrend}>
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
  const [editFounder, setEditFounder] = useState<Founder | null>(null);
  const [deleteFounderId, setDeleteFounderId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Founder>>({ name: '', role: '', color: '#3b82f6', initials: '', email: '', password: '' });

  const activeFounder = founders.find(f => f.id === currentFounder);
  const isSuperAdmin = activeFounder?.role === 'Super Admin';

  const handleSave = async () => {
    try {
      const dataToSave = { ...form };
      if (editFounder && !dataToSave.password) {
        delete dataToSave.password;
      }
      
      if (editFounder) {
        const updated = await api.put(`/founders/${editFounder.id}`, dataToSave, currentFounder);
        setFounders(founders.map(f => f.id === editFounder.id ? updated : f));
        setEditFounder(null);
      } else {
        const created = await api.post('/founders', dataToSave, currentFounder);
        setFounders([...founders, created]);
        setShowAdd(false);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving founder. Make sure you have Super Admin privileges.');
    }
  };

  const handleDelete = async () => {
    if (!deleteFounderId) return;
    if (deleteFounderId === currentFounder) {
      alert("You cannot delete yourself.");
      setDeleteFounderId(null);
      return;
    }
    
    try {
      await api.delete(`/founders/${deleteFounderId}`, currentFounder);
      setFounders(founders.filter(f => f.id !== deleteFounderId));
      if (currentFounder === deleteFounderId) {
        setCurrentFounder(founders[0]?.id || '');
      }
      setDeleteFounderId(null);
    } catch (err) {
      console.error(err);
      alert('Error deleting founder.');
    }
  };

  const openAdd = () => {
    setForm({ name: '', role: '', color: '#3b82f6', initials: '', email: '', password: '' });
    setShowAdd(true);
  };

  const openEdit = (f: Founder) => {
    setForm({ name: f.name, role: f.role, color: f.color, initials: f.initials, email: f.email || '', password: '' });
    setEditFounder(f);
  };

  const handleUpdateFounder = async (founderId: string, updatedFields: Partial<Founder>) => {
    try {
      // Optimistic update
      setFounders(prev => prev.map(f => f.id === founderId ? { ...f, ...updatedFields } : f));
      
      const updated = await api.put(`/founders/${founderId}`, updatedFields, currentFounder);
      setFounders(prev => prev.map(f => f.id === founderId ? updated : f));
    } catch (err) {
      console.error(err);
      alert('Error updating tasks/goals. Please try again.');
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
          <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all text-sm font-medium">
            + Add Founder
          </button>
        )}
      </div>

      <Modal open={showAdd || !!editFounder} onClose={() => { setShowAdd(false); setEditFounder(null); }} title={editFounder ? "Edit Founder" : "Add New Founder"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Name</label>
              <input placeholder="Name" value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Role</label>
              <input placeholder="Role" disabled={!isSuperAdmin} value={form.role || ''} onChange={e => setForm({ ...form, role: e.target.value })} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg disabled:opacity-50" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Initials (e.g. JD)</label>
              <input placeholder="Initials" value={form.initials || ''} onChange={e => setForm({ ...form, initials: e.target.value })} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Color</label>
              <input type="color" value={form.color || ''} onChange={e => setForm({ ...form, color: e.target.value })} className="h-[38px] w-full rounded-lg cursor-pointer bg-input-background border border-border p-1" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Email</label>
              <input type="email" placeholder="Email" value={form.email || ''} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Password {editFounder && '(Leave blank to keep)'}</label>
              <input type="password" placeholder={editFounder ? "New Password" : "Password"} value={form.password || ''} onChange={e => setForm({ ...form, password: e.target.value })} className="w-full px-3 py-2 bg-input-background border border-border rounded-lg" />
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <button onClick={() => { setShowAdd(false); setEditFounder(null); }} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
            <button onClick={handleSave} className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium">Save Founder</button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog 
        open={!!deleteFounderId} 
        onClose={() => setDeleteFounderId(null)} 
        onConfirm={handleDelete} 
        title="Delete Founder" 
        message="Are you sure you want to permanently delete this founder? This cannot be undone." 
        danger 
      />

      {/* Selected founder content */}
      {founders.map(f => currentFounder === f.id && (
        <FounderTab
          key={f.id}
          founder={f}
          isSuperAdmin={isSuperAdmin}
          currentLoggedInId={currentFounder}
          onEdit={() => openEdit(f)}
          onDelete={() => setDeleteFounderId(f.id)}
          onUpdate={fields => handleUpdateFounder(f.id, fields)}
        />
      ))}
    </div>
  );
}
