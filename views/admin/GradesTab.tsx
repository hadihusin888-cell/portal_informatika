
import React, { useState, useEffect, useMemo } from 'react';
import { 
  Loader2, History, Clock, ClipboardCheck, Search, Filter, 
  ClipboardList, ExternalLink, GraduationCap, X, Eye, 
  Award, Star, MessageCircle, Save, MessageSquare, Printer,
  ChevronDown, ArrowDown, Trash2, RotateCcw, CheckSquare, Square
} from 'lucide-react';
import { db } from '../../App.tsx';
import { Submission, Task, User, ClassRoom } from '../../types.ts';
import { notifyStudents } from '../../utils/helpers.ts';

interface GradesTabProps {
  triggerConfirm: any;
  classes: ClassRoom[];
  currentUser: User;
}

const GradesTab: React.FC<GradesTabProps> = ({ triggerConfirm, classes, currentUser }) => {
  const [subs, setSubs] = useState<Submission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [gradeModal, setGradeModal] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [classFilter, setClassFilter] = useState('');
  const [taskFilter, setTaskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'graded'>('all');
  const [displayLimit, setDisplayLimit] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    setCurrentPage(1);
  }, [search, classFilter, taskFilter, statusFilter]);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      try {
        const [s, t, u] = await Promise.all([
          db.get('elearning_submissions'), 
          db.get('elearning_tasks'), 
          db.get('users')
        ]);
        
        const allTasks = (Array.isArray(t) ? t : []) as Task[];
        const allSubs = (Array.isArray(s) ? s : []) as Submission[];
        
        // Filter Tugas: Hanya ambil tugas yang dibuat oleh pengguna yang sedang login
        const relevantTasks = allTasks.filter(task => task.authorId === currentUser.id);
        
        const relevantTaskIds = new Set(relevantTasks.map(t => t.id));
        
        // Filter Submissions: Hanya ambil pengumpulan yang berkaitan dengan tugas di atas
        const relevantSubs = allSubs.filter(sub => relevantTaskIds.has(sub.taskId));

        setTasks(relevantTasks);
        setSubs(relevantSubs);
        setAllUsers(Array.isArray(u) ? u : []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [currentUser]);

  const sortedClasses = useMemo(() => {
    return [...classes].sort((a, b) => 
      a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
    );
  }, [classes]);

  const baseFilteredSubs = useMemo(() => {
    const filtered = subs.filter(s => {
      const student = allUsers.find(st => st.id === s.studentId);
      const task = tasks.find(t => t.id === s.taskId);
      
      const matchSearch = (student?.name || '').toLowerCase().includes(search.toLowerCase()) || 
                          (task?.title || '').toLowerCase().includes(search.toLowerCase());
      const matchClass = !classFilter || student?.classId === classFilter;
      const matchTask = !taskFilter || s.taskId === taskFilter;
      
      return matchSearch && matchClass && matchTask;
    });

    return filtered.sort((a, b) => {
      const studentA = allUsers.find(st => st.id === a.studentId);
      const studentB = allUsers.find(st => st.id === b.studentId);
      const classNameA = studentA?.classId || '';
      const classNameB = studentB?.classId || '';
      const classCompare = classNameA.localeCompare(classNameB, undefined, { numeric: true, sensitivity: 'base' });
      if (classCompare !== 0) return classCompare;
      const nameA = studentA?.name || '';
      const nameB = studentB?.name || '';
      return nameA.localeCompare(nameB);
    });
  }, [subs, allUsers, tasks, search, classFilter, taskFilter]);

  const filteredSubs = useMemo(() => {
    if (statusFilter === 'all') return baseFilteredSubs;
    return baseFilteredSubs.filter(s => {
      const isGraded = s.grade !== undefined && s.grade !== null;
      return statusFilter === 'graded' ? isGraded : !isGraded;
    });
  }, [baseFilteredSubs, statusFilter]);

  const displayedSubs = useMemo(() => {
    const start = (currentPage - 1) * displayLimit;
    return filteredSubs.slice(start, start + displayLimit);
  }, [filteredSubs, currentPage, displayLimit]);

  const totalPages = Math.ceil(filteredSubs.length / displayLimit);

  const stats = useMemo(() => ({
    total: baseFilteredSubs.length,
    graded: baseFilteredSubs.filter(s => s.grade !== undefined && s.grade !== null).length,
    pending: baseFilteredSubs.filter(s => s.grade === undefined || s.grade === null).length
  }), [baseFilteredSubs]);

  const toggleSelectAll = () => {
    if (selectedIds.size === displayedSubs.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(displayedSubs.map(s => s.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) newSelected.delete(id);
    else newSelected.add(id);
    setSelectedIds(newSelected);
  };

  const handleBulkDelete = () => {
    if (selectedIds.size === 0) return;
    triggerConfirm(
      `Reset Status Tugas?`,
      `Menghapus ${selectedIds.size} data pengumpulan akan mengizinkan siswa mengirim ulang tugas.`,
      async () => {
        try {
          const idsArray = Array.from(selectedIds);
          await Promise.all(idsArray.map((id: string) => db.delete('elearning_submissions', id)));
          setSubs(prev => prev.filter(s => !selectedIds.has(s.id)));
          setSelectedIds(new Set());
        } catch (err) { alert("Gagal menghapus."); }
      }
    );
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    let tableRows = '';
    filteredSubs.forEach(s => {
      const student = allUsers.find(st => st.id === s.studentId);
      const task = tasks.find(t => t.id === s.taskId);
      tableRows += `<tr><td>${student?.name || 'N/A'}</td><td>${task?.title || 'N/A'} (Kelas ${student?.classId || 'N/A'})</td><td style="text-align:center;">${s.grade ?? '--'}</td></tr>`;
    });
    printWindow.document.write(`<html><body><h1>Rekap Nilai ${currentUser.subject}</h1><table><thead><tr><th>Nama</th><th>Tugas</th><th>Skor</th></tr></thead><tbody>${tableRows}</tbody></table></body><script>window.onload=function(){window.print();window.close();}</script></html>`);
    printWindow.document.close();
  };

  const handleGrade = async () => {
    if (gradeModal.grade === "" || gradeModal.grade < 0 || gradeModal.grade > 100) { alert("Nilai tidak valid."); return; }
    try {
      const updated = { ...gradeModal, grade: Number(gradeModal.grade), feedback: gradeModal.feedback || '' };
      await db.update('elearning_submissions', gradeModal.id, updated);
      setSubs(subs.map(s => s.id === gradeModal.id ? updated : s));
      notifyStudents([], "Tugas Dinilai!", `Skor: ${gradeModal.grade}`, "grade", gradeModal.studentId);
      setGradeModal(null);
    } catch (err) { alert("Gagal."); }
  };

  const handleNextStudent = () => {
    const currentIndex = filteredSubs.findIndex(s => s.id === gradeModal.id);
    if (currentIndex < filteredSubs.length - 1) {
      setGradeModal(filteredSubs[currentIndex + 1]);
    }
  };

  const handlePrevStudent = () => {
    const currentIndex = filteredSubs.findIndex(s => s.id === gradeModal.id);
    if (currentIndex > 0) {
      setGradeModal(filteredSubs[currentIndex - 1]);
    }
  };

  if (loading) return <div className="py-32 flex flex-col items-center justify-center"><Loader2 className="animate-spin text-indigo-600" size={48} /></div>;

  return (
    <div className="space-y-8 text-black pb-20">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { id: 'all', label: 'Tugas Masuk', val: stats.total, icon: History, col: 'text-blue-600', bg: 'bg-blue-50' },
          { id: 'pending', label: 'Perlu Dinilai', val: stats.pending, icon: Clock, col: 'text-orange-600', bg: 'bg-orange-50' },
          { id: 'graded', label: 'Selesai', val: stats.graded, icon: ClipboardCheck, col: 'text-emerald-600', bg: 'bg-emerald-50' },
        ].map((s, i) => (
          <button 
            key={i} 
            onClick={() => setStatusFilter(s.id as any)}
            className={`p-8 rounded-[2.5rem] border transition-all flex items-center gap-6 text-left ${
              statusFilter === s.id 
                ? 'bg-slate-900 border-slate-900 shadow-xl scale-[1.02]' 
                : 'bg-white border-slate-100 shadow-sm hover:border-indigo-200'
            }`}
          >
            <div className={`${statusFilter === s.id ? 'bg-white/10 text-white' : `${s.bg} ${s.col}`} w-14 h-14 rounded-2xl flex items-center justify-center transition-colors`}>
              <s.icon size={28}/>
            </div>
            <div>
              <p className={`${statusFilter === s.id ? 'text-slate-400' : 'text-slate-400'} text-[10px] font-black uppercase tracking-widest`}>{s.label}</p>
              <h4 className={`text-3xl font-black ${statusFilter === s.id ? 'text-white' : 'text-slate-800'}`}>{s.val}</h4>
            </div>
          </button>
        ))}
      </div>

      <section className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 relative w-full">
            <input type="text" placeholder="Cari siswa atau tugas..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-6 py-4 bg-slate-50 rounded-2xl font-bold text-sm outline-none focus:bg-white border-2 border-transparent focus:border-indigo-100 transition-all" />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
          </div>
          <select value={classFilter} onChange={e => setClassFilter(e.target.value)} className="w-full md:w-48 p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase outline-none">
            <option value="">Semua Kelas</option>
            {sortedClasses.map(c => <option key={c.id} value={c.name}>Kelas {c.name}</option>)}
          </select>
          <select value={taskFilter} onChange={e => setTaskFilter(e.target.value)} className="w-full md:w-64 p-4 bg-slate-50 rounded-2xl font-black text-[10px] uppercase outline-none">
            <option value="">Semua Tugas</option>
            {tasks.map(t => <option key={t.id} value={t.id}>{t.title}</option>)}
          </select>
          <div className="flex gap-2 w-full md:w-auto">
            <button onClick={handlePrint} className="flex-1 md:flex-none px-6 py-4 bg-white border-2 border-slate-100 rounded-2xl font-black text-[10px] uppercase flex items-center gap-2"><Printer size={18} /> Rekap</button>
            {selectedIds.size > 0 && <button onClick={handleBulkDelete} className="px-6 py-4 bg-rose-600 text-white rounded-2xl font-black text-[10px] uppercase flex items-center gap-2 animate-in slide-in-from-right"><RotateCcw size={18} /> Reset ({selectedIds.size})</button>}
          </div>
        </div>
      </section>

      <div className="bg-white rounded-[3rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50/50 uppercase text-[10px] font-black text-slate-400">
              <tr>
                <th className="px-10 py-6"><button onClick={toggleSelectAll}>{selectedIds.size === displayedSubs.length && displayedSubs.length > 0 ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} />}</button></th>
                <th className="px-4 py-6">Siswa</th>
                <th className="px-10 py-6">Tugas</th>
                <th className="px-10 py-6 text-center">Skor</th>
                <th className="px-10 py-6 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {displayedSubs.map(s => {
                const student = allUsers.find(st => st.id === s.studentId);
                const task = tasks.find(t => t.id === s.taskId);
                const isGraded = s.grade !== undefined && s.grade !== null;
                return (
                  <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-10 py-6"><button onClick={() => toggleSelect(s.id)}>{selectedIds.has(s.id) ? <CheckSquare size={20} className="text-indigo-600" /> : <Square size={20} className="text-slate-200" />}</button></td>
                    <td className="px-4 py-6">
                      <div className="flex items-center gap-3">
                        <img src={student?.avatar} className="w-10 h-10 rounded-full bg-slate-100" />
                        <div><p className="font-black text-slate-800 text-sm uppercase">{student?.name}</p><p className="text-[9px] text-slate-400 font-bold uppercase">Kelas {student?.classId}</p></div>
                      </div>
                    </td>
                    <td className="px-10 py-6"><p className="font-bold text-slate-700">{task?.title}</p></td>
                    <td className="px-10 py-6 text-center"><span className={`text-2xl font-black ${isGraded ? 'text-indigo-600' : 'text-slate-200'}`}>{isGraded ? s.grade : '--'}</span></td>
                    <td className="px-10 py-6 text-right">
                      <button 
                        onClick={() => setGradeModal(s)} 
                        className={`px-6 py-3 rounded-xl font-black text-[10px] uppercase transition-all ${
                          isGraded 
                            ? 'bg-slate-100 text-slate-600 hover:bg-slate-200' 
                            : 'bg-slate-900 text-white hover:bg-indigo-600 shadow-lg'
                        }`}
                      >
                        {isGraded ? 'Edit' : 'Nilai'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filteredSubs.length === 0 && <div className="py-20 text-center"><p className="text-slate-400 font-black text-xs uppercase tracking-widest">Tidak ada data untuk ditampilkan</p></div>}
          
          {filteredSubs.length > displayLimit && (
            <div className="px-10 py-6 bg-slate-50/30 border-t border-slate-50 flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                Menampilkan {Math.min((currentPage - 1) * displayLimit + 1, filteredSubs.length)} - {Math.min(currentPage * displayLimit, filteredSubs.length)} dari {filteredSubs.length} data
              </p>
              <div className="flex items-center gap-2">
                <button 
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-slate-50 transition-colors"
                >
                  Sebelumnya
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum = currentPage;
                    if (totalPages <= 5) pageNum = i + 1;
                    else if (currentPage <= 3) pageNum = i + 1;
                    else if (currentPage >= totalPages - 2) pageNum = totalPages - 4 + i;
                    else pageNum = currentPage - 2 + i;

                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-8 h-8 rounded-lg text-[10px] font-black flex items-center justify-center transition-all ${
                          currentPage === pageNum ? 'bg-slate-900 text-white shadow-lg' : 'bg-white border border-slate-100 text-slate-400 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                <button 
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="px-4 py-2 bg-white border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-30 hover:bg-slate-50 transition-colors"
                >
                  Selanjutnya
                </button>
              </div>
            </div>
          )}
      </div>

      {gradeModal && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-md z-[100] flex items-center justify-center p-6 text-black">
          <div className="bg-white w-full max-w-xl rounded-[3.5rem] shadow-2xl flex flex-col p-10 space-y-8 animate-in zoom-in-95">
             <div className="flex justify-between items-center">
                <div>
                   <h3 className="text-2xl font-black">Evaluasi Tugas</h3>
                   <p className="text-[10px] font-black uppercase text-slate-400 mt-1">
                      Siswa: {allUsers.find(u => u.id === gradeModal.studentId)?.name}
                   </p>
                </div>
                <button onClick={() => setGradeModal(null)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={28}/></button>
             </div>
             
             <div className="flex items-center justify-between gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <button 
                  disabled={filteredSubs.findIndex(s => s.id === gradeModal.id) === 0}
                  onClick={handlePrevStudent}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                >
                   <ChevronDown className="rotate-90" size={16} /> Sebelumnya
                </button>
                <div className="h-4 w-px bg-slate-200"></div>
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                   {filteredSubs.findIndex(s => s.id === gradeModal.id) + 1} / {filteredSubs.length}
                </span>
                <div className="h-4 w-px bg-slate-200"></div>
                <button 
                  disabled={filteredSubs.findIndex(s => s.id === gradeModal.id) === filteredSubs.length - 1}
                  onClick={handleNextStudent}
                  className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-indigo-600 disabled:opacity-30 transition-colors"
                >
                   Selanjutnya <ChevronDown className="-rotate-90" size={16} />
                </button>
             </div>

             <div className="space-y-4">
                <p className="text-[10px] font-black uppercase text-slate-400">Tautan Hasil Kerja:</p>
                <a href={gradeModal.content} target="_blank" className="block p-4 bg-slate-50 border rounded-2xl font-bold text-indigo-600 truncate flex items-center justify-between group">
                   <span className="truncate">{gradeModal.content}</span>
                   <ExternalLink size={16} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                </a>
             </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase text-slate-400">Skor (0-100)</label>
                   <input 
                    type="number" 
                    value={gradeModal.grade} 
                    onChange={e => setGradeModal({...gradeModal, grade: e.target.value})} 
                    className="w-full p-5 bg-slate-50 border-2 rounded-2xl font-black text-2xl" 
                   />
                </div>
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-700 text-[10px] font-bold">
                  Input nilai di samping dan simpan untuk mempublikasikan hasil.
                </div>
             </div>
             <textarea 
              value={gradeModal.feedback ?? ''} 
              onChange={e => setGradeModal({...gradeModal, feedback: e.target.value})} 
              placeholder="Catatan perbaikan..." 
              className="w-full p-5 bg-slate-50 border-2 rounded-2xl h-24 font-bold" 
             />
             <button onClick={handleGrade} className="w-full py-5 bg-slate-900 text-white rounded-[2rem] font-black text-xs uppercase shadow-xl hover:bg-emerald-600 transition-all">Simpan Nilai</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradesTab;
