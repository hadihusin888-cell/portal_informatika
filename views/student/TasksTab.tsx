
import React, { useState, useMemo } from 'react';
import { 
  ClipboardList, CheckCircle2, Clock, Calendar, 
  AlertCircle, Send, LayoutList, CheckCircle, 
  ArrowRight, MessageSquare, Star, Loader2,
  X, Info, ExternalLink, Filter, Globe, PlayCircle,
  Link as LinkIcon, FileText, Zap, ChevronRight,
  Trophy, MousePointer2, Monitor, ArrowUpRight,
  PartyPopper, ShieldCheck, BadgeCheck, Award, SearchX
} from 'lucide-react';
import { db } from '../../App.tsx';
import { User, Submission, Task } from '../../types.ts';

interface TasksTabProps {
  user: User;
  tasks: Task[];
  submissions: Submission[];
  onRefresh: () => void;
}

const TasksTab: React.FC<TasksTabProps> = ({ user, tasks = [], submissions = [], onRefresh }) => {
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [link, setLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const subjects = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.subject))).filter(Boolean);
  }, [tasks]);

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
      const matchStatus = activeFilter === 'pending' ? !isSubmitted : (activeFilter === 'completed' ? isSubmitted : true);
      const matchSubject = subjectFilter === 'all' || t.subject === subjectFilter;
      return matchStatus && matchSubject;
    });
  }, [tasks, submissions, activeFilter, subjectFilter]);

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
    } else if (url.includes('drive.google.com/file/d/')) {
      // Handle Google Drive file preview
      embedUrl = url.replace('/view', '/preview').replace('/edit', '/preview');
    } else if (url.includes('canva.com/design/')) {
      const baseUrl = url.split('?')[0];
      embedUrl = baseUrl.includes('/view') ? `${baseUrl}?embed` : `${baseUrl}/view?embed`;
    } else if (url.includes('wordwall.net/resource/')) {
      embedUrl = url.replace('wordwall.net/resource/', 'wordwall.net/embed/resource/');
    } else if (url.toLowerCase().endsWith('.pdf')) {
      embedUrl = `https://docs.google.com/viewer?url=${encodeURIComponent(url)}&embedded=true`;
    }
    return embedUrl;
  };

  const handleSubmit = async () => {
    if (!selectedTask) return;
    if (selectedTask.isSubmissionEnabled && (!link || !link.startsWith('http'))) {
      alert("Masukkan tautan URL pengerjaan yang valid.");
      return;
    }

    setSubmitting(true);
    const newSub: Submission = {
      id: `sub_${Date.now()}`,
      taskId: selectedTask.id,
      studentId: user.id,
      content: link || 'Tugas Selesai',
      submittedAt: new Date().toLocaleString('id-ID'),
    };
    
    try {
      await db.add('elearning_submissions', newSub);
      setIsSuccess(true);
      setTimeout(() => {
        onRefresh();
        setLink('');
        setIsSuccess(false);
        setSelectedTask(null);
      }, 1500);
    } catch (err) {
      alert("Gagal mengirim.");
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
      <section className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', val: stats.total, color: 'bg-indigo-600', icon: LayoutList },
          { label: 'Belum Selesai', val: stats.pending, color: 'bg-orange-500', icon: Clock },
          { label: 'Sudah Selesai', val: stats.completed, color: 'bg-emerald-500', icon: CheckCircle2 }
        ].map(s => (
          <div key={s.label} className={`${s.color} p-6 rounded-2xl text-white flex flex-col justify-center shadow-lg`}>
            <div className="flex items-center gap-2 opacity-70 mb-2">
               <s.icon size={14} />
               <p className="text-[8px] font-black uppercase tracking-widest">{s.label}</p>
            </div>
            <h4 className="text-3xl font-black tracking-tight">{s.val}</h4>
          </div>
        ))}
      </section>

      {/* Filter Toolbar */}
      <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'pending', label: 'Perlu Dikerjakan' },
              { id: 'completed', label: 'Selesai' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveFilter(tab.id as any)}
                className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                  activeFilter === tab.id ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3">
             <Filter size={16} className="text-slate-300" />
             <select 
               value={subjectFilter} 
               onChange={e => setSubjectFilter(e.target.value)}
               className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2.5 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-indigo-500/5 transition-all"
             >
               <option value="all">Semua Mapel</option>
               {subjects.map(s => <option key={s} value={s}>{s}</option>)}
             </select>
          </div>
        </div>
      </section>

      {/* Task Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {filteredTasks.map(t => {
          const submission = submissions.find(s => s.taskId === t.id);
          const deadline = getDeadlineInfo(t.dueDate);
          const typeStyle = getTypeStyle(t.type);
          return (
            <div key={t.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col overflow-hidden relative">
              <div className={`h-24 ${typeStyle.bg} flex items-center justify-center relative`}>
                 <div className="absolute top-4 right-4">
                    <span className={`px-3 py-1 rounded-lg text-[8px] font-black uppercase tracking-widest flex items-center gap-1.5 bg-white/90 backdrop-blur-sm shadow-sm ${deadline.color}`}>
                      <Clock size={10} /> {deadline.label}
                    </span>
                 </div>
                 <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-indigo-600 text-white text-[8px] font-black uppercase tracking-widest rounded-lg shadow-sm">
                      {t.subject}
                    </span>
                 </div>
                 <typeStyle.icon size={36} className={`${typeStyle.text} opacity-20 group-hover:scale-125 transition-transform duration-700`} />
              </div>
              <div className="p-7 flex-1 flex flex-col">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-slate-100 text-slate-400">
                    {typeStyle.label}
                  </span>
                  {submission && (
                    <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-600 flex items-center gap-1">
                      <CheckCircle size={10} /> Selesai
                    </span>
                  )}
                </div>
                <h4 className="text-lg font-black text-slate-800 mb-2 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{t.title}</h4>
                <div className="mt-auto pt-4 flex gap-2">
                  <button 
                    onClick={() => { setSelectedTask(t); setIsSuccess(false); setLink(''); }}
                    className={`flex-[2] py-4 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 ${
                      submission 
                        ? 'bg-slate-50 text-slate-500 border border-slate-100' 
                        : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-xl'
                    }`}
                  >
                    {submission ? 'Lihat Detail' : 'Kerjakan Sekarang'} 
                  </button>
                  <a 
                    href={t.content} 
                    target="_blank" 
                    rel="noreferrer"
                    className="flex-1 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-200 transition-all flex items-center justify-center shadow-inner border border-slate-100"
                    title="Buka di Tab Baru"
                  >
                    <ExternalLink size={18} />
                  </a>
                </div>
              </div>
            </div>
          );
        })}

        {filteredTasks.length === 0 && (
           <div className="col-span-full py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
              <SearchX size={48} className="mx-auto text-slate-200 mb-4" />
              <p className="text-slate-400 font-black text-xs uppercase tracking-widest">Tidak ada tugas yang ditemukan.</p>
           </div>
        )}
      </section>

      {/* Modal Detail Tugas */}
      {selectedTask && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center p-6 animate-in fade-in zoom-in-95 duration-300">
            <div className="bg-white w-full max-w-5xl h-full md:h-auto md:max-h-[85vh] rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden border border-slate-100/50">
              <div className="p-4 md:px-8 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${getTypeStyle(selectedTask.type).bg} ${getTypeStyle(selectedTask.type).text} shadow-sm`}>
                      <ClipboardList size={24} />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-xl font-black text-slate-800 tracking-tight leading-none truncate max-w-[200px] md:max-w-none">{selectedTask.title}</h3>
                      <div className="flex items-center gap-3 mt-2">
                        <span className="text-indigo-600 font-black text-[9px] uppercase tracking-widest">{selectedTask.subject}</span>
                        <div className="w-1 h-1 bg-slate-200 rounded-full"></div>
                        <p className="text-slate-400 font-bold text-[9px] uppercase tracking-[0.15em] flex items-center gap-1.5">
                          <Calendar size={12} /> {selectedTask.dueDate}
                        </p>
                      </div>
                    </div>
                 </div>
                 <button onClick={() => setSelectedTask(null)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                    <X size={24} />
                 </button>
              </div>

              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                <div className="flex-[3] bg-slate-100 p-2 md:p-4 overflow-hidden border-r border-slate-50 flex flex-col">
                  <div className="bg-white border border-slate-200 p-2 rounded-xl mb-3 flex items-center justify-between gap-3 shadow-sm">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-8 h-8 bg-indigo-50 text-indigo-500 rounded-lg flex items-center justify-center shrink-0">
                        <Info size={16} />
                      </div>
                      <p className="text-[10px] font-bold text-slate-500 truncate">
                        {selectedTask.content}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => {
                          navigator.clipboard.writeText(selectedTask.content);
                          alert("Tautan berhasil disalin!");
                        }}
                        className="px-4 py-2 bg-slate-50 text-slate-500 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all"
                      >
                        Salin
                      </button>
                      <a href={selectedTask.content} target="_blank" rel="noreferrer" className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-lg flex items-center gap-2">
                        Tab Baru <ArrowUpRight size={12} />
                      </a>
                    </div>
                  </div>
                  <div className="flex-1 w-full bg-white rounded-2xl shadow-2xl overflow-hidden border-4 border-white relative">
                    {selectedTask.type === 'link' && !['youtube', 'youtu.be', 'docs.google', 'drive.google', 'canva', 'wordwall'].some(p => selectedTask.content.includes(p)) ? (
                      <div className="absolute inset-0 flex flex-col items-center justify-center p-10 text-center space-y-4 bg-slate-50">
                        <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-lg flex items-center justify-center text-indigo-500">
                          <Globe size={40} />
                        </div>
                        <div className="max-w-xs space-y-1">
                          <h4 className="text-lg font-black text-slate-800 uppercase tracking-tight">Tautan Luar</h4>
                          <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                            Situs ini mungkin tidak mendukung tampilan langsung. Silakan buka di tab baru.
                          </p>
                        </div>
                        <a 
                          href={selectedTask.content} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl flex items-center gap-2"
                        >
                          Buka Tautan <ExternalLink size={14} />
                        </a>
                      </div>
                    ) : (
                      <iframe 
                        src={getEmbedUrl(selectedTask.content)} 
                        className="w-full h-full border-0" 
                        allowFullScreen 
                        title="Task Content"
                        loading="lazy"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      ></iframe>
                    )}
                  </div>
                </div>

                <div className="flex-1 bg-white p-5 md:p-8 overflow-y-auto flex flex-col space-y-6 scrollbar-hide">
                  <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
                      <Info size={14} /> Instruksi Pengerjaan
                    </h4>
                    <p className="text-xs text-slate-600 font-medium leading-relaxed whitespace-pre-wrap bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      {selectedTask.description || 'Ikuti petunjuk di dalam modul untuk menyelesaikan tugas ini.'}
                    </p>
                  </div>

                  <div className="pt-6 border-t border-slate-50 space-y-6">
                    <h4 className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 flex items-center gap-2">
                      <Zap size={14} className="text-amber-500" /> Status Pengumpulan
                    </h4>

                    {currentSubmission ? (
                      <div className="space-y-4">
                        <div className="bg-emerald-50 border border-emerald-100 p-6 rounded-2xl relative overflow-hidden text-center">
                           <div className="relative z-10 space-y-2">
                              <BadgeCheck size={32} className="text-emerald-600 mx-auto" />
                              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Sudah Terkirim</p>
                              <p className="text-[10px] text-slate-500 font-bold">{currentSubmission.submittedAt}</p>
                           </div>
                        </div>
                        <div className="bg-slate-900 p-8 rounded-2xl text-white shadow-xl text-center">
                           <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3">Nilai Akhir</p>
                           <div className="text-5xl font-black text-white">
                              {currentSubmission.grade ?? '--'}
                           </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-6">
                        {selectedTask.isSubmissionEnabled && (
                          <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Tautan URL Hasil Kerja</label>
                            <input 
                              type="url"
                              value={link} 
                              onChange={e => setLink(e.target.value)} 
                              placeholder="https://docs.google.com/..." 
                              className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner" 
                            />
                          </div>
                        )}
                        <button 
                          onClick={handleSubmit} 
                          disabled={submitting || isSuccess} 
                          className={`w-full py-5 rounded-2xl font-black text-sm uppercase tracking-[0.15em] transition-all flex items-center justify-center gap-4 shadow-xl active:scale-[0.98] ${
                            isSuccess ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-indigo-600'
                          }`}
                        >
                          {submitting ? (
                            <Loader2 size={24} className="animate-spin" />
                          ) : isSuccess ? (
                            'Berhasil Terkirim!'
                          ) : link.trim() !== '' ? (
                            'Kirim Sekarang'
                          ) : (
                            'Selesai Mengerjakan'
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
