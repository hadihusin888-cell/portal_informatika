
import React, { useMemo, useEffect, useState } from 'react';
import { 
  BookOpen, ClipboardList, ArrowRight, Sparkles, 
  Calendar, Clock, Trophy, Zap, Target, CheckCircle, Briefcase, GraduationCap
} from 'lucide-react';
import { User } from '../../types';
import { db } from '../../App.tsx';

interface HomeTabProps {
  user: User;
  materials: any[];
  tasks: any[];
  submissions: any[]; 
  setActiveView: (view: string) => void;
  setSelectedSubjectFilter?: (subject: string) => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ user, materials = [], tasks = [], submissions = [], setActiveView, setSelectedSubjectFilter }) => {
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);

  // Daftar tema warna untuk kartu mata pelajaran
  const colorThemes = [
    { 
      primary: 'bg-indigo-600', 
      secondary: 'bg-indigo-50', 
      text: 'text-indigo-600', 
      border: 'hover:border-indigo-200',
      shadow: 'hover:shadow-indigo-100'
    },
    { 
      primary: 'bg-emerald-600', 
      secondary: 'bg-emerald-50', 
      text: 'text-emerald-600', 
      border: 'hover:border-emerald-200',
      shadow: 'hover:shadow-emerald-100'
    },
    { 
      primary: 'bg-rose-600', 
      secondary: 'bg-rose-50', 
      text: 'text-rose-600', 
      border: 'hover:border-rose-200',
      shadow: 'hover:shadow-rose-100'
    },
    { 
      primary: 'bg-amber-600', 
      secondary: 'bg-amber-50', 
      text: 'text-amber-600', 
      border: 'hover:border-amber-200',
      shadow: 'hover:shadow-amber-100'
    },
    { 
      primary: 'bg-violet-600', 
      secondary: 'bg-violet-50', 
      text: 'text-violet-600', 
      border: 'hover:border-violet-200',
      shadow: 'hover:shadow-violet-100'
    },
    { 
      primary: 'bg-cyan-600', 
      secondary: 'bg-cyan-50', 
      text: 'text-cyan-600', 
      border: 'hover:border-cyan-200',
      shadow: 'hover:shadow-cyan-100'
    },
  ];

  useEffect(() => {
    const fetchTeachers = async () => {
      const allUsers = await db.get('users');
      const teachers = Array.isArray(allUsers) ? allUsers.filter((u: any) => u.role === 'ADMIN' && u.subject) : [];
      const subjects = Array.from(new Set(teachers.map((t: any) => t.subject)));
      setAvailableSubjects(subjects as string[]);
    };
    fetchTeachers();
  }, []);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    if (hour < 11) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 19) return "Selamat Sore";
    return "Selamat Malam";
  }, []);

  const completedTasksCount = useMemo(() => {
    return tasks.filter(t => submissions.some(s => s.taskId === t.id)).length;
  }, [tasks, submissions]);

  const progressPercentage = tasks.length > 0 
    ? Math.round((completedTasksCount / tasks.length) * 100) 
    : 0;

  const handleSubjectClick = (subject: string) => {
    if (setSelectedSubjectFilter) {
      setSelectedSubjectFilter(subject);
    }
    setActiveView('materials');
  };

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 text-black pb-24 max-w-[1600px] mx-auto">
      
      {/* Welcome Banner */}
      <section className="relative overflow-hidden bg-slate-900 rounded-3xl p-10 md:p-14 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
          <img src={user.avatar} className="w-36 h-36 rounded-full border-8 border-white/10 bg-slate-800 shadow-2xl object-cover" alt="Avatar" />
          <div className="text-center md:text-left space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 rounded-full text-xs font-black uppercase tracking-widest border border-white/10">
              <Sparkles size={14} className="text-emerald-400" /> Portal Belajar Multi-Mapel
            </div>
            <h2 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
              {greeting}, <span className="text-emerald-400 italic">{user.name.split(' ')[0]}!</span>
            </h2>
            <p className="text-slate-400 font-medium text-xl max-w-xl">
              Siap untuk melanjutkan petualangan belajar di <span className="text-white font-bold">Kelas {user.classId}</span> hari ini?
            </p>
          </div>
        </div>
      </section>

      {/* Subjects Grid */}
      <section className="space-y-6">
        <div className="flex items-center gap-3 px-2">
           <div className="w-2 h-8 bg-indigo-500 rounded-full"></div>
           <h3 className="text-2xl font-black text-slate-800 tracking-tight">Mata Pelajaran Kamu</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
           {availableSubjects.map((subject, i) => {
             const theme = colorThemes[i % colorThemes.length];
             return (
               <div 
                  key={i} 
                  onClick={() => handleSubjectClick(subject)}
                  className={`bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl ${theme.shadow} ${theme.border} hover:-translate-y-2 transition-all duration-500 group relative overflow-hidden cursor-pointer`}
               >
                  <div className={`absolute -right-4 -top-4 w-24 h-24 ${theme.secondary} rounded-full opacity-50 group-hover:scale-150 transition-transform`}></div>
                  <div className="relative z-10 space-y-4">
                     <div className={`w-14 h-14 ${theme.primary} text-white rounded-2xl flex items-center justify-center shadow-lg group-hover:rotate-12 transition-transform`}>
                        <BookOpen size={28} />
                     </div>
                     <div>
                        <h4 className={`text-xl font-black text-slate-800 leading-tight group-hover:${theme.text} transition-colors uppercase`}>{subject}</h4>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">E-Learning Module</p>
                     </div>
                     <div className={`flex items-center gap-2 text-[10px] font-black ${theme.text} uppercase tracking-widest mt-4`}>
                        Masuk Kelas <ArrowRight size={14} />
                     </div>
                  </div>
               </div>
             );
           })}
           {availableSubjects.length === 0 && (
             <div className="col-span-full py-12 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                <Briefcase className="mx-auto text-slate-200 mb-4" size={48} />
                <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Belum ada mata pelajaran yang didaftarkan Guru.</p>
             </div>
           )}
        </div>
      </section>

      {/* Progress & Stats */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-10 rounded-3xl border border-slate-100 shadow-sm flex flex-col md:flex-row items-center justify-between gap-10">
           <div className="space-y-4">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Penyelesaian Tugas Keseluruhan</p>
              <h3 className="text-4xl font-black text-slate-800">{completedTasksCount} / {tasks.length} Selesai</h3>
              <p className="text-sm text-slate-500 font-medium">Terus tingkatkan semangat belajarmu untuk mencapai target akademik terbaik.</p>
           </div>
           <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                 <circle cx="50%" cy="50%" r="45%" stroke="#f1f5f9" strokeWidth="10" fill="transparent" />
                 <circle cx="50%" cy="50%" r="45%" stroke="#10b981" strokeWidth="10" fill="transparent" strokeDasharray="282.7" strokeDashoffset={282.7 - (282.7 * progressPercentage) / 100} className="transition-all duration-1000" />
              </svg>
              <span className="absolute text-xl font-black">{progressPercentage}%</span>
           </div>
        </div>

        <div className="bg-indigo-600 p-10 rounded-3xl text-white shadow-xl relative overflow-hidden flex flex-col justify-center gap-4">
           <Trophy size={48} className="text-amber-400 animate-bounce" />
           <h4 className="text-2xl font-black leading-tight">Membangun Masa Depan Melalui Digital</h4>
           <p className="text-indigo-100 text-sm opacity-80">Portal E-Learning Al Irsyad Surakarta kini mendukung integrasi berbagai mata pelajaran dalam satu cloud.</p>
        </div>
      </section>
    </div>
  );
};

export default HomeTab;
