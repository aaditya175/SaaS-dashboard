import { useApp, Notification } from '../store/appStore';
import { api } from '../../lib/api';
import { Bell, CheckCheck, Trash2, Clock, DollarSign, Target, Video, ClipboardCheck, CheckSquare, AlertTriangle } from 'lucide-react';

const TYPE_CONFIG: Record<Notification['type'], { icon: any; color: string; bg: string; label: string }> = {
  follow_up: { icon: Clock, color: 'text-amber-400', bg: 'bg-amber-500/10', label: 'Follow-up' },
  invoice: { icon: DollarSign, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Invoice' },
  deadline: { icon: Target, color: 'text-orange-400', bg: 'bg-orange-500/10', label: 'Deadline' },
  meeting: { icon: Video, color: 'text-violet-400', bg: 'bg-violet-500/10', label: 'Meeting' },
  checkin: { icon: ClipboardCheck, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Check-in' },
  task: { icon: CheckSquare, color: 'text-emerald-400', bg: 'bg-emerald-500/10', label: 'Task' },
};

const PRIORITY_BADGE: Record<string, string> = {
  high: 'bg-red-500/15 text-red-400',
  medium: 'bg-amber-500/15 text-amber-400',
  low: 'bg-muted text-muted-foreground',
};

function formatTime(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export default function Notifications() {
  const { notifications, setNotifications, currentFounder } = useApp();

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`, {}, currentFounder);
      setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
    } catch (err) {
      console.error(err);
    }
  };

  const markAllRead = async () => {
    try {
      await api.put('/notifications/read-all', {}, currentFounder);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    } catch (err) {
      console.error(err);
    }
  };
  const deleteNotif = (id: string) => setNotifications(prev => prev.filter(n => n.id !== id));
  const clearAll = () => setNotifications([]);

  const unread = notifications.filter(n => !n.read);
  const read = notifications.filter(n => n.read);

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="font-semibold text-foreground">{unread.length} unread notifications</p>
            <p className="text-xs text-muted-foreground">{notifications.length} total</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {unread.length > 0 && (
            <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
              <CheckCheck className="w-3.5 h-3.5" /> Mark all read
            </button>
          )}
          {notifications.length > 0 && (
            <button onClick={clearAll} className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-red-400 transition-colors">
              <Trash2 className="w-3.5 h-3.5" /> Clear all
            </button>
          )}
        </div>
      </div>

      {/* Unread */}
      {unread.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">New</p>
          {unread.map(n => {
            const config = TYPE_CONFIG[n.type];
            const Icon = config.icon;
            return (
              <div key={n.id} className="rounded-xl border border-primary/15 bg-primary/5 p-4 flex items-start gap-3 group">
                <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-0.5">
                        <p className="text-sm font-semibold text-foreground">{n.title}</p>
                        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full uppercase ${PRIORITY_BADGE[n.priority]}`}>{n.priority}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{formatTime(n.createdAt)}</p>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                      <button onClick={() => markRead(n.id)} className="w-6 h-6 rounded-md hover:bg-primary/20 flex items-center justify-center text-primary" title="Mark read"><CheckCheck className="w-3 h-3" /></button>
                      <button onClick={() => deleteNotif(n.id)} className="w-6 h-6 rounded-md hover:bg-red-500/10 flex items-center justify-center text-red-400" title="Delete"><Trash2 className="w-3 h-3" /></button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Read */}
      {read.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Earlier</p>
          {read.map(n => {
            const config = TYPE_CONFIG[n.type];
            const Icon = config.icon;
            return (
              <div key={n.id} className="rounded-xl border border-border bg-card p-4 flex items-start gap-3 group opacity-60 hover:opacity-100 transition-opacity">
                <div className={`w-9 h-9 rounded-xl ${config.bg} flex items-center justify-center flex-shrink-0`}>
                  <Icon className={`w-4.5 h-4.5 ${config.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-foreground">{n.title}</p>
                      <p className="text-xs text-muted-foreground">{n.message}</p>
                      <p className="text-[10px] text-muted-foreground/60 mt-1">{formatTime(n.createdAt)}</p>
                    </div>
                    <button onClick={() => deleteNotif(n.id)} className="w-6 h-6 rounded-md hover:bg-red-500/10 flex items-center justify-center text-muted-foreground hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all">
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {notifications.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <Bell className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">All caught up! No notifications.</p>
        </div>
      )}
    </div>
  );
}
