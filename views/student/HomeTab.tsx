
import React, { useMemo } from 'react';
import { 
  BookOpen, ClipboardList, ArrowRight, Sparkles, 
  Calendar, Clock, Trophy, ChevronRight, Zap,
  PlayCircle, FileText
} from 'lucide-react';
import { User } from '../../types';

interface HomeTabProps {
  user: User;
  materials: any[];
  tasks: any[];
  submissions: any[]; 
  setActiveView: (view: string) => void;
}

const HomeTab: React.FC<HomeTabProps> = ({ user, materials, tasks, submissions = [], setActiveView }) => {
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

  const latestMaterials = useMemo(() => {
    return [...materials].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 2);
  }, [materials]);

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-black pb-20">
      
      {/* 1. Header Welcome Section */}
      <section className="relative overflow-hidden bg-slate-900 rounded-2xl md:rounded-[2.5rem] p-5 md:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-40 h-40 md:w-80 md:h-80 bg-emerald-500/20 rounded-full blur-[50px] md:blur-[100px] -mr-20 -mt-20 md:-mr-40 md:-mt-40"></div>
        
        <div className="relative z-10 flex flex-row items-center gap-4 md:gap-6">
          <div className="relative shrink-0">
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
              className="w-16 h-16 md:w-24 md:h-24 rounded-full border-4 border-white/20 bg-white/10 backdrop-blur-md relative" 
              alt="Avatar"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1 md:p-1.5 rounded-full border-2 border-slate-900">
              <Zap size={10} className="fill-white" />
            </div>
          </div>
          
          <div className="text-left space-y-0.5">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-white/10 rounded-full text-[8px] md:text-[9px] font-black uppercase tracking-widest border border-white/10">
              <Sparkles size={8} className="text-emerald-400" /> E-Learning
            </div>
            <h2 className="text-xl md:text-4xl font-black tracking-tight leading-tight">{greeting}, {user.name.split(' ')[0]}!</h2>
            <p className="text-slate-400 font-medium text-xs md:text-base">Kelas <span className="text-emerald-400 font-black">{user.classId}</span></p>
          </div>
        </div>
      </section>

      {/* 2. Stats & Progress Overview */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div className="space-y-0.5">
            <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Tugas Selesai</p>
            <h3 className="text-2xl md:text-3xl font-black text-slate-800">{completedTasksCount}<span className="text-slate-300 text-sm md:text-lg font-medium">/{tasks.length}</span></h3>
          </div>
          <div className="relative w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-50 md:hidden" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-50 hidden md:block" />
              
              {/* Desktop Progress */}
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * progressPercentage) / 100} className="text-emerald-500 transition-all duration-1000 hidden md:block" />
              {/* Mobile Progress */}
              <circle cx="24" cy="24" r="20" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={125.6} strokeDashoffset={125.6 - (125.6 * progressPercentage) / 100} className="text-emerald-500 transition-all duration-1000 md:hidden" />
            </svg>
            <span className="absolute text-[8px] md:text-[10px] font-black text-slate-700">{progressPercentage}%</span>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-2 gap-3 md:gap-6">
          <div onClick={() => setActiveView('materials')} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 cursor-pointer hover:bg-blue-50 transition-all group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <BookOpen size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-xl md:text-2xl font-black text-slate-800">{materials.length}</h4>
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Materi</p>
            </div>
          </div>

          <div onClick={() => setActiveView('tasks')} className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row items-center md:items-center gap-2 md:gap-4 cursor-pointer hover:bg-purple-50 transition-all group">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ClipboardList size={20} className="md:w-6 md:h-6" />
            </div>
            <div className="text-center md:text-left">
              <h4 className="text-xl md:text-2xl font-black text-slate-800">{tasks.length - completedTasksCount}</h4>
              <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Tugas Aktif</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 md:gap-8">
        {/* Latest Materials */}
        <div className="lg:col-span-8 space-y-3 md:space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2">
              <Zap size={16} className="text-amber-500 fill-amber-500" /> Materi Terupdate
            </h3>
            <button onClick={() => setActiveView('materials')} className="text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline">
              Semua <ChevronRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
            {latestMaterials.map(m => (
              <div key={m.id} className="bg-white p-5 md:p-6 rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                <div className="relative z-10">
                  <div className="w-8 h-8 md:w-10 md:h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-3 md:mb-4">
                    {m.type === 'embed' ? <PlayCircle size={18} /> : <FileText size={18} />}
                  </div>
                  <h4 className="font-black text-slate-800 text-sm md:text-base mb-1 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-1">{m.title}</h4>
                  <p className="text-[10px] md:text-[11px] text-slate-400 font-medium mb-3 md:mb-4 line-clamp-2 leading-relaxed">{m.description}</p>
                  <a href={m.content} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                    Pelajari <ArrowRight size={10} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines */}
        <div className="lg:col-span-4 space-y-3 md:space-y-4">
          <h3 className="text-base md:text-lg font-black text-slate-800 flex items-center gap-2 px-1">
            <Clock size={16} className="text-rose-500" /> Deadline
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2 md:gap-3">
            {tasks.filter(t => !submissions.some(s => s.taskId === t.id)).slice(0, 3).map(t => (
              <div key={t.id} className="bg-white p-3 md:p-4 rounded-xl md:rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-3 hover:border-rose-200 transition-all cursor-pointer group" onClick={() => setActiveView('tasks')}>
                <div className="w-9 h-9 md:w-10 md:h-10 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar size={16} className="md:w-[18px] md:h-[18px]" />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-xs md:text-sm text-slate-800 truncate group-hover:text-rose-600 transition-colors">{t.title}</h5>
                  <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.dueDate}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
