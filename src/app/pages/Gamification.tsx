import { FOUNDERS, formatCurrency } from '../store/appStore';
import { Trophy, Zap, Flame, Award, Star, TrendingUp, Target, Crown } from 'lucide-react';

const BADGES = [
  { id: '🏆', label: 'Top Closer', desc: 'Closed 10+ deals in a month' },
  { id: '🚀', label: 'Growth Hacker', desc: 'Generated 100+ leads in a quarter' },
  { id: '💎', label: 'Diamond Deal', desc: 'Closed a deal worth ₹5L+' },
  { id: '🔥', label: 'On Fire', desc: 'Maintained a 10+ day streak' },
  { id: '⭐', label: 'Client Star', desc: 'Received 5-star satisfaction rating' },
  { id: '🤝', label: 'Connector', desc: 'Brought in 5+ referrals' },
  { id: '💪', label: 'Grinder', desc: 'Logged 60+ hours in a week' },
  { id: '⚡', label: 'Speed Builder', desc: 'Delivered project ahead of deadline' },
  { id: '🛠️', label: 'Tech Master', desc: 'Shipped 10+ features' },
  { id: '🎯', label: 'Bullseye', desc: '100% task completion rate for a week' },
  { id: '🎨', label: 'Creative Lead', desc: 'Designed 5+ winning campaigns' },
  { id: '📊', label: 'Data Driven', desc: 'Generated 10 client reports' },
  { id: '💡', label: 'Innovator', desc: 'Proposed 3 strategic improvements' },
  { id: '💰', label: 'Revenue King', desc: 'Generated ₹10L+ in a quarter' },
  { id: '📈', label: 'Growth Master', desc: 'Grew client base by 50%' },
];

const LEVEL_NAMES = ['Newcomer', 'Apprentice', 'Associate', 'Professional', 'Expert', 'Master', 'Champion', 'Legend', 'Elite', 'Legendary'];

const RECENT_ACHIEVEMENTS = [
  { founder: 'Aryan Shah', badge: '💎', label: 'Diamond Deal', desc: 'Closed HealthFirst for ₹2.4L', time: '2 days ago', color: '#7c3aed' },
  { founder: 'Rahul Patel', badge: '⚡', label: 'Speed Builder', desc: 'Delivered Finwise system early', time: '3 days ago', color: '#10b981' },
  { founder: 'Priya Mehta', badge: '⭐', label: 'Client Star', desc: 'TechNova gave 5-star rating', time: '5 days ago', color: '#06b6d4' },
  { founder: 'Dev Sharma', badge: '📈', label: 'Growth Master', desc: 'Onboarded 2 new clients this quarter', time: '1 week ago', color: '#ef4444' },
];

function XPBar({ xp, level }: { xp: number; level: number }) {
  const baseXP = (level - 1) * 500;
  const nextXP = level * 500;
  const progress = Math.min(100, Math.round(((xp - baseXP) / (nextXP - baseXP)) * 100));
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">{xp.toLocaleString()} XP</span>
        <span className="text-muted-foreground">{nextXP.toLocaleString()} XP</span>
      </div>
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <div className="h-full rounded-full bg-gradient-to-r from-primary to-violet-400 transition-all" style={{ width: `${progress}%` }} />
      </div>
      <p className="text-[10px] text-muted-foreground text-center">{nextXP - xp} XP to Level {level + 1}</p>
    </div>
  );
}

