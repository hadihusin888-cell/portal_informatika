
import React, { useState, useMemo } from 'react';
import { 
  Award, Star, MessageCircle, TrendingUp, 
  CheckCircle2, Clock, Search, Filter,
  ArrowUpRight, Info, BookOpen, ChevronRight,
  Trophy, Target, Zap, FileText, LayoutList, SearchX
} from 'lucide-react';
import { Submission, Task } from '../../types';

interface GradesTabProps {
  tasks: Task[];
  submissions: Submission[];
}

const GradesTab: React.FC<GradesTabProps> = ({ tasks = [], submissions = [] }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'graded' | 'pending'>('all');
  const [subjectFilter, setSubjectFilter] = useState('all');

  const subjects = useMemo(() => {
    return Array.from(new Set(tasks.map(t => t.subject))).filter(Boolean);
  }, [tasks]);

  const stats = useMemo(() => {
    const gradedSubmissions = submissions.filter(s => s.grade !== undefined && s.grade !== null);
    const totalGrades = gradedSubmissions.reduce((acc, s) => acc + (s.grade || 0), 0);
    const average = gradedSubmissions.length > 0 ? Math.round(totalGrades / gradedSubmissions.length) : 0;
    
    return {
      average,
      totalGraded: gradedSubmissions.length,
      totalSubmitted: submissions.length,
      pending: submissions.length - gradedSubmissions.length
    };
  }, [submissions]);

  const filteredGrades = useMemo(() => {
    return submissions.filter(s => {
      const task = tasks.find(t => t.id === s.taskId);
      const taskTitle = task?.title.toLowerCase() || '';
      const taskSubject = task?.subject || '';
      const matchSearch = taskTitle.includes(search.toLowerCase());
      const isGraded = s.grade !== undefined && s.grade !== null;
      const matchSubject = subjectFilter === 'all' || taskSubject === subjectFilter;
      
      const matchStatus = filter === 'graded' ? isGraded : (filter === 'pending' ? !isGraded : true);
      
      return matchSearch && matchStatus && matchSubject;
    });
  }, [submissions, tasks, search, filter, subjectFilter]);

  const getGradeBadgeStyle = (grade: number | undefined) => {
    if (grade === undefined || grade === null) return 'text-slate-400 bg-slate-50 border-slate-100';
    if (grade >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (grade >= 75) return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-black pb-24">
      
      {/* Performance Summary */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-2 bg-slate-900 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl flex flex-col justify-between group">
           <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                 <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <Award size={20} className="text-amber-400" />
                 </div>
                 <span className="text-[10px] font-black uppercase tracking-widest opacity-60">Status Akademik</span>
              </div>
              <h2 className="text-3xl font-black mb-1 tracking-tight">Rata-rata Cloud</h2>
              <p className="text-slate-400 text-xs font-medium">Berdasarkan data <span className="text-white font-bold">{stats.totalGraded}</span> tugas yang sudah dinilai.</p>
           </div>
           <div className="relative z-10 mt-10 flex items-center gap-6">
              <div className="flex-1 h-3 bg-white/5 rounded-full overflow-hidden border border-white/5 shadow-inner">
                 <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${stats.average}%` }}></div>
              </div>
              <span className="text-4xl font-black text-emerald-400">{stats.average}<span className="text-xs opacity-50 ml-1">/100</span></span>
           </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Tugas Selesai</p>
          <div className="flex items-end gap-2">
             <h3 className="text-5xl font-black text-slate-800">{stats.totalSubmitted}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500 mt-2">
             <CheckCircle2 size={16} />
             <span className="text-[10px] font-bold">Progres Aktif</span>
          </div>
        </div>

        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm flex flex-col justify-center gap-2">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Sedang Dikoreksi</p>
          <div className="flex items-end gap-2">
             <h3 className="text-5xl font-black text-slate-800">{stats.pending}</h3>
          </div>
          <div className="flex items-center gap-1.5 text-orange-400 mt-2">
             <Clock size={16} />
             <span className="text-[10px] font-bold">Menunggu Guru</span>
          </div>
        </div>
      </section>

      {/* Filter Toolbar */}
      <section className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="flex-1 w-full relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Cari tugas..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:bg-white transition-all shadow-inner text-sm"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'all', label: 'Semua Status' },
              { id: 'graded', label: 'Dinilai' },
              { id: 'pending', label: 'Proses' }
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id as any)}
                className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                  filter === f.id ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 border border-slate-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="flex items-center gap-4 pt-4 border-t border-slate-50">
           <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Mata Pelajaran:</p>
           <div className="flex flex-wrap gap-2">
              <button 
                onClick={() => setSubjectFilter('all')}
                className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${subjectFilter === 'all' ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}
              >Semua</button>
              {subjects.map(sub => (
                <button 
                  key={sub}
                  onClick={() => setSubjectFilter(sub)}
                  className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${subjectFilter === sub ? 'bg-indigo-600 text-white' : 'bg-slate-50 text-slate-400'}`}
                >{sub}</button>
              ))}
           </div>
        </div>
      </section>

      {/* Grade Table */}
      <section className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 uppercase text-[10px] font-black text-slate-400 tracking-widest">
              <tr>
                <th className="px-10 py-6">Mata Pelajaran & Tugas</th>
                <th className="px-10 py-6">Penyerahan</th>
                <th className="px-10 py-6 text-center">Skor</th>
                <th className="px-10 py-6">Catatan Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredGrades.map((s: Submission) => {
                const task = tasks.find(t => t.id === s.taskId);
                const isGraded = s.grade !== undefined && s.grade !== null;
                const badgeStyle = getGradeBadgeStyle(s.grade);

                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-5">
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-slate-100 flex items-center justify-center text-indigo-600">
                          <BookOpen size={24} />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mb-1">{task?.subject}</p>
                          <p className="font-black text-slate-800 text-base leading-tight">{task?.title || 'Tugas'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-600 leading-tight">{s.submittedAt.split(',')[0]}</span>
                        <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest mt-1">{s.submittedAt.split(',')[1]}</span>
                      </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <div className={`inline-flex flex-col items-center px-6 py-3 rounded-2xl border ${badgeStyle} min-w-[90px] shadow-sm`}>
                        <span className="text-3xl font-black leading-none">{isGraded ? s.grade : '--'}</span>
                        <span className="text-[9px] font-black uppercase tracking-widest mt-1.5 opacity-60">
                          {isGraded ? 'Nilai Akhir' : 'Koreksi'}
                        </span>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      {s.feedback ? (
                        <div className="max-w-xs bg-indigo-50 p-4 rounded-2xl border border-indigo-100 flex gap-3">
                           <MessageCircle size={16} className="text-indigo-500 shrink-0 mt-0.5" />
                           <p className="text-[11px] text-indigo-700 font-medium leading-relaxed italic">"{s.feedback}"</p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest italic">Belum Ada Catatan</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredGrades.length === 0 && (
          <div className="py-32 text-center flex flex-col items-center justify-center">
            <SearchX size={64} className="text-slate-100 mb-6" />
            <h4 className="text-2xl font-black text-slate-300">Data Tidak Ditemukan</h4>
          </div>
        )}
      </section>
    </div>
  );
};

export default GradesTab;
