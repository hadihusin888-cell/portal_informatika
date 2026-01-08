
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, Edit, Trash2, School, Users, Save, 
  User as UserIcon, X, Info, LayoutGrid, 
  Settings2, ChevronRight, AlertCircle, 
  Sparkles, GraduationCap, Zap, Bookmark,
  Search, RefreshCw, Layers, UserCheck, SearchX,
  Loader2
} from 'lucide-react';
import { db } from '../../App';
import { ClassRoom, User } from '../../types';

interface ManageClassesTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
  setClasses: (c: ClassRoom[]) => void;
}

const ManageClassesTab: React.FC<ManageClassesTabProps> = ({ triggerConfirm, classes, setClasses }) => {
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [studentCounts, setStudentCounts] = useState<Record<string, number>>({});
  const [form, setForm] = useState<Partial<ClassRoom>>({ name: '', homeroomTeacher: '' });
  const [search, setSearch] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchStudentCounts();
  }, [classes]);

  const fetchStudentCounts = async () => {
    setLoading(true);
    try {
      const users = await db.getByQuery('users', 'role', 'STUDENT');
      const studentList = Array.isArray(users) ? users : [];
      const counts: Record<string, number> = {};
      studentList.forEach((s: any) => { 
        if (s.classId && s.status === 'ACTIVE') {
          counts[s.classId] = (counts[s.classId] || 0) + 1; 
        }
      });
      setStudentCounts(counts);
    } catch (err) {
      console.error("Gagal menghitung statistik siswa:", err);
    } finally {
      setLoading(false);
    }
  };

  const filteredClasses = useMemo(() => {
    return classes.filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      (c.homeroomTeacher || '').toLowerCase().includes(search.toLowerCase())
    ).sort((a, b) => a.name.localeCompare(b.name));
  }, [classes, search]);

  const handleSave = async () => {
    if (!form.name || !form.homeroomTeacher) { 
      alert("Mohon lengkapi Nama Kelas dan Wali Kelas."); 
      return; 
    }

    setIsSaving(true);
    const isNew = !form.id;
    const classData = { 
      ...form, 
      id: form.id || `cls_${Date.now()}` 
    } as ClassRoom;
    
    try {
      if (isNew) {
        await db.add('elearning_classes', classData);
        setClasses([...classes, classData]);
      } else {
        await db.update('elearning_classes', classData.id, classData);
        setClasses(classes.map(c => c.id === classData.id ? classData : c));
      }
      setShowModal(false);
      setForm({ name: '', homeroomTeacher: '' });
    } catch (err) {
      alert("Gagal menyimpan data kelas ke Cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    triggerConfirm(
      `Hapus Kelas ${name}?`, 
      "Data struktur kelas akan dihapus. Perhatikan bahwa siswa yang terdaftar di kelas ini tetap ada tetapi akan kehilangan asosiasi kelasnya.", 
      async () => {
        try {
          await db.delete('elearning_classes', id);
          setClasses(classes.filter(c => c.id !== id));
        } catch (err) {
          alert("Gagal menghapus kelas.");
        }
      }
    );
  };

  return (
    <div className="space-y-8 text-black animate-in fade-in duration-500 pb-24">
      {/* Header & Stats Panel */}
      <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
              <School size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Manajemen Kelas</h3>
              <p className="text-slate-500 font-medium text-sm mt-1">Mengatur {classes.length} kelompok belajar Informatika.</p>
            </div>
          </div>
          <div className="flex gap-3 w-full md:w-auto">
             <div className="hidden sm:flex items-center gap-3 px-6 py-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div className="text-right">
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Siswa Terdata</p>
                   <p className="text-lg font-black text-slate-800">
                     {/* Fix: Explicitly type reduce parameters to avoid unknown operator + error */}
                     {Object.values(studentCounts).reduce((a: number, b: number) => a + b, 0)} <span className="text-[10px] text-slate-400">Jiwa</span>
                   </p>
                </div>
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-amber-500 shadow-sm">
                   <Users size={18} />
                </div>
             </div>
             <button 
                onClick={() => { setForm({ name: '', homeroomTeacher: '' }); setShowModal(true); }} 
                className="flex-1 md:flex-none px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-amber-600 active:scale-95 transition-all"
              >
                <Plus size={20}/> Tambah Kelas
              </button>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mt-8 flex flex-col md:flex-row gap-4">
           <div className="flex-1 relative">
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
              <input 
                type="text" placeholder="Cari kode kelas atau wali kelas..." 
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full pl-13 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-amber-500/10 transition-all shadow-inner"
              />
           </div>
           <button 
             onClick={fetchStudentCounts}
             className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:text-amber-500 hover:bg-amber-50 transition-all shadow-inner"
             title="Refresh Statistik Siswa"
           >
             <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </section>

      {/* Grid Kelas */}
      {filteredClasses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredClasses.map(c => (
            <div key={c.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm text-center relative group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden flex flex-col items-center">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-50 rounded-full -mr-12 -mt-12 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all scale-90 group-hover:scale-100 z-10">
                <button onClick={() => { setForm(c); setShowModal(true); }} className="p-3 bg-white text-amber-600 rounded-xl hover:bg-amber-600 hover:text-white transition-all shadow-lg border border-slate-50"><Edit size={16}/></button>
                <button onClick={() => handleDelete(c.id, c.name)} className="p-3 bg-white text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-lg border border-slate-50"><Trash2 size={16}/></button>
              </div>
              
              <div className="w-20 h-20 bg-gradient-to-br from-amber-50 to-orange-100 text-amber-600 rounded-[2rem] flex items-center justify-center mb-6 shadow-inner group-hover:rotate-6 transition-transform duration-500">
                <School size={36} />
              </div>
              
              <h4 className="text-2xl font-black text-slate-800 mb-1 leading-tight tracking-tight">Kelas {c.name}</h4>
              <div className="flex items-center justify-center gap-2 mb-8 text-slate-400">
                 <UserIcon size={12} className="text-slate-300" />
                 <p className="text-[10px] font-black uppercase tracking-widest truncate max-w-[140px]">
                   {c.homeroomTeacher || 'Belum Diatur'}
                 </p>
              </div>

              <div className="mt-auto w-full pt-6 border-t border-slate-50">
                 <div className="inline-flex items-center gap-2 px-5 py-2 bg-slate-50 rounded-full border border-slate-100 group-hover:bg-amber-50 group-hover:border-amber-100 transition-colors">
                    <Users size={14} className="text-slate-400 group-hover:text-amber-500" />
                    <span className="text-[11px] font-black text-slate-600 group-hover:text-amber-700 tracking-tight">
                      {studentCounts[c.name] || 0} Siswa Aktif
                    </span>
                 </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-20 flex flex-col items-center text-center">
          <div className="w-20 h-20 bg-slate-50 text-slate-300 rounded-3xl flex items-center justify-center mb-6">
            <SearchX size={40} />
          </div>
          <h4 className="text-xl font-black text-slate-400">Data Tidak Ditemukan</h4>
          <p className="text-slate-400 font-medium text-sm max-w-xs mt-2 italic">Belum ada kelas yang terdaftar atau pencarian Anda tidak cocok.</p>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
            <div className="p-8 md:p-10 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-amber-500 text-white rounded-[1.5rem] flex items-center justify-center shadow-lg shadow-amber-100">
                    <Layers size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-none">{form.id ? 'Edit Informasi Kelas' : 'Buat Kelas Baru'}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Sinkronisasi Struktur Organisasi Informatika</p>
                  </div>
               </div>
               <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                  <X size={24} />
               </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 scrollbar-hide">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama / Kode Kelas</label>
                  <div className="relative group">
                    <Bookmark className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors" size={20} />
                    <input 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value.toUpperCase().replace(/\s/g, '')})} 
                      placeholder="Contoh: 8A, 9F, DLL"
                      className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] font-black text-slate-800 outline-none focus:bg-white focus:border-amber-500 transition-all shadow-inner" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Wali Kelas</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 transition-colors" size={20} />
                    <input 
                      value={form.homeroomTeacher} 
                      onChange={e => setForm({...form, homeroomTeacher: e.target.value})} 
                      placeholder="Masukkan nama lengkap guru..."
                      className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-[1.8rem] font-bold text-slate-800 outline-none focus:bg-white focus:border-amber-500 transition-all shadow-inner" 
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6 bg-amber-50 rounded-[2rem] border border-amber-100 flex items-start gap-4">
                 <Info size={18} className="text-amber-500 shrink-0 mt-0.5" />
                 <p className="text-[11px] text-amber-700 font-bold leading-relaxed italic">
                   Gunakan penamaan kelas yang standar untuk memudahkan sinkronisasi dengan database pendaftaran siswa. Kode kelas bersifat unik.
                 </p>
              </div>
            </div>

            <div className="p-8 md:p-10 border-t border-slate-50 flex flex-col md:flex-row gap-4 bg-white shrink-0">
              <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest">Batal</button>
              <button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-amber-600 shadow-2xl shadow-slate-200 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                {isSaving ? 'Menyimpan...' : 'Simpan Data Kelas'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageClassesTab;
