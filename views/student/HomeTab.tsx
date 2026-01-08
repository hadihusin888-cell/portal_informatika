
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
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 text-black pb-20">
      
      {/* 1. Header Welcome Section */}
      <section className="relative overflow-hidden bg-slate-900 rounded-[2.5rem] p-8 md:p-10 text-white shadow-2xl">
        <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/20 rounded-full blur-[100px] -mr-40 -mt-40"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
              className="w-20 h-20 md:w-24 md:h-24 rounded-full border-4 border-white/20 bg-white/10 backdrop-blur-md relative" 
              alt="Avatar"
            />
            <div className="absolute -bottom-1 -right-1 bg-emerald-500 p-1.5 rounded-full border-2 border-slate-900">
              <Zap size={12} className="fill-white" />
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-1">
            <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-white/10 rounded-full text-[9px] font-black uppercase tracking-widest border border-white/10">
              <Sparkles size={10} className="text-emerald-400" /> Kurikulum Informatika
            </div>
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">{greeting}, {user.name.split(' ')[0]}!</h2>
            <p className="text-slate-400 font-medium text-base">Kelas <span className="text-emerald-400 font-black">{user.classId}</span></p>
          </div>
        </div>
      </section>

      {/* 2. Stats & Progress Overview */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center justify-between group">
          <div className="space-y-0.5">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tugas Selesai</p>
            <h3 className="text-3xl font-black text-slate-800">{completedTasksCount}<span className="text-slate-300 text-lg font-medium">/{tasks.length}</span></h3>
          </div>
          <div className="relative w-16 h-16 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-50" />
              <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="6" fill="transparent" strokeDasharray={175.9} strokeDashoffset={175.9 - (175.9 * progressPercentage) / 100} className="text-emerald-500 transition-all duration-1000" />
            </svg>
            <span className="absolute text-[10px] font-black text-slate-700">{progressPercentage}%</span>
          </div>
        </div>

        <div onClick={() => setActiveView('materials')} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-blue-50 transition-all group">
          <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen size={24} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-800">{materials.length}</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Materi Belajar</p>
          </div>
        </div>

        <div onClick={() => setActiveView('tasks')} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-4 cursor-pointer hover:bg-purple-50 transition-all group">
          <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
            <ClipboardList size={24} />
          </div>
          <div>
            <h4 className="text-2xl font-black text-slate-800">{tasks.length - completedTasksCount}</h4>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tugas Aktif</p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Latest Materials */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex items-center justify-between px-2">
            <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
              <Zap size={18} className="text-amber-500 fill-amber-500" /> Materi Terupdate
            </h3>
            <button onClick={() => setActiveView('materials')} className="text-[9px] font-black text-emerald-600 uppercase tracking-widest hover:underline">
              Semua <ChevronRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {latestMaterials.map(m => (
              <div key={m.id} className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-lg transition-all group overflow-hidden relative">
                <div className="relative z-10">
                  <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                    {m.type === 'embed' ? <PlayCircle size={20} /> : <FileText size={20} />}
                  </div>
                  <h4 className="font-black text-slate-800 mb-1 leading-tight group-hover:text-emerald-600 transition-colors line-clamp-1">{m.title}</h4>
                  <p className="text-[11px] text-slate-400 font-medium mb-4 line-clamp-2 leading-relaxed">{m.description}</p>
                  <a href={m.content} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest">
                    Pelajari <ArrowRight size={12} />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines */}
        <div className="lg:col-span-4 space-y-4">
          <h3 className="text-lg font-black text-slate-800 flex items-center gap-2 px-2">
            <Clock size={18} className="text-rose-500" /> Deadline
          </h3>
          <div className="space-y-3">
            {tasks.filter(t => !submissions.some(s => s.taskId === t.id)).slice(0, 3).map(t => (
              <div key={t.id} className="bg-white p-4 rounded-[1.5rem] border border-slate-100 shadow-sm flex items-center gap-3 hover:border-rose-200 transition-all cursor-pointer group" onClick={() => setActiveView('tasks')}>
                <div className="w-10 h-10 bg-rose-50 text-rose-500 rounded-lg flex items-center justify-center shrink-0">
                  <Calendar size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <h5 className="font-bold text-sm text-slate-800 truncate group-hover:text-rose-600 transition-colors">{t.title}</h5>
                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{t.dueDate}</p>
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
