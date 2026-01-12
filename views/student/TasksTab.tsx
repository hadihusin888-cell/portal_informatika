
import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, CheckCircle2, Clock, Calendar, 
  AlertCircle, Send, LayoutList, CheckCircle, 
  ArrowRight, MessageSquare, Star, Loader2,
  X, Info, ExternalLink, Filter, Globe, PlayCircle,
  Link as LinkIcon, FileText, Zap, ChevronRight,
  Trophy, MousePointer2, Monitor, ArrowUpRight,
  PartyPopper, ShieldCheck, BadgeCheck, Award
} from 'lucide-react';
import { db } from '../../App.tsx';
import { User, Submission, Task } from '../../types.ts';

interface TasksTabProps {
  user: User;
  tasks: Task[];
  submissions: Submission[];
  onRefresh: () => void;
}

const TasksTab: React.FC<TasksTabProps> = ({ user, tasks, submissions, onRefresh }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [link, setLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const getDeadlineInfo = (dueDate: string) => {
    const now = new Date();
    const deadline = new Date(dueDate);
    const diffTime = deadline.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: 'Lampau', color: 'text-rose-500 bg-rose-50', icon: AlertCircle };
    if (diffDays <= 2) return { label: `${diffDays} hari`, color: 'text-orange-500 bg-orange-50', icon: Clock };
    return { label: `${diffDays} hari`, color: 'text-emerald-500 bg-emerald-50', icon: Calendar };
  };

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'embed': return { bg: 'bg-purple-50', text: 'text-purple-600', icon: PlayCircle, label: 'Interaktif' };
      case 'file': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: FileText, label: 'Modul' };
      case 'link': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: LinkIcon, label: 'Tautan' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', icon: ClipboardList, label: 'Tugas' };
    }
  };

  const filteredTasks = useMemo(() => {
    return tasks.filter(t => {
      const isSubmitted = submissions.some(s => s.taskId === t.id);
      if (activeFilter === 'pending') return !isSubmitted;
      if (activeFilter === 'completed') return isSubmitted;
      return true;
    });
  }, [tasks, submissions, activeFilter]);

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(t => submissions.some(s => s.taskId === t.id)).length;
    return { total, completed, pending: total - completed };
  }, [tasks, submissions]);

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      embedUrl = 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1];
    } else if (url.includes('docs.google.com')) {
      embedUrl = url.includes('?') ? `${url}&embedded=true` : `${url}?embedded=true`;
    }
    return embedUrl;
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;
    
    // Validasi input jika pengumpulan diaktifkan
    if (selectedTask.isSubmissionEnabled) {
      if (!link) {
        alert("Mohon masukkan link hasil pengerjaan Anda (Google Drive/Canva/URL lainnya).");
        return;
      }
      if (!link.startsWith('http')) {
        alert("Mohon masukkan URL yang valid (diawali dengan http:// atau https://).");
        return;
      }
    }

    setSubmitting(true);
    const newSub: Submission = {
      id: `sub_${Date.now()}`,
      taskId: selectedTask.id,
      studentId: user.id,
      content: link || 'Tugas Selesai (Tanpa Pengumpulan Link)',
      submittedAt: new Date().toLocaleString('id-ID'),
    };
    
    try {
      await db.add('elearning_submissions', newSub);
      setIsSuccess(true);
      
      // Berikan feedback visual sebentar sebelum menutup modal
      setTimeout(() => {
        onRefresh();
        setLink('');
        setIsSuccess(false);
        setSelectedTask(null);
      }, 1500);
    } catch (err) {
      alert("Gagal mengirim tugas. Mohon periksa koneksi internet Anda.");
      setSubmitting(false);
    }
  };

  const currentSubmission = useMemo(() => {
    if (!selectedTask) return null;
    return submissions.find(s => s.taskId === selectedTask.id);
  }, [selectedTask, submissions]);

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-700 text-black pb-24">
      {/* Dashboard Stats */}
      <section className="grid grid-cols-3 gap-2 md:gap-4">
        {[
          { label: 'Total', mobileLabel: 'Total', val: stats.total, color: 'bg-indigo-600', icon: LayoutList },
          { label: 'Belum Selesai', mobileLabel: 'Belum', val: stats.pending, color: 'bg-orange-500', icon: Clock },
          { label: 'Sudah Selesai', mobileLabel: 'Selesai', val: stats.completed, color: 'bg-emerald-500', icon: CheckCircle2 }
        ].map(s => (
          <div key={s.label} className={`${s.color} p-3 md:p-6 rounded-xl md:rounded-[2rem] text-white flex flex-col justify-center shadow-lg`}>
            <div className="flex items-center gap-1 md:gap-2 opacity-70 mb-1 md:mb-2">
               <s.icon size={10} className="md:w-3.5 md:h-3.5" />
               <p className="text-[7px] md:text-[8px] font-black uppercase tracking-widest truncate">{s.mobileLabel}</p>
            </div>
            <h4 className="text-xl md:text-3xl font-black tracking-tight">{s.val}</h4>
          </div>
        ))}
      </section>

      {/* Filter Tabs */}
      <section className="flex flex-wrap gap-1.5 md:gap-2">
        {[
          { id: 'all', label: 'Semua' },
          { id: 'pending', label: 'Perlu Dikerjakan' },
          { id: 'completed', label: 'Selesai' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-4 md:px-6 py-2 md:py-3 rounded-xl md:rounded-2xl text-[8px] md:text-[9px] font-black uppercase tracking-widest transition-all ${
              activeFilter === tab.id 
                ? 'bg-slate-900 text-white shadow-lg translate-y-[-1px]' 
                : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* Task Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {filteredTasks.map(t => {
          const submission = submissions.find(s => s.taskId === t.id);
          const deadline = getDeadlineInfo(t.dueDate);
          const typeStyle = getTypeStyle(t.type);
          return (
            <div key={t.id} className="bg-white rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden relative">
              <div className={`h-20 md:h-24 ${typeStyle.bg} flex items-center justify-center relative`}>
                 <div className="absolute top-3 right-3 md:top-4 md:right-4">
                    <span className={`px-2 md:px-3 py-0.5 md:py-1 rounded-full text-[7px] md:text-[8px] font-black uppercase tracking-widest flex items-center gap-1 bg-white/90 backdrop-blur-sm shadow-sm ${deadline.color}`}>
                      <Clock size={8} className="md:w-[10px] md:h-[10px]" /> {deadline.label}
                    </span>
                 </div>
                 <typeStyle.icon size={28} className={`${typeStyle.text} opacity-20 group-hover:scale-110 transition-transform duration-500 md:w-9 md:h-9`} />
              </div>
              <div className="p-5 md:p-7 flex-1 flex flex-col">
                <div className="flex items-center gap-1.5 mb-2 md:mb-3">
                  <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1.5 md:py-0.5 rounded-md bg-slate-100 text-slate-400`}>
                    {typeStyle.label}
                  </span>
                  {submission && (
                    <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest px-1.5 md:py-0.5 rounded-md bg-emerald-100 text-emerald-600 flex items-center gap-0.5">
                      <CheckCircle size={8} className="md:w-[10px] md:h-[10px]" /> Selesai
                    </span>
                  )}
                </div>
                <h4 className="text-sm md:text-lg font-black text-slate-800 mb-2 md:mb-3 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{t.title}</h4>
                <div className="mt-auto">
                  <button 
                    onClick={() => { setSelectedTask(t); setIsSuccess(false); setLink(''); }}
                    className={`w-full py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[8px] md:text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                      submission 
                        ? 'bg-slate-50 text-slate-500 border border-slate-100' 
                        : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg'
                    }`}
                  >
                    {submission ? 'Detail' : 'Kerjakan'} 
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Enhanced Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center p-2 md:p-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white w-full max-w-7xl h-full md:max-h-[90vh] rounded-2xl md:rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
              
              {/* Modal Header */}
              <div className="p-4 md:px-10 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                 <div className="flex items-center gap-3 md:gap-5">
                    <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl flex items-center justify-center ${getTypeStyle(selectedTask.type).bg} ${getTypeStyle(selectedTask.type).text} shadow-inner`}>
                      <ClipboardList size={20} className="md:w-7 md:h-7" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-xl font-black text-slate-800 tracking-tight leading-none truncate max-w-[180px] md:max-w-none">{selectedTask.title}</h3>
                      <p className="text-slate-400 font-bold text-[8px] md:text-[10px] uppercase tracking-[0.15em] mt-1 md:mt-2 flex items-center gap-1.5">
                        <Calendar size={10} className="md:w-3 md:h-3" /> {selectedTask.dueDate}
                      </p>
                    </div>
                 </div>
                 <button onClick={() => { if(!submitting) setSelectedTask(null); }} className="p-2 md:p-4 bg-slate-50 text-slate-400 rounded-lg md:rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90">
                    <X size={20} className="md:w-6 md:h-6" />
                 </button>
              </div>

              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Task Content / Iframe Area */}
                <div className="flex-[3] bg-slate-100 p-3 md:p-8 overflow-hidden border-r border-slate-50 flex flex-col min-h-[250px] md:min-h-0">
                  <div className="bg-blue-50 border border-blue-100 p-3 md:p-4 rounded-xl md:rounded-2xl mb-3 md:mb-4 flex items-center justify-between gap-2 md:gap-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <Info size={14} className="text-blue-500 shrink-0 md:w-4 md:h-4" />
                      <p className="text-[9px] md:text-[11px] font-bold text-blue-700 leading-tight">Gunakan viewer di bawah untuk melihat materi.</p>
                    </div>
                    <a href={selectedTask.content} target="_blank" rel="noreferrer" className="shrink-0 px-3 md:px-5 py-2 md:py-2.5 bg-white text-blue-600 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-blue-100 flex items-center gap-1.5">
                       <ExternalLink size={12} className="md:w-3.5 md:h-3.5" /> Buka
                    </a>
                  </div>
                  <div className="flex-1 w-full bg-white rounded-xl md:rounded-[2rem] shadow-xl overflow-hidden border-2 md:border-4 border-white relative">
                    <iframe 
                      src={getEmbedUrl(selectedTask.content)} 
                      className="w-full h-full border-0" 
                      allowFullScreen 
                      title="Task Content"
                      loading="lazy"
                    ></iframe>
                  </div>
                </div>

                {/* Sidebar / Submission Area */}
                <div className="flex-1 bg-white p-5 md:p-8 overflow-y-auto flex flex-col space-y-6 md:space-y-10 scrollbar-hide">
                  <div className="space-y-3">
                    <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5">
                      <Info size={12} className="md:w-3.5 md:h-3.5" /> Instruksi Guru
                    </h4>
                    <p className="text-[10px] md:text-xs text-slate-600 font-medium leading-relaxed italic bg-slate-50 p-4 md:p-6 rounded-xl md:rounded-[2rem] border border-slate-100 shadow-inner">
                      "{selectedTask.description || 'Selesaikan tugas ini tepat waktu.'}"
                    </p>
                  </div>

                  {/* Submission Status or Form */}
                  <div className="pt-6 md:pt-8 border-t border-slate-50 space-y-4 md:space-y-6">
                    <h4 className="text-[8px] md:text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-1.5">
                      <Zap size={12} className="text-amber-500 md:w-3.5 md:h-3.5" /> Status Pengumpulan
                    </h4>

                    {currentSubmission ? (
                      <div className="space-y-4">
                        {/* Submitted Content Card */}
                        <div className="bg-emerald-50 border border-emerald-100 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2.5rem] relative overflow-hidden">
                           <div className="relative z-10 space-y-3">
                              <div className="flex items-center gap-2 md:gap-3">
                                 <div className="w-8 h-8 md:w-10 md:h-10 bg-white rounded-lg md:rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                                    <BadgeCheck size={18} className="md:w-5 md:h-5" />
                                 </div>
                                 <div>
                                    <p className="text-[8px] md:text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Terkirim</p>
                                    <p className="text-[9px] md:text-[10px] text-slate-500 font-bold mt-0.5">{currentSubmission.submittedAt}</p>
                                 </div>
                              </div>
                              <div className="pt-3 border-t border-emerald-100 flex flex-col gap-1.5">
                                 <p className="text-[8px] md:text-[9px] font-black text-slate-400 uppercase tracking-widest">Keterangan:</p>
                                 <p className="text-[10px] md:text-[11px] font-bold text-slate-600 truncate">{currentSubmission.content}</p>
                              </div>
                           </div>
                        </div>

                        {/* Grading Card */}
                        <div className="bg-slate-900 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2.5rem] text-white shadow-xl text-center">
                           <Award size={24} className="text-indigo-400 mx-auto mb-2 md:w-8 md:h-8" />
                           <p className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Nilai</p>
                           <div className="text-3xl md:text-5xl font-black text-white">
                              {currentSubmission.grade ?? '--'}
                           </div>
                           {currentSubmission.grade === undefined && (
                             <p className="text-[8px] font-bold text-amber-400 mt-3 uppercase tracking-widest bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 inline-block">Proses Koreksi</p>
                           )}
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4 md:space-y-6">
                        {selectedTask.isSubmissionEnabled ? (
                          <div className="space-y-3">
                            <label className="text-[8px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Link Hasil Tugas (URL)</label>
                            <div className="relative">
                              <Globe className={`absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 transition-colors ${link ? 'text-emerald-500' : ''}`} />
                              <input 
                                type="url"
                                value={link} 
                                onChange={e => setLink(e.target.value)} 
                                placeholder="https://..." 
                                className="w-full p-4 pl-11 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner" 
                              />
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100">
                             <p className="text-[9px] md:text-[10px] font-bold text-amber-700 leading-relaxed italic text-center">
                               Tugas ini tidak memerlukan pengiriman link.
                             </p>
                          </div>
                        )}
                        
                        <button 
                          onClick={handleSubmit} 
                          disabled={submitting || isSuccess} 
                          className={`w-full py-4 md:py-6 rounded-xl md:rounded-3xl font-black text-xs md:text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-3 shadow-xl active:scale-[0.98] ${
                            isSuccess 
                              ? 'bg-emerald-600 text-white' 
                              : 'bg-slate-900 text-white hover:bg-emerald-600'
                          }`}
                        >
                          {submitting ? (
                            <Loader2 size={20} className="animate-spin" />
                          ) : isSuccess ? (
                            <>Berhasil!</>
                          ) : (
                            <>{selectedTask.isSubmissionEnabled ? 'Kirim Tugas' : 'Selesai'}</>
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
      )}
    </div>
  );
};

export default TasksTab;
