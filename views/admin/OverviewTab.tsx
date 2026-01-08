
import React, { useState, useEffect } from 'react';
import { Loader2, UserPlus, Award, Users, BookOpen, ClipboardList, School, Sparkles } from 'lucide-react';
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

  if (loading) return <div className="py-20 text-center"><Loader2 className="animate-spin mx-auto text-emerald-600" size={40}/></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-black">
      <div className="relative overflow-hidden bg-slate-900 rounded-[3rem] p-10 text-white shadow-2xl">
        <div className="relative z-10 space-y-4">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[10px] font-black uppercase tracking-widest">
              <Sparkles size={14} className="text-emerald-400" /> Dashboard Guru Informatika
           </div>
           <h2 className="text-4xl font-black tracking-tighter">Analitik Portal E-Learning</h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Siswa Aktif', val: stats.students, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Materi Belajar', val: stats.materials, icon: BookOpen, color: 'text-emerald-600', bg: 'bg-emerald-50' },
          { label: 'Tugas Terdaftar', val: stats.tasks, icon: ClipboardList, color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Total Kelas', val: stats.classes, icon: School, color: 'text-amber-600', bg: 'bg-amber-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm text-center flex flex-col items-center">
            <div className={`${s.bg} ${s.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4`}><s.icon size={28}/></div>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">{s.label}</p>
            <h4 className="text-4xl font-black text-slate-800">{s.val}</h4>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div onClick={() => setActiveView('confirmations')} className="bg-orange-500 p-10 rounded-[3rem] text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-all group">
           <UserPlus size={40} className="mb-4 group-hover:rotate-12 transition-transform" />
           <h3 className="text-3xl font-black">{stats.pending} Registrasi Baru</h3>
           <p className="text-orange-100 font-medium mt-2">Klik untuk memproses pendaftaran siswa.</p>
        </div>
        <div onClick={() => setActiveView('grades')} className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-xl cursor-pointer hover:scale-[1.02] transition-all group">
           <Award size={40} className="mb-4 group-hover:rotate-12 transition-transform" />
           <h3 className="text-3xl font-black">{stats.ungraded} Tugas Belum Dinilai</h3>
           <p className="text-indigo-100 font-medium mt-2">Klik untuk melihat pengumpulan tugas terbaru.</p>
        </div>
      </div>
    </div>
  );
};

export default OverviewTab;
