import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, UserPlus2, Search, Edit, 
  Trash2, X, User as UserIcon, Save, SearchX, 
  School, Fingerprint, Lock, Info, 
  CheckCircle2, AlertCircle, RefreshCw, ChevronRight, UserCircle,
  Zap, UserCheck, ShieldCheck, AlertTriangle, Filter,
  Mail, Calendar, GraduationCap, LayoutGrid, UserCog, Key, Send,
  Eye, EyeOff, Clipboard
} from 'lucide-react';
import { auth, firestore } from '../../firebase';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { sendPasswordResetEmail } from "firebase/auth";
import { db } from '../../App.tsx';
import { User, ClassRoom } from '../../types.ts';

interface ManageStudentsTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
}

const ManageStudentsTab: React.FC<ManageStudentsTabProps> = ({ triggerConfirm, classes }) => {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [showFormPassword, setShowFormPassword] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [visiblePasswords, setVisiblePasswords] = useState<Set<string>>(new Set());
  
  const [form, setForm] = useState<Partial<User>>({ 
    name: '', 
    username: '', 
    classId: '',
    avatar: '',
    password: '',
    status: 'ACTIVE'
  });

  // Urutkan kelas dari terkecil ke terbesar secara alfanumerik (7, 8, 9, 10...)
  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [classes]);

  useEffect(() => {
    setLoading(true);
    const q = query(collection(firestore, "users"), where("role", "==", "STUDENT"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const studentList: User[] = [];
      snapshot.forEach((doc) => {
        const data = doc.data() as User;
        if (data.status === 'ACTIVE') {
          studentList.push({ id: doc.id, ...data });
        }
      });
      setStudents(studentList);
      setLoading(false);
    }, (error) => {
      console.error("Error listening to students:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredStudents = useMemo(() => students.filter(s => {
    const matchSearch = (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
                        (s.username || '').toLowerCase().includes(search.toLowerCase());
    const matchClass = !classFilter || s.classId === classFilter;
    return matchSearch && matchClass;
  }), [students, search, classFilter]);

  const togglePasswordVisibility = (id: string) => {
    const newVisible = new Set(visiblePasswords);
    if (newVisible.has(id)) {
      newVisible.delete(id);
    } else {
      newVisible.add(id);
    }
    setVisiblePasswords(newVisible);
  };

  const handleSave = async () => {
    if (!form.name || !form.username || !form.classId) {
      alert("Mohon lengkapi Nama Lengkap, Username, dan Pilihan Kelas.");
      return;
    }

    setIsSaving(true);
    const studentData = { 
      ...form, 
      id: form.id || `std_${Date.now()}`, 
      role: 'STUDENT', 
      avatar: form.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username || 'default'}`, 
      status: 'ACTIVE',
      createdAt: form.createdAt || new Date().toLocaleString('id-ID')
    } as User;

    try {
      if (form.id) {
        await db.update('users', form.id, studentData);
      } else {
        await db.add('users', studentData);
      }
      setShowModal(false);
    } catch (err) {
      alert("Gagal menyimpan data siswa ke Cloud.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetPassword = async () => {
    if (!form.id || !form.username) return;
    
    const studentEmail = `${form.username}@alirsyad.sch.id`;

    triggerConfirm(
      "Kirim Link Reset Password?",
      `Sistem akan mengirimkan link pemulihan password ke email cloud siswa: ${studentEmail}. Password baru akan dicatat sebagai '123456' sebagai referensi sementara.`,
      async () => {
        setIsResetting(true);
        try {
          await sendPasswordResetEmail(auth, studentEmail);
          await db.update('users', form.id!, { 
            password: '123456',
            lastPasswordResetRequested: new Date().toLocaleString('id-ID')
          });
          setForm(prev => ({ ...prev, password: '123456' }));
          alert(`Berhasil! Link reset terkirim. Password referensi diubah ke: 123456`);
        } catch (err: any) {
          alert("Gagal: " + (err.message || "Pastikan akun terdaftar."));
        } finally {
          setIsResetting(false);
        }
      },
      'warning'
    );
  };

  const handleDelete = (id: string, name: string) => {
    triggerConfirm(
      `Hapus Profil Siswa?`, 
      `Semua data Cloud untuk "${name}" akan dihapus permanen.`, 
      async () => {
        try {
          await db.delete('users', id);
        } catch (err) {
          alert("Gagal menghapus data.");
        }
      }
    );
  };

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center gap-4 text-black">
      <Loader2 className="animate-spin text-blue-600" size={48} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Database Siswa...</p>
    </div>
  );

  return (
    <div className="space-y-8 text-black animate-in fade-in duration-500 pb-24">
      {/* Header & Filter Panel */}
      <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-5">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
              <GraduationCap size={32} />
            </div>
            <div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Database Siswa</h3>
              <p className="text-slate-500 font-medium text-sm mt-1">Mengelola {students.length} profil akademik cloud aktif.</p>
            </div>
          </div>
          <button 
            onClick={() => { setForm({ name: '', username: '', classId: '', avatar: '', password: '', status: 'ACTIVE' }); setShowModal(true); setShowFormPassword(false); }} 
            className="group px-8 py-4 bg-blue-600 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-slate-900 transition-all active:scale-95"
          >
            <UserPlus2 size={20} /> Tambah Siswa Baru
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Cari berdasarkan nama atau username..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-blue-500/10 transition-all shadow-inner" 
            />
          </div>
          <div className="w-full md:w-64 relative">
             <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
             <select 
               value={classFilter} 
               onChange={e => setClassFilter(e.target.value)}
               className="w-full pl-14 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-black text-[10px] uppercase tracking-widest appearance-none outline-none focus:bg-white focus:border-blue-500/10 transition-all cursor-pointer shadow-inner"
             >
               <option value="">Semua Kelas</option>
               {sortedClasses.map(c => <option key={c.id} value={c.name}>Kelas {c.name}</option>)}
             </select>
          </div>
        </div>
      </section>

      {/* Grid Siswa */}
      {filteredStudents.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredStudents.map(s => (
            <div key={s.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center relative group hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
              <div className="absolute top-4 right-4 flex gap-1.5 opacity-0 group-hover:opacity-100 transition-all z-10">
                <button onClick={() => { setForm(s); setShowModal(true); setShowFormPassword(false); }} className="p-3 bg-white text-blue-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all shadow-lg border border-slate-50"><Edit size={16}/></button>
                <button onClick={() => handleDelete(s.id, s.name)} className="p-3 bg-white text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all shadow-lg border border-slate-50"><Trash2 size={16}/></button>
              </div>
              
              <div className="relative mb-6">
                <img 
                  src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} 
                  className="w-24 h-24 rounded-[2.5rem] border-4 border-white bg-slate-50 shadow-xl object-cover group-hover:scale-105 transition-transform duration-500" 
                  alt={s.name} 
                />
                <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-2 rounded-full border-4 border-white shadow-lg">
                  <UserCheck size={12} className="text-white" />
                </div>
              </div>

              <h4 className="font-black text-slate-800 text-lg line-clamp-1 leading-tight">{s.name}</h4>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-2">@{s.username}</p>
              
              {/* Display Password on Card */}
              <div className="mt-4 w-full p-4 bg-slate-50 rounded-2xl flex items-center justify-between gap-2 border border-slate-100 group-hover:bg-blue-50 transition-colors">
                <div className="text-left overflow-hidden">
                   <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Sandi Cloud</p>
                   <p className="text-xs font-mono font-black text-slate-700 truncate">
                     {visiblePasswords.has(s.id) ? (s.password || '123456') : '••••••••'}
                   </p>
                </div>
                <button 
                  onClick={() => togglePasswordVisibility(s.id)}
                  className="p-2 text-slate-400 hover:text-blue-600 transition-colors"
                  title="Lihat Password"
                >
                  {visiblePasswords.has(s.id) ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              
              <div className="w-full pt-4 mt-2 border-t border-slate-50 flex items-center justify-center gap-3">
                 <div className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full flex items-center gap-2">
                    <School size={12} />
                    <span className="text-[10px] font-black uppercase tracking-tight">Kelas {s.classId || 'N/A'}</span>
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
          <h4 className="text-xl font-black text-slate-400">Database Kosong</h4>
          <p className="text-slate-400 font-medium text-sm max-w-xs mt-2 italic">"{search}" tidak cocok dengan data siswa mana pun.</p>
        </div>
      )}

      {/* Modal Tambah/Edit */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-[3.5rem] shadow-2xl relative flex flex-col max-h-[90vh] overflow-hidden">
            {/* Modal Header */}
            <div className="p-8 md:p-10 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white">
               <div className="flex items-center gap-5">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-100 ${form.id ? 'bg-indigo-600 text-white' : 'bg-blue-600 text-white'}`}>
                    {form.id ? <UserCog size={28} /> : <UserPlus2 size={28} />}
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-none">{form.id ? 'Edit Profil' : 'Registrasi Siswa'}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Identitas Cloud Siswa</p>
                  </div>
               </div>
               <button onClick={() => setShowModal(false)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                  <X size={24} />
               </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 scrollbar-hide">
              <div className="flex flex-col items-center justify-center py-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 shadow-inner">
                <img 
                  src={form.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username || 'default'}`} 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-white mb-4" 
                  alt="Avatar Preview" 
                />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Avatar Preview Cloud</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Siswa</label>
                  <div className="relative group">
                    <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      value={form.name} 
                      onChange={e => setForm({...form, name: e.target.value})} 
                      placeholder="Nama lengkap..." 
                      className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:border-blue-500 focus:bg-white transition-all shadow-inner" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Username (Login ID)</label>
                  <div className="relative group">
                    <Fingerprint className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      value={form.username} 
                      onChange={e => setForm({...form, username: e.target.value.toLowerCase().replace(/\s/g, '')})} 
                      placeholder="Username..." 
                      className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:border-blue-500 focus:bg-white transition-all shadow-inner" 
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Pilih Kelas</label>
                  <div className="relative group">
                    <School className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <select 
                      value={form.classId} 
                      onChange={e => setForm({...form, classId: e.target.value})}
                      className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-bold text-slate-800 focus:border-blue-500 focus:bg-white transition-all shadow-inner appearance-none cursor-pointer"
                    >
                      <option value="">Pilih Kelas Siswa</option>
                      {sortedClasses.map(c => <option key={c.id} value={c.name}>Kelas {c.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Email Kredensial</label>
                  <div className="flex items-center p-5 bg-blue-50 rounded-2xl border border-blue-100 text-[11px] font-bold text-blue-600 gap-3">
                    <Mail size={16} />
                    <span>{form.username || 'username'}@alirsyad.sch.id</span>
                  </div>
                </div>

                {/* Password Field in Edit Modal */}
                <div className="space-y-3 col-span-1 md:col-span-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Kata Sandi (Referensi)</label>
                  <div className="relative group">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                    <input 
                      type={showFormPassword ? 'text' : 'password'}
                      value={form.password || ''} 
                      onChange={e => setForm({...form, password: e.target.value})} 
                      placeholder="Isi password atau biarkan default" 
                      className="w-full p-5 pl-14 pr-14 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none font-black text-slate-800 focus:border-blue-500 focus:bg-white transition-all shadow-inner" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowFormPassword(!showFormPassword)} 
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {showFormPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-xl border border-amber-100 mt-2">
                    <Info size={14} className="text-amber-500" />
                    <p className="text-[9px] text-amber-700 font-bold italic">Catatan: Password ini disimpan untuk memudahkan Admin membantu siswa. Disarankan meriset password jika siswa lupa akses.</p>
                  </div>
                </div>
              </div>

              {/* Reset Password Action Area */}
              {form.id && (
                <div className="pt-6 border-t border-slate-100">
                  <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-4 text-center md:text-left">
                      <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-blue-600 shadow-sm shrink-0">
                        <Key size={24} />
                      </div>
                      <div>
                        <p className="text-[11px] font-black text-blue-600 uppercase tracking-widest">Pemulihan Akun</p>
                        <p className="text-xs text-slate-600 font-medium">Kirim tautan reset ke email siswa.</p>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={handleResetPassword}
                      disabled={isResetting}
                      className="px-6 py-3 bg-slate-900 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-600 transition-all active:scale-95 flex items-center gap-2 shadow-sm disabled:opacity-50"
                    >
                      {isResetting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                      Kirim Link Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-8 md:p-10 border-t border-slate-50 bg-white flex flex-col md:flex-row gap-4 shrink-0">
               <button onClick={() => setShowModal(false)} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest">Batal</button>
               <button 
                onClick={handleSave} 
                disabled={isSaving} 
                className="flex-[2] py-4 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:bg-slate-900 transition-all disabled:opacity-50 active:scale-95"
               >
                 {isSaving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                 {isSaving ? 'Menyimpan...' : (form.id ? 'Perbarui Profil' : 'Daftarkan Siswa')}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageStudentsTab;