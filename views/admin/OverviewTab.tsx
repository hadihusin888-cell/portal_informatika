
import React, { useState, useEffect } from 'react';
import { Loader2, UserPlus, Award, Users, BookOpen, ClipboardList, School, Sparkles, AlertCircle, ChevronRight } from 'lucide-react';
import { db } from '../../App.tsx';
import { User } from '../../types.ts';

interface OverviewTabProps {
  setActiveView: (v: string) => void;
  currentUser: User;
}

const OverviewTab: React.FC<OverviewTabProps> = ({ setActiveView, currentUser }) => {
  const [stats, setStats] = useState({ students: 0, classes: 0, materials: 0, tasks: 0, pending: 0, ungraded: 0 });
  const [loading, setLoading] = useState(true);

  const isSuperAdmin = currentUser.username === 'admin';

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
        const allMaterials = Array.isArray(materials) ? materials : [];
        const allTasks = Array.isArray(tasks) ? tasks : [];
        const allSubs = Array.isArray(submissions) ? submissions : [];

        // Filter data: Hanya ambil milik pengguna yang sedang login
        const relevantMaterials = allMaterials.filter((m: any) => m.authorId === currentUser.id);
        const relevantTasks = allTasks.filter((t: any) => t.authorId === currentUser.id);
        const relevantTaskIds = new Set(relevantTasks.map(t => t.id));
        const relevantUngraded = allSubs.filter((s: any) => relevantTaskIds.has(s.taskId) && !s.grade).length;

        setStats({
          students: allUsers.filter((u: any) => u.role === 'STUDENT' && u.status === 'ACTIVE').length,
          pending: allUsers.filter((u: any) => u.role === 'STUDENT' && u.status === 'PENDING').length,
          classes: Array.isArray(classes) ? classes.length : 0,
          materials: relevantMaterials.length,
          tasks: relevantTasks.length,
          ungraded: relevantUngraded
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentUser, isSuperAdmin]);

  if (loading) return <div className="py-32 flex flex-col items-center justify-center gap-4 text-black"><Loader2 className="animate-spin text-emerald-600" size={48} /><p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Dashboard...</p></div>;

  const hasUrgentActions = (isSuperAdmin && stats.pending > 0) || stats.ungraded > 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-black pb-20">
      <div className="relative overflow-hidden bg-slate-900 rounded-3xl p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="relative z-10 space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
              <Sparkles size={14} className="text-emerald-400" /> Portal {currentUser.subject}
           </div>
           <h2 className="text-4xl font-black tracking-tighter">Halo, {currentUser.name.split(' ')[0]}</h2>
           <p className="text-slate-400 font-medium max-w-lg">Pantau aktivitas pengumpulan tugas dan perkembangan siswa Anda secara real-time.</p>
        </div>
      </div>

      {hasUrgentActions && (
        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Perlu Segera Ditangani</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {isSuperAdmin && stats.pending > 0 && (
              <div onClick={() => setActiveView('confirmations')} className="bg-orange-500 p-8 rounded-2xl text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-all flex items-center justify-between group">
                 <div className="flex items-center gap-6"><div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all"><UserPlus size={32} /></div><div><h3 className="text-2xl font-black">{stats.pending} Registrasi Baru</h3><p className="text-orange-100 font-medium text-sm">Konfirmasi akun siswa baru.</p></div></div><ChevronRight className="opacity-40" />
              </div>
            )}
            {stats.ungraded > 0 && (
              <div onClick={() => setActiveView('grades')} className="bg-indigo-600 p-8 rounded-2xl text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-all flex items-center justify-between group">
                 <div className="flex items-center gap-6"><div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:rotate-12 transition-all"><Award size={32} /></div><div><h3 className="text-2xl font-black">{stats.ungraded} Tugas Belum Dinilai</h3><p className="text-indigo-100 font-medium text-sm">Segera beri evaluasi & skor.</p></div></div><ChevronRight className="opacity-40" />
              </div>
            )}
          </div>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">Ringkasan Statistik</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Siswa Aktif', val: stats.students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Materi Saya', val: stats.materials, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Tugas Saya', val: stats.tasks, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Rombel', val: stats.classes, icon: School, color: 'text-amber-600', bg: 'bg-amber-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center flex flex-col items-center hover:shadow-lg transition-all">
              <div className={`${s.bg} ${s.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4 shadow-inner`}><s.icon size={28}/></div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest">{s.label}</p>
              <h4 className="text-4xl font-black text-slate-800 tracking-tighter">{s.val}</h4>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