export default function Gamification() {
  const sorted = [...FOUNDERS].sort((a, b) => b.xp - a.xp);

  return (
    <div className="p-6 space-y-6 max-w-[1600px] mx-auto">
      {/* Podium */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-b from-primary/10 to-transparent p-6">
        <div className="flex items-center gap-2 mb-6">
          <Crown className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-foreground font-display">Team Leaderboard — June 2025</h2>
        </div>
        <div className="flex items-end justify-center gap-4">
          {/* 2nd place */}
          <div className="text-center flex-1 max-w-36">
            <div className="w-14 h-14 rounded-2xl text-white text-xl font-bold flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: sorted[1].color }}>{sorted[1].initials}</div>
            <p className="font-semibold text-foreground text-sm">{sorted[1].name.split(' ')[0]}</p>
            <p className="text-xs text-muted-foreground">{sorted[1].xp.toLocaleString()} XP</p>
            <div className="mt-3 bg-card border border-border rounded-t-xl h-20 flex items-end justify-center pb-2">
              <span className="text-3xl">🥈</span>
            </div>
          </div>

          {/* 1st place */}
          <div className="text-center flex-1 max-w-44">
            <div className="relative mb-2">
              <Crown className="w-6 h-6 text-amber-400 absolute -top-4 left-1/2 -translate-x-1/2" />
              <div className="w-16 h-16 rounded-2xl text-white text-2xl font-bold flex items-center justify-center mx-auto ring-4 ring-amber-400/40" style={{ backgroundColor: sorted[0].color }}>{sorted[0].initials}</div>
            </div>
            <p className="font-bold text-foreground">{sorted[0].name.split(' ')[0]}</p>
            <p className="text-xs text-primary font-semibold">{sorted[0].xp.toLocaleString()} XP</p>
            <div className="mt-3 bg-gradient-to-b from-amber-500/20 to-card border border-amber-500/30 rounded-t-xl h-28 flex items-end justify-center pb-2">
              <span className="text-4xl">🥇</span>
            </div>
          </div>

          {/* 3rd place */}
          <div className="text-center flex-1 max-w-36">
            <div className="w-14 h-14 rounded-2xl text-white text-xl font-bold flex items-center justify-center mx-auto mb-2" style={{ backgroundColor: sorted[2].color }}>{sorted[2].initials}</div>
            <p className="font-semibold text-foreground text-sm">{sorted[2].name.split(' ')[0]}</p>
            <p className="text-xs text-muted-foreground">{sorted[2].xp.toLocaleString()} XP</p>
            <div className="mt-3 bg-card border border-border rounded-t-xl h-14 flex items-end justify-center pb-2">
              <span className="text-3xl">🥉</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Full rankings */}
        <div className="lg:col-span-2 space-y-3">
          <h3 className="text-sm font-semibold text-foreground">Full Rankings</h3>
          {sorted.map((f, i) => (
            <div key={f.id} className={`rounded-xl border p-4 flex items-center gap-4 ${i === 0 ? 'border-amber-500/30 bg-amber-500/5' : 'border-border bg-card'}`}>
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-amber-500/20 text-amber-400' : i === 1 ? 'bg-slate-500/20 text-slate-400' : i === 2 ? 'bg-orange-500/20 text-orange-400' : 'bg-muted text-muted-foreground'}`}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </div>
              <div className="w-10 h-10 rounded-xl text-white text-sm font-bold flex items-center justify-center flex-shrink-0" style={{ backgroundColor: f.color }}>{f.initials}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="font-semibold text-foreground">{f.name}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">Lv.{f.level} {LEVEL_NAMES[f.level - 1]}</span>
                </div>
                <div className="mt-1.5"><XPBar xp={f.xp} level={f.level} /></div>
              </div>
              <div className="text-right flex-shrink-0">
                <p className="text-lg font-bold text-foreground font-display">{f.score}</p>
                <p className="text-xs text-muted-foreground">Score</p>
                <p className="text-xs text-amber-400">{f.streak}🔥</p>
              </div>
              <div className="flex gap-0.5 flex-shrink-0">
                {f.badges.map((b, j) => <span key={j} className="text-base">{b}</span>)}
              </div>
            </div>
          ))}
        </div>

        {/* Recent achievements & badges */}
        <div className="space-y-4">
          {/* Recent achievements */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3"><Zap className="w-4 h-4 text-amber-400" /><p className="text-sm font-semibold text-foreground">Recent Achievements</p></div>
            <div className="space-y-3">
              {RECENT_ACHIEVEMENTS.map((a, i) => (
                <div key={i} className="flex items-start gap-2">
                  <span className="text-xl flex-shrink-0">{a.badge}</span>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs" style={{ color: a.color }}>{a.founder.split(' ')[0]}</span>
                      <span className="text-xs text-foreground">earned {a.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{a.desc}</p>
                    <p className="text-[10px] text-muted-foreground/60 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats */}
          <div className="rounded-xl border border-border bg-card p-4">
            <div className="flex items-center gap-2 mb-3"><TrendingUp className="w-4 h-4 text-primary" /><p className="text-sm font-semibold text-foreground">Team Stats</p></div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: 'Total XP', value: FOUNDERS.reduce((s, f) => s + f.xp, 0).toLocaleString() },
                { label: 'Avg Score', value: Math.round(FOUNDERS.reduce((s, f) => s + f.score, 0) / FOUNDERS.length) },
                { label: 'Longest Streak', value: `${Math.max(...FOUNDERS.map(f => f.streak))} days` },
                { label: 'Badges Earned', value: FOUNDERS.reduce((s, f) => s + f.badges.length, 0) },
              ].map(s => (
                <div key={s.label} className="rounded-lg bg-muted/50 p-2.5 text-center">
                  <p className="text-base font-bold text-foreground">{s.value}</p>
                  <p className="text-[10px] text-muted-foreground">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* All badges */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4"><Award className="w-4 h-4 text-primary" /><p className="text-sm font-semibold text-foreground">All Achievement Badges</p></div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          {BADGES.map(badge => {
            const earned = FOUNDERS.some(f => f.badges.includes(badge.id));
            return (
              <div key={badge.id} className={`rounded-xl border p-3 text-center transition-all ${earned ? 'border-primary/30 bg-primary/5' : 'border-border opacity-40'}`}>
                <p className="text-2xl mb-1">{badge.id}</p>
                <p className="text-xs font-semibold text-foreground">{badge.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{badge.desc}</p>
                {earned && <p className="text-[9px] text-primary mt-1 font-semibold">EARNED</p>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
