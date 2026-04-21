
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, Plus, Search, BookOpen, Link as LinkIcon, Edit, 
  PlayCircle, FileText, SearchX, X, Save, Trash2, Globe, Youtube,
  Target, Info, Layers, Type, Hash, ArrowUpRight, Zap
} from 'lucide-react';
import { db } from '../../App.tsx';
import { Material, ClassRoom, User } from '../../types.ts';
import { notifyStudents } from '../../utils/helpers.ts';

interface ManageMaterialsTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
  currentUser: User;
}

const ManageMaterialsTab: React.FC<ManageMaterialsTabProps> = ({ triggerConfirm, classes, currentUser }) => {
  const [items, setItems] = useState<Material[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
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
      const allMaterials = Array.isArray(saved) ? saved : [];
      const isSuperAdmin = currentUser.username === 'admin';
      
      setItems(allMaterials.filter((m: any) => 
        m.authorId === currentUser.id || (isSuperAdmin && !m.authorId)
      ));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [classes]);

  const ensureArray = (data: any): string[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') return data.split(',').filter(Boolean);
    return [];
  };

  const handleSave = async () => {
    if (!form.title || !form.content || ensureArray(form.targetClassIds).length === 0) { 
      alert("Mohon lengkapi Judul, Konten, dan Target Kelas."); return; 
    }
    
    setIsSaving(true);
    const newItem: Material = { 
      ...form, 
      id: form.id || `mat_${Date.now()}`, 
      subject: currentUser.subject || 'Digital',
      authorId: currentUser.id,
      targetClassIds: ensureArray(form.targetClassIds),
      createdAt: form.createdAt || new Date().toLocaleString('id-ID'),
    } as Material;

    try {
      if (!form.id) {
        await db.add('elearning_materials', newItem);
        setItems([newItem, ...items]);
        await notifyStudents(newItem.targetClassIds, `Materi ${newItem.subject} Baru!`, `${currentUser.name} mengunggah: ${newItem.title}`, "material");
      } else {
        await db.update('elearning_materials', newItem.id, newItem);
        setItems(items.map(it => it.id === newItem.id ? newItem : it));
      }
      setShowModal(false);
    } catch (err) {
      alert("Gagal menyimpan ke cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'link': return { icon: LinkIcon, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Tautan Luar' };
      case 'embed': return { icon: Youtube, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Media/Video' };
      case 'file': return { icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Modul PDF/File' };
      default: return { icon: BookOpen, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Materi' };
    }
  };

  const filteredItems = items.filter(it => 
    it.title.toLowerCase().includes(search.toLowerCase()) || 
    it.description.toLowerCase().includes(search.toLowerCase())
  );

  const groupedItems = useMemo(() => {
    const groups: { [key: string]: Material[] } = {
      'Kelas 7': [],
      'Kelas 8': [],
      'Kelas 9': [],
      'Lainnya': []
    };

    filteredItems.forEach(item => {
      const targetClasses = ensureArray(item.targetClassIds);
      const levels = new Set<string>();
      
      targetClasses.forEach(c => {
        if (c.startsWith('7')) levels.add('Kelas 7');
        else if (c.startsWith('8')) levels.add('Kelas 8');
        else if (c.startsWith('9')) levels.add('Kelas 9');
        else levels.add('Lainnya');
      });

      if (levels.size === 0) {
        groups['Lainnya'].push(item);
      } else {
        levels.forEach(level => {
          groups[level].push(item);
        });
      }
    });

    return groups;
  }, [filteredItems]);

  if (loading) return <div className="py-32 flex flex-col items-center justify-center gap-4 text-black"><Loader2 className="animate-spin text-emerald-600" size={48} /><p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Memuat Pustaka Materi...</p></div>;

  return (
    <div className="space-y-12 animate-in fade-in duration-500 pb-24 max-w-[1600px] mx-auto text-black">
      
      {/* Header Panel */}
      <section className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6 w-full md:w-auto">
           <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
              <BookOpen size={32} />
           </div>
           <div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Pustaka Materi</h3>
              <p className="text-slate-500 font-medium text-sm mt-1">Anda memiliki {items.length} materi aktif di cloud.</p>
           </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari materi..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-13 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-emerald-500/10 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => { setForm({ title: '', description: '', type: 'link', content: '', targetClassIds: [] }); setShowModal(true); }} 
            className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-emerald-600 transition-all active:scale-95"
          >
            <Plus size={20}/> Materi Baru
          </button>
        </div>
      </section>

      {/* Grouped Sections */}
      {(Object.entries(groupedItems) as [string, Material[]][]).map(([level, levelItems]) => {
        if (levelItems.length === 0) return null;
        
        return (
          <section key={level} className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">{level}</h4>
              <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">{levelItems.length} Materi</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4">
              {levelItems.map(it => {
                const style = getTypeStyle(it.type);
                return (
                  <div key={`${level}-${it.id}`} className="bg-white rounded-xl border border-slate-100 p-4 flex flex-col group hover:border-emerald-500/30 transition-all duration-300">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-8 h-8 ${style.bg} ${style.color} rounded-lg flex items-center justify-center`}>
                        <style.icon size={16} />
                      </div>
                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                        <button onClick={() => { setForm(it); setShowModal(true); }} className="p-1.5 text-slate-400 hover:text-slate-900 transition-colors"><Edit size={14}/></button>
                        <button onClick={() => triggerConfirm("Hapus Materi?", "Materi akan hilang permanen.", () => db.delete('elearning_materials', it.id).then(() => setItems(items.filter(x => x.id !== it.id))))} className="p-1.5 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={14}/></button>
                      </div>
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="font-bold text-slate-800 text-sm leading-tight mb-1 group-hover:text-emerald-600 transition-colors line-clamp-1">{it.title}</h4>
                      <p className="text-[10px] text-slate-400 font-medium line-clamp-1 mb-3">{it.description || 'Tidak ada deskripsi.'}</p>
                    </div>

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-50">
                      <div className="flex flex-wrap gap-1">
                        {ensureArray(it.targetClassIds).slice(0, 2).map(cid => (
                          <span key={cid} className="text-[8px] font-black text-slate-300 uppercase">{cid}</span>
                        ))}
                        {ensureArray(it.targetClassIds).length > 2 && <span className="text-[8px] font-black text-slate-300">...</span>}
                      </div>
                      <span className="text-[8px] font-black text-slate-300 uppercase tracking-tighter">{it.subject}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {filteredItems.length === 0 && (
        <div className="py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
          <SearchX size={64} className="mx-auto text-slate-100 mb-6" />
          <h4 className="text-xl font-black text-slate-300 uppercase tracking-widest">Materi tidak ditemukan</h4>
          <p className="text-slate-400 text-sm mt-2">Coba gunakan kata kunci pencarian yang lain.</p>
        </div>
      )}

      {/* MODERN POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative border border-white/20">
              
              {/* Modal Header */}
              <div className="p-8 md:p-10 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-emerald-500 text-white rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-emerald-100">
                       <Zap size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{form.id ? 'Edit Materi' : 'Publikasi Materi'}</h3>
                       <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Digital Learning Center Al Irsyad</p>
                    </div>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-4 bg-slate-50 text-slate-400 rounded-3xl hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90">
                    <X size={28} />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 scrollbar-hide bg-slate-50/30">
                 
                 {/* Main Fields */}
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                         <Type size={12} /> Judul Materi Pembelajaran
                       </label>
                       <div className="relative group">
                          <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                          <input 
                            value={form.title || ''} 
                            onChange={e => setForm({...form, title: e.target.value})} 
                            placeholder="Contoh: Pengenalan Algoritma Dasar" 
                            className="w-full pl-16 pr-8 py-5 bg-white border-2 border-transparent rounded-[2rem] font-black text-slate-800 outline-none focus:border-emerald-500/10 transition-all shadow-sm" 
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                         <FileText size={12} /> Deskripsi Singkat Modul
                       </label>
                       <textarea 
                         value={form.description || ''} 
                         onChange={e => setForm({...form, description: e.target.value})} 
                         placeholder="Tuliskan poin-poin yang akan dipelajari siswa..." 
                         className="w-full p-8 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-600 h-32 outline-none focus:border-emerald-500/10 transition-all shadow-sm leading-relaxed" 
                       />
                    </div>
                 </div>

                 {/* Content Type Selector */}
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                      <Layers size={12} /> Tipe & Sumber Konten
                    </p>
                    <div className="grid grid-cols-3 gap-3">
                       {[
                         { id: 'link', label: 'Tautan Luar', icon: Globe, color: 'text-blue-500', bg: 'bg-blue-50' },
                         { id: 'embed', label: 'Video/Media', icon: Youtube, color: 'text-rose-500', bg: 'bg-rose-50' },
                         { id: 'file', label: 'Modul PDF', icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' }
                       ].map(t => (
                         <button
                           key={t.id}
                           onClick={() => setForm({...form, type: t.id as any})}
                           className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-3 ${
                             form.type === t.id 
                             ? 'bg-white border-emerald-500 shadow-xl scale-105' 
                             : 'bg-white border-transparent grayscale opacity-50 hover:grayscale-0 hover:opacity-100'
                           }`}
                         >
                            <t.icon size={28} className={t.color} />
                            <span className="text-[9px] font-black uppercase tracking-tight text-slate-600">{t.label}</span>
                         </button>
                       ))}
                    </div>

                    <div className="relative group mt-4">
                       <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                       <input 
                         value={form.content || ''} 
                         onChange={e => setForm({...form, content: e.target.value})} 
                         placeholder="Tempelkan URL di sini (YouTube, Google Drive, Canva, dll)" 
                         className="w-full pl-16 pr-8 py-5 bg-white border-2 border-transparent rounded-2xl font-bold text-emerald-600 outline-none focus:border-emerald-500/10 transition-all shadow-sm" 
                       />
                    </div>
                 </div>

                 {/* Target Classes Selection */}
                 <div className="space-y-4">
                    <div className="flex justify-between items-center ml-2">
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                         <Target size={12} /> Target Rombongan Belajar
                       </p>
                    </div>
                    <div className="flex flex-wrap gap-2.5 p-8 bg-white rounded-2xl border border-slate-100 shadow-inner">
                       {sortedClasses.filter(c => (currentUser.assignedClassIds || []).includes(c.name) || currentUser.username === 'admin').map(c => {
                          const isSelected = ensureArray(form.targetClassIds).includes(c.name);
                          return (
                             <button 
                                key={c.id} 
                                onClick={() => {
                                   const cur = ensureArray(form.targetClassIds);
                                   setForm({...form, targetClassIds: isSelected ? cur.filter(x => x !== c.name) : [...cur, c.name]});
                                }} 
                                className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase transition-all duration-300 flex items-center gap-2 ${
                                  isSelected 
                                  ? 'bg-emerald-600 text-white shadow-lg scale-110' 
                                  : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                                }`}
                             >
                               Kelas {c.name}
                               {isSelected && <ArrowUpRight size={14} />}
                             </button>
                          );
                       })}
                       {classes.length === 0 && (
                         <p className="text-xs font-bold text-slate-400 italic">Belum ada kelas yang dibuat Admin.</p>
                       )}
                    </div>
                 </div>

                 {/* Information Box */}
                 <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100/50 flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                       <Info size={20} />
                    </div>
                    <p className="text-[11px] text-emerald-700 font-bold leading-relaxed">
                       Pastikan tautan konten yang diunggah bersifat "Public" atau "Anyone with link" agar siswa dapat mengakses materi tanpa kendala izin.
                    </p>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 md:p-10 border-t border-slate-50 bg-white flex flex-col md:flex-row gap-4 shrink-0">
                 <button 
                   onClick={() => setShowModal(false)} 
                   className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                 >
                    Batal & Tutup
                 </button>
                 <button 
                   onClick={handleSave} 
                   disabled={isSaving} 
                   className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                 >
                   {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                   {isSaving ? "Sinkronisasi..." : (form.id ? "Perbarui Materi" : "Publikasikan Sekarang")}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ManageMaterialsTab;
