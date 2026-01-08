
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, Plus, Search, Filter, ClipboardList, Calendar, 
  Edit, Trash2, CheckCircle2, X, Info, Layers, Link as LinkIcon, 
  Youtube, FileCode, Clock, ToggleRight, ToggleLeft, School, 
  Save, Type, MessageSquare, ChevronRight, Zap, 
  SearchX, AlertCircle, CalendarDays, MousePointer2, PlayCircle,
  FileText, Globe, ExternalLink, Bookmark, LayoutGrid, Target,
  Sparkles
} from 'lucide-react';
import { db } from '../../App.tsx';
import { Task, ClassRoom } from '../../types.ts';
import { notifyStudents } from '../../utils/helpers.ts';

interface ManageTasksTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
}

const ManageTasksTab: React.FC<ManageTasksTabProps> = ({ triggerConfirm, classes }) => {
  const [items, setItems] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<Partial<Task>>({ 
    title: '', 
    description: '', 
    content: '', 
    targetClassIds: [], 
    dueDate: '', 
    isSubmissionEnabled: true, 
    type: 'link' 
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const saved = await db.get('elearning_tasks');
      setItems(Array.isArray(saved) ? saved : []);
    } catch (err) {
      console.error("Gagal memuat tugas:", err);
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
    const targetClasses = ensureArray(form.targetClassIds);
    if (!form.title || !form.dueDate || targetClasses.length === 0 || !form.content) { 
      alert("Mohon lengkapi Judul, Tautan Tugas, Tenggat, dan minimal satu Kelas Target."); 
      return; 
    }
    
    setIsSaving(true);
    const isNew = !form.id;
    const newItem: Task = { 
      ...form, 
      id: form.id || `tsk_${Date.now()}`, 
      targetClassIds: targetClasses,
      createdAt: form.createdAt || new Date().toLocaleString('id-ID'),
      type: form.type as any || 'link',
      title: form.title || '',
      description: form.description || '',
      content: form.content || '',
      dueDate: form.dueDate || '',
      isSubmissionEnabled: form.isSubmissionEnabled ?? true
    } as Task;

    try {
      if (isNew) {
        await db.add('elearning_tasks', newItem);
        setItems([newItem, ...items]);
        await notifyStudents(newItem.targetClassIds, "Tugas Baru!", `Ada tugas baru: ${newItem.title}. Segera kerjakan sebelum tenggat!`, "task");
      } else {
        await db.update('elearning_tasks', newItem.id, newItem);
        setItems(items.map(it => it.id === newItem.id ? newItem : it));
      }
      setShowModal(false);
    } catch (err) {
      alert("Gagal menyimpan tugas ke database.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, title: string) => {
    triggerConfirm(
      `Hapus Tugas?`, 
      `Tugas "${title}" akan dihapus. Semua riwayat pengumpulan siswa untuk tugas ini juga akan hilang.`, 
      async () => {
        try {
          await db.delete('elearning_tasks', id);
          setItems(items.filter(it => it.id !== id));
        } catch (err) {
          alert("Gagal menghapus tugas.");
        }
      }
    );
  };

  const getTaskStatus = (dueDate: string) => {
    const now = new Date();
    const deadline = new Date(dueDate);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Kadaluarsa', color: 'text-rose-500 bg-rose-50', border: 'border-rose-100' };
    if (diffDays <= 2) return { label: 'Segera Berakhir', color: 'text-orange-500 bg-orange-50', border: 'border-orange-100' };
    return { label: 'Aktif', color: 'text-emerald-500 bg-emerald-50', border: 'border-emerald-100' };
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'link': return { icon: LinkIcon, color: 'text-blue-500', bg: 'bg-blue-50', label: 'Tautan' };
      case 'embed': return { icon: Youtube, color: 'text-rose-500', bg: 'bg-rose-50', label: 'Interaktif' };
      case 'file': return { icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50', label: 'Dokumen' };
      default: return { icon: ClipboardList, color: 'text-slate-500', bg: 'bg-slate-50', label: 'Tugas' };
    }
  };

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center gap-4 text-black">
      <Loader2 className="animate-spin text-purple-600" size={48} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Cloud...</p>
    </div>
  );

  return (
    <div className="space-y-8 text-black animate-in fade-in duration-500 pb-24">
      {/* Action Header */}
      <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
              <ClipboardList size={32} />
           </div>
           <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Evaluasi & Tugas</h3>
              <p className="text-slate-500 font-medium text-sm mt-1">Mengelola {items.length} instrumen penilaian informatika.</p>
           </div>
        </div>
        <div className="flex flex-wrap gap-4 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
            <input 
              type="text" placeholder="Cari tugas..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-purple-500/20 outline-none font-bold text-sm transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => { 
              setForm({ title: '', description: '', content: '', targetClassIds: [], dueDate: '', isSubmissionEnabled: true, type: 'link' }); 
              setShowModal(true); 
            }} 
            className="px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-purple-600 active:scale-95 transition-all"
          >
            <Plus size={20}/> Tambah Tugas
          </button>
        </div>
      </section>

      {/* Grid Tugas */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(it => {
            const status = getTaskStatus(it.dueDate);
            const style = getTypeStyle(it.type);
            const targetClasses = ensureArray(it.targetClassIds);
            
            return (
              <div key={it.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
                <div className={`h-24 ${style.bg} flex items-center justify-center relative`}>
                  <style.icon size={40} className={`${style.color} opacity-20 group-hover:scale-125 transition-transform duration-700`} />
                  <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                    <button onClick={() => { setForm({...it, targetClassIds: ensureArray(it.targetClassIds)}); setShowModal(true); }} className="p-2.5 bg-white text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white shadow-xl transition-all"><Edit size={14}/></button>
                    <button onClick={() => handleDelete(it.id, it.title)} className="p-2.5 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white shadow-xl transition-all"><Trash2 size={14}/></button>
                  </div>
                  <div className="absolute bottom-3 left-4">
                     <span className={`px-2.5 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest border ${status.color} ${status.border} bg-white/80 backdrop-blur-sm`}>
                       {status.label}
                     </span>
                  </div>
                </div>
                
                <div className="p-7 flex-1 flex flex-col">
                  <h4 className="font-black text-slate-800 text-base leading-tight mb-2 group-hover:text-purple-600 transition-colors line-clamp-1">{it.title}</h4>
                  
                  <div className="flex items-center gap-2 mb-4 text-slate-400">
                    <CalendarDays size={12} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Tenggat: {it.dueDate}</span>
                  </div>

                  <p className="text-[11px] text-slate-500 font-medium leading-relaxed mb-6 line-clamp-2">{it.description}</p>
                  
                  <div className="mt-auto pt-5 border-t border-slate-50 flex flex-wrap gap-1.5">
                    {targetClasses.map(cid => (
                      <span key={cid} className="px-2.5 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-lg border border-slate-100">
                        {cid}
                      </span>
                    ))}
                    {!it.isSubmissionEnabled && (
                      <span className="px-2.5 py-1 bg-rose-50 text-rose-400 text-[9px] font-black rounded-lg border border-rose-100 ml-auto">
                        Upload Mati
                      </span>
                    )}
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
          <h4 className="text-xl font-black text-slate-400">Belum Ada Tugas</h4>
          <p className="text-slate-400 font-medium text-sm max-w-xs mt-2 italic">Tambahkan tugas baru untuk mulai mengevaluasi siswa.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-8 md:p-10 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white">
               <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-purple-100 ${form.id ? 'bg-indigo-600 text-white' : 'bg-purple-600 text-white'}`}>
                    {form.id ? <Edit size={28} /> : <Target size={28} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-none">{form.id ? 'Edit Tugas' : 'Buat Penugasan'}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Sistem Penilaian Cloud</p>
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
                  { id: 'embed', icon: Youtube, label: 'Interaktif' },
                  { id: 'file', icon: FileText, label: 'Dokumen' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setForm({...form, type: type.id as any})}
                    className={`flex flex-col items-center gap-2 p-4 rounded-3xl border-2 transition-all ${
                      form.type === type.id 
                        ? 'border-purple-600 bg-purple-50 text-purple-700 shadow-inner' 
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
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Judul Penugasan</label>
                  <input 
                    value={form.title} 
                    onChange={e => setForm({...form, title: e.target.value})} 
                    placeholder="Contoh: Projek Mandiri Membuat Blog" 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:border-purple-500 focus:bg-white transition-all shadow-inner" 
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tenggat Waktu (Deadline)</label>
                    <div className="relative group">
                      <Calendar className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                      <input 
                        type="date"
                        value={form.dueDate} 
                        onChange={e => setForm({...form, dueDate: e.target.value})} 
                        className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:border-purple-500 focus:bg-white transition-all shadow-inner" 
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Fitur Upload Siswa</label>
                    <button 
                      onClick={() => setForm({...form, isSubmissionEnabled: !form.isSubmissionEnabled})}
                      className={`w-full p-5 rounded-2xl border-2 flex items-center justify-between font-black text-xs uppercase tracking-widest transition-all ${
                        form.isSubmissionEnabled ? 'bg-emerald-50 border-emerald-500 text-emerald-700' : 'bg-rose-50 border-rose-500 text-rose-700'
                      }`}
                    >
                      {form.isSubmissionEnabled ? 'Pengumpulan Aktif' : 'Pengumpulan Mati'}
                      {form.isSubmissionEnabled ? <ToggleRight size={28} /> : <ToggleLeft size={28} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Instruksi Pengerjaan</label>
                  <textarea 
                    value={form.description} 
                    onChange={e => setForm({...form, description: e.target.value})} 
                    placeholder="Jelaskan langkah-langkah yang harus dilakukan siswa..." 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:border-purple-500 focus:bg-white transition-all shadow-inner h-24 resize-none" 
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">URL Sumber/Tugas (Link)</label>
                  <div className="relative group">
                    <Globe className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      value={form.content} 
                      onChange={e => setForm({...form, content: e.target.value})} 
                      placeholder="https://docs.google.com/..." 
                      className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:border-purple-500 focus:bg-white transition-all shadow-inner" 
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
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 md:p-10 border-t border-slate-50 bg-white flex flex-col md:flex-row gap-4 shrink-0">
               <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest">Batal</button>
               <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="flex-[2] py-4 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-purple-100 hover:bg-slate-900 transition-all disabled:opacity-50"
               >
                 {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {isSaving ? 'Menyimpan...' : 'Simpan & Publikasikan Tugas'}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTasksTab;
