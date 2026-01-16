import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, UserCheck, UserX, Search, Users, 
  Clock, SearchX, Fingerprint, X
} from 'lucide-react';
import { firestore } from '../../firebase';
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from '../../App.tsx';
import { User } from '../../types.ts';
import { notifyStudents } from '../../utils/helpers.ts';

interface ConfirmRegistrationsTabProps {
  triggerConfirm: any;
}

const ConfirmRegistrationsTab: React.FC<ConfirmRegistrationsTabProps> = ({ triggerConfirm }) => {
  const [pending, setPending] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    // Monitor pendaftaran dengan status PENDING secara real-time
    const q = query(collection(firestore, "users"), where("status", "==", "PENDING"));
    
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const penders: User[] = [];
      querySnapshot.forEach((doc) => {
        penders.push({ id: doc.id, ...doc.data() } as User);
      });
      setPending(penders);
      setLoading(false);
    }, (error) => {
      console.error("Firestore Error:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredPending = useMemo(() => {
    return [...pending]
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .filter(s => 
        (s.name || '').toLowerCase().includes(search.toLowerCase()) || 
        (s.username || '').toLowerCase().includes(search.toLowerCase())
      );
  }, [pending, search]);

  const handleApprove = async (student: User) => {
    setIsProcessing(student.id);
    try {
      // Ubah status menjadi ACTIVE. Listener di ManageStudentsTab akan menangkap ini.
      await db.update('users', student.id, { 
        status: 'ACTIVE',
        activatedAt: new Date().toISOString()
      });
      
      await notifyStudents([], "Akun Aktif!", "Selamat, pendaftaran Anda telah disetujui Guru Informatika. Silakan login.", "registration", student.id);
    } catch (err) {
      console.error("Gagal aktivasi:", err);
      alert("Gagal mengaktifkan akun. Mohon periksa koneksi atau Izin Firestore.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleReject = (student: User) => {
    triggerConfirm(
      "Tolak Pendaftaran?", 
      `Hapus data pendaftaran "${student.name}" secara permanen?`, 
      async () => {
        setIsProcessing(student.id);
        try {
          await db.delete('users', student.id);
        } catch (err) {
          alert("Gagal menghapus data.");
        } finally {
          setIsProcessing(null);
        }
      },
      'danger'
    );
  };

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center gap-4 text-black">
      <Loader2 className="animate-spin text-orange-500" size={48} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Cloud...</p>
    </div>
  );

  return (
    <div className="space-y-8 text-black animate-in fade-in duration-500 pb-20">
      <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col md:flex-row justify-between items-center gap-6">
        <div className="flex items-center gap-5">
           <div className="w-16 h-16 bg-orange-50 text-orange-600 rounded-[1.5rem] flex items-center justify-center shadow-inner">
              <Fingerprint size={32} />
           </div>
           <div>
              <h3 className="text-2xl font-black text-slate-800 tracking-tight">Persetujuan Siswa</h3>
              <p className="text-slate-500 font-medium text-sm mt-1">
                {pending.length} permintaan akun menunggu verifikasi.
              </p>
           </div>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text" placeholder="Cari pendaftar..." 
            value={search} onChange={e => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-4 bg-slate-50 rounded-2xl border-2 border-transparent focus:border-orange-500/20 outline-none font-bold text-sm transition-all shadow-inner"
          />
        </div>
      </section>

      {filteredPending.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredPending.map(s => (
            <div key={s.id} className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm flex flex-col items-center text-center relative group hover:shadow-2xl transition-all duration-300">
              <img 
                src={s.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${s.username}`} 
                className="w-24 h-24 rounded-full border-4 border-slate-50 shadow-xl bg-slate-50 mb-6" 
                alt={s.name}
              />
              <h4 className="font-black text-slate-800 text-lg leading-tight line-clamp-1">{s.name}</h4>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mt-1 mb-6">Kelas {s.classId || 'N/A'}</p>
              
              <div className="flex gap-3 w-full">
                 <button 
                    onClick={() => handleApprove(s)} 
                    disabled={isProcessing === s.id}
                    className="flex-1 py-4 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 active:scale-95"
                 >
                    {isProcessing === s.id ? <Loader2 size={16} className="animate-spin" /> : <UserCheck size={16} />}
                    Aktifkan
                 </button>
                 <button 
                    onClick={() => handleReject(s)} 
                    disabled={isProcessing === s.id}
                    className="p-4 bg-rose-50 text-rose-500 rounded-2xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                 >
                    <UserX size={18} />
                 </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[3rem] border-2 border-dashed border-slate-200 p-20 flex flex-col items-center text-center">
          <SearchX size={48} className="text-slate-200 mb-4" />
          <h4 className="text-xl font-black text-slate-400 uppercase tracking-widest">Antrean Kosong</h4>
          <p className="text-slate-400 text-sm italic mt-2">Semua pendaftaran telah diproses.</p>
        </div>
      )}
    </div>
  );
};

export default ConfirmRegistrationsTab;