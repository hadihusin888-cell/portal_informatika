
import React, { useState, useMemo } from 'react';
import { 
  Award, Star, MessageCircle, TrendingUp, 
  CheckCircle2, Clock, Search, Filter,
  ArrowUpRight, Info, BookOpen, ChevronRight,
  Trophy, Target, Zap, FileText, LayoutList
} from 'lucide-react';
import { Submission, Task } from '../../types';

interface GradesTabProps {
  tasks: Task[];
  submissions: Submission[];
}

const GradesTab: React.FC<GradesTabProps> = ({ tasks, submissions }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'graded' | 'pending'>('all');

  // Logic: Hitung Statistik
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

  // Logic: Filter dan Pencarian
  const filteredGrades = useMemo(() => {
    return submissions.filter(s => {
      const task = tasks.find(t => t.id === s.taskId);
      const taskTitle = task?.title.toLowerCase() || '';
      const matchSearch = taskTitle.includes(search.toLowerCase());
      const isGraded = s.grade !== undefined && s.grade !== null;
      
      if (filter === 'graded') return matchSearch && isGraded;
      if (filter === 'pending') return matchSearch && !isGraded;
      return matchSearch;
    });
  }, [submissions, tasks, search, filter]);

  const getGradeBadgeStyle = (grade: number | undefined) => {
    if (grade === undefined || grade === null) return 'text-slate-400 bg-slate-50 border-slate-100';
    if (grade >= 85) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
    if (grade >= 75) return 'text-indigo-600 bg-indigo-50 border-indigo-100';
    return 'text-rose-600 bg-rose-50 border-rose-100';
  };

  const getLevelLabel = (avg: number) => {
    if (avg >= 90) return { label: 'Informatics Legend', icon: Trophy, color: 'text-amber-500' };
    if (avg >= 80) return { label: 'Tech Expert', icon: Zap, color: 'text-indigo-500' };
    if (avg >= 70) return { label: 'Digital Explorer', icon: Target, color: 'text-emerald-500' };
    return { label: 'Rising Learner', icon: TrendingUp, color: 'text-blue-500' };
  };

  const level = getLevelLabel(stats.average);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-black pb-24">
      
      {/* 1. Header Ringkasan Performa (Ukuran Lebih Kecil) */}
      <section className="grid grid-cols-1 lg:grid-cols-4 gap-5">
        <div className="lg:col-span-2 bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-between group">
           <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-24 -mt-24"></div>
           <div className="relative z-10">
              <div className="flex items-center gap-2 mb-3">
                 <div className="w-8 h-8 bg-white/10 rounded-lg flex items-center justify-center">
                    <Award size={16} className="text-amber-400" />
                 </div>
                 <span className="text-[9px] font-black uppercase tracking-widest opacity-60">Status Pencapaian</span>
              </div>
              <h2 className="text-2xl font-black mb-1 tracking-tight">Level: {level.label}</h2>
              <p className="text-slate-400 text-[11px] font-medium">Rata-rata dari <span className="text-white font-bold">{stats.totalGraded}</span> tugas dinilai.</p>
           </div>
           <div className="relative z-10 mt-6 flex items-center gap-4">
              <div className="flex-1 h-2 bg-white/5 rounded-full overflow-hidden border border-white/5">
                 <div className="h-full bg-emerald-500 rounded-full transition-all duration-1000" style={{ width: `${stats.average}%` }}></div>
              </div>
              <span className="text-xl font-black text-emerald-400">{stats.average}<span className="text-[10px] opacity-50 ml-0.5">/100</span></span>
           </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center gap-1 hover:border-emerald-200 transition-all">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Tugas Dinilai</p>
          <div className="flex items-end gap-2">
             <h3 className="text-3xl font-black text-slate-800">{stats.totalGraded}</h3>
             <span className="text-[10px] font-bold text-slate-300 mb-1">tugas</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-500 mt-1">
             <CheckCircle2 size={12} />
             <span className="text-[9px] font-bold">Lengkap</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col justify-center gap-1 hover:border-orange-200 transition-all">
          <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Dalam Antrean</p>
          <div className="flex items-end gap-2">
             <h3 className="text-3xl font-black text-slate-800">{stats.pending}</h3>
             <span className="text-[10px] font-bold text-slate-300 mb-1">tugas</span>
          </div>
          <div className="flex items-center gap-1.5 text-orange-400 mt-1">
             <Clock size={12} />
             <span className="text-[9px] font-bold">Proses</span>
          </div>
        </div>
      </section>

      {/* 2. Filter & Search Bar (Lebih Kompak) */}
      <section className="bg-white p-5 rounded-[2rem] border border-slate-100 shadow-sm flex flex-col md:flex-row gap-4 items-center">
        <div className="flex-1 w-full relative group">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="Cari tugas..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-6 py-3.5 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm focus:ring-4 focus:ring-emerald-500/5 outline-none transition-all placeholder:text-slate-300 shadow-inner"
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          {[
            { id: 'all', label: 'Semua', icon: LayoutList },
            { id: 'graded', label: 'Dinilai', icon: Star },
            { id: 'pending', label: 'Proses', icon: Clock }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id as any)}
              className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                filter === f.id 
                  ? 'bg-slate-900 text-white shadow-lg shadow-slate-200' 
                  : 'bg-white text-slate-400 border border-slate-100 hover:bg-slate-50'
              }`}
            >
              <f.icon size={12} /> {f.label}
            </button>
          ))}
        </div>
      </section>

      {/* 3. Tabel Hasil Nilai (Padding Diperkecil) */}
      <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 border-b border-slate-100 uppercase text-[9px] font-black text-slate-400 tracking-[0.15em]">
              <tr>
                <th className="px-8 py-5">Tugas Informatika</th>
                <th className="px-8 py-5">Penyerahan</th>
                <th className="px-8 py-5 text-center">Skor</th>
                <th className="px-8 py-5">Umpan Balik Guru</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredGrades.map((s: Submission) => {
                const task = tasks.find(t => t.id === s.taskId);
                const isGraded = s.grade !== undefined && s.grade !== null;
                const badgeStyle = getGradeBadgeStyle(s.grade);

                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-emerald-500 transition-colors">
                          <FileText size={20} />
                        </div>
                        <div>
                          <p className="font-black text-slate-800 text-sm leading-tight mb-1">{task?.title || 'Tugas Terhapus'}</p>
                          <span className="text-[8px] font-bold text-slate-300 uppercase tracking-widest">Modul Terkait</span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <span className="text-[13px] font-bold text-slate-600 leading-tight">{s.submittedAt.split(',')[0]}</span>
                        <span className="text-[9px] font-medium text-slate-300 uppercase">{s.submittedAt.split(',')[1] || 'Waktu'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className={`inline-flex flex-col items-center px-4 py-2 rounded-xl border ${badgeStyle} min-w-[70px] shadow-sm`}>
                        <span className="text-xl font-black leading-none">{isGraded ? s.grade : '-'}</span>
                        <span className="text-[7px] font-black uppercase tracking-widest mt-0.5 opacity-60">
                          {isGraded ? 'Skor' : 'Antrean'}
                        </span>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      {s.feedback ? (
                        <div className="max-w-xs bg-indigo-50/50 p-3 rounded-xl border border-indigo-100 flex gap-3">
                           <MessageCircle size={12} className="text-indigo-500 shrink-0 mt-0.5" />
                           <p className="text-[10px] text-indigo-700 font-medium leading-relaxed italic">"{s.feedback}"</p>
                        </div>
                      ) : (
                        <p className="text-[10px] text-slate-300 font-medium">Belum ada komentar.</p>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Empty State */}
        {filteredGrades.length === 0 && (
          <div className="py-20 text-center flex flex-col items-center justify-center border-t border-slate-50">
            <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-[1.5rem] flex items-center justify-center mb-5">
              <Star size={32} />
            </div>
            <h4 className="text-lg font-black text-slate-400 mb-1">Data Kosong</h4>
            <p className="text-slate-400 font-medium text-xs max-w-xs">
              {search ? `Tidak ada hasil untuk "${search}"` : 'Kamu belum mengumpulkan tugas apa pun.'}
            </p>
          </div>
        )}
      </section>

      {/* 4. Tips Section (Ukuran Lebih Kecil) */}
      <section className="bg-indigo-600 rounded-[2rem] p-8 md:p-10 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -ml-32 -mt-32"></div>
        <div className="relative z-10 space-y-3 text-center md:text-left">
           <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full text-[8px] font-black uppercase tracking-widest border border-white/10">
              <Zap size={12} className="text-amber-400 fill-amber-400" /> Tips Belajar
           </div>
           <h3 className="text-2xl font-black tracking-tight leading-tight">Gunakan Feedback untuk <br/>Tumbuh Lebih Baik!</h3>
           <p className="text-indigo-100 font-medium text-xs max-w-xs opacity-80 leading-relaxed">Perhatikan setiap catatan guru pada tugas yang sudah dinilai untuk meningkatkan skill-mu.</p>
        </div>
        <div className="relative z-10 shrink-0">
           <button onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})} className="px-8 py-4 bg-white text-indigo-600 rounded-xl font-black text-sm hover:bg-indigo-50 transition-all shadow-lg active:scale-95 flex items-center gap-2">
              Lanjut Belajar <ChevronRight size={16} />
           </button>
        </div>
      </section>

    </div>
  );
};

export default GradesTab;
