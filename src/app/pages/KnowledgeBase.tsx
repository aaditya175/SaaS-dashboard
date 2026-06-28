import { useState } from 'react';
import { useApp, KBDocument } from '../store/appStore';
import Modal from '../components/Modal';
import { ConfirmDialog } from '../components/Modal';
import { Plus, Search, BookOpen, Eye, Edit2, Trash2, Tag } from 'lucide-react';

const CATEGORIES = ['All', 'Sales', 'Operations', 'Brand', 'Technical', 'Legal', 'Finance'];

function DocForm({ doc, onSave, onClose }: { doc: KBDocument | null; onSave: (d: KBDocument) => void; onClose: () => void }) {
  const [form, setForm] = useState<Partial<KBDocument>>(doc ?? {
    title: '', category: 'Operations', content: '', tags: [], author: 'Aryan Shah', views: 0, icon: '📄', updatedAt: new Date().toISOString().split('T')[0]
  });
  const [tagInput, setTagInput] = useState(doc?.tags.join(', ') ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.title?.trim()) e.title = 'Title required';
    if (!form.content?.trim()) e.content = 'Content required';
    setErrors(e); return Object.keys(e).length === 0;
  };

  const f = (field: keyof KBDocument) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [field]: e.target.value }));

  const handleSave = () => {
    if (!validate()) return;
    onSave({
      id: form.id ?? `kb${Date.now()}`,
      views: 0,
      updatedAt: new Date().toISOString().split('T')[0],
      ...form,
      tags: tagInput.split(',').map(s => s.trim()).filter(Boolean),
    } as KBDocument);
    onClose();
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Title *</label>
          <input value={form.title ?? ''} onChange={f('title')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40" />
          {errors.title && <p className="text-xs text-red-400 mt-0.5">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Category</label>
          <select value={form.category ?? ''} onChange={f('category')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none">
            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Icon (emoji)</label>
          <input value={form.icon ?? '📄'} onChange={f('icon')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Author</label>
          <select value={form.author ?? ''} onChange={f('author')} className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none">
            {['Aryan Shah', 'Priya Mehta', 'Rahul Patel', 'Sneha Kapoor', 'Dev Sharma'].map(n => <option key={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1">Tags (comma-separated)</label>
          <input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="SOP, onboarding, sales" className="w-full h-9 px-3 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1">Content *</label>
          <textarea value={form.content ?? ''} onChange={f('content')} rows={8} className="w-full px-3 py-2 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none resize-none font-mono" placeholder="# Title&#10;&#10;## Section&#10;&#10;Content..." />
          {errors.content && <p className="text-xs text-red-400 mt-0.5">{errors.content}</p>}
        </div>
      </div>
      <div className="flex justify-end gap-3">
        <button onClick={onClose} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted">Cancel</button>
        <button onClick={handleSave} className="px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-white rounded-lg font-medium">{doc ? 'Update' : 'Create Document'}</button>
      </div>
    </div>
  );
}

function DocViewer({ doc }: { doc: KBDocument }) {
  const lines = doc.content.split('\n');
  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <span className="text-2xl">{doc.icon}</span>
        <div>
          <h3 className="font-bold text-foreground">{doc.title}</h3>
          <p className="text-xs text-muted-foreground">{doc.category} · by {doc.author} · Updated {doc.updatedAt} · {doc.views} views</p>
        </div>
      </div>
      <div className="prose prose-sm max-w-none">
        {lines.map((line, i) => {
          if (line.startsWith('# ')) return <h1 key={i} className="text-xl font-bold text-foreground mt-4 mb-2">{line.slice(2)}</h1>;
          if (line.startsWith('## ')) return <h2 key={i} className="text-base font-semibold text-foreground mt-3 mb-1">{line.slice(3)}</h2>;
          if (line.startsWith('- ')) return <p key={i} className="text-sm text-foreground flex items-start gap-2 py-0.5"><span className="text-primary mt-1">•</span>{line.slice(2)}</p>;
          if (line.trim() === '') return <div key={i} className="h-2" />;
          return <p key={i} className="text-sm text-foreground">{line}</p>;
        })}
      </div>
      <div className="flex flex-wrap gap-1.5 pt-3 border-t border-border">
        {doc.tags.map(t => <span key={t} className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground">{t}</span>)}
      </div>
    </div>
  );
}

export default function KnowledgeBase() {
  const { kbDocs, setKbDocs } = useApp();
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('All');
  const [editDoc, setEditDoc] = useState<KBDocument | null | undefined>(undefined);
  const [viewDoc, setViewDoc] = useState<KBDocument | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = kbDocs.filter(d => {
    const matchSearch = !search || d.title.toLowerCase().includes(search.toLowerCase()) || d.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchCat = filterCat === 'All' || d.category === filterCat;
    return matchSearch && matchCat;
  });

  const handleSave = (doc: KBDocument) => {
    setKbDocs(prev => {
      const idx = prev.findIndex(d => d.id === doc.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = doc; return n; }
      return [...prev, doc];
    });
  };

  const handleView = (doc: KBDocument) => {
    setKbDocs(prev => prev.map(d => d.id === doc.id ? { ...d, views: d.views + 1 } : d));
    setViewDoc(doc);
  };

  return (
    <div className="p-6 space-y-5 max-w-[1600px] mx-auto">
      {/* Controls */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          {CATEGORIES.map(cat => (
            <button key={cat} onClick={() => setFilterCat(cat)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterCat === cat ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'}`}>{cat}</button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search docs..." className="pl-9 pr-3 h-9 rounded-lg bg-input-background border border-border text-sm text-foreground focus:outline-none w-48" />
          </div>
          <button onClick={() => setEditDoc(null)} className="h-9 px-4 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-medium flex items-center gap-2"><Plus className="w-4 h-4" /> New Doc</button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
        {CATEGORIES.filter(c => c !== 'All').map(cat => {
          const count = kbDocs.filter(d => d.category === cat).length;
          return (
            <button key={cat} onClick={() => setFilterCat(cat)} className={`rounded-xl border p-3 text-center hover:border-primary/30 transition-all ${filterCat === cat ? 'border-primary/40 bg-primary/5' : 'border-border bg-card'}`}>
              <p className="text-xl font-bold text-foreground font-display">{count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{cat}</p>
            </button>
          );
        })}
      </div>

      {/* Document grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(doc => (
          <div key={doc.id} className="rounded-xl border border-border bg-card p-5 flex flex-col gap-3 hover:border-primary/30 hover:shadow-md hover:shadow-primary/5 transition-all group cursor-pointer" onClick={() => handleView(doc)}>
            <div className="flex items-start justify-between">
              <span className="text-2xl">{doc.icon}</span>
              <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">{doc.category}</span>
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm leading-snug">{doc.title}</p>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{doc.content.slice(0, 100).replace(/[#\-]/g, '').trim()}...</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {doc.tags.slice(0, 3).map(t => <span key={t} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{t}</span>)}
            </div>
            <div className="flex items-center justify-between pt-2 border-t border-border text-xs text-muted-foreground">
              <span>By {doc.author.split(' ')[0]}</span>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1"><Eye className="w-3 h-3" />{doc.views}</span>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={e => { e.stopPropagation(); setEditDoc(doc); }} className="hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={e => { e.stopPropagation(); setDeletingId(doc.id); }} className="hover:text-red-400"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full rounded-xl border border-dashed border-border p-12 text-center">
            <BookOpen className="w-8 h-8 text-muted-foreground mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No documents found</p>
          </div>
        )}
      </div>

      {editDoc !== undefined && (
        <Modal open title={editDoc ? 'Edit Document' : 'New Document'} onClose={() => setEditDoc(undefined)} size="xl">
          <DocForm doc={editDoc} onSave={handleSave} onClose={() => setEditDoc(undefined)} />
        </Modal>
      )}
      {viewDoc && (
        <Modal open title="Document" onClose={() => setViewDoc(null)} size="lg" footer={
          <><button onClick={() => { setEditDoc(viewDoc); setViewDoc(null); }} className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-muted flex items-center gap-2"><Edit2 className="w-3.5 h-3.5" />Edit</button></>
        }>
          <DocViewer doc={viewDoc} />
        </Modal>
      )}
      <ConfirmDialog open={!!deletingId} onClose={() => setDeletingId(null)} onConfirm={() => deletingId && setKbDocs(d => d.filter(x => x.id !== deletingId))} title="Delete Document" message="Delete this document permanently?" danger />
    </div>
  );
}
