import { useState } from 'react';
import { useApp, Client, formatCurrency, getStageColor } from '../store/appStore';
import { api } from '../../lib/api';
import Modal from '../components/Modal';
import { ConfirmDialog } from '../components/Modal';
import { Plus, Search, Star, Globe, Mail, Phone, Edit2, Trash2, Building2, TrendingUp, Users, CheckCircle } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-emerald-500/15 text-emerald-400',
  inactive: 'bg-muted text-muted-foreground',
  prospect: 'bg-blue-500/15 text-blue-400',
};

function ClientForm({ client, onSave, onClose }: { client: Client | null; onSave: (c: Client) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Client>>(client ?? {
    name: '', company: '', email: '', phone: '', website: '', industry: '',
    status: 'active', satisfaction: 5, contractValue: 0, totalRevenue: 0,
    renewalDate: '', tags: [], notes: '', projectIds: [],
    joinedDate: new Date().toISOString().split('T')[0],
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name?.trim()) e.name = 'Name required';
    if (!form.company?.trim()) e.company = 'Company required';
    if (!form.email?.trim()) e.email = 'Email required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const f = (field: keyof Client) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: ['satisfaction', 'contractValue', 'totalRevenue'].includes(field) ? Number(e.target.value) : e.target.value }));

  const handleSave = () => {
    if (!validate()) return;
    onSave({ id: form.id ?? `c${Date.now()}`, projectIds: [], tags: [], ...form } as Client);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Contact Name *</label>
          <input value={form.name ?? ''} onChange={f('name')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          {errors.name && <p className="text-xs text-red-400 mt-0.5">{errors.name}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Company *</label>
          <input value={form.company ?? ''} onChange={f('company')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          {errors.company && <p className="text-xs text-red-400 mt-0.5">{errors.company}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Email *</label>
          <input value={form.email ?? ''} onChange={f('email')} type="email" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          {errors.email && <p className="text-xs text-red-400 mt-0.5">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Phone</label>
          <input value={form.phone ?? ''} onChange={f('phone')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Website</label>
          <input value={form.website ?? ''} onChange={f('website')} placeholder="https://" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Industry</label>
          <input value={form.industry ?? ''} onChange={f('industry')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Status</label>
          <select value={form.status} onChange={f('status')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none">
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="prospect">Prospect</option>
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Contract Value (₹)</label>
          <input value={form.contractValue ?? 0} onChange={f('contractValue')} type="number" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Renewal Date</label>
          <input value={form.renewalDate ?? ''} onChange={f('renewalDate')} type="date" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Satisfaction (1-5)</label>
          <input value={form.satisfaction ?? 5} onChange={f('satisfaction')} type="number" min="1" max="5" step="0.1" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Notes</label>
          <textarea value={form.notes ?? ''} onChange={f('notes')} rows={2} className="w-full px-3 py-2 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none resize-none" />
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg font-medium">{client ? 'Update' : 'Add Client'}</button>
      </div>
    </div>
  );
}

function ClientDetail({ client, onEdit, onClose }: { client: Client; onEdit: () => void; onClose: () => void }) {
  return (
    <div className="space-y-5">
      {/* Profile */}
      <div className="flex items-start gap-4 p-4 rounded-xl bg-muted/30">
        <div className="w-14 h-14 rounded-2xl bg-primary/20 text-primary text-xl font-bold flex items-center justify-center flex-shrink-0">
          {client.company[0]}
        </div>
        <div className="flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-bold text-foreground">{client.name}</h3>
              <p className="text-sm text-muted-foreground">{client.company}</p>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full mt-1 inline-block ${STATUS_COLORS[client.status]}`}>{client.status}</span>
            </div>
            <button onClick={onEdit} className="text-xs text-primary hover:underline">Edit</button>
          </div>
        </div>
      </div>

      {/* Contact info */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { icon: Mail, label: 'Email', value: client.email },
          { icon: Phone, label: 'Phone', value: client.phone },
          { icon: Globe, label: 'Website', value: client.website },
          { icon: Building2, label: 'Industry', value: client.industry },
        ].map(item => (
          <div key={item.label} className="flex items-start gap-2">
            <item.icon className="w-3.5 h-3.5 text-muted-foreground mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[10px] text-muted-foreground">{item.label}</p>
              <p className="text-xs text-foreground">{item.value || '—'}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Financials */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-lg font-bold text-foreground">{formatCurrency(client.totalRevenue)}</p><p className="text-xs text-muted-foreground">Total Revenue</p></div>
        <div className="rounded-lg bg-muted/50 p-3 text-center"><p className="text-lg font-bold text-foreground">{formatCurrency(client.contractValue)}</p><p className="text-xs text-muted-foreground">Contract</p></div>
        <div className="rounded-lg bg-muted/50 p-3 text-center">
          <div className="flex items-center justify-center gap-0.5">
            {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= Math.round(client.satisfaction) ? 'text-amber-400 fill-amber-400' : 'text-muted'}`} />)}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">Satisfaction</p>
        </div>
      </div>

      {client.notes && (
        <div className="rounded-lg bg-muted/30 p-3">
          <p className="text-xs text-muted-foreground font-medium mb-1">Notes</p>
          <p className="text-sm text-foreground">{client.notes}</p>
        </div>
      )}
    </div>
  );
}

export default function Clients() {
  const { clients, setClients, currentFounder } = useApp();
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | Client['status']>('all');
  const [editClient, setEditClient] = useState<Client | null | undefined>(undefined);
  const [viewClient, setViewClient] = useState<Client | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = clients.filter(c => {
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.company.toLowerCase().includes(search.toLowerCase());
    const matchStatus = filterStatus === 'all' || c.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const stats = {
    active: clients.filter(c => c.status === 'active').length,
    totalRevenue: clients.reduce((s, c) => s + c.totalRevenue, 0),
    avgSat: clients.reduce((s, c) => s + c.satisfaction, 0) / (clients.length || 1),
  };

  const handleSave = async (client: Client) => {
    try {
      if (client.id && !client.id.startsWith('c')) {
        const updated = await api.put(`/clients/${client.id}`, client, currentFounder);
        setClients(prev => prev.map(c => c.id === client.id ? updated : c));
      } else {
        const { id, ...rest } = client;
        const created = await api.post('/clients', rest, currentFounder);
        setClients(prev => [...prev, created]);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Active Clients', value: stats.active, icon: Building2, color: 'text-violet-400', bg: 'bg-violet-500/10' },
          { label: 'Total Revenue', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
          { label: 'Avg Satisfaction', value: `${stats.avgSat.toFixed(1)}/5`, icon: Star, color: 'text-amber-400', bg: 'bg-amber-500/10' },
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
          {(['all', 'active', 'inactive', 'prospect'] as const).map(s => (
            <button key={s} onClick={() => setFilterStatus(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterStatus === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{s === 'all' ? 'All' : s}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search clients..." className="pl-9 pr-3 h-9 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40 w-48" />
          </div>
          <button onClick={() => setEditClient(null)} className="h-9 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add Client</button>
        </div>
      </div>

      {/* Client cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map(c => (
          <div key={c.id} onClick={() => setViewClient(c)} className="rounded-xl border border-border bg-card p-5 cursor-pointer hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all group flex flex-col gap-3">
            <div className="flex items-start justify-between">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-lg font-bold text-primary">
                {c.company[0]}
              </div>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${STATUS_COLORS[c.status]}`}>{c.status}</span>
            </div>
            <div>
              <p className="font-semibold text-foreground">{c.name}</p>
              <p className="text-xs text-muted-foreground">{c.company}</p>
              <p className="text-xs text-muted-foreground">{c.industry}</p>
            </div>
            <div className="flex items-center gap-1">
              {[1,2,3,4,5].map(s => <Star key={s} className={`w-3 h-3 ${s <= Math.round(c.satisfaction) ? 'text-amber-400 fill-amber-400' : 'text-muted'}`} />)}
              <span className="text-xs text-muted-foreground ml-1">{c.satisfaction}</span>
            </div>
            <div className="pt-2 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Revenue</span>
              <span className="font-bold text-foreground">{formatCurrency(c.totalRevenue)}</span>
            </div>
            <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={e => { e.stopPropagation(); setEditClient(c); }} className="w-7 h-7 rounded-lg hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
              <button onClick={e => { e.stopPropagation(); setDeletingId(c.id); }} className="w-7 h-7 rounded-lg hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
            <p className="text-muted-foreground text-sm">No clients found</p>
          </div>
        )}
      </div>

      {/* Edit/Add modal */}
      {editClient !== undefined && (
        <Modal open title={editClient ? 'Edit Client' : 'Add Client'} onClose={() => setEditClient(undefined)} size="lg">
          <ClientForm client={editClient} onSave={handleSave} onClose={() => setEditClient(undefined)} />
        </Modal>
      )}

      {/* View detail modal */}
      {viewClient && (
        <Modal open title="Client Profile" onClose={() => setViewClient(null)} size="md">
          <ClientDetail client={viewClient} onEdit={() => { setEditClient(viewClient); setViewClient(null); }} onClose={() => setViewClient(null)} />
        </Modal>
      )}

      <ConfirmDialog open={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={() => deletingId && setClients(c => c.filter(x => x.id !== deletingId))} title="Remove Client" message="Remove this client record? Their project history will remain." danger />
    </div>
  );
}
