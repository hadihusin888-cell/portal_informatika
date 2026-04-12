
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, UserPlus2, Search, Edit, Trash2, X, Save, 
  Briefcase, School, ShieldCheck, Lock, Eye, EyeOff,
  SearchX, CheckCircle, GraduationCap, Mail,
  User as UserIcon, Fingerprint, Info, Zap, ArrowUpRight,
  Camera, RefreshCw
} from 'lucide-react';
import { auth, firestore } from '../../firebase';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from '../../App.tsx';
import { User, ClassRoom } from '../../types.ts';

interface ManageTeachersTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
}

const ManageTeachersTab: React.FC<ManageTeachersTabProps> = ({ triggerConfirm, classes }) => {
  const [teachers, setTeachers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [search, setSearch] = useState('');
  
  const [form, setForm] = useState<Partial<User>>({ 
    name: '', 
    username: '', 
    password: '',
    subject: '',
    assignedClassIds: []
  });

  useEffect(() => {
    setLoading(true);
    const q = query(collection(firestore, "users"), where("role", "==", "ADMIN"));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: User[] = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() } as User);
      });
      setTeachers(list);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredTeachers = teachers.filter(t => 
    t.name.toLowerCase().includes(search.toLowerCase()) || 
    (t.subject || '').toLowerCase().includes(search.toLowerCase())
  );

  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [classes]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert("Ukuran foto terlalu besar. Maksimal 1MB.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setForm({ ...form, avatar: reader.result as string });
    };
    reader.readAsDataURL(file);
  };

  const randomizeAvatar = () => {
    const randomSeed = Math.random().toString(36).substring(2, 10);
    setForm({ ...form, avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}` });
  };

  const handleSave = async () => {
    if (!form.name || !form.username || (!form.id && !form.password) || !form.subject) {
      alert("Mohon lengkapi Nama, Mapel, Username, dan Password.");
      return;
    }

    setIsSaving(true);
    try {
      const isNew = !form.id;
      const cleanUsername = form.username!.replace(/\s/g, '');
      const email = `${cleanUsername}@alirsyad.sch.id`;

      let userId = form.id;

      if (isNew) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, form.password!);
        userId = userCredential.user.uid;
      }

      const teacherData: User = {
        id: userId!,
        name: form.name!,
        username: cleanUsername,
        password: form.password || (teachers.find(t => t.id === userId)?.password || ''),
        role: 'ADMIN',
        status: 'ACTIVE',
        subject: form.subject!,
        assignedClassIds: form.assignedClassIds || [],
        avatar: form.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
        createdAt: form.createdAt || new Date().toISOString()
      };

      await db.update('users', userId!, teacherData);
      setShowModal(false);
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (name.toLowerCase() === 'admin utama' || id === auth.currentUser?.uid) {
      alert("Akun ini tidak dapat dihapus melalui dashboard.");
      return;
    }
    triggerConfirm(
      "Hapus Akun Guru?",
      `Seluruh akses dan data milik "${name}" akan dihapus permanen.`,
      async () => {
        try {
          await db.delete('users', id);
        } catch (err) {
          alert("Gagal menghapus.");
        }
      }
    );
  };

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center gap-4 text-black">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Memuat Database Guru...</p>
    </div>
  );

  return (
    <div className="space-y-8 text-black animate-in fade-in duration-500 pb-24 max-w-[1600px] mx-auto">
      
      {/* Header Section */}
      <section className="bg-white p-8 md:p-10 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="flex items-center gap-6 w-full md:w-auto">
           <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
              <Briefcase size={32} />
           </div>
           <div>
              <h3 className="text-3xl font-black text-slate-800 tracking-tight">Kader Pendidik</h3>
              <p className="text-slate-500 font-medium text-sm mt-1">Mengelola {teachers.length} akun pengampu akademik.</p>
           </div>
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64 group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={18} />
            <input 
              type="text" placeholder="Cari guru..." 
              value={search} onChange={e => setSearch(e.target.value)}
              className="w-full pl-13 pr-6 py-4 bg-slate-50 border-2 border-transparent rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-indigo-500/10 transition-all shadow-inner"
            />
          </div>
          <button 
            onClick={() => { setForm({ name: '', username: '', password: '', subject: '', assignedClassIds: [] }); setShowModal(true); }}
            className="w-full md:w-auto px-8 py-4 bg-slate-900 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-xl hover:bg-indigo-600 transition-all active:scale-95"
          >
            <UserPlus2 size={20} /> Tambah Guru
          </button>
        </div>
      </section>

      {/* Grid Guru */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredTeachers.map(t => (
          <div key={t.id} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 flex flex-col items-center text-center group relative overflow-hidden">
            <div className="absolute top-5 right-5 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
              <button onClick={() => { setForm(t); setShowModal(true); }} className="p-3 bg-white text-indigo-600 rounded-xl hover:bg-indigo-600 hover:text-white shadow-xl transition-all border border-slate-50"><Edit size={16}/></button>
              <button onClick={() => handleDelete(t.id, t.name)} className="p-3 bg-white text-rose-500 rounded-xl hover:bg-rose-600 hover:text-white shadow-xl transition-all border border-slate-50"><Trash2 size={16}/></button>
            </div>
            
            <img src={t.avatar} className="w-24 h-24 rounded-full border-4 border-white shadow-xl bg-slate-50 mb-6 object-cover" alt="" />
            <h4 className="font-black text-slate-800 text-lg leading-tight line-clamp-1">{t.name}</h4>
            <span className="px-4 py-1.5 bg-emerald-50 text-emerald-600 rounded-full text-[9px] font-black uppercase tracking-widest mt-4 border border-emerald-100">
               {t.subject || 'Mapel'}
            </span>
            
            <div className="w-full mt-8 pt-8 border-t border-slate-50 space-y-4">
               <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Kelas Bimbingan</p>
               <div className="flex flex-wrap justify-center gap-2">
                  {(t.assignedClassIds || []).map(cid => (
                    <span key={cid} className="px-3 py-1.5 bg-slate-50 text-slate-500 text-[9px] font-black rounded-xl border border-slate-100 uppercase tracking-tighter">
                       {cid}
                    </span>
                  ))}
                  {(t.assignedClassIds || []).length === 0 && <span className="text-[9px] font-bold text-slate-300 italic">Belum ada kelas</span>}
               </div>
            </div>
          </div>
        ))}

        {filteredTeachers.length === 0 && (
           <div className="col-span-full py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <SearchX size={64} className="mx-auto text-slate-100 mb-6" />
              <h4 className="text-xl font-black text-slate-300 uppercase tracking-widest">Guru tidak ditemukan</h4>
           </div>
        )}
      </div>

      {/* MODERN POPUP MODAL */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-6 overflow-hidden animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl relative flex flex-col max-h-[92vh] overflow-hidden border border-white/20">
            
            {/* Modal Header */}
            <div className="p-8 md:p-10 border-b border-slate-50 flex items-center justify-between shrink-0 bg-white">
               <div className="flex items-center gap-6">
                  <div className="w-16 h-16 bg-indigo-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-indigo-100">
                    <ShieldCheck size={32} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-none">{form.id ? 'Edit Data Guru' : 'Daftarkan Guru'}</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Akses Administrator Cloud</p>
                  </div>
               </div>
               <button onClick={() => setShowModal(false)} className="p-4 bg-slate-50 text-slate-400 rounded-3xl hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90">
                  <X size={28} />
               </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10 space-y-10 scrollbar-hide bg-slate-50/30">
              
              {/* Avatar Section */}
              <div className="flex flex-col items-center py-8 bg-white rounded-3xl border border-slate-100 shadow-sm relative group/avatar">
                <div className="relative">
                  <img 
                    src={form.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${form.username || 'default'}`} 
                    className="w-28 h-28 rounded-full border-4 border-white shadow-xl bg-slate-50 mb-4 object-cover" 
                    alt="Teacher Avatar"
                  />
                  <div className="absolute bottom-4 right-0 flex gap-1">
                    <button 
                      onClick={randomizeAvatar}
                      className="p-2 bg-white text-slate-400 rounded-xl shadow-lg border border-slate-100 hover:text-indigo-600 transition-all active:scale-90"
                      title="Acak Avatar"
                    >
                      <RefreshCw size={14} />
                    </button>
                    <label className="p-2 bg-indigo-600 text-white rounded-xl shadow-lg border-2 border-white hover:bg-slate-900 transition-all active:scale-90 cursor-pointer flex items-center justify-center">
                      <Camera size={14} />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleFileChange}
                      />
                    </label>
                  </div>
                </div>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Foto Profil Guru (Maks 1MB)</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <UserIcon size={12} /> Nama Lengkap Guru
                  </label>
                  <input 
                    value={form.name || ''} 
                    onChange={e => setForm({...form, name: e.target.value})} 
                    placeholder="Nama & Gelar..." 
                    className="w-full p-5 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500/10 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <GraduationCap size={12} /> Mata Pelajaran Pengampu
                  </label>
                  <input 
                    value={form.subject || ''} 
                    onChange={e => setForm({...form, subject: e.target.value})} 
                    placeholder="Contoh: Matematika" 
                    className="w-full p-5 bg-white border-2 border-transparent rounded-2xl font-black text-indigo-600 outline-none focus:border-indigo-500/10 transition-all shadow-sm" 
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <Fingerprint size={12} /> Username Login
                  </label>
                  <div className="relative group">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                    <input 
                      value={form.username || ''} 
                      onChange={e => setForm({...form, username: e.target.value})} 
                      placeholder="username_guru" 
                      className="w-full pl-16 pr-6 py-5 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500/10 transition-all shadow-sm" 
                    />
                  </div>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                    <Lock size={12} /> Kata Sandi Akses
                  </label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={form.password || ''} 
                      onChange={e => setForm({...form, password: e.target.value})} 
                      placeholder="Minimal 6 karakter..." 
                      className="w-full p-5 pr-14 bg-white border-2 border-transparent rounded-2xl font-bold text-slate-800 outline-none focus:border-indigo-500/10 transition-all shadow-sm" 
                    />
                    <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors">
                      {showPassword ? <EyeOff size={22}/> : <Eye size={22}/>}
                    </button>
                  </div>
                </div>
              </div>

              {/* Class Selection */}
              <div className="space-y-4">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2 flex items-center gap-2">
                   <School size={12} /> Daftar Kelas yang Diampu
                </p>
                <div className="flex flex-wrap gap-2.5 p-8 bg-white rounded-2xl border border-slate-100 shadow-inner">
                  {sortedClasses.map(c => {
                    const isSelected = (form.assignedClassIds || []).includes(c.name);
                    return (
                      <button 
                        key={c.id} 
                        onClick={() => {
                          const current = form.assignedClassIds || [];
                          setForm({
                            ...form, 
                            assignedClassIds: isSelected 
                              ? current.filter(x => x !== c.name) 
                              : [...current, c.name]
                          });
                        }} 
                        className={`px-5 py-3 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                          isSelected ? 'bg-indigo-600 text-white shadow-lg scale-110' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                        }`}
                      >
                        Kelas {c.name}
                        {isSelected && <ArrowUpRight size={14} />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Info Area */}
              <div className="p-6 bg-indigo-50 rounded-2xl border border-indigo-100/50 flex items-start gap-4">
                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-indigo-500 shadow-sm shrink-0">
                    <Info size={20} />
                 </div>
                 <p className="text-[11px] text-indigo-700 font-bold leading-relaxed">
                   Setiap akun Guru memiliki akses penuh untuk mengelola Materi, Tugas, dan Nilai khusus pada Mata Pelajaran yang diatur di atas.
                 </p>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-8 md:p-10 border-t border-slate-50 flex flex-col md:flex-row gap-4 bg-white shrink-0">
               <button onClick={() => setShowModal(false)} className="flex-1 py-5 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-100 transition-all">
                  Tutup
               </button>
               <button 
                 onClick={handleSave} 
                 disabled={isSaving} 
                 className="flex-[2] py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 shadow-2xl shadow-slate-200 hover:bg-indigo-600 transition-all active:scale-[0.98] disabled:opacity-50"
               >
                 {isSaving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                 {isSaving ? 'Memproses...' : (form.id ? 'Perbarui Profil' : 'Daftarkan Sekarang')}
               </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageTeachersTab;
