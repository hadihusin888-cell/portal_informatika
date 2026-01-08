
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, Plus, Search, Filter, BookOpen, Link as LinkIcon, 
  Edit, PlayCircle, FileText, SearchX, X, Info, 
  Zap, School, Save, Trash2, ExternalLink, Globe,
  LayoutGrid, Youtube, FileCode, CheckCircle2,
  ChevronRight, Bookmark
} from 'lucide-react';
import { db } from '../../App.tsx';
import { Material, ClassRoom } from '../../types.ts';
import { notifyStudents } from '../../utils/helpers.ts';

interface ManageMaterialsTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
}

const ManageMaterialsTab: React.FC<ManageMaterialsTabProps> = ({ triggerConfirm, classes }) => {
  const [items, setItems] = useState<Material[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [form, setForm] = useState<Partial<Material>>({ 
    title: '', 
    description: '', 
    type: 'link', 
    content: '', 
    targetClassIds: [] 
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const saved = await db.get('elearning_materials');
      setItems(Array.isArray(saved) ? saved : []);
    } catch (err) {
      console.error("Gagal memuat materi:", err);
    } finally {
      setLoading(false);
    }
  };

  const ensureArray = (data: any): string[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') return data.split(',').filter(Boolean);
    return [];
  };

  const filteredItems = useMemo(() => items.filter(it => {
    const targetClasses = ensureArray(it.targetClassIds);
    const matchSearch = it.title.toLowerCase().includes(search.toLowerCase()) || 
                        it.description.toLowerCase().includes(search.toLowerCase());
    const matchClass = !classFilter || targetClasses.includes(classFilter);
    return matchSearch && matchClass;
  }), [items, search, classFilter]);

  const handleSave = async () => {
    if (!form.title || !form.content || ensureArray(form.targetClassIds).length === 0) { 
      alert("Mohon lengkapi Judul, Link Konten, dan minimal satu Kelas Target"); 
      return; 
    }
    
    setIsSaving(true);
    const isNew = !form.id;
    // Simpan sebagai array di Firestore sesuai types.ts
    const newItem: Material = { 
      ...form, 
      id: form.id || `mat_${Date.now()}`, 
      targetClassIds: ensureArray(form.targetClassIds),
      createdAt: form.createdAt || new Date().toLocaleString('id-ID'),
      type: form.type as any || 'link',
      title: form.title || '',
      description: form.description || '',
      content: form.content || ''
    } as Material;

    try {
      if (isNew) {
        await db.add('elearning_materials', newItem);
        setItems([newItem, ...items]);
        await notifyStudents(newItem.targetClassIds, "Materi Baru!", `Guru telah mempublikasikan materi: ${newItem.title}`, "material");
      } else {
        await db.update('elearning_materials', newItem.id, newItem);
        setItems(items.map(it => it.id === newItem.id ? newItem : it));
      }
      setShowModal(false);
    } catch (err) {
      alert("Gagal menyimpan materi ke Cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    triggerConfirm(
      `Hapus Materi?`, 
      `Materi "${title}" akan dihapus permanen. Siswa tidak akan bisa lagi mengakses konten ini.`, 
      async () => {
        try {
          await db.delete('elearning_materials', id);
          setItems(items.filter(it => it.id !== id));
        } catch (err) {
          alert("Gagal menghapus materi.");
        }
      }
    );
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'link': return { icon: LinkIcon, color: 'text-blue-500', bg: 'bg-blue-50', border: 'border-blue-100', label: 'Tautan' };
      case 'embed': return { icon: Youtube, color: 'text-rose-500', bg: 'bg-rose-50', border: 'border-rose-100', label: 'Interaktif' };
      case 'file': return { icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50', border: 'border-emerald-100', label: 'Dokumen' };
      default: return { icon: BookOpen, color: 'text-slate-500', bg: 'bg-slate-50', border: 'border-slate-100', label: 'Materi' };
    }
  };

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center gap-4 text-black">
      <Loader2 className="animate-spin text-emerald-600" size={48} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Cloud...</p>
    </div>
  );

  return (
    <div className="space-y-8 text-black animate-in fade-in duration-500 pb-24">
      {/* Action Header */}
      <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
              <BookOpen size={32} />
           </div>
           <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Katalog Materi</h3>
              <p className="text-slate-500 font-medium text-sm mt-1">Mengelola {items.length} modul pembelajaran informatika.</p>
           </div>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" placeholder="Cari judul..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-emerald-500/20 outline-none font-bold text-sm transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => { 
              setForm({ title: '', description: '', type: 'link', content: '', targetClassIds: [] }); 
              setShowModal(true); 
            }} 
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-600 active:scale-95 transition-all"
          >
            <Plus size={20}/> Materi Baru
          </button>
        </div>
      </section>

      {/* Stats Quick Filter */}
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2">
        {['all', 'link', 'embed', 'file'].map(type => {
          const style = getTypeStyle(type);
          const count = type === 'all' ? items.length : items.filter(it => it.type === type).length;
          return (
            <button
              key={type}
              onClick={() => {}} // Could implement active filter logic here
              className={`px-6 py-3 rounded-2xl border transition-all flex items-center gap-3 shrink-0 ${
                classFilter === '' ? 'bg-white border-slate-100 hover:border-emerald-200' : 'bg-slate-50 border-transparent'
              }`}
            >
              <div className={`w-8 h-8 ${style.bg} ${style.color} rounded-lg flex items-center justify-center`}>
                <style.icon size={16} />
              </div>
              <span className="text-xs font-black text-slate-700 uppercase tracking-tight">{style.label}</span>
              <span className="text-[10px] font-black bg-slate-100 text-slate-400 px-2 py-0.5 rounded-md">{count}</span>
            </button>
          )
        })}
      </div>

      {/* Grid Materi */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(it => {
            const style = getTypeStyle(it.type);
            const targetClasses = ensureArray(it.targetClassIds);
            return (
              <div key={it.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className={`h-24 ${style.bg} flex items-center justify-center relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                  <style.icon size={40} className={`${style.color} opacity-20 group-hover:scale-125 transition-transform duration-700`} />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <button onClick={() => { setForm({...it, targetClassIds: ensureArray(it.targetClassIds)}); setShowModal(true); }} className="p-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white shadow-xl transition-all"><Edit size={14}/></button>
                    <button onClick={() => handleDelete(it.id, it.title)} className="p-2.5 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white shadow-xl transition-all"><Trash2 size={14}/></button>
                  </div>
                </div>
                <div className="p-7 flex-1 flex flex-col">
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`px-2.5 py-1 ${style.bg} ${style.color} text-[8px] font-black uppercase tracking-widest rounded-lg border ${style.border}`}>
                      {style.label}
                    </span>
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{it.createdAt.split(',')[0]}</span>
                  </div>
                  <h4 className="font-black text-slate-800 text-base leading-tight mb-2 group-hover:text-emerald-600 transition-colors line-clamp-2">{it.title}</h4>
                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2">{it.description}</p>
                  
                  <div className="mt-auto pt-5 border-t border-slate-50">
                    <div className="flex flex-wrap gap-1.5">
                      {targetClasses.map(cid => (
                        <span key={cid} className="px-2.5 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-lg border border-slate-100">
                          {cid}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
            <SearchX size={40} />
          </div>
          <h4 className="text-xl font-black text-slate-400">Tidak Menemukan Materi</h4>
          <p className="text-slate-400 font-medium text-sm max-w-xs mt-2 italic">"{search}" tidak cocok dengan materi apa pun.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-8 md:p-10 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white">
               <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-100 ${form.id ? 'bg-blue-600 text-white' : 'bg-emerald-600 text-white'}`}>
                    {form.id ? <Edit size={28} /> : <Plus size={28} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-none">{form.id ? 'Edit Materi' : 'Publikasi Materi'}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Sinkronisasi Cloud Informatika</p>
                  </div>
               </div>
               <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                  <X size={24} />
               </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-8 scrollbar-hide">
              {/* Type Selection */}
              <div className="grid grid-cols-3 gap-3">
                {[
                  { id: 'link', icon: LinkIcon, label: 'Tautan' },
                  { id: 'embed', icon: Youtube, label: 'Video' },
                  { id: 'file', icon: FileText, label: 'Dokumen' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setForm({...form, type: type.id as any})}
                    className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${
                      form.type === type.id 
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-700 shadow-inner' 
                        : 'border-slate-100 bg-white text-slate-400 grayscale'
                    }`}
                  >
                    <type.icon size={24} />
                    <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Materi Pembelajaran</label>
                  <input 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    placeholder="Contoh: Algoritma Pemrograman Dasar" 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Deskripsi Singkat (Ringkasan)</label>
                  <textarea 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                    placeholder="Apa yang akan dipelajari siswa?" 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:border-emerald-500 focus:bg-white transition-all shadow-inner h-24 resize-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Konten (Google Drive/YouTube/Canva)</label>
                  <div className="relative group">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      value={form.content} 
                      onChange={e => setForm({...form, content: e.target.value})} 
                      placeholder="https://..." 
                      className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Bagikan ke Kelas</label>
                  <div className="flex flex-wrap gap-2">
                    {classes.map(c => {
                      const isSelected = ensureArray(form.targetClassIds).includes(c.name);
                      return (
                        <button 
                          key={c.id} 
                          onClick={() => {
                            const current = ensureArray(form.targetClassIds);
                            setForm({
                              ...form, 
                              targetClassIds: isSelected 
                                ? current.filter(x => x !== c.name) 
                                : [...current, c.name]
                            });
                          }} 
                          className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${
                            isSelected 
                              ? 'bg-slate-900 text-white shadow-lg' 
                              : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                          }`}
                        >
                          Kelas {c.name}
                        </button>
                      );
                    })}
                  </div>
                  {ensureArray(form.targetClassIds).length === 0 && (
                     <p className="text-[10px] text-rose-500 font-bold mt-1 italic">Mohon pilih minimal satu kelas target.</p>
                  )}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 md:p-10 border-t border-slate-50 bg-white flex flex-col md:flex-row gap-4 shrink-0">
               <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest">Batal</button>
               <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="flex-[2] py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-emerald-100 hover:bg-slate-900 transition-all disabled:opacity-50"
               >
                 {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {isSaving ? 'Menyimpan...' : 'Simpan & Publikasikan'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMaterialsTab;
