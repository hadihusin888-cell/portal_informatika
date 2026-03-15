
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, Plus, Search, ClipboardList, Calendar, Edit, Trash2, X, Save, 
  Globe, Youtube, FileText, Link as LinkIcon, ToggleRight, ToggleLeft,
  Type, Hash, Target, Info, Zap, ArrowUpRight, CheckCircle2,
  AlertCircle, LayoutList, BookOpen, SearchX
} from 'lucide-react';
import { db } from '../../App.tsx';
import { Task, ClassRoom, User } from '../../types.ts';
import { notifyStudents } from '../../utils/helpers.ts';

interface ManageTasksTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
  currentUser: User;
}

const ManageTasksTab: React.FC<ManageTasksTabProps> = ({ triggerConfirm, classes, currentUser }) => {
  const [items, setItems] = useState<Task[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState<Partial<Task>>({ 
    title: '', description: '', content: '', targetClassIds: [], 
    dueDate: '', isSubmissionEnabled: true, type: 'link' 
  });

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const saved = await db.get('elearning_tasks');
      const all = Array.isArray(saved) ? saved : [];
      setItems(currentUser.username === 'admin' ? all : all.filter((t: any) => t.authorId === currentUser.id));
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
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
    if (!form.title || !form.dueDate || !form.content || ensureArray(form.targetClassIds).length === 0) { 
      alert("Mohon lengkapi Judul, Tenggat, Konten, dan Target Kelas."); 
      return; 
    }
    
    setIsSaving(true);
    const newItem: Task = { 
      ...form, 
      id: form.id || `tsk_${Date.now()}`, 
      subject: currentUser.subject || 'Informatika',
      authorId: currentUser.id,
      targetClassIds: ensureArray(form.targetClassIds),
      createdAt: form.createdAt || new Date().toLocaleString('id-ID'),
    } as Task;

    try {
      if (!form.id) {
        await db.add('elearning_tasks', newItem);
        setItems([newItem, ...items]);
        await notifyStudents(newItem.targetClassIds, `Tugas ${newItem.subject} Baru!`, `${currentUser.name} memberi tugas: ${newItem.title}`, "task");
      } else {
        await db.update('elearning_tasks', newItem.id, newItem);
        setItems(items.map(it => it.id === newItem.id ? newItem : it));
      }
      setShowModal(false);
    } catch (err) { alert("Gagal menyimpan tugas ke cloud."); }
    finally { setIsSaving(false); }
  };

  const filteredItems = items.filter(it => 
    it.title.toLowerCase().includes(search.toLowerCase()) || 
    (it.description || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center gap-4 text-black">
      <Loader2 className="animate-spin text-purple-600" size={48} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Papan Tugas...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-24 max-w-[1600px] mx-auto text-black">
      
      {/* Header Panel */}
      <section className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6 w-full md:w-auto">
           <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shadow-inner">
              <ClipboardList size={32} />
           </div>
           <div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Kelola Tugas</h3>
              <p className="text-slate-500 font-medium text-sm mt-1">Mengatur {items.length} instrumen evaluasi akademik.</p>
           </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari judul tugas..." 
              value={search} 
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-13 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-purple-500/10 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => { setForm({ title: '', description: '', content: '', targetClassIds: [], dueDate: '', isSubmissionEnabled: true, type: 'link' }); setShowModal(true); }} 
            className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-purple-600 transition-all active:scale-95"
          >
            <Plus size={20}/> Tugas Baru
          </button>
        </div>
      </section>

      {/* Grid Tugas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredItems.map(it => (
          <div key={it.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500">
             <div className="h-32 bg-purple-50 flex items-center justify-center relative overflow-hidden">
                <ClipboardList size={64} className="text-purple-600 opacity-10 group-hover:scale-125 transition-transform duration-700" />
                <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                  <button onClick={() => { setForm(it); setShowModal(true); }} className="p-3 bg-white text-slate-600 rounded-xl hover:bg-slate-900 hover:text-white shadow-xl transition-all border border-slate-50"><Edit size={16}/></button>
                  <button onClick={() => triggerConfirm("Hapus Tugas?", "Data pengumpulan siswa juga akan hilang.", () => db.delete('elearning_tasks', it.id).then(() => setItems(items.filter(x => x.id !== it.id))))} className="p-3 bg-white text-rose-500 rounded-xl hover:bg-rose-500 hover:text-white shadow-xl transition-all border border-slate-50"><Trash2 size={16}/></button>
                </div>
                <div className="absolute top-5 left-5">
                  <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[9px] font-black text-slate-800 uppercase tracking-widest rounded-lg shadow-sm">
                    {it.subject}
                  </span>
                </div>
             </div>
             <div className="p-8 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-4">
                  <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-xl ${it.isSubmissionEnabled ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                    {it.isSubmissionEnabled ? 'Pengumpulan Aktif' : 'Terblokir'}
                  </span>
                </div>
                <h4 className="font-black text-slate-800 text-lg leading-tight mb-3 group-hover:text-purple-600 transition-colors line-clamp-2">{it.title}</h4>
                <div className="flex items-center gap-2 text-slate-400 mb-6">
                  <Calendar size={14} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Deadline: {it.dueDate}</span>
                </div>
                
                <div className="mt-auto pt-6 border-t border-slate-50 flex flex-wrap gap-1.5">
                  {ensureArray(it.targetClassIds).map(cid => (
                    <span key={cid} className="px-3 py-1 bg-slate-50 text-slate-400 text-[9px] font-black rounded-lg border border-slate-100 uppercase tracking-tighter">
                       {cid}
                    </span>
                  ))}
                </div>
             </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
           <div className="col-span-full py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
              {/* Added SearchX to lucide-react imports */}
              <SearchX size={64} className="mx-auto text-slate-100 mb-6" />
              <h4 className="text-xl font-black text-slate-300 uppercase tracking-widest">Tugas tidak ditemukan</h4>
           </div>
        )}
      </div>

      {/* MODERN POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden animate-in fade-in duration-300">
           <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[92vh] overflow-hidden relative border border-white/20">
              
              {/* Modal Header */}
              <div className="p-8 md:p-10 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white">
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-purple-600 text-white rounded-[1.8rem] flex items-center justify-center shadow-2xl shadow-purple-100">
                       <Zap size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black text-slate-800 tracking-tight leading-none">{form.id ? 'Edit Penugasan' : 'Buat Tugas Baru'}</h3>
                       <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Instrumen Evaluasi Al Irsyad</p>
                    </div>
                 </div>
                 <button onClick={() => setShowModal(false)} className="p-4 bg-slate-50 text-slate-400 rounded-3xl hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90">
                    <X size={28} />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 scrollbar-hide bg-slate-50/30">
                 
                 {/* Main Info */}
                 <div className="space-y-6">
                    <div className="space-y-3">
                       <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                         <Type size={12} /> Judul / Nama Tugas
                       </label>
                       <div className="relative group">
                          <Hash className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={20} />
                          <input 
                            value={form.title || ''} 
                            onChange={e => setForm({...form, title: e.target.value})} 
                            placeholder="Contoh: Praktikum Pemrograman Web 1" 
                            className="w-full pl-16 pr-8 py-5 bg-white border-2 border-transparent rounded-[2rem] font-black text-slate-800 outline-none focus:border-purple-500/10 transition-all shadow-sm" 
                          />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                            <Calendar size={12} /> Tenggat Pengumpulan
                          </label>
                          <input 
                             type="date" 
                             value={form.dueDate || ''} 
                             onChange={e => setForm({...form, dueDate: e.target.value})} 
                             className="w-full p-5 bg-white border-2 border-transparent rounded-[1.8rem] font-black text-slate-800 outline-none focus:border-purple-500/10 transition-all shadow-sm" 
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                            <Zap size={12} /> Kontrol Akses
                          </label>
                          <button 
                             onClick={() => setForm({...form, isSubmissionEnabled: !form.isSubmissionEnabled})} 
                             className={`w-full p-5 rounded-[1.8rem] border-2 transition-all flex items-center justify-between group ${
                               form.isSubmissionEnabled 
                               ? 'bg-emerald-50 border-emerald-500 text-emerald-600' 
                               : 'bg-rose-50 border-rose-500 text-rose-600'
                             }`}
                          >
                             <span className="text-[10px] font-black uppercase tracking-widest">
                                {form.isSubmissionEnabled ? 'Buka Pengumpulan' : 'Tutup Pengumpulan'}
                             </span>
                             {form.isSubmissionEnabled ? <ToggleRight size={28}/> : <ToggleLeft size={28}/>}
                          </button>
                       </div>
                    </div>
                 </div>

                 {/* Instructions */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                      <FileText size={12} /> Instruksi & Detail Pengerjaan
                    </label>
                    <textarea 
                      value={form.description || ''} 
                      onChange={e => setForm({...form, description: e.target.value})} 
                      placeholder="Tuliskan langkah-langkah pengerjaan tugas di sini..." 
                      className="w-full p-8 bg-white border-2 border-transparent rounded-[2.5rem] font-bold text-slate-600 h-32 outline-none focus:border-purple-500/10 transition-all shadow-sm leading-relaxed" 
                    />
                 </div>

                 {/* Content Link */}
                 <div className="space-y-3">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                      <LinkIcon size={12} /> Tautan Template / Sumber (Opsional)
                    </label>
                    <div className="relative group">
                       <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-purple-500 transition-colors" size={20} />
                       <input 
                         value={form.content || ''} 
                         onChange={e => setForm({...form, content: e.target.value})} 
                         placeholder="Link Google Doc / YouTube / Website terkait" 
                         className="w-full pl-16 pr-8 py-5 bg-white border-2 border-transparent rounded-[2rem] font-bold text-purple-600 outline-none focus:border-purple-500/10 transition-all shadow-sm" 
                       />
                    </div>
                 </div>

                 {/* Target Classes */}
                 <div className="space-y-4">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                      <Target size={12} /> Rombongan Belajar Sasaran
                    </p>
                    <div className="flex flex-wrap gap-2.5 p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-inner">
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
                                  ? 'bg-purple-600 text-white shadow-lg scale-110' 
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

                 <div className="p-6 bg-purple-50 rounded-[2rem] border border-purple-100/50 flex items-start gap-4">
                    <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-purple-500 shadow-sm shrink-0">
                       <Info size={20} />
                    </div>
                    <p className="text-[11px] text-purple-700 font-bold leading-relaxed">
                       Tugas yang Anda publikasikan akan langsung muncul di dashboard siswa dan mengirimkan notifikasi real-time ke akun mereka.
                    </p>
                 </div>
              </div>

              {/* Modal Footer */}
              <div className="p-8 md:p-10 border-t border-slate-50 bg-white flex flex-col md:flex-row gap-4 shrink-0">
                 <button 
                   onClick={() => setShowModal(false)} 
                   className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all active:scale-95"
                 >
                    Batal
                 </button>
                 <button 
                   onClick={handleSave} 
                   disabled={isSaving} 
                   className="flex-[2] py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-slate-200 hover:bg-purple-600 transition-all disabled:opacity-50 flex items-center justify-center gap-3 active:scale-[0.98]"
                 >
                   {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                   {isSaving ? "Sinkronisasi..." : (form.id ? "Perbarui Tugas" : "Publikasikan Tugas")}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default ManageTasksTab;
