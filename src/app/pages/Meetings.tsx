import { useState } from 'react';
import { useApp, Meeting } from '../store/appStore';
import Modal from '../components/Modal';
import { ConfirmDialog } from '../components/Modal';
import { Plus, Video, Users, Clock, MapPin, Check, Edit2, Trash2, ExternalLink, ChevronDown } from 'lucide-react';

const TYPE_COLORS: Record<string, string> = {
  internal: 'bg-blue-500/15 text-blue-400',
  client: 'bg-violet-500/15 text-violet-400',
  sales: 'bg-emerald-500/15 text-emerald-400',
};

function MeetingForm({ meeting, onSave, onClose }: { meeting: Meeting | null; onSave: (m: Meeting) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Meeting>>(meeting ?? {
    title: '', participants: [], date: '', time: '', duration: 60, type: 'internal', notes: '', actionItems: [], location: '',
  });
  const [participantInput, setParticipantInput] = useState(meeting?.participants.join(', ') ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title?.trim()) e.title = 'Title required';
    if (!form.date) e.date = 'Date required';
    if (!form.time) e.time = 'Time required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const f = (field: keyof Meeting) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: field === 'duration' ? Number(e.target.value) : e.target.value }));

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: form.id ?? `m${Date.now()}`,
      actionItems: [],
      ...form,
      participants: participantInput.split(',').map(s => s.trim()).filter(Boolean),
    } as Meeting);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Meeting Title *</label>
        <input value={form.title ?? ''} onChange={f('title')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
        {errors.title && <p className="text-xs text-red-400 mt-0.5">{errors.title}</p>}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Date *</label>
          <input value={form.date ?? ''} onChange={f('date')} type="date" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
          {errors.date && <p className="text-xs text-red-400 mt-0.5">{errors.date}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Time *</label>
          <input value={form.time ?? ''} onChange={f('time')} type="time" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Duration (min)</label>
          <select value={form.duration} onChange={f('duration')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none">
            {[15, 30, 45, 60, 90, 120].map(d => <option key={d} value={d}>{d} min</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Type</label>
          <select value={form.type} onChange={f('type')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none">
            <option value="internal">Internal</option>
            <option value="client">Client</option>
            <option value="sales">Sales</option>
          </select>
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Participants (comma-separated)</label>
          <input value={participantInput} onChange={e => setParticipantInput(e.target.value)} placeholder="Aryan Shah, Priya Mehta, Vikram Nair" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Location / Link</label>
          <input value={form.location ?? ''} onChange={f('location')} placeholder="Google Meet, Office, Zoom..." className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Notes / Agenda</label>
          <textarea value={form.notes ?? ''} onChange={f('notes')} rows={3} className="w-full px-3 py-2 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none resize-none" />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg font-medium">{meeting ? 'Update' : 'Schedule Meeting'}</button>
      </div>
    </div>
  );
}

function MeetingCard({ meeting, onEdit, onDelete }: { meeting: Meeting; onEdit: () => void; onDelete: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const { setMeetings } = useApp();
  const isPast = new Date(`${meeting.date}T${meeting.time}`) < new Date();

  const toggleActionItem = (index: number) => {
    setMeetings(prev => prev.map(m => m.id === meeting.id ? {
      ...m, actionItems: m.actionItems.map((a, i) => i === index ? { ...a, done: !a.done } : a)
    } : m));
  };

  return (
    <div className={`rounded-xl border bg-card transition-all ${isPast ? 'border-border opacity-75' : 'border-border hover:border-primary/30'}`}>
      <div className="p-4 flex items-start gap-4 cursor-pointer" onClick={() => setExpanded(e => !e)}>
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${isPast ? 'bg-muted' : 'bg-primary/10'}`}>
          <Video className={`w-5 h-5 ${isPast ? 'text-muted-foreground' : 'text-primary'}`} />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-foreground text-sm">{meeting.title}</p>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-muted-foreground">
                <span>{meeting.date} at {meeting.time}</span>
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{meeting.duration}m</span>
                {meeting.location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{meeting.location}</span>}
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${TYPE_COLORS[meeting.type]}`}>{meeting.type}</span>
              <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${expanded ? 'rotate-180' : ''}`} />
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2">
            {meeting.participants.map((p, i) => (
              <span key={i} className="w-6 h-6 rounded-full bg-primary/20 text-[9px] font-bold text-primary flex items-center justify-center -ml-1 first:ml-0 border border-card">
                {p.split(' ').map(n => n[0]).join('')}
              </span>
            ))}
            <span className="text-xs text-muted-foreground ml-1">{meeting.participants.join(', ')}</span>
          </div>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 space-y-3 border-t border-border pt-3">
          {meeting.notes && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{meeting.notes}</p>
            </div>
          )}
          {meeting.actionItems.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-2">Action Items</p>
              <div className="space-y-1.5">
                {meeting.actionItems.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <button onClick={() => toggleActionItem(i)} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center flex-shrink-0 transition-colors ${item.done ? 'bg-primary border-primary' : 'border-border hover:border-primary'}`}>
                      {item.done && <Check className="w-3 h-3 text-white" />}
                    </button>
                    <span className={`text-sm flex-1 ${item.done ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{item.text}</span>
                    <span className="text-xs text-muted-foreground">{item.assignee}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex items-center gap-2 pt-1">
            <button onClick={onEdit} className="flex items-center gap-1 text-xs text-primary hover:underline"><Edit2 className="w-3 h-3" /> Edit</button>
            <span className="text-border">·</span>
            <button onClick={onDelete} className="flex items-center gap-1 text-xs text-red-400 hover:underline"><Trash2 className="w-3 h-3" /> Delete</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Meetings() {
  const { meetings, setMeetings } = useApp();
  const [editMeeting, setEditMeeting] = useState<Meeting | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<'all' | Meeting['type']>('all');

  const now = new Date();
  const upcoming = meetings.filter(m => new Date(`${m.date}T${m.time}`) >= now && (filterType === 'all' || m.type === filterType))
    .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`));
  const past = meetings.filter(m => new Date(`${m.date}T${m.time}`) < now && (filterType === 'all' || m.type === filterType))
    .sort((a, b) => `${b.date}T${b.time}`.localeCompare(`${a.date}T${a.time}`));

  const handleSave = (m: Meeting) => {
    setMeetings(prev => {
      const idx = prev.findIndex(x => x.id === m.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = m; return n; }
      return [...prev, m];
    });
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          {(['all', 'internal', 'client', 'sales'] as const).map(t => (
            <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterType === t ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{t}</button>
          ))}
        </div>
        <button onClick={() => setEditMeeting(null)} className="h-9 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium flex items-center gap-2">
          <Plus className="w-4 h-4" /> Schedule Meeting
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Upcoming', value: upcoming.length, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'This Week', value: meetings.filter(m => { const d = new Date(m.date); const now = new Date(); const week = new Date(); week.setDate(now.getDate() + 7); return d >= now && d <= week; }).length, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
          { label: 'Total This Month', value: meetings.filter(m => m.date.startsWith('2025-06')).length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><Video className={`w-5 h-5 ${s.color}`} /></div>
            <div><p className="text-2xl font-bold text-foreground font-display">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Upcoming */}
      {upcoming.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-foreground mb-3">Upcoming Meetings ({upcoming.length})</p>
          <div className="space-y-3">
            {upcoming.map(m => (
              <MeetingCard key={m.id} meeting={m} onEdit={() => setEditMeeting(m)} onDelete={() => setDeletingId(m.id)} />
            ))}
          </div>
        </div>
      )}

      {/* Past */}
      {past.length > 0 && (
        <div>
          <p className="text-sm font-semibold text-muted-foreground mb-3">Past Meetings ({past.length})</p>
          <div className="space-y-3">
            {past.map(m => (
              <MeetingCard key={m.id} meeting={m} onEdit={() => setEditMeeting(m)} onDelete={() => setDeletingId(m.id)} />
            ))}
          </div>
        </div>
      )}

      {meetings.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-16 text-center">
          <Video className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">No meetings scheduled</p>
          <button onClick={() => setEditMeeting(null)} className="mt-3 text-sm text-primary hover:underline">Schedule your first meeting</button>
        </div>
      )}

      {editMeeting !== undefined && (
        <Modal open title={editMeeting ? 'Edit Meeting' : 'Schedule Meeting'} onClose={() => setEditMeeting(undefined)} size="md">
          <MeetingForm meeting={editMeeting} onSave={handleSave} onClose={() => setEditMeeting(undefined)} />
        </Modal>
      )}
      <ConfirmDialog open={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={() => deletingId && setMeetings(m => m.filter(x => x.id !== deletingId))} title="Cancel Meeting" message="Remove this meeting from your calendar?" danger />
    </div>
  );
}
