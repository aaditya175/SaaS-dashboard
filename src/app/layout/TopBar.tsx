import { useApp, FOUNDERS } from '../store/appStore';
import { Bell, Sun, Moon, Search, Command, Plus, Bot } from 'lucide-react';

const PAGE_TITLES: Record<string, { label: string; description: string }> = {
  dashboard: { label: 'Executive Dashboard', description: 'Your agency at a glance' },
  crm: { label: 'CRM Pipeline', description: 'Manage leads and opportunities' },
  projects: { label: 'Projects', description: 'Track work and deliverables' },
  founders: { label: 'Founder Dashboards', description: 'Individual performance & goals' },
  checkin: { label: 'Daily Check-in', description: 'Submit your daily standup' },
  clients: { label: 'Client Management', description: 'All client accounts and details' },
  finance: { label: 'Finance', description: 'Revenue, expenses, and cash flow' },
  meetings: { label: 'Meetings', description: 'Schedule and meeting notes' },
  kb: { label: 'Knowledge Base', description: 'SOPs, templates, and documentation' },
  analytics: { label: 'Analytics', description: 'Data-driven insights and reports' },
  notifications: { label: 'Notifications', description: 'Alerts, reminders, and updates' },
  gamification: { label: 'Leaderboard', description: 'Team XP, badges, and achievements' },
};

export default function TopBar() {
  const { currentPage, isDark, setIsDark, notifications, setCommandOpen, currentFounder, founders, setIsAiOpen } = useApp();
  const unread = notifications.filter(n => !n.read).length;
  const pageInfo = PAGE_TITLES[currentPage] ?? { label: 'NexGo OS', description: '' };
  const founder = founders.find(f => f.id === currentFounder) ?? founders[0] ?? { name: 'Super Admin', initials: 'SA', color: '#10b981' };

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-border bg-card/50 backdrop-blur-sm flex-shrink-0 gap-4">
      {/* Page title */}
      <div className="flex items-center gap-3 min-w-0">
        <div>
          <h1 className="text-base font-semibold text-foreground leading-none">{pageInfo.label}</h1>
          <p className="text-xs text-muted-foreground mt-0.5 leading-none">{pageInfo.description}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Search trigger */}
        <button
          onClick={() => setCommandOpen(true)}
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-muted hover:bg-accent text-muted-foreground hover:text-foreground text-xs transition-colors border border-border"
        >
          <Search className="w-3.5 h-3.5" />
          <span>Search...</span>
          <kbd className="font-mono text-[10px] opacity-60 hidden md:block">⌘K</kbd>
        </button>

        {/* Mobile search */}
        <button
          onClick={() => setCommandOpen(true)}
          className="sm:hidden w-8 h-8 rounded-lg bg-muted hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          <Search className="w-4 h-4" />
        </button>

        {/* AI Assistant Toggle */}
        <button
          onClick={() => setIsAiOpen(prev => !prev)}
          className="hidden sm:flex items-center gap-2 h-8 px-3 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary transition-colors border border-primary/20 font-medium text-xs"
        >
          <Bot className="w-4 h-4" />
          <span>Ask AI</span>
        </button>
        <button
          onClick={() => setIsAiOpen(prev => !prev)}
          className="sm:hidden w-8 h-8 rounded-lg bg-primary/10 hover:bg-primary/20 flex items-center justify-center text-primary transition-colors"
        >
          <Bot className="w-4 h-4" />
        </button>

        {/* Notifications */}
        <button className="relative w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
          <Bell className="w-4 h-4" />
          {unread > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-500 ring-2 ring-card" />
          )}
        </button>

        {/* Theme toggle */}
        <button
          onClick={() => setIsDark(!isDark)}
          className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Avatar */}
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer ring-2 ring-primary/20 hover:ring-primary/50 transition-all"
          style={{ backgroundColor: founder.color }}
        >
          {founder.initials}
        </div>
      </div>
    </header>
  );
}
