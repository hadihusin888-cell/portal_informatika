
import React, { useMemo } from 'react';
import { 
  BookOpen, ClipboardList, ArrowRight, Sparkles, 
  Calendar, Clock, Trophy, ChevronRight, Zap,
  PlayCircle, FileText, LayoutDashboard, Target,
  CheckCircle
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
    return [...materials].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 4);
  }, [materials]);

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 text-black pb-24 max-w-[1600px] mx-auto">
      
      {/* 1. High-End Welcome Banner */}
      <section className="relative overflow-hidden bg-slate-900 rounded-[2rem] md:rounded-[3.5rem] p-6 md:p-14 text-white shadow-2xl border border-white/5">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] -mr-40 -mt-40 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-indigo-500/10 rounded-full blur-[80px] -ml-20 -mb-20"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row items-center gap-6 md:gap-12">
          <div className="relative shrink-0">
            <div className="absolute -inset-4 bg-emerald-500/20 rounded-full blur-xl animate-pulse"></div>
            <img 
              src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
              className="w-20 h-20 md:w-36 md:h-36 rounded-full border-4 md:border-8 border-white/10 bg-slate-800 shadow-2xl relative z-10 object-cover" 
              alt="Avatar"
            />
            <div className="absolute bottom-0 right-0 bg-emerald-500 p-2 md:p-3 rounded-full border-4 border-slate-900 z-20 shadow-lg">
              <Trophy size={14} className="md:w-5 md:h-5 text-white" />
            </div>
          </div>
          
          <div className="text-center md:text-left space-y-2 md:space-y-4">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/5 backdrop-blur-md rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest border border-white/10">
              <Sparkles size={14} className="text-emerald-400" /> Dashboard Siswa Premium
            </div>
            <h2 className="text-2xl md:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
              {greeting}, <span className="text-emerald-400 italic">{user.name.split(' ')[0]}!</span>
            </h2>
            <p className="text-slate-400 font-medium text-sm md:text-xl max-w-xl">
              Siap untuk melanjutkan petualangan <span className="text-white font-bold">Informatika</span> di Kelas {user.classId}?
            </p>
          </div>
        </div>
      </section>

      {/* 2. Optimized Stats Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
        {/* Progress Card */}
        <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-row items-center justify-between group hover:shadow-xl transition-all duration-500">
          <div className="space-y-1">
            <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Penyelesaian Tugas</p>
            <h3 className="text-3xl md:text-4xl font-black text-slate-800">{completedTasksCount}<span className="text-slate-300 text-lg md:text-xl font-medium">/{tasks.length}</span></h3>
            <p className="text-xs text-emerald-600 font-bold flex items-center gap-1">
              <Target size={14} /> Fokus belajar hari ini
            </p>
          </div>
          <div className="relative w-20 h-20 md:w-28 md:h-28 flex items-center justify-center">
            <svg className="w-full h-full transform -rotate-90">
              <circle cx="50%" cy="50%" r="40%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-50" />
              <circle 
                cx="50%" cy="50%" r="40%" 
                stroke="currentColor" strokeWidth="8" fill="transparent" 
                strokeDasharray="251.2" 
                strokeDashoffset={251.2 - (251.2 * progressPercentage) / 100} 
                className="text-emerald-500 transition-all duration-1000 stroke-round" 
              />
            </svg>
            <span className="absolute text-sm md:text-lg font-black text-slate-700">{progressPercentage}%</span>
          </div>
        </div>

        {/* Quick Access Grid Container */}
        <div className="grid grid-cols-2 gap-4 md:gap-8 lg:col-span-2">
          <div onClick={() => setActiveView('materials')} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-start gap-4 cursor-pointer hover:bg-indigo-50 hover:border-indigo-100 transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 text-indigo-500/5 group-hover:scale-110 transition-transform duration-500">
               <BookOpen size={120} />
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:rotate-6 transition-all shadow-inner">
              <BookOpen size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
              <h4 className="text-2xl md:text-4xl font-black text-slate-800">{materials.length}</h4>
              <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Modul Materi</p>
            </div>
          </div>

          <div onClick={() => setActiveView('tasks')} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex flex-col items-start gap-4 cursor-pointer hover:bg-rose-50 hover:border-rose-100 transition-all group overflow-hidden relative">
            <div className="absolute -right-4 -bottom-4 text-rose-500/5 group-hover:scale-110 transition-transform duration-500">
               <ClipboardList size={120} />
            </div>
            <div className="w-12 h-12 md:w-16 md:h-16 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center group-hover:-rotate-6 transition-all shadow-inner">
              <ClipboardList size={24} className="md:w-8 md:h-8" />
            </div>
            <div>
              <h4 className="text-2xl md:text-4xl font-black text-slate-800">{tasks.length - completedTasksCount}</h4>
              <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">Tugas Menunggu</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Content Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-10">
        
        {/* Latest Materials - Left Column */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-50 rounded-xl text-emerald-600">
                <LayoutDashboard size={20} />
              </div>
              <h3 className="text-xl md:text-2xl font-black text-slate-800">Materi Terupdate</h3>
            </div>
            <button onClick={() => setActiveView('materials')} className="group flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest hover:text-slate-900 transition-colors">
              Lihat Perpustakaan <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
            {latestMaterials.map((m, idx) => (
              <div key={m.id} className="bg-white p-6 md:p-8 rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 group relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-slate-50 rounded-full -mr-16 -mt-16 group-hover:bg-emerald-50 transition-colors"></div>
                
                <div className="relative z-10 space-y-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                    {m.type === 'embed' ? <PlayCircle size={24} /> : <FileText size={24} />}
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-lg md:text-xl mb-2 line-clamp-1 group-hover:text-emerald-600 transition-colors">{m.title}</h4>
                    <p className="text-sm text-slate-500 font-medium line-clamp-2 leading-relaxed h-10">{m.description || 'Pelajari materi ini untuk meningkatkan pemahaman teknologi Anda.'}</p>
                  </div>
                  <div className="pt-2 flex items-center justify-between">
                    <a href={m.content} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-xs font-black text-emerald-600 uppercase tracking-widest">
                      Buka Modul <ArrowRight size={14} />
                    </a>
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">{m.createdAt.split(',')[0]}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Deadlines & Activity - Right Column */}
        <div className="lg:col-span-4 space-y-6">
          <div className="flex items-center gap-3 px-2">
            <div className="p-2 bg-rose-50 rounded-xl text-rose-500">
              <Clock size={20} />
            </div>
            <h3 className="text-xl md:text-2xl font-black text-slate-800">Papan Deadline</h3>
          </div>

          <div className="space-y-4">
            {tasks.filter(t => !submissions.some(s => s.taskId === t.id)).length > 0 ? (
              tasks.filter(t => !submissions.some(s => s.taskId === t.id)).slice(0, 5).map(t => (
                <div key={t.id} className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm flex items-center gap-5 hover:border-rose-200 hover:shadow-lg transition-all cursor-pointer group" onClick={() => setActiveView('tasks')}>
                  <div className="w-12 h-12 md:w-14 md:h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-rose-500 group-hover:text-white transition-all">
                    <Calendar size={20} className="md:w-6 md:h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h5 className="font-black text-sm md:text-base text-slate-800 truncate group-hover:text-rose-600 transition-colors">{t.title}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock size={12} className="text-slate-300" />
                      <p className="text-[10px] md:text-xs font-black text-slate-400 uppercase tracking-widest">{t.dueDate}</p>
                    </div>
                  </div>
                  <ChevronRight size={20} className="text-slate-200 group-hover:text-rose-400 transition-colors" />
                </div>
              ))
            ) : (
              <div className="bg-emerald-50 rounded-[2rem] p-10 border border-emerald-100 text-center space-y-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle size={32} className="text-emerald-500" />
                </div>
                <h4 className="font-black text-emerald-800">Semua Tugas Selesai!</h4>
                <p className="text-xs text-emerald-600 font-medium">Kamu bebas dari tanggungan hari ini. Kerja bagus!</p>
              </div>
            )}
            
            {/* Motivation Quote Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-slate-900 rounded-[2rem] p-8 text-white shadow-xl relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-full -mr-12 -mt-12 group-hover:scale-150 transition-transform duration-700"></div>
               <Zap size={24} className="text-amber-400 mb-4 animate-pulse" />
               <p className="text-sm italic font-medium opacity-80 leading-relaxed">
                 "Teknologi bukan hanya tentang alat, tetapi tentang bagaimana kita memecahkan masalah."
               </p>
               <div className="mt-4 pt-4 border-t border-white/10 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-black text-[10px]">AI</div>
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Guru Informatika</span>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomeTab;
