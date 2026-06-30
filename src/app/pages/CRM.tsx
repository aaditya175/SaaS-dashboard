import { useState } from 'react';
import { useApp, Lead, LeadStage, LEAD_STAGES, formatCurrency, getStageColor } from '../store/appStore';
import { api } from '../../lib/api';
import Modal from '../components/Modal';
import Badge from '../components/Badge';
import { ConfirmDialog } from '../components/Modal';
import { Plus, Search, Filter, MoreHorizontal, Phone, Mail, Tag, Calendar, Trash2, Edit2, ChevronDown, ChevronLeft, ChevronRight, Building2 } from 'lucide-react';

const STAGE_COLORS: Record<LeadStage, string> = {
  Lead: 'border-slate-500/30 bg-slate-500/5',
  Contacted: 'border-blue-500/30 bg-blue-500/5',
  Interested: 'border-cyan-500/30 bg-cyan-500/5',
  Meeting: 'border-violet-500/30 bg-violet-500/5',
  Proposal: 'border-amber-500/30 bg-amber-500/5',
  Negotiation: 'border-orange-500/30 bg-orange-500/5',
  Won: 'border-emerald-500/30 bg-emerald-500/5',
  Lost: 'border-red-500/30 bg-red-500/5',
};

function LeadCard({ lead, isSelected, onClick, onEdit, onDelete }: { lead: Lead; isSelected: boolean; onClick: () => void; onEdit: (l: Lead) => void; onDelete: (id: string) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <div 
      onClick={onClick}
      className={`border rounded-xl p-4 cursor-pointer transition-all group flex flex-col ${isSelected ? 'border-primary shadow-md shadow-primary/20 bg-primary/5' : 'border-border bg-card hover:border-primary/40 hover:shadow-md hover:shadow-primary/5'}`}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div>
          <p className="text-sm font-semibold text-foreground leading-snug">{lead.name}</p>
          <p className="text-xs text-muted-foreground">{lead.company}</p>
        </div>
        <div className="relative">
          <button
            onClick={e => { e.stopPropagation(); setMenuOpen(m => !m); }}
            className="w-6 h-6 rounded-md hover:bg-muted flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-7 z-10 bg-popover border border-border rounded-lg shadow-xl p-1 w-32">
              <button onClick={() => { onEdit(lead); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-muted rounded-md text-foreground">
                <Edit2 className="w-3 h-3" /> Edit
              </button>
              <button onClick={() => { onDelete(lead.id); setMenuOpen(false); }} className="w-full flex items-center gap-2 px-3 py-1.5 text-xs hover:bg-red-500/10 rounded-md text-red-400">
                <Trash2 className="w-3 h-3" /> Delete
              </button>
            </div>
          )}
        </div>
      </div>
      <p className="text-base font-bold text-foreground mb-3">{formatCurrency(lead.value)}</p>
      <div className="space-y-1.5 text-xs text-muted-foreground flex-1">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5"><Tag className="w-3 h-3" />{lead.assignee}</div>
          {lead.updatedBy && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground/70 truncate max-w-[100px]">by {lead.updatedBy}</span>}
        </div>
        <div className="flex items-center gap-1.5"><Calendar className="w-3 h-3" />Last: {lead.lastContact}</div>
        {lead.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {lead.tags.map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 bg-muted rounded text-muted-foreground">{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}

function LeadForm({ lead, onSave, onClose }: { lead: Partial<Lead> | null; onSave: (l: Lead) => void; onClose: () => void }) {
  const { currentFounder, founders } = useApp();
  const [form, setForm] = useState<Partial<Lead>>(lead ?? {
    name: '', company: '', email: '', phone: '', value: 0,
    stage: 'Lead', assignee: 'Aryan Shah', tags: [], notes: '', source: 'LinkedIn', createdAt: new Date().toISOString().split('T')[0], lastContact: new Date().toISOString().split('T')[0]
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = 'Name is required';
    if ((form.value ?? 0) < 0) e.value = 'Value must be positive';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form } as Lead);
    onClose();
  };

  const f = (field: keyof Lead) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: field === 'value' ? Number(e.target.value) : e.target.value }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Contact Name *</label>
          <input value={form.name ?? ''} onChange={f('name')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="Vikram Nair" />
          {errors.name && <p className="text-xs text-red-400 mt-0.5">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Company</label>
          <input value={form.company ?? ''} onChange={f('company')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" placeholder="TechNova Solutions" />
          {errors.company && <p className="text-xs text-red-400 mt-0.5">{errors.company}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Email</label>
          <input value={form.email ?? ''} onChange={f('email')} type="email" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          {errors.email && <p className="text-xs text-red-400 mt-0.5">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Phone</label>
          <input value={form.phone ?? ''} onChange={f('phone')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Deal Value (₹) *</label>
          <input value={form.value ?? ''} onChange={f('value')} type="number" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          {errors.value && <p className="text-xs text-red-400 mt-0.5">{errors.value}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Stage</label>
          <select value={form.stage ?? 'Lead'} onChange={f('stage')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
            {LEAD_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Source</label>
          <select value={form.source ?? 'LinkedIn'} onChange={f('source')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
            {['LinkedIn', 'Referral', 'Cold Outreach', 'Content Marketing', 'Social Media', 'Conference', 'Inbound'].map(s => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Assignee</label>
          <select value={form.assignee ?? ''} onChange={f('assignee')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40">
            {founders.map(fo => <option key={fo.id} value={fo.name}>{fo.name}</option>)}
          </select>
        </div>
      </div>
      <div>
        <label className="block text-xs font-medium text-foreground mb-1">Notes</label>
        <textarea value={form.notes ?? ''} onChange={f('notes')} rows={3} className="w-full px-3 py-2 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none" />
      </div>
      <div className="flex justify-end gap-3 pt-2">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted transition-colors">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg transition-colors font-medium">
          {form.id ? 'Update Lead' : 'Add Lead'}
        </button>
      </div>
    </div>
  );
}

export default function CRM() {
  const { leads, setLeads, currentFounder, founders } = useApp();
  const [search, setSearch] = useState('');
  const [filterStage, setFilterStage] = useState<LeadStage | 'all'>('all');
  const [editLead, setEditLead] = useState<Lead | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [view, setView] = useState<'kanban' | 'list'>('kanban');

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.name.toLowerCase().includes(search.toLowerCase()) || l.company.toLowerCase().includes(search.toLowerCase());
    const matchStage = filterStage === 'all' || l.stage === filterStage;
    return matchSearch && matchStage;
  });

  const handleSave = async (lead: Lead) => {
    try {
      if (lead.id) {
        const updated = await api.put(`/leads/${lead.id}`, lead, currentFounder);
        setLeads(prev => prev.map(l => l.id === lead.id ? updated : l));
      } else {
        const created = await api.post('/leads', lead, currentFounder);
        setLeads(prev => [...prev, created]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/leads/${id}`, currentFounder);
      setLeads(prev => prev.filter(l => l.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const handleMoveLead = async (id: string, direction: 'left' | 'right') => {
    const lead = leads.find(l => l.id === id);
    if (!lead) return;
    const currentIndex = LEAD_STAGES.indexOf(lead.stage);
    let newStage = lead.stage;
    if (direction === 'left' && currentIndex > 0) newStage = LEAD_STAGES[currentIndex - 1];
    if (direction === 'right' && currentIndex < LEAD_STAGES.length - 1) newStage = LEAD_STAGES[currentIndex + 1];
    if (newStage === lead.stage) return;
    // Optimistic update
    setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: newStage } : l));
    
    // Auto-scroll to the new stage column
    setTimeout(() => {
      document.getElementById(`stage-${newStage}`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }, 50);

    try {
      await api.put(`/leads/${id}`, { stage: newStage }, currentFounder);
    } catch (err) {
      // Revert if error
      setLeads(prev => prev.map(l => l.id === id ? { ...l, stage: lead.stage } : l));
    }
  };

  const totalValue = filtered.reduce((s, l) => s + l.value, 0);
  const wonValue = filtered.filter(l => l.stage === 'Won').reduce((s, l) => s + l.value, 0);

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <button onClick={() => setView('kanban')} className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${view === 'kanban' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>Kanban</button>
            <button onClick={() => setView('list')} className={`px-3 py-1.5 text-xs rounded-md transition-colors font-medium ${view === 'list' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>List</button>
          </div>
          <div className="text-xs text-muted-foreground">
            <span className="text-foreground font-semibold">{filtered.length}</span> leads · Pipeline: <span className="text-primary font-semibold">{formatCurrency(totalValue)}</span> · Won: <span className="text-emerald-400 font-semibold">{formatCurrency(wonValue)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search leads..." className="pl-9 pr-3 h-9 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 w-48" />
          </div>
          <select value={filterStage} onChange={e => setFilterStage(e.target.value as any)} className="h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none">
            <option value="all">All Stages</option>
            {LEAD_STAGES.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <button onClick={() => setEditLead(null)} className="h-9 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium flex items-center gap-2 transition-colors">
            <Plus className="w-4 h-4" /> Add Lead
          </button>
        </div>
      </div>

      {/* Kanban view */}
      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {LEAD_STAGES.map(stage => {
            const stageLeads = filtered.filter(l => l.stage === stage);
            const stageValue = stageLeads.reduce((s, l) => s + l.value, 0);
            return (
              <div id={`stage-${stage}`} key={stage} className={`flex-shrink-0 w-64 rounded-xl border p-3 ${STAGE_COLORS[stage]}`}>
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${getStageColor(stage)}`}>{stage}</span>
                    <p className="text-xs text-muted-foreground mt-1">{formatCurrency(stageValue)}</p>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-muted text-muted-foreground text-[10px] font-bold flex items-center justify-center">{stageLeads.length}</span>
                </div>
                <div className="space-y-2">
                  {stageLeads.map(l => (
                    <LeadCard key={l.id} lead={l} isSelected={selectedLeadId === l.id} onClick={() => setSelectedLeadId(selectedLeadId === l.id ? null : l.id)} onEdit={setEditLead} onDelete={setDeletingId} />
                  ))}
                  {stageLeads.length === 0 && (
                    <div className="rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                      No leads in this stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List view */}
      {view === 'list' && (
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Contact</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Stage</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Value</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Assignee</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Source</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Last Contact</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((l, i) => (
                  <tr key={l.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{l.name}</p>
                      <p className="text-xs text-muted-foreground">{l.company}</p>
                    </td>
                    <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${getStageColor(l.stage)}`}>{l.stage}</span></td>
                    <td className="px-4 py-3 font-semibold text-foreground">{formatCurrency(l.value)}</td>
                    <td className="px-4 py-3">
                      <p className="text-muted-foreground">{l.assignee}</p>
                      {l.updatedBy && <p className="text-[10px] text-muted-foreground/60">by {l.updatedBy}</p>}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{l.source}</td>
                    <td className="px-4 py-3 text-muted-foreground">{l.lastContact}</td>
                    <td className="px-4 py-3" />
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Edit/Add modal */}
      {editLead !== undefined && (
        <Modal open title={editLead ? 'Edit Lead' : 'Add Lead'} onClose={() => setEditLead(undefined)} size="lg">
          <LeadForm lead={editLead} onSave={handleSave} onClose={() => setEditLead(undefined)} />
        </Modal>
      )}

      {/* Floating Action Bar for Selected Lead */}
      {selectedLeadId && view === 'kanban' && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-card border border-border shadow-2xl rounded-2xl p-2 flex items-center gap-2 animate-in slide-in-from-bottom-5">
          {(() => {
            const lead = leads.find(l => l.id === selectedLeadId);
            if (!lead) return null;
            const currentIndex = LEAD_STAGES.indexOf(lead.stage);
            return (
              <>
                <button
                  disabled={currentIndex === 0}
                  onClick={() => handleMoveLead(lead.id, 'left')}
                  className="flex items-center gap-2 px-4 py-3 bg-muted hover:bg-muted/80 disabled:opacity-50 disabled:cursor-not-allowed text-foreground font-medium rounded-xl transition-all"
                >
                  <ChevronLeft className="w-5 h-5" /> Move Left
                </button>
                <div className="w-px h-8 bg-border mx-2" />
                <div className="px-4 text-center min-w-[200px]">
                  <p className="text-sm font-bold text-foreground truncate">{lead.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{lead.company}</p>
                </div>
                <div className="w-px h-8 bg-border mx-2" />
                <button
                  onClick={() => setEditLead(lead)}
                  className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:bg-primary/10 hover:text-primary rounded-xl transition-all"
                  title="Edit Lead"
                >
                  <Edit2 className="w-5 h-5" />
                </button>
                <button
                  onClick={() => { setDeletingId(lead.id); setSelectedLeadId(null); }}
                  className="w-12 h-12 flex items-center justify-center text-muted-foreground hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-all"
                  title="Delete Lead"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
                <div className="w-px h-8 bg-border mx-2" />
                <button
                  disabled={currentIndex === LEAD_STAGES.length - 1}
                  onClick={() => handleMoveLead(lead.id, 'right')}
                  className="flex items-center gap-2 px-4 py-3 bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl transition-all shadow-md shadow-primary/20"
                >
                  Move Right <ChevronRight className="w-5 h-5" />
                </button>
              </>
            );
          })()}
        </div>
      )}

      <ConfirmDialog open={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={() => deletingId && handleDelete(deletingId)} title="Delete Lead" message="Are you sure you want to delete this lead? This action cannot be undone." danger />
    </div>
  );
}
