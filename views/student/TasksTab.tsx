
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
      content: link || 'Tugas Selesai (Sesuai Instruksi)',
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
    <div className="space-y-8 animate-in fade-in duration-700 text-black pb-24">
      {/* Dashboard Stats */}
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Tugas', val: stats.total, color: 'bg-indigo-600', icon: LayoutList },
          { label: 'Belum Selesai', val: stats.pending, color: 'bg-orange-500', icon: Clock },
          { label: 'Sudah Selesai', val: stats.completed, color: 'bg-emerald-500', icon: CheckCircle2 }
        ].map(s => (
          <div key={s.label} className={`${s.color} p-6 rounded-[2rem] text-white flex flex-col justify-center shadow-lg`}>
            <div className="flex items-center gap-2 opacity-70 mb-2">
               <s.icon size={14} />
               <p className="text-[8px] font-black uppercase tracking-widest">{s.label}</p>
            </div>
            <h4 className="text-3xl font-black tracking-tight">{s.val}</h4>
          </div>
        ))}
      </section>

      {/* Filter Tabs */}
      <section className="flex flex-wrap gap-2">
        {[
          { id: 'all', label: 'Semua Tugas' },
          { id: 'pending', label: 'Perlu Dikerjakan' },
          { id: 'completed', label: 'Selesai' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id as any)}
            className={`px-6 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
              activeFilter === tab.id 
                ? 'bg-slate-900 text-white shadow-xl translate-y-[-2px]' 
                : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </section>

      {/* Task Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {filteredTasks.map(t => {
          const submission = submissions.find(s => s.taskId === t.id);
          const deadline = getDeadlineInfo(t.dueDate);
          const typeStyle = getTypeStyle(t.type);
          return (
            <div key={t.id} className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col overflow-hidden relative">
              <div className={`h-24 ${typeStyle.bg} flex items-center justify-center relative`}>
                 <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-white/90 backdrop-blur-sm shadow-sm ${deadline.color}`}>
                      <Clock size={10} /> {deadline.label}
                    </span>
                 </div>
                 <typeStyle.icon size={36} className={`${typeStyle.text} opacity-20 group-hover:scale-110 transition-transform duration-500`} />
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-100 text-slate-400`}>
                    {typeStyle.label}
                  </span>
                  {submission && (
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-600 flex items-center gap-1">
                      <CheckCircle size={10} /> Selesai
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-black text-slate-800 mb-3 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{t.title}</h4>
                <div className="mt-auto">
                  <button 
                    onClick={() => { setSelectedTask(t); setIsSuccess(false); setLink(''); }}
                    className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                      submission 
                        ? 'bg-slate-50 text-slate-500 border border-slate-100 hover:bg-slate-100' 
                        : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl shadow-slate-100'
                    }`}
                  >
                    {submission ? 'Lihat Detail' : 'Kerjakan Sekarang'} 
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* Enhanced Task Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-10 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white w-full max-w-7xl h-full md:max-h-[90vh] rounded-[3rem] shadow-2xl flex flex-col overflow-hidden border border-white/20">
              
              {/* Modal Header */}
              <div className="p-6 md:px-10 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                 <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${getTypeStyle(selectedTask.type).bg} ${getTypeStyle(selectedTask.type).text} shadow-inner`}>
                      <ClipboardList size={28} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none">{selectedTask.title}</h3>
                      <p className="text-slate-400 font-bold text-[10px] uppercase tracking-[0.2em] mt-2 flex items-center gap-2">
                        <Calendar size={12} /> Tenggat: {selectedTask.dueDate}
                      </p>
                    </div>
                 </div>
                 <button onClick={() => { if(!submitting) setSelectedTask(null); }} className="p-4 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90">
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Task Content / Iframe Area */}
                <div className="flex-[3] bg-slate-100 p-4 md:p-8 overflow-hidden border-r border-slate-50 flex flex-col">
                  <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl mb-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <Info size={18} className="text-blue-500 shrink-0" />
                      <p className="text-[11px] font-bold text-blue-700 leading-tight">Gunakan viewer di bawah untuk melihat soal/materi tugas secara langsung.</p>
                    </div>
                    <a href={selectedTask.content} target="_blank" rel="noreferrer" className="shrink-0 px-5 py-2.5 bg-white text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-600 hover:text-white transition-all flex items-center gap-2">
                       <ExternalLink size={14} /> Buka Tab Baru
                    </a>
                  </div>
                  <div className="flex-1 w-full bg-white rounded-[2rem] shadow-2xl overflow-hidden border-4 border-white relative">
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
                <div className="flex-1 bg-white p-8 overflow-y-auto flex flex-col space-y-10 scrollbar-hide">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Info size={14} /> Instruksi Guru
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed italic bg-slate-50 p-6 rounded-[2rem] border border-slate-100 shadow-inner">
                      "{selectedTask.description || 'Harap selesaikan tugas ini dengan teliti dan tepat waktu sesuai instruksi yang diberikan.'}"
                    </p>
                  </div>

                  {/* Submission Status or Form */}
                  <div className="pt-8 border-t border-slate-50 space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                      <Zap size={14} className="text-amber-500" /> Status Pengumpulan
                    </h4>

                    {currentSubmission ? (
                      <div className="space-y-6">
                        {/* Submitted Content Card */}
                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-[2.5rem] relative overflow-hidden group">
                           <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-100 rounded-full -mr-12 -mt-12 opacity-50"></div>
                           <div className="relative z-10 space-y-4">
                              <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-emerald-600 shadow-sm">
                                    <BadgeCheck size={22} />
                                 </div>
                                 <div>
                                    <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Tugas Terkirim</p>
                                    <p className="text-[10px] text-slate-500 font-bold mt-1">{currentSubmission.submittedAt}</p>
                                 </div>
                              </div>
                              <div className="pt-4 border-t border-emerald-100 flex flex-col gap-2">
                                 <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Link Hasil Pekerjaan:</p>
                                 <a 
                                  href={currentSubmission.content} 
                                  target="_blank" 
                                  rel="noreferrer" 
                                  className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-2 truncate"
                                 >
                                    <LinkIcon size={12} /> {currentSubmission.content}
                                 </a>
                              </div>
                           </div>
                        </div>

                        {/* Grading Card */}
                        <div className="bg-slate-900 p-8 rounded-[2.5rem] text-white shadow-xl relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl -mr-16 -mt-16"></div>
                           <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                              <Award size={32} className="text-indigo-400" />
                              <div>
                                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-3">Hasil Penilaian</p>
                                 <div className="text-5xl font-black tracking-tighter text-white">
                                    {currentSubmission.grade !== undefined && currentSubmission.grade !== null 
                                      ? currentSubmission.grade 
                                      : <span className="text-slate-600 italic">--</span>}
                                 </div>
                                 {currentSubmission.grade === undefined || currentSubmission.grade === null ? (
                                   <p className="text-[9px] font-bold text-amber-400 mt-4 uppercase tracking-widest bg-amber-400/10 px-4 py-2 rounded-full border border-amber-400/20">Menunggu Koreksi Guru</p>
                                 ) : (
                                   <div className="mt-6 p-4 bg-white/5 border border-white/10 rounded-2xl w-full">
                                      <p className="text-[11px] font-medium text-slate-300 italic">
                                         {currentSubmission.feedback ? `"${currentSubmission.feedback}"` : "Selamat! Tugasmu sudah dinilai."}
                                      </p>
                                   </div>
                                 )}
                              </div>
                           </div>
                        </div>
                      </div>
                    ) : (
                      selectedTask.isSubmissionEnabled ? (
                        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
                          <div className="p-6 bg-blue-50 rounded-[2rem] border border-blue-100">
                             <p className="text-[10px] font-bold text-blue-700 leading-relaxed italic">
                               Siswa diperbolehkan mengumpulkan tugas melalui link Google Drive, Canva, atau platform lainnya. Pastikan link dapat diakses oleh Guru.
                             </p>
                          </div>
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">Tautan Hasil Pekerjaan (URL)</label>
                            <div className="relative group">
                              <Globe className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${link ? 'text-emerald-500' : 'text-slate-300'}`} size={20} />
                              <input 
                                type="url"
                                value={link} 
                                onChange={e => setLink(e.target.value)} 
                                placeholder="https://canva.com/..." 
                                className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-2xl text-xs font-bold outline-none focus:bg-white focus:border-emerald-500 transition-all shadow-inner" 
                              />
                            </div>
                          </div>
                          
                          <button 
                            onClick={handleSubmit} 
                            disabled={submitting || isSuccess} 
                            className={`w-full py-6 rounded-3xl font-black text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-4 shadow-2xl active:scale-[0.98] ${
                              isSuccess 
                                ? 'bg-emerald-600 text-white' 
                                : 'bg-slate-900 text-white hover:bg-emerald-600 shadow-slate-100 hover:shadow-emerald-200'
                            }`}
                          >
                            {submitting ? (
                              <Loader2 size={24} className="animate-spin" />
                            ) : isSuccess ? (
                              <>
                                <PartyPopper size={24} className="animate-bounce" /> Berhasil Dikirim!
                              </>
                            ) : (
                              <>
                                <Send size={20} /> Kirim Sekarang
                              </>
                            )}
                          </button>
                          
                          <p className="text-center text-[9px] text-slate-400 font-bold uppercase tracking-widest">
                            Tugas yang dikirim tidak dapat diubah tanpa seizin Guru.
                          </p>
                        </div>
                      ) : (
                        <div className="p-10 bg-rose-50 rounded-[2.5rem] border border-rose-100 text-center space-y-4">
                           <div className="w-16 h-16 bg-white rounded-3xl flex items-center justify-center text-rose-500 mx-auto shadow-sm">
                              <AlertCircle size={32} />
                           </div>
                           <h5 className="text-base font-black text-rose-800">Pengumpulan Ditutup</h5>
                           <p className="text-[10px] text-rose-600 font-bold uppercase tracking-widest leading-relaxed">Tugas ini bersifat informasi atau waktu pengumpulan telah berakhir.</p>
                        </div>
                      )
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
