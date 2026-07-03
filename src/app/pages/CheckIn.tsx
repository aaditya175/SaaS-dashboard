import { useState } from 'react';
import { useApp, CheckIn, FOUNDERS, MoodScore } from '../store/appStore';
import { api } from '../../lib/api';
import { CheckCircle, Clock, Smile, Frown, Meh, AlertCircle, Trophy, Plus, X, Bot, Sparkles } from 'lucide-react';

const MOOD_OPTIONS: { score: MoodScore; label: string; icon: any; color: string }[] = [
  { score: 1, label: 'Rough', icon: Frown, color: 'text-red-400 border-red-400/30 bg-red-500/10' },
  { score: 2, label: 'Tired', icon: Meh, color: 'text-orange-400 border-orange-400/30 bg-orange-500/10' },
  { score: 3, label: 'Okay', icon: Meh, color: 'text-amber-400 border-amber-400/30 bg-amber-500/10' },
  { score: 4, label: 'Good', icon: Smile, color: 'text-emerald-400 border-emerald-400/30 bg-emerald-500/10' },
  { score: 5, label: 'Amazing', icon: Trophy, color: 'text-violet-400 border-violet-400/30 bg-violet-500/10' },
];

function ListInput({ items, onChange, placeholder }: { items: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState('');

  const add = () => {
    if (draft.trim()) { onChange([...items, draft.trim()]); setDraft(''); }
  };

  return (
    <div className="space-y-2">
      <div className="space-y-1.5">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 bg-muted/50 rounded-lg px-3 py-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
            <span className="text-sm text-foreground flex-1">{item}</span>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} className="text-muted-foreground hover:text-red-400 transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          onBlur={add}
          placeholder={placeholder}
          className="flex-1 h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
        />
        <button onClick={add} className="h-9 w-9 bg-primary/10 hover:bg-primary/20 text-primary rounded-lg flex items-center justify-center transition-colors">
          <Plus className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function CheckInPage() {
  const { checkIns, setCheckIns, currentFounder, founders } = useApp();
  const founder = founders.find(f => f.id === currentFounder) ?? { name: 'Super Admin', initials: 'SA', color: '#10b981', role: 'Super Admin', streak: 0 };

  const today = new Date().toISOString().split('T')[0];
  const todayCheckIn = checkIns.find(c => (c.founderId === currentFounder || c.founder === founder.name) && c.date === today);

  const [view, setView] = useState<'mine' | 'team'>('mine');
  const [isDrafting, setIsDrafting] = useState(false);

  const [form, setForm] = useState({
    completed: [] as string[],
    workingOn: [] as string[],
    blockers: '',
    hoursWorked: 8,
    mood: 4 as MoodScore,
    win: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (form.completed.length === 0) e.completed = 'Add at least one completed task';
    if (form.workingOn.length === 0) e.workingOn = 'Add at least one upcoming task';
    if (!form.win.trim()) e.win = 'Share your biggest win';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const handleAutoDraft = async () => {
    setIsDrafting(true);
    try {
      const res = await api.post('/ai/draft-checkin', {}, currentFounder);
      if (res && res.draft) {
        const lines = res.draft.split('\n')
          .map((l: string) => l.trim().replace(/^[\*\-]\s*/, ''))
          .filter(Boolean);
        setForm(p => ({ ...p, completed: [...p.completed, ...lines] }));
      }
    } catch (err) {
      console.error(err);
      alert('Failed to generate draft.');
    } finally {
      setIsDrafting(false);
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    try {
      const checkInPayload = {
        date: today,
        ...form,
      };
      const created = await api.post('/checkins', checkInPayload, currentFounder);
      
      setCheckIns(prev => [...prev, created]);
      setSubmitted(true);
      setView('team');
    } catch (err) {
      console.error(err);
    }
  };

  const teamCheckInsToday = checkIns.filter(c => c.date === today).sort((a, b) => b.createdAt ? b.createdAt.localeCompare(a.createdAt || '') : 0);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between border-b border-border pb-4">
        <h1 className="text-2xl font-bold font-display text-foreground flex items-center gap-2">
          <CheckCircle className="w-6 h-6 text-primary" />
          Daily Check-ins
        </h1>
        <div className="flex bg-muted/50 p-1 rounded-lg">
          <button 
            onClick={() => setView('mine')} 
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${view === 'mine' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            My Check-in
          </button>
          <button 
            onClick={() => setView('team')} 
            className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-all ${view === 'team' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
          >
            Team Feed
          </button>
        </div>
      </div>

      {view === 'team' && (
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-foreground">Today's Team Updates</h2>
          {teamCheckInsToday.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-border rounded-xl">
              <p className="text-muted-foreground text-sm">No one has checked in yet today.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {teamCheckInsToday.map(ci => {
                const fData = founders.find(f => f.name === ci.founder) || founders[0] || { initials: '?', color: '#ccc' };
                return (
                  <div key={ci.id} className="rounded-xl border border-border bg-card p-5 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg text-white font-bold text-sm flex items-center justify-center" style={{ backgroundColor: fData.color }}>
                        {fData.initials}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-foreground">{ci.founder}</p>
                        <p className="text-[10px] text-muted-foreground">{ci.hoursWorked}h worked · {MOOD_OPTIONS.find(m => m.score === ci.mood)?.label} mood</p>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-xs font-semibold text-muted-foreground mb-1 uppercase tracking-wider">Completed</p>
                      <ul className="space-y-1">
                        {ci.completed.map((t, i) => (
                          <li key={i} className="text-sm text-foreground flex gap-2"><span className="text-primary">•</span> <span>{t}</span></li>
                        ))}
                      </ul>
                    </div>

                    {ci.win && (
                      <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-2.5">
                        <p className="text-xs text-amber-500 font-bold">🏆 Biggest Win</p>
                        <p className="text-sm text-foreground mt-0.5">{ci.win}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {view === 'mine' && (
        <>
          {(submitted || todayCheckIn) ? (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center space-y-3">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-7 h-7 text-emerald-400" />
                </div>
                <h2 className="text-xl font-bold text-foreground font-display">Check-in submitted! 🎉</h2>
                <p className="text-sm text-muted-foreground">Great job staying accountable, {founder.name.split(' ')[0]}. Keep the streak alive!</p>
                <div className="inline-flex items-center gap-1.5 text-sm font-semibold text-amber-400">🔥 Day streak extended!</div>
              </div>
            </div>
          ) : (
            <div className="max-w-2xl mx-auto space-y-6">
              <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary/10 to-transparent p-5 flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl text-white font-bold text-lg flex items-center justify-center" style={{ backgroundColor: founder.color }}>
                  {founder.initials}
                </div>
                <div>
                  <p className="text-xs text-primary font-semibold uppercase tracking-widest">{today}</p>
                  <h2 className="text-lg font-bold text-foreground font-display">{founder.name}'s Daily Check-in</h2>
                  <p className="text-xs text-muted-foreground">{founder.role} · {founder.streak} day streak 🔥</p>
                </div>
              </div>

              <div className="space-y-5 bg-card border border-border p-5 rounded-xl shadow-sm">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <label className="block text-sm font-semibold text-foreground">✅ What did you complete today?</label>
                      <p className="text-xs text-muted-foreground">List your wins and completed tasks</p>
                    </div>
                    <button 
                      onClick={handleAutoDraft} 
                      disabled={isDrafting}
                      className="flex items-center gap-1.5 bg-violet-500/10 hover:bg-violet-500/20 text-violet-400 px-3 py-1.5 rounded-lg text-xs font-bold border border-violet-500/30 transition-all disabled:opacity-50"
                    >
                      {isDrafting ? <Clock className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      {isDrafting ? 'Drafting...' : 'Auto-Draft with AI'}
                    </button>
                  </div>
                  <ListInput items={form.completed} onChange={v => setForm(p => ({ ...p, completed: v }))} placeholder="Closed the Finwise deal..." />
                  {errors.completed && <p className="text-xs text-red-400 mt-1">{errors.completed}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">🚀 What are you working on next?</label>
                  <p className="text-xs text-muted-foreground mb-2">Tomorrow's priorities</p>
                  <ListInput items={form.workingOn} onChange={v => setForm(p => ({ ...p, workingOn: v }))} placeholder="Send HealthFirst onboarding email..." />
                  {errors.workingOn && <p className="text-xs text-red-400 mt-1">{errors.workingOn}</p>}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">🚧 Any blockers?</label>
                  <textarea
                    value={form.blockers}
                    onChange={e => setForm(p => ({ ...p, blockers: e.target.value }))}
                    rows={2}
                    placeholder="Waiting on client approval for designs..."
                    className="w-full px-3 py-2.5 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">⏰ Hours worked today</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="range" min={1} max={14} value={form.hoursWorked}
                        onChange={e => setForm(p => ({ ...p, hoursWorked: Number(e.target.value) }))}
                        className="flex-1 accent-primary"
                      />
                      <span className="text-sm font-bold text-foreground w-8 text-right">{form.hoursWorked}h</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">😊 Mood today</label>
                    <div className="flex items-center gap-2">
                      {MOOD_OPTIONS.map(m => {
                        const Icon = m.icon;
                        return (
                          <button key={m.score} onClick={() => setForm(p => ({ ...p, mood: m.score }))}
                            className={`flex-1 py-2 rounded-lg border text-center transition-all ${form.mood === m.score ? m.color : 'border-border text-muted-foreground hover:bg-muted'}`}
                          >
                            <Icon className="w-4 h-4 mx-auto" />
                            <p className="text-[9px] mt-0.5">{m.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-1">🏆 Biggest win of the day</label>
                  <input
                    value={form.win}
                    onChange={e => setForm(p => ({ ...p, win: e.target.value }))}
                    placeholder="Closed the Finwise deal for ₹3.2L!"
                    className="w-full h-10 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
                  />
                  {errors.win && <p className="text-xs text-red-400 mt-1">{errors.win}</p>}
                </div>

                <button onClick={handleSubmit} className="w-full h-11 bg-primary hover:bg-primary/90 text-white rounded-xl font-semibold text-sm transition-colors mt-2">
                  Submit Check-in 🚀
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
