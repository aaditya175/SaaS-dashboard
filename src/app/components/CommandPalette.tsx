import { useEffect, useState, useRef } from 'react';
import { useApp } from '../store/appStore';
import { Search, LayoutDashboard, Users, FolderKanban, UserCircle, ClipboardCheck, Building2, DollarSign, Video, BookOpen, BarChart3, Bell, Trophy, ArrowRight } from 'lucide-react';

const COMMANDS = [
  { id: 'dashboard', label: 'Go to Dashboard', description: 'Executive overview & KPIs', icon: LayoutDashboard, group: 'Navigation' },
  { id: 'crm', label: 'Go to CRM', description: 'Lead pipeline & contacts', icon: Users, group: 'Navigation' },
  { id: 'projects', label: 'Go to Projects', description: 'Tasks & project management', icon: FolderKanban, group: 'Navigation' },
  { id: 'founders', label: 'Go to Founders', description: 'Individual dashboards', icon: UserCircle, group: 'Navigation' },
  { id: 'checkin', label: 'Submit Daily Check-in', description: "Today's standup", icon: ClipboardCheck, group: 'Navigation' },
  { id: 'clients', label: 'Go to Clients', description: 'Client management', icon: Building2, group: 'Navigation' },
  { id: 'finance', label: 'Go to Finance', description: 'Revenue & expenses', icon: DollarSign, group: 'Navigation' },
  { id: 'meetings', label: 'Go to Meetings', description: 'Schedule & notes', icon: Video, group: 'Navigation' },
  { id: 'kb', label: 'Go to Knowledge Base', description: 'SOPs & documentation', icon: BookOpen, group: 'Navigation' },
  { id: 'analytics', label: 'Go to Analytics', description: 'Reports & insights', icon: BarChart3, group: 'Navigation' },
  { id: 'notifications', label: 'Go to Notifications', description: 'Alerts & reminders', icon: Bell, group: 'Navigation' },
  { id: 'gamification', label: 'Go to Leaderboard', description: 'XP, badges & rankings', icon: Trophy, group: 'Navigation' },
];

export default function CommandPalette() {
  const { commandOpen, setCommandOpen, setCurrentPage } = useApp();
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered = query.trim() === ''
    ? COMMANDS
    : COMMANDS.filter(c => c.label.toLowerCase().includes(query.toLowerCase()) || c.description.toLowerCase().includes(query.toLowerCase()));

  useEffect(() => {
    if (commandOpen) {
      setQuery('');
      setSelected(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [commandOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandOpen(true);
      }
      if (!commandOpen) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected(s => Math.min(s + 1, filtered.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected(s => Math.max(s - 1, 0)); }
      if (e.key === 'Enter' && filtered[selected]) {
        setCurrentPage(filtered[selected].id);
        setCommandOpen(false);
      }
      if (e.key === 'Escape') setCommandOpen(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [commandOpen, filtered, selected, setCommandOpen, setCurrentPage]);

  if (!commandOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh] px-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={() => setCommandOpen(false)} />
      <div className="relative w-full max-w-xl bg-card border border-border rounded-2xl shadow-2xl shadow-black/60 overflow-hidden">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            value={query}
            onChange={e => { setQuery(e.target.value); setSelected(0); }}
            placeholder="Search pages, actions..."
            className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground text-sm outline-none"
          />
          <kbd className="text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">ESC</kbd>
        </div>

        {/* Results */}
        <div className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">No results found</p>
          ) : (
            filtered.map((cmd, i) => {
              const Icon = cmd.icon;
              return (
                <button
                  key={cmd.id}
                  onClick={() => { setCurrentPage(cmd.id); setCommandOpen(false); }}
                  onMouseEnter={() => setSelected(i)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-colors ${i === selected ? 'bg-primary/15 text-primary' : 'hover:bg-muted text-foreground'}`}
                >
                  <Icon className="w-4 h-4 flex-shrink-0 opacity-70" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{cmd.label}</p>
                    <p className="text-xs text-muted-foreground truncate">{cmd.description}</p>
                  </div>
                  {i === selected && <ArrowRight className="w-3 h-3 opacity-60 flex-shrink-0" />}
                </button>
              );
            })
          )}
        </div>

        {/* Footer hint */}
        <div className="border-t border-border px-4 py-2 flex items-center gap-4 text-[10px] text-muted-foreground">
          <span><kbd className="font-mono border border-border rounded px-1">↑↓</kbd> Navigate</span>
          <span><kbd className="font-mono border border-border rounded px-1">↵</kbd> Select</span>
          <span><kbd className="font-mono border border-border rounded px-1">ESC</kbd> Close</span>
        </div>
      </div>
    </div>
  );
}
