import { useApp, FOUNDERS } from '../store/appStore';
import {
  LayoutDashboard, Users, FolderKanban, UserCircle, ClipboardCheck,
  Building2, DollarSign, Video, BookOpen, BarChart3, Bell, Trophy,
  ChevronRight, Zap, Settings, LogOut, Command
} from 'lucide-react';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, group: 'main' },
  { id: 'crm', label: 'CRM', icon: Users, group: 'main' },
  { id: 'projects', label: 'Projects', icon: FolderKanban, group: 'main' },
  { id: 'founders', label: 'Founders', icon: UserCircle, group: 'main' },
  { id: 'checkin', label: 'Daily Check-in', icon: ClipboardCheck, group: 'main' },
  { id: 'clients', label: 'Clients', icon: Building2, group: 'ops' },
  { id: 'finance', label: 'Finance', icon: DollarSign, group: 'ops' },
  { id: 'meetings', label: 'Meetings', icon: Video, group: 'ops' },
  { id: 'kb', label: 'Knowledge Base', icon: BookOpen, group: 'ops' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, group: 'insights' },
  { id: 'notifications', label: 'Notifications', icon: Bell, group: 'insights' },
  { id: 'gamification', label: 'Leaderboard', icon: Trophy, group: 'insights' },
];

const GROUP_LABELS: Record<string, string> = {
  main: 'Workspace',
  ops: 'Operations',
  insights: 'Insights',
};

export default function Sidebar({ collapsed, onToggle }: { collapsed: boolean; onToggle: () => void }) {
  const { currentPage, setCurrentPage, notifications, setCommandOpen, currentFounder } = useApp();
  const unread = notifications.filter(n => !n.read).length;
  const founder = FOUNDERS.find(f => f.id === currentFounder) ?? FOUNDERS[0];

  const groups = ['main', 'ops', 'insights'];

  return (
    <aside
      className={`
        flex flex-col h-full bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-16' : 'w-60'}
        flex-shrink-0
      `}
    >
      {/* Logo */}
      <div className={`flex items-center h-14 px-4 border-b border-[var(--sidebar-border)] gap-3 ${collapsed ? 'justify-center' : ''}`}>
        <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center flex-shrink-0">
          <Zap className="w-4 h-4 text-white" />
        </div>
        {!collapsed && (
          <div className="min-w-0">
            <p className="text-sm font-bold text-[var(--sidebar-foreground)] font-display truncate">NexGo OS</p>
            <p className="text-xs text-[var(--muted-foreground)] truncate">Agency Operating System</p>
          </div>
        )}
      </div>

      {/* Command Palette Trigger */}
      {!collapsed && (
        <button
          onClick={() => setCommandOpen(true)}
          className="mx-3 mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--sidebar-accent)] hover:bg-[var(--accent)] transition-colors text-[var(--muted-foreground)] hover:text-[var(--sidebar-foreground)] text-xs"
        >
          <Command className="w-3 h-3" />
          <span className="flex-1 text-left">Quick search...</span>
          <kbd className="font-mono text-[10px] opacity-60">⌘K</kbd>
        </button>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-2 pt-2 pb-2 space-y-1">
        {groups.map(group => {
          const items = NAV_ITEMS.filter(i => i.group === group);
          return (
            <div key={group} className="mb-1">
              {!collapsed && (
                <p className="text-[10px] font-semibold uppercase tracking-widest text-[var(--muted-foreground)] px-3 py-1.5">
                  {GROUP_LABELS[group]}
                </p>
              )}
              {items.map(item => {
                const active = currentPage === item.id;
                const Icon = item.icon;
                const badge = item.id === 'notifications' && unread > 0 ? unread : null;

                return (
                  <button
                    key={item.id}
                    onClick={() => setCurrentPage(item.id)}
                    title={collapsed ? item.label : undefined}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-150
                      ${collapsed ? 'justify-center' : ''}
                      ${active
                        ? 'bg-primary/15 text-primary font-semibold'
                        : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]'
                      }
                    `}
                  >
                    <div className="relative flex-shrink-0">
                      <Icon className={`w-4 h-4 ${active ? 'text-primary' : ''}`} />
                      {badge && (
                        <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center">
                          {badge > 9 ? '9+' : badge}
                        </span>
                      )}
                    </div>
                    {!collapsed && (
                      <>
                        <span className="flex-1 text-left truncate">{item.label}</span>
                        {active && <ChevronRight className="w-3 h-3 opacity-50" />}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-[var(--sidebar-border)] p-2">
        {!collapsed && (
          <div className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[var(--sidebar-accent)] cursor-pointer transition-colors mb-1">
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0"
              style={{ backgroundColor: founder.color }}
            >
              {founder.initials}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-[var(--sidebar-foreground)] truncate">{founder.name}</p>
              <p className="text-[10px] text-[var(--muted-foreground)] truncate">{founder.role}</p>
            </div>
            <Settings className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />
          </div>
        )}
        <button
          onClick={onToggle}
          className={`w-full flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs text-[var(--muted-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-foreground)] transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <ChevronRight className={`w-3.5 h-3.5 transition-transform duration-300 ${collapsed ? '' : 'rotate-180'}`} />
          {!collapsed && <span>Collapse</span>}
        </button>
      </div>
    </aside>
  );
}
