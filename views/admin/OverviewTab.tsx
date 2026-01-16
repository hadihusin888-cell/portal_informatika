import React, { useState, useEffect } from 'react';
import { Loader2, UserPlus, Award, Users, BookOpen, ClipboardList, School, Sparkles, AlertCircle, ChevronRight } from 'lucide-react';
import { db } from '../../App.tsx';

interface OverviewTabProps {
  setActiveView: (v: string) => void;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ setActiveView }) => {
  const [stats, setStats] = useState({ students: 0, classes: 0, materials: 0, tasks: 0, pending: 0, ungraded: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [users, classes, materials, tasks, submissions] = await Promise.all([
          db.get('users'),
          db.get('elearning_classes'),
          db.get('elearning_materials'),
          db.get('elearning_tasks'),
          db.get('elearning_submissions')
        ]);

        const allUsers = Array.isArray(users) ? users : [];
        setStats({
          students: allUsers.filter((u: any) => u.role === 'STUDENT' && u.status === 'ACTIVE').length,
          pending: allUsers.filter((u: any) => u.role === 'STUDENT' && u.status === 'PENDING').length,
          classes: Array.isArray(classes) ? classes.length : 0,
          materials: Array.isArray(materials) ? materials.length : 0,
          tasks: Array.isArray(tasks) ? tasks.length : 0,
          ungraded: Array.isArray(submissions) ? submissions.filter((s: any) => !s.grade).length : 0
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center gap-4 text-black">
      <Loader2 className="animate-spin text-emerald-600" size={48} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Data Dashboard...</p>
    </div>
  );

  const hasUrgentActions = stats.pending > 0 || stats.ungraded > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-black pb-20">
      {/* 1. Header Banner */}
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
              <Sparkles size={14} className="text-emerald-400" /> Dashboard Guru Informatika
           </div>
           <h2 className="text-4xl font-black tracking-tighter">Analitik Portal Cloud</h2>
           <p className="text-slate-400 font-medium max-w-lg">Selamat datang kembali. Berikut adalah ringkasan performa dan aktivitas belajar siswa di SMP Al Irsyad Surakarta.</p>
        </div>
      </div>

      {/* 2. Urgent Actions Section (Hanya muncul jika ada data masuk) */}
      {hasUrgentActions && (
        <div className="space-y-4 animate-in slide-in-from-top-4 duration-500">
          <div className="flex items-center gap-3 px-2">
            <AlertCircle size={18} className="text-rose-500" />
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Tindakan Mendesak</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {stats.pending > 0 && (
              <div 
                onClick={() => setActiveView('confirmations')} 
                className="bg-orange-500 p-8 rounded-[2.5rem] text-white shadow-xl shadow-orange-100 cursor-pointer hover:scale-[1.02] transition-all group flex items-center justify-between"
              >
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                       <UserPlus size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black">{stats.pending} Registrasi Baru</h3>
                       <p className="text-orange-100 font-medium text-sm mt-1">Siswa menunggu konfirmasi akun.</p>
                    </div>
                 </div>
                 <ChevronRight className="opacity-40 group-hover:opacity-100 transition-opacity" size={24} />
              </div>
            )}
            
            {stats.ungraded > 0 && (
              <div 
                onClick={() => setActiveView('grades')} 
                className="bg-indigo-600 p-8 rounded-[2.5rem] text-white shadow-xl shadow-indigo-100 cursor-pointer hover:scale-[1.02] transition-all group flex items-center justify-between"
              >
                 <div className="flex items-center gap-6">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-transform">
                       <Award size={32} />
                    </div>
                    <div>
                       <h3 className="text-2xl font-black">{stats.ungraded} Tugas Belum Dinilai</h3>
                       <p className="text-indigo-100 font-medium text-sm mt-1">Cek pengumpulan tugas terbaru.</p>
                    </div>
                 </div>
                 <ChevronRight className="opacity-40 group-hover:opacity-100 transition-opacity" size={24} />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. Main Analytics Grid */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 px-2">
          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Statistik Global</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Siswa Aktif', val: stats.students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Materi Belajar', val: stats.materials, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Tugas Terdaftar', val: stats.tasks, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Total Kelas', val: stats.classes, icon: School, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center flex flex-col items-center hover:border-slate-200 transition-all">
              <div className={`${s.bg} ${s.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner`}><s.icon size={28}/></div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
              <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{s.val}</h4>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Secondary Action (Jika Urgent Actions Kosong, tampilkan di bawah sebagai reminder) */}
      {!hasUrgentActions && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 opacity-60">
          <div onClick={() => setActiveView('confirmations')} className="bg-white p-10 rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-400 cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-6">
             <UserPlus size={40} className="shrink-0" />
             <div>
                <h3 className="text-xl font-black text-slate-600">Manajemen Registrasi</h3>
                <p className="text-xs font-medium mt-1">Cek berkala pendaftaran siswa baru.</p>
             </div>
          </div>
          <div onClick={() => setActiveView('grades')} className="bg-white p-10 rounded-[3rem] border-2 border-dashed border-slate-100 text-slate-400 cursor-pointer hover:bg-slate-50 transition-all flex items-center gap-6">
             <Award size={40} className="shrink-0" />
             <div>
                <h3 className="text-xl font-black text-slate-600">Evaluasi Nilai</h3>
                <p className="text-xs font-medium mt-1">Pantau dan beri umpan balik tugas siswa.</p>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OverviewTab;