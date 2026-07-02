import { useState } from 'react';
import { useApp, Transaction, formatCurrency, REVENUE_CHART_DATA } from '../store/appStore';
import { api } from '../../lib/api';
import Modal from '../components/Modal';
import { ConfirmDialog } from '../components/Modal';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Plus, Search, TrendingUp, TrendingDown, DollarSign, AlertCircle, Download, Edit2, Trash2, Filter } from 'lucide-react';

const STATUS_COLORS: Record<string, string> = {
  paid: 'bg-emerald-500/15 text-emerald-400',
  pending: 'bg-amber-500/15 text-amber-400',
  overdue: 'bg-red-500/15 text-red-400',
};

const EXPENSE_CATEGORIES = ['Salaries', 'Tools & Software', 'Ads & Marketing', 'Office & Admin', 'Freelancers', 'Travel', 'Legal', 'Other'];
const REVENUE_CATEGORIES = ['Project', 'Retainer', 'Consulting', 'Other'];

function TransactionForm({ tx, onSave, onClose }: { tx: Transaction | null; onSave: (t: Transaction) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<Transaction>>(tx ?? {
    type: 'revenue', amount: 0, category: 'Project', description: '', date: new Date().toISOString().split('T')[0], status: 'pending',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.description?.trim()) e.description = 'Description required';
    if ((form.amount ?? 0) <= 0) e.amount = 'Amount must be positive';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const f = (field: keyof Transaction) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: field === 'amount' ? Number(e.target.value) : e.target.value }));

  const handleSave = () => {
    if (!validate()) return;
    onSave({ ...form } as Transaction);
    onClose();
  };

  const categories = form.type === 'revenue' ? REVENUE_CATEGORIES : EXPENSE_CATEGORIES;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        {(['revenue', 'expense'] as const).map(t => (
          <button key={t} onClick={() => setForm(p => ({ ...p, type: t, category: t === 'revenue' ? 'Project' : 'Salaries' }))}
            className={`flex-1 py-2 rounded-md text-sm font-medium transition-colors capitalize ${form.type === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground'}`}>
            {t}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Description *</label>
          <input value={form.description ?? ''} onChange={f('description')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          {errors.description && <p className="text-xs text-red-400 mt-0.5">{errors.description}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Amount (₹) *</label>
          <input value={form.amount ?? ''} onChange={f('amount')} type="number" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
          {errors.amount && <p className="text-xs text-red-400 mt-0.5">{errors.amount}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Category</label>
          <select value={form.category ?? ''} onChange={f('category')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none">
            {categories.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Date</label>
          <input value={form.date ?? ''} onChange={f('date')} type="date" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Status</label>
          <select value={form.status ?? 'pending'} onChange={f('status')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none">
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
          </select>
        </div>
        {form.type === 'revenue' && (
          <div>
            <label className="block text-xs font-medium text-foreground mb-1">Client</label>
            <input value={form.client ?? ''} onChange={f('client')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
          </div>
        )}
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg font-medium">{tx ? 'Update' : 'Add Transaction'}</button>
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-muted-foreground capitalize">{p.name}:</span>
          <span className="font-medium">{formatCurrency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

const PIE_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

export default function Finance() {
  const { transactions, setTransactions, currentFounder, refreshData } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'revenue' | 'expense'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'paid' | 'pending' | 'overdue'>('all');
  const [editTx, setEditTx] = useState<Transaction | null | undefined>(undefined);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = transactions.filter(t => {
    const matchSearch = !search || t.description.toLowerCase().includes(search.toLowerCase()) || (t.client ?? '').toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === 'all' || t.type === filterType;
    const matchStatus = filterStatus === 'all' || t.status === filterStatus;
    return matchSearch && matchType && matchStatus;
  });

  const paidRevenue = transactions.filter(t => t.type === 'revenue' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'expense' && t.status === 'paid').reduce((s, t) => s + t.amount, 0);
  const profit = paidRevenue - totalExpenses;
  const pending = transactions.filter(t => t.status === 'pending' || t.status === 'overdue').reduce((s, t) => s + t.amount, 0);

  // Expense breakdown for pie
  const expenseBreakdown = EXPENSE_CATEGORIES.map(cat => ({
    name: cat,
    value: transactions.filter(t => t.type === 'expense' && t.category === cat).reduce((s, t) => s + t.amount, 0),
  })).filter(d => d.value > 0);

  const handleSave = async (tx: Transaction) => {
    try {
      if (editTx) {
        const updated = await api.put(`/transactions/${tx.id}`, tx, currentFounder);
        setTransactions(prev => prev.map(t => t.id === tx.id ? updated : t));
      } else {
        const created = await api.post('/transactions', tx, currentFounder);
        setTransactions(prev => [...prev, created]);
      }
      await refreshData();
      setEditTx(undefined);
    } catch (err) {
      console.error(err);
      alert('Error saving transaction.');
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await api.delete(`/transactions/${deletingId}`, currentFounder);
      setTransactions(prev => prev.filter(t => t.id !== deletingId));
      setDeletingId(null);
    } catch (err) {
      console.error(err);
      alert('Error deleting transaction.');
    }
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Revenue', value: formatCurrency(paidRevenue), icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10', change: '+18%' },
          { label: 'Total Expenses', value: formatCurrency(totalExpenses), icon: TrendingDown, color: 'text-red-400', bg: 'bg-red-500/10', change: '-3%' },
          { label: 'Net Profit', value: formatCurrency(profit), icon: DollarSign, color: 'text-violet-400', bg: 'bg-violet-500/10', change: '+28%' },
          { label: 'Pending', value: formatCurrency(pending), icon: AlertCircle, color: 'text-amber-400', bg: 'bg-amber-500/10', change: '' },
        ].map(k => (
          <div key={k.label} className="rounded-xl border border-border bg-card p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${k.bg} flex items-center justify-center flex-shrink-0`}><k.icon className={`w-5 h-5 ${k.color}`} /></div>
            <div>
              <p className="text-xl font-bold text-foreground font-display">{k.value}</p>
              <div className="flex items-center gap-1.5">
                <span className="text-xs text-muted-foreground">{k.label}</span>
                {k.change && <span className={`text-[10px] font-semibold ${k.change.startsWith('+') ? 'text-emerald-400' : 'text-red-400'}`}>{k.change}</span>}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue vs expenses */}
        <div className="lg:col-span-2 rounded-xl border border-border bg-card p-5">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-semibold text-foreground">Revenue vs Expenses</p>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-violet-500" />Revenue</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500" />Expenses</span>
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-emerald-500" />Profit</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={REVENUE_CHART_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <YAxis tickFormatter={v => `₹${(v/100000).toFixed(0)}L`} tick={{ fontSize: 11, fill: 'var(--muted-foreground)' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="revenue" name="revenue" fill="#7c3aed" radius={[3,3,0,0]} />
              <Bar dataKey="expenses" name="expenses" fill="#ef4444" radius={[3,3,0,0]} />
              <Bar dataKey="profit" name="profit" fill="#10b981" radius={[3,3,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Expense breakdown */}
        <div className="rounded-xl border border-border bg-card p-5">
          <p className="text-sm font-semibold text-foreground mb-3">Expense Breakdown</p>
          <ResponsiveContainer width="100%" height={150}>
            <PieChart>
              <Pie data={expenseBreakdown} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={2} dataKey="value">
                {expenseBreakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
              </Pie>
              <Tooltip formatter={(v: any) => formatCurrency(v)} contentStyle={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: '8px', fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1.5 mt-2">
            {expenseBreakdown.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium text-foreground">{formatCurrency(d.value)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Transaction list */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-2">
            {(['all', 'revenue', 'expense'] as const).map(t => (
              <button key={t} onClick={() => setFilterType(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${filterType === t ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{t === 'all' ? 'All' : t === 'revenue' ? '💰 Revenue' : '💸 Expense'}</button>
            ))}
            <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="h-8 px-3 rounded-lg bg-input-background border border-border text-xs text-foreground focus:outline-none">
              <option value="all">All Status</option>
              <option value="paid">Paid</option>
              <option value="pending">Pending</option>
              <option value="overdue">Overdue</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search transactions..." className="pl-9 pr-3 h-9 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none w-48" />
            </div>
            <button onClick={() => setEditTx(null)} className="h-9 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> Add</button>
          </div>
        </div>

        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead><tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Transaction</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Type</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Status</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Date</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Invoice</th>
                <th className="px-4 py-3" />
              </tr></thead>
              <tbody>
                {filtered.map((t, i) => (
                  <tr key={t.id} className={`border-b border-border hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/10'}`}>
                    <td className="px-4 py-3">
                      <p className="font-medium text-foreground">{t.description}</p>
                      {t.client && <p className="text-xs text-muted-foreground">{t.client}</p>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${t.type === 'revenue' ? 'bg-emerald-500/15 text-emerald-400' : 'bg-red-500/15 text-red-400'}`}>{t.type}</span>
                    </td>
                    <td className={`px-4 py-3 font-bold ${t.type === 'revenue' ? 'text-emerald-400' : 'text-red-400'}`}>
                      {t.type === 'revenue' ? '+' : '-'}{formatCurrency(t.amount)}
                    </td>
                    <td className="px-4 py-3"><span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[t.status]}`}>{t.status}</span></td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{t.date}</td>
                    <td className="px-4 py-3 text-xs font-mono text-muted-foreground">{t.invoiceNumber ?? '—'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button onClick={() => setEditTx(t)} className="w-7 h-7 rounded-lg hover:bg-primary/10 hover:text-primary flex items-center justify-center text-muted-foreground"><Edit2 className="w-3.5 h-3.5" /></button>
                        <button onClick={() => setDeletingId(t.id)} className="w-7 h-7 rounded-lg hover:bg-red-500/10 hover:text-red-400 flex items-center justify-center text-muted-foreground"><Trash2 className="w-3.5 h-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {editTx !== undefined && (
        <Modal open title={editTx ? 'Edit Transaction' : 'Add Transaction'} onClose={() => setEditTx(undefined)} size="md">
          <TransactionForm tx={editTx} onSave={handleSave} onClose={() => setEditTx(undefined)} />
        </Modal>
      )}
      <ConfirmDialog open={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={handleDelete} title="Delete Transaction" message="Are you sure you want to delete this transaction?" danger />
    </div>
  );
}
