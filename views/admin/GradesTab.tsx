
import React, { useState, useEffect, useMemo } from 'react';
import { Loader2, History, Clock, ClipboardCheck, Search, Filter, ClipboardList, ExternalLink, GraduationCap, X, Eye, Award, Star, MessageCircle, Save, MessageSquare } from 'lucide-react';
import { db } from '../../App.tsx';
import { Submission, Task, User, ClassRoom } from '../../types.ts';
import { notifyStudents } from '../../utils/helpers.ts';

interface GradesTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
}

const GradesTab: React.FC<GradesTabProps> = ({ triggerConfirm, classes }) => {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [gradeModal, setGradeModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [taskFilter, setTaskFilter] = useState('');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [s, t, u] = await Promise.all([
          db.get('elearning_submissions'), 
          db.get('elearning_tasks'), 
          db.get('users')
        ]);
        setSubs(Array.isArray(s) ? s : []);
        setTasks(Array.isArray(t) ? t : []);
        setAllUsers(Array.isArray(u) ? u : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const filteredSubs = useMemo(() => {
    return subs.filter(s => {
      const student = allUsers.find(st => st.id === s.studentId);
      const task = tasks.find(t => t.id === s.taskId);
      
      const matchSearch = (student?.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (task?.title || '').toLowerCase().includes(search.toLowerCase());
      const matchClass = !classFilter || student?.classId === classFilter;
      const matchTask = !taskFilter || s.taskId === taskFilter;
      
      return matchSearch && matchClass && matchTask;
    });
  }, [subs, allUsers, tasks, search, classFilter, taskFilter]);

  const stats = useMemo(() => ({
    total: filteredSubs.length,
    graded: filteredSubs.filter(s => s.grade !== undefined && s.grade !== null).length,
    pending: filteredSubs.filter(s => s.grade === undefined || s.grade === null).length
  }), [filteredSubs]);

  const handleGrade = async () => {
    if (gradeModal.grade === undefined || gradeModal.grade === "" || gradeModal.grade < 0 || gradeModal.grade > 100) {
      alert("Masukkan nilai yang valid (0-100)");
      return;
    }
    
    try {
      const updatedSubmission = { 
        ...gradeModal, 
        grade: Number(gradeModal.grade),
        feedback: gradeModal.feedback || '' 
      };
      await db.update('elearning_submissions', gradeModal.id, updatedSubmission);
      setSubs(subs.map(s => s.id === gradeModal.id ? updatedSubmission : s));
      
      notifyStudents([], "Tugas Telah Dinilai!", `Tugas Anda telah dinilai dengan skor ${gradeModal.grade}.`, "grade", gradeModal.studentId);
      alert("Nilai dan umpan balik berhasil disimpan!");
      setGradeModal(null);
    } catch (err) {
      alert("Gagal menyimpan nilai.");
    }
  };

  if (loading) return (
    <div className="py-32 flex flex-col items-center justify-center gap-4 text-black">
      <Loader2 className="animate-spin text-indigo-600" size={48} />
      <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Sinkronisasi Nilai Cloud...</p>
    </div>
  );

  return (
    <div className="space-y-8 text-black animate-in fade-in duration-500 pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Pekerjaan Masuk', val: stats.total, icon: History, col: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Menunggu Nilai', val: stats.pending, icon: Clock, col: 'text-orange-600', bg: 'bg-orange-50' },
          { label: 'Selesai Dinilai', val: stats.graded, icon: ClipboardCheck, col: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm flex items-center gap-6">
            <div className={`${s.bg} ${s.col} w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner`}><s.icon size={28}/></div>
            <div>
              <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest leading-none mb-1">{s.label}</p>
              <h4 className="text-3xl font-black text-slate-800 tracking-tighter">{s.val}</h4>
            </div>
          </div>
        ))}
      </div>

      <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Cari nama siswa atau judul tugas..." 
              value={search} 
              onChange={e => setSearch(e.target.value)} 
              className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-transparent rounded-2xl font-bold text-sm outline-none focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all shadow-inner" 
            />
          </div>
          <div className="w-full md:w-64 relative group">
            <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <select 
              value={classFilter} 
              onChange={e => setClassFilter(e.target.value)} 
              className="w-full pl-14 pr-10 py-4 bg-slate-50 border border-transparent rounded-2xl font-black text-[10px] uppercase tracking-widest appearance-none outline-none focus:bg-white focus:border-indigo-500/20 focus:ring-4 focus:ring-indigo-500/5 transition-all cursor-pointer shadow-inner"
            >
              <option value="">Semua Kelas</option>
              {classes.map(c => <option key={c.id} value={c.name}>Kelas {c.name}</option>)}
            </select>
          </div>
        </div>
      </section>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto scrollbar-hide">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 uppercase text-[10px] font-black text-slate-400 tracking-[0.2em]">
              <tr>
                <th className="px-10 py-6">Siswa</th>
                <th className="px-10 py-6">Tugas & Kelas</th>
                <th className="px-10 py-6">Status</th>
                <th className="px-10 py-6 text-center">Skor</th>
                <th className="px-10 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredSubs.map(s => {
                const student = allUsers.find(st => st.id === s.studentId);
                const task = tasks.find(t => t.id === s.taskId);
                const isGraded = s.grade !== undefined && s.grade !== null;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-10 py-6">
                      <div className="flex items-center gap-4">
                        <img 
                          src={student?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${student?.username}`} 
                          className="w-10 h-10 rounded-full border-4 border-white bg-slate-50 shadow-sm" 
                          alt="" 
                        />
                        <div>
                          <p className="font-black text-slate-800 text-sm">{student?.name || 'User Dihapus'}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">@{student?.username || 'unknown'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-10 py-6">
                      <p className="font-bold text-slate-700 truncate max-w-[200px] mb-1">{task?.title || 'Tugas Dihapus'}</p>
                      <span className="text-[9px] font-black bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full uppercase tracking-widest border border-indigo-100">Kelas {student?.classId || 'N/A'}</span>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isGraded ? 'bg-emerald-500' : 'bg-orange-500 animate-pulse'}`}></div>
                          <span className={`text-[10px] font-black uppercase tracking-widest ${isGraded ? 'text-emerald-600' : 'text-orange-600'}`}>
                             {isGraded ? 'Dinilai' : 'Menunggu'}
                          </span>
                       </div>
                    </td>
                    <td className="px-10 py-6 text-center">
                      <span className={`text-2xl font-black ${isGraded ? 'text-indigo-600' : 'text-slate-200'}`}>
                        {isGraded ? s.grade : '--'}
                      </span>
                    </td>
                    <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => setGradeModal(s)} 
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 shadow-xl ${
                          isGraded ? 'bg-slate-100 text-slate-600 hover:bg-indigo-600 hover:text-white' : 'bg-slate-900 text-white hover:bg-emerald-600'
                        }`}
                      >
                        {isGraded ? 'Edit Nilai' : 'Beri Nilai'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {gradeModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 text-black">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl animate-in zoom-in-95 duration-300 relative flex flex-col max-h-[90vh]">
            <div className="p-10 border-b border-slate-50 flex items-center justify-between shrink-0">
               <div className="flex items-center gap-5">
                  <div className="w-14 h-14 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center shadow-inner">
                    <GraduationCap size={28} />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black text-slate-800 leading-none">Evaluasi Tugas</h3>
                    <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">Beri skor & catatan perbaikan</p>
                  </div>
               </div>
               <button onClick={() => setGradeModal(null)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                  <X size={28} />
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 space-y-8 scrollbar-hide">
              <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100 space-y-6">
                  <div className="flex items-center gap-4">
                     <img 
                        src={allUsers.find(st => st.id === gradeModal.studentId)?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${gradeModal.studentId}`} 
                        className="w-14 h-14 rounded-full border-4 border-white shadow-sm"
                        alt=""
                     />
                     <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Identitas Siswa</p>
                        <p className="font-black text-slate-800 text-lg leading-none">{allUsers.find(st => st.id === gradeModal.studentId)?.name || 'N/A'}</p>
                        <p className="text-[10px] font-bold text-indigo-600 mt-1 uppercase">Kelas {allUsers.find(st => st.id === gradeModal.studentId)?.classId || 'N/A'}</p>
                     </div>
                  </div>
                  
                  <div className="pt-6 border-t border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Tautan Tugas Terkirim</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 p-4 bg-white border border-slate-200 rounded-2xl font-bold text-[11px] truncate shadow-inner">
                        {gradeModal.content}
                      </div>
                      <a 
                        href={gradeModal.content} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="p-4 bg-indigo-600 text-white rounded-2xl shadow-xl hover:bg-indigo-700 transition-all active:scale-95"
                      >
                        <ExternalLink size={20} />
                      </a>
                    </div>
                  </div>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
                    <div className="space-y-3">
                      <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Skor Penilaian (0-100)</label>
                      <input 
                        type="number" 
                        min="0" 
                        max="100" 
                        value={gradeModal.grade === null ? '' : gradeModal.grade} 
                        onChange={e => setGradeModal({...gradeModal, grade: e.target.value})} 
                        placeholder="Masukkan Angka..." 
                        className="w-full p-6 bg-slate-50 border-2 border-slate-100 rounded-3xl text-3xl font-black text-indigo-600 outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner" 
                      />
                    </div>
                    <div className="p-6 bg-emerald-50 rounded-[2rem] border border-emerald-100 text-emerald-700 font-bold text-[10px] uppercase tracking-[0.15em] leading-relaxed flex items-center gap-3">
                      <Award size={20} /> Siswa akan menerima notifikasi skor segera setelah disimpan.
                    </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Umpan Balik Guru (Feedback)</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-5 top-5 text-slate-300" size={20} />
                    <textarea 
                      value={gradeModal.feedback || ''} 
                      onChange={e => setGradeModal({...gradeModal, feedback: e.target.value})} 
                      placeholder="Tuliskan catatan perbaikan atau apresiasi untuk siswa..." 
                      className="w-full p-5 pl-14 bg-slate-50 border-2 border-slate-100 rounded-3xl font-bold text-sm outline-none focus:bg-white focus:border-indigo-500 transition-all shadow-inner h-32 resize-none"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-10 border-t border-slate-50 shrink-0">
              <button 
                onClick={handleGrade} 
                className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase tracking-[0.2em] hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 active:scale-95 shadow-2xl shadow-slate-100"
              >
                <Save size={20}/> Simpan & Publikasikan Nilai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesTab;
