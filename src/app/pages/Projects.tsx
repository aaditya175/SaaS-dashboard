import { useState, useEffect } from 'react';
import { useApp, Project, ProjectStatus, Priority, Task, formatCurrency, getStatusColor, getPriorityColor } from '../store/appStore';
import { api } from '../../lib/api';
import Modal from '../components/Modal';
import { ConfirmDialog } from '../components/Modal';
import Badge from '../components/Badge';
import { Plus, Search, LayoutGrid, List, Edit2, Trash2, ChevronRight, Calendar, Users, DollarSign, CheckCircle, Clock, AlertCircle, Check, X, Github, GitCommit } from 'lucide-react';

const STATUS_LABELS: Record<ProjectStatus, string> = {
  planning: 'Planning', in_progress: 'In Progress', review: 'Review', completed: 'Completed', on_hold: 'On Hold'
};
const PRIORITY_LABELS: Record<Priority, string> = {
  low: 'Low', medium: 'Medium', high: 'High', critical: 'Critical'
};

function ProjectCard({ project, onEdit, onDelete }: { project: Project; onEdit: (p: Project) => void; onDelete: (id: string) => void }) {
  const [commits, setCommits] = useState<any[]>([]);
  const [loadingCommits, setLoadingCommits] = useState(false);

  useEffect(() => {
    if (project.githubRepo) {
      setLoadingCommits(true);
      fetch(`https://api.github.com/repos/${project.githubRepo}/commits?per_page=3`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) setCommits(data);
        })
        .catch(console.error)
        .finally(() => setLoadingCommits(false));
    }
  }, [project.githubRepo]);

  const todoCount = project.tasks.filter(t => t.status === 'todo').length;
  const doneCount = project.tasks.filter(t => t.status === 'done').length;
  const totalTasks = project.tasks.length;
  const isOverdue = new Date(project.deadline) < new Date() && project.status !== 'completed';

  return (
    <div className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all group flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm leading-snug truncate">{project.name}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{project.client}</p>
          {project.updatedBy && <p className="text-[10px] text-muted-foreground/60">by {project.updatedBy}</p>}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button onClick={() => onEdit(project)} className="w-7 h-7 rounded-lg hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
          <button onClick={() => onDelete(project.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusColor(project.status)}`}>{STATUS_LABELS[project.status]}</span>
        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getPriorityColor(project.priority)}`}>{PRIORITY_LABELS[project.priority]}</span>
        {isOverdue && <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-red-500/15 text-red-400">Overdue</span>}
      </div>

      {/* Progress */}
      <div>
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-muted-foreground">Progress</span>
          <span className="font-semibold text-foreground">{project.progress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${project.progress}%`, backgroundColor: project.progress === 100 ? '#10b981' : '#7c3aed' }}
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="font-bold text-foreground">{formatCurrency(project.budget)}</p>
          <p className="text-muted-foreground">Budget</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className="font-bold text-foreground">{totalTasks}</p>
          <p className="text-muted-foreground">Tasks</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-2">
          <p className={`font-bold ${isOverdue ? 'text-red-400' : 'text-foreground'}`}>{project.deadline}</p>
          <p className="text-muted-foreground">Due</p>
        </div>
      </div>

      {/* Assignees & GitHub */}
      <div className="flex items-center justify-between mt-auto pt-2 border-t border-border/50">
        <div className="flex items-center gap-2">
          <div className="flex -space-x-1.5">
            {project.assignees.slice(0, 3).map((a, i) => (
              <div key={i} className="w-6 h-6 rounded-full bg-primary/20 border-2 border-card flex items-center justify-center text-[9px] font-bold text-primary">
                {a.split(' ').map(n => n[0]).join('')}
              </div>
            ))}
            {project.assignees.length > 3 && (
              <div className="w-6 h-6 rounded-full bg-muted border-2 border-card flex items-center justify-center text-[9px] text-muted-foreground">+{project.assignees.length - 3}</div>
            )}
          </div>
        </div>
        
        {project.githubRepo && (
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/50 px-2 py-1 rounded-md">
            <Github className="w-3.5 h-3.5" />
            <span className="font-medium truncate max-w-[100px]">{project.githubRepo.split('/')[1]}</span>
          </div>
        )}
      </div>

      {/* GitHub Commits Preview */}
      {project.githubRepo && commits.length > 0 && (
        <div className="mt-2 space-y-2 bg-input-background/50 p-2.5 rounded-lg border border-border/50">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 mb-1.5"><GitCommit className="w-3 h-3" /> Recent Commits</p>
          {commits.map(c => (
            <div key={c.sha} className="flex flex-col gap-0.5">
              <a href={c.html_url} target="_blank" rel="noreferrer" className="text-xs text-foreground hover:text-primary transition-colors line-clamp-1 font-medium">{c.commit.message.split('\n')[0]}</a>
              <span className="text-[10px] text-muted-foreground">{c.commit.author.name} • {new Date(c.commit.author.date).toLocaleDateString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectForm({ project, onSave, onClose }: { project: Project | null; onSave: (p: Project) => void; onClose: () => void }) {
  const { clients, founders } = useApp();
  const [form, setForm] = useState<Partial<Project>>(project ?? {
    name: '', client: '', status: 'planning', priority: 'medium', assignees: [], progress: 0,
    startDate: new Date().toISOString().split('T')[0], deadline: '', description: '', budget: 0, spent: 0, tasks: []
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = 'Name required';
    if (!form.client?.trim()) e.client = 'Client required';
    if (!form.deadline) e.deadline = 'Deadline required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const f = (field: keyof Project) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: ['budget', 'spent', 'progress'].includes(field) ? Number(e.target.value) : e.target.value }));

  const handleAssignees = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const vals = Array.from(e.target.selectedOptions).map(o => o.value);
    setForm(p => ({ ...p, assignees: vals }));
  };

  // Assignee checkboxes
  const toggleAssignee = (name: string) => {
    setForm(p => {
      const current = p.assignees || [];
      return { ...p, assignees: current.includes(name) ? current.filter(a => a !== name) : [...current, name] };
    });
  };

  const addTask = () => {
    setForm(p => {
      const newTasks = [...(p.tasks || []), { id: Date.now().toString(), title: '', status: 'todo' as const, priority: 'medium' as const, assignee: '', dueDate: '', projectId: p.id || '' }];
      const progress = Math.round((newTasks.filter(t => t.status === 'done').length / newTasks.length) * 100);
      return { ...p, tasks: newTasks, progress };
    });
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setForm(p => {
      const newTasks = (p.tasks || []).map(t => t.id === id ? { ...t, ...updates } : t);
      const progress = newTasks.length ? Math.round((newTasks.filter(t => t.status === 'done').length / newTasks.length) * 100) : (p.progress || 0);
      return { ...p, tasks: newTasks, progress };
    });
  };

  const removeTask = (id: string) => {
    setForm(p => {
      const newTasks = (p.tasks || []).filter(t => t.id !== id);
      const progress = newTasks.length ? Math.round((newTasks.filter(t => t.status === 'done').length / newTasks.length) * 100) : (p.progress || 0);
      return { ...p, tasks: newTasks, progress };
    });
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form, tasks: form.tasks || [] } as Project);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Project Name *</label>
          <input value={form.name ?? ''} onChange={f('name')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          {errors.name && <p className="text-xs text-red-400 mt-0.5">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Client *</label>
          <select value={form.client ?? ''} onChange={f('client')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
            <option value="">Select client...</option>
            {clients.map(c => <option key={c.id} value={c.company}>{c.company} — {c.name}</option>)}
          </select>
          {errors.client && <p className="text-xs text-red-400 mt-0.5">{errors.client}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Status</label>
          <select value={form.status} onChange={f('status')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none">
            {(['planning', 'in_progress', 'review', 'completed', 'on_hold'] as ProjectStatus[]).map(s => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Priority</label>
          <select value={form.priority} onChange={f('priority')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none">
            {(['low', 'medium', 'high', 'critical'] as Priority[]).map(p => <option key={p} value={p}>{PRIORITY_LABELS[p]}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Budget (₹)</label>
          <input value={form.budget ?? 0} onChange={f('budget')} type="number" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Start Date</label>
          <input value={form.startDate ?? ''} onChange={f('startDate')} type="date" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Deadline *</label>
          <input value={form.deadline ?? ''} onChange={f('deadline')} type="date" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
          {errors.deadline && <p className="text-xs text-red-400 mt-0.5">{errors.deadline}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1 flex items-center gap-2">
            Progress (%)
            {(form.tasks?.length || 0) > 0 && <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.5 rounded-full font-bold">Auto-calculated</span>}
          </label>
          <input disabled={(form.tasks?.length || 0) > 0} value={form.progress ?? 0} onChange={f('progress')} type="number" min="0" max="100" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none disabled:opacity-50" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Description</label>
          <textarea value={form.description ?? ''} onChange={f('description')} rows={3} className="w-full px-3 py-2 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none resize-none" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">GitHub Repository (owner/repo)</label>
          <input value={form.githubRepo ?? ''} onChange={f('githubRepo')} placeholder="e.g. aaditya175/SaaS-dashboard" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Assignees</label>
          <div className="flex flex-wrap gap-2">
            {founders.map(fo => (
              <button key={fo.id} type="button" onClick={() => toggleAssignee(fo.name)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  (form.assignees || []).includes(fo.name)
                    ? 'bg-primary/20 border-primary/50 text-primary'
                    : 'bg-muted border-border text-muted-foreground hover:text-foreground'
                }`}>{fo.name}</button>
            ))}
          </div>
        </div>
        
        {/* Task Management */}
        <div className="col-span-2 mt-2 pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-3">
            <label className="block text-sm font-semibold text-foreground">Project Tasks</label>
            <button type="button" onClick={addTask} className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1">
              <Plus className="w-3.5 h-3.5" /> Add Task
            </button>
          </div>
          <div className="space-y-2">
            {(form.tasks || []).map(t => (
              <div key={t.id} className={`flex items-center gap-2 p-2 rounded-lg border ${t.status === 'done' ? 'bg-muted/30 border-muted' : 'bg-card border-border'}`}>
                <button 
                  type="button" 
                  onClick={() => updateTask(t.id, { status: t.status === 'done' ? 'todo' : 'done' })}
                  className={`w-5 h-5 rounded flex items-center justify-center shrink-0 transition-colors ${t.status === 'done' ? 'bg-primary text-white' : 'border border-muted-foreground/30 hover:border-primary text-transparent'}`}
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <input 
                  type="text" 
                  value={t.title} 
                  onChange={(e) => updateTask(t.id, { title: e.target.value })} 
                  placeholder="Task description..." 
                  className={`flex-1 bg-transparent border-none focus:outline-none text-sm ${t.status === 'done' ? 'text-muted-foreground line-through' : 'text-foreground'}`}
                />
                <button type="button" onClick={() => removeTask(t.id)} className="w-6 h-6 rounded flex items-center justify-center hover:bg-red-500/10 text-muted-foreground hover:text-red-400 shrink-0 transition-colors">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
            {form.tasks?.length === 0 && (
              <p className="text-xs text-muted-foreground text-center py-4 border border-dashed border-border rounded-lg">No tasks added yet. Add tasks to automatically track progress.</p>
            )}
          </div>
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg font-medium">{project ? 'Update' : 'Create Project'}</button>
      </div>
    </div>
  );
}

export default function Projects() {
  const { projects, setProjects, clients, currentFounder, founders } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<ProjectStatus | 'all'>('all');
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [editProject, setEditProject] = useState<Project | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = projects.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.client.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    active: projects.filter(p => p.status === 'in_progress').length,
    review: projects.filter(p => p.status === 'review').length,
    completed: projects.filter(p => p.status === 'completed').length,
    totalBudget: projects.reduce((s, p) => s + p.budget, 0),
  };

  const handleSave = async (project: Project) => {
    try {
      if (project.id) {
        const updated = await api.put(`/projects/${project.id}`, project, currentFounder);
        setProjects(prev => prev.map(p => p.id === project.id ? updated : p));
      } else {
        const created = await api.post('/projects', project, currentFounder);
        setProjects(prev => [...prev, created]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/projects/${id}`, currentFounder);
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Active', value: stats.active, icon: Clock, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'In Review', value: stats.review, icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Total Budget', value: formatCurrency(stats.totalBudget), icon: DollarSign, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        ].map(s => (
          <div key={s.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.color}`} /></div>
            <div><p className="text-xl font-bold text-foreground font-display">{s.value}</p><p className="text-xs text-muted-foreground">{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <button onClick={() => setView('grid')} className={`p-1.5 rounded-md transition-colors ${view === 'grid' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setView('list')} className={`p-1.5 rounded-md transition-colors ${view === 'list' ? 'bg-card shadow-sm text-foreground' : 'text-muted-foreground'}`}><List className="w-4 h-4" /></button>
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none">
            <option value="all">All Status</option>
            {Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." className="pl-9 pr-3 h-9 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 w-48" />
          </div>
          <button onClick={() => setEditProject(null)} className="h-9 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> New Project
          </button>
        </div>
      </div>

      {/* Grid view */}
      {view === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map(p => (
            <ProjectCard key={p.id} project={p} onEdit={setEditProject} onDelete={setDeletingId} />
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
              <p className="text-muted-foreground text-sm">No projects found</p>
            </div>
          )}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <table className="w-full text-sm">
            <thead><tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Project</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Priority</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Progress</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Budget</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Deadline</th>
              <th className="px-4 py-3" />
            </tr></thead>
            <tbody>
              {filtered.map((p, i) => (
                <tr key={p.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                  <td className="px-4 py-3"><p className="font-medium text-foreground">{p.name}</p><p className="text-xs text-muted-foreground">{p.client}</p></td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getStatusColor(p.status)}`}>{STATUS_LABELS[p.status]}</span></td>
                  <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getPriorityColor(p.priority)}`}>{PRIORITY_LABELS[p.priority]}</span></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden"><div className="h-full rounded-full bg-primary" style={{ width: `${p.progress}%` }} /></div>
                      <span className="text-xs font-semibold text-foreground">{p.progress}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium text-foreground">{formatCurrency(p.budget)}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.deadline}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => setEditProject(p)} className="w-7 h-7 rounded-lg hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setDeletingId(p.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {editProject !== undefined && (
        <Modal open title={editProject ? 'Edit Project' : 'New Project'} onClose={() => setEditProject(undefined)} size="lg">
          <ProjectForm project={editProject} onSave={handleSave} onClose={() => setEditProject(undefined)} />
        </Modal>
      )}
      <ConfirmDialog open={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={() => deletingId && handleDelete(deletingId)} title="Delete Project" message="Delete this project and all its tasks? This cannot be undone." danger />
    </div>
  );
}
