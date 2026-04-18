
import React, { useMemo, useEffect, useState } from 'react';
import { 
  BookOpen, ClipboardList, ArrowRight, Sparkles, 
  Calendar, Clock, Trophy, Zap, Target, CheckCircle, Briefcase, GraduationCap,
  AlertTriangle, X, ChevronRight, ListTodo
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
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [hasShownPendingModal, setHasShownPendingModal] = useState(false);

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

  const pendingTasks = useMemo(() => {
    return tasks.filter(t => !submissions.some(s => s.taskId === t.id));
  }, [tasks, submissions]);

  useEffect(() => {
    if (!hasShownPendingModal && pendingTasks.length > 0 && tasks.length > 0) {
      setShowPendingModal(true);
      setHasShownPendingModal(true);
    }
  }, [pendingTasks, tasks, hasShownPendingModal]);

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
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 text-black pb-20 max-w-[1200px] mx-auto px-4">
      
      {/* Welcome Banner - Minimalist */}
      <section className="bg-slate-900 rounded-xl p-4 md:p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 rounded-full blur-3xl -mr-16 -mt-16"></div>
        <div className="relative z-10 flex items-center gap-4">
          <img src={user.avatar} className="w-12 h-12 md:w-16 md:h-16 rounded-xl border-2 border-white/10 bg-slate-800 shadow-lg object-cover" alt="Avatar" />
          <div className="space-y-1">
            <h2 className="text-xl md:text-2xl font-black tracking-tight leading-tight">
              {greeting}, <span className="text-emerald-400 italic">{user.name.toUpperCase()}!</span>
            </h2>
            <p className="text-slate-400 font-bold text-[9px] md:text-[10px] uppercase tracking-widest">
              Kelas <span className="text-white">{user.classId}</span> • SMP Al Irsyad Surakarta
            </p>
          </div>
        </div>
      </section>

      {/* Subjects Grid - Even More Minimalist */}
      <section className="space-y-3">
        <div className="flex items-center gap-2 px-1">
           <div className="w-0.5 h-4 bg-indigo-500 rounded-full"></div>
           <h3 className="text-xs font-black text-slate-400 tracking-widest uppercase">Mata Pelajaran</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
           {availableSubjects.map((subject, i) => {
             const theme = colorThemes[i % colorThemes.length];
             return (
               <div 
                  key={i} 
                  onClick={() => handleSubjectClick(subject)}
                  className={`bg-white p-3 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 group cursor-pointer flex flex-col items-center text-center gap-2`}
               >
                  <div className={`w-7 h-7 ${theme.primary} text-white rounded-lg flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform`}>
                    <BookOpen size={14} />
                  </div>
                  <h4 className="text-[9px] font-black text-slate-800 leading-tight uppercase group-hover:text-indigo-600 transition-colors">{subject}</h4>
               </div>
             );
           })}
           {availableSubjects.length === 0 && (
             <div className="col-span-full py-6 text-center bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-slate-400 font-black text-[8px] uppercase tracking-widest">Belum ada mata pelajaran.</p>
             </div>
           )}
        </div>
      </section>

      {/* Progress & Stats - Cleaner */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center justify-between gap-4">
           <div className="space-y-1">
              <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Progres Tugas</p>
              <h3 className="text-lg font-black text-slate-800 tracking-tight">{completedTasksCount} / {tasks.length} Selesai</h3>
              <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Terus tingkatkan semangat belajarmu!</p>
           </div>
           <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
              <svg className="w-full h-full transform -rotate-90">
                 <circle cx="50%" cy="50%" r="40%" stroke="#f1f5f9" strokeWidth="3" fill="transparent" />
                 <circle cx="50%" cy="50%" r="40%" stroke="#10b981" strokeWidth="3" fill="transparent" strokeDasharray="251.2" strokeDashoffset={251.2 - (251.2 * progressPercentage) / 100} className="transition-all duration-1000" />
              </svg>
              <span className="absolute text-[9px] font-black">{progressPercentage}%</span>
           </div>
        </div>

        <div className="bg-indigo-600 p-4 rounded-xl text-white shadow-md flex items-center gap-4">
           <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center shrink-0">
              <Trophy size={16} className="text-amber-400" />
           </div>
           <div>
              <h4 className="text-[9px] font-black leading-tight uppercase tracking-widest">E-Learning</h4>
              <p className="text-indigo-100 text-[7px] font-bold uppercase opacity-60 mt-0.5 tracking-widest">Al Irsyad Surakarta</p>
           </div>
        </div>
      </section>

      {/* MODAL TUGAS BELUM DIKERJAKAN */}
      {showPendingModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-300">
           <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setShowPendingModal(false)}></div>
           <div className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/20 overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-8 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center shadow-inner">
                       <AlertTriangle size={24} />
                    </div>
                    <button onClick={() => setShowPendingModal(false)} className="p-2 text-slate-300 hover:text-slate-900 transition-colors">
                       <X size={20} />
                    </button>
                 </div>

                 <div className="space-y-2">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Tugas Belum Selesai</h3>
                    <p className="text-slate-500 font-medium text-xs leading-relaxed">Kamu memiliki <span className="text-rose-600 font-black">{pendingTasks.length} tugas</span> yang belum dikerjakan. Ayo segera selesaikan!</p>
                 </div>

                 <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-hide">
                    {pendingTasks.map((t, i) => (
                       <div key={i} className="group p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between hover:bg-slate-100 transition-all">
                          <div className="space-y-1">
                             <div className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[8px] font-black uppercase tracking-widest inline-block border border-indigo-100">
                                {t.subject}
                             </div>
                             <h4 className="font-black text-slate-800 text-xs line-clamp-1">{t.title}</h4>
                          </div>
                          <ChevronRight size={14} className="text-slate-300 group-hover:translate-x-1 transition-transform" />
                       </div>
                    ))}
                 </div>

                 <div className="space-y-3">
                    <button 
                       onClick={() => { setActiveView('tasks'); setShowPendingModal(false); }}
                       className="w-full py-5 bg-slate-900 text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-xl shadow-slate-200 hover:bg-emerald-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                       <ListTodo size={16} /> Kerjakan Sekarang
                    </button>
                    <button 
                       onClick={() => setShowPendingModal(false)}
                       className="w-full py-5 bg-white text-slate-400 rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:text-slate-900 transition-all"
                    >
                       Nanti Saja
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default HomeTab;
