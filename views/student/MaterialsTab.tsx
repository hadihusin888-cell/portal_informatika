
import React, { useState, useMemo, useEffect } from 'react';
import { 
  FileText, ExternalLink, Search, Filter, 
  PlayCircle, Link as LinkIcon, Clock, Sparkles, 
  SearchX, ChevronRight, BookOpen, X, Info,
  Monitor, Globe, ArrowUpRight, Zap, CheckCircle2,
  BookMarked
} from 'lucide-react';
import { db } from '../../App.tsx';

interface MaterialsTabProps {
  materials: any[];
  initialSubject?: string;
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({ materials = [], initialSubject }) => {
  const [search, setSearch] = useState('');
  const [activeTypeFilter, setActiveTypeFilter] = useState('all');
  const [subjectFilter, setSubjectFilter] = useState(initialSubject || 'all');
  const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);
  const [loadingSubjects, setLoadingSubjects] = useState(false);

  // Ambil daftar mata pelajaran dari semua Guru yang terdaftar
  useEffect(() => {
    const fetchAllSubjects = async () => {
      setLoadingSubjects(true);
      try {
        const allUsers = await db.get('users');
        const teachers = Array.isArray(allUsers) ? allUsers.filter((u: any) => u.role === 'ADMIN' && u.subject) : [];
        const subjects = Array.from(new Set(teachers.map((t: any) => t.subject))).filter(Boolean);
        setAvailableSubjects(subjects as string[]);
      } catch (err) {
        console.error("Gagal memuat daftar mapel:", err);
      } finally {
        setLoadingSubjects(false);
      }
    };
    fetchAllSubjects();
  }, []);

  // Efek untuk menangani filter otomatis saat navigasi dari Home (Masuk Kelas)
  useEffect(() => {
    if (initialSubject) {
      setSubjectFilter(initialSubject);
    }
  }, [initialSubject]);

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchSearch = (m.title || '').toLowerCase().includes(search.toLowerCase()) || 
                          (m.description || '').toLowerCase().includes(search.toLowerCase());
      const matchType = activeTypeFilter === 'all' || m.type === activeTypeFilter;
      const matchSubject = subjectFilter === 'all' || m.subject === subjectFilter;
      return matchSearch && matchType && matchSubject;
    });
  }, [materials, search, activeTypeFilter, subjectFilter]);

  const getTypeStyle = (type: string) => {
    switch(type) {
      case 'embed': return { bg: 'bg-purple-50', text: 'text-purple-600', icon: PlayCircle, label: 'Video' };
      case 'file': return { bg: 'bg-emerald-50', text: 'text-emerald-600', icon: FileText, label: 'Modul' };
      case 'link': return { bg: 'bg-blue-50', text: 'text-blue-600', icon: LinkIcon, label: 'Tautan' };
      default: return { bg: 'bg-slate-50', text: 'text-slate-600', icon: BookOpen, label: 'Materi' };
    }
  };

  const getEmbedUrl = (url: string) => {
    if (!url) return '';
    let embedUrl = url;
    if (url.includes('youtube.com/watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      embedUrl = 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1];
    } else if (url.includes('docs.google.com')) {
      embedUrl = url.includes('?') ? `${url}&embedded=true` : `${url}?embedded=true`;
    } else if (url.includes('canva.com/design/')) {
      const baseUrl = url.split('?')[0];
      embedUrl = baseUrl.includes('/view') ? `${baseUrl}?embed` : `${baseUrl}/view?embed`;
    }
    return embedUrl;
  };

  const getSubjectColor = (subject: string) => {
    const defaultColor = { bg: 'bg-slate-50', text: 'text-slate-600', active: 'bg-slate-600', border: 'border-slate-100' };
    if (!subject) return defaultColor;

    const colors = [
      { bg: 'bg-rose-50', text: 'text-rose-600', active: 'bg-rose-600', border: 'border-rose-100' },
      { bg: 'bg-blue-50', text: 'text-blue-600', active: 'bg-blue-600', border: 'border-blue-100' },
      { bg: 'bg-emerald-50', text: 'text-emerald-600', active: 'bg-emerald-600', border: 'border-emerald-100' },
      { bg: 'bg-amber-50', text: 'text-amber-600', active: 'bg-amber-600', border: 'border-amber-100' },
      { bg: 'bg-purple-50', text: 'text-purple-600', active: 'bg-purple-600', border: 'border-purple-100' },
      { bg: 'bg-indigo-50', text: 'text-indigo-600', active: 'bg-indigo-600', border: 'border-indigo-100' },
      { bg: 'bg-cyan-50', text: 'text-cyan-600', active: 'bg-cyan-600', border: 'border-cyan-100' },
      { bg: 'bg-pink-50', text: 'text-pink-600', active: 'bg-pink-600', border: 'border-pink-100' },
      { bg: 'bg-orange-50', text: 'text-orange-600', active: 'bg-orange-600', border: 'border-orange-100' },
      { bg: 'bg-teal-50', text: 'text-teal-600', active: 'bg-teal-600', border: 'border-teal-100' },
    ];
    
    let hash = 0;
    for (let i = 0; i < subject.length; i++) {
      hash = subject.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % colors.length;
    return colors[index];
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-in fade-in duration-700 text-black pb-24 max-w-[1600px] mx-auto">
      
      {/* Header & Filter Section */}
      <section className="bg-white p-8 md:p-10 rounded-3xl border border-slate-100 shadow-sm space-y-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h3 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              <div className="w-1.5 h-8 bg-indigo-500 rounded-full"></div>
              Pustaka Belajar
            </h3>
            <p className="text-slate-500 font-medium text-sm">Temukan materi belajar terpadu dari bapak/ibu guru pengampu.</p>
          </div>
          <div className="relative w-full md:w-[400px] group">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-indigo-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Cari judul materi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-16 pr-8 py-5 bg-slate-50 border-2 border-transparent rounded-2xl font-bold outline-none focus:bg-white focus:border-indigo-500/10 transition-all text-sm shadow-inner"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 pt-4 border-t border-slate-50">
           {/* Subject Pills - DAFTAR FILTER MAPEL */}
           <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                <Filter size={12} /> Pilih Mata Pelajaran
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSubjectFilter('all')}
                  className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                    subjectFilter === 'all' 
                    ? 'bg-slate-900 text-white shadow-lg scale-105' 
                    : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                  }`}
                >
                  Semua Mapel
                </button>
                {availableSubjects.map(sub => {
                  const subColor = getSubjectColor(sub);
                  return (
                    <button
                      key={sub}
                      onClick={() => setSubjectFilter(sub)}
                      className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 flex items-center gap-2 ${
                        subjectFilter === sub 
                        ? `${subColor.active} text-white shadow-lg scale-105` 
                        : `${subColor.bg} ${subColor.text} border ${subColor.border} hover:brightness-95`
                      }`}
                    >
                      {sub}
                      {subjectFilter === sub && <CheckCircle2 size={12} />}
                    </button>
                  );
                })}
                {loadingSubjects && <div className="px-4 py-3 animate-pulse bg-slate-50 rounded-2xl w-24 h-10"></div>}
              </div>
           </div>

           {/* Type Select */}
           <div className="space-y-4">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2 flex items-center gap-2">
                <Zap size={12} /> Format Pembelajaran
              </p>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'all', label: 'Semua Format' },
                  { id: 'embed', label: 'Video & Media' },
                  { id: 'file', label: 'Modul PDF/File' },
                  { id: 'link', label: 'Tautan Luar' }
                ].map((f) => (
                  <button
                    key={f.id}
                    onClick={() => setActiveTypeFilter(f.id)}
                    className={`px-4 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${
                      activeTypeFilter === f.id 
                      ? 'bg-indigo-600 text-white shadow-lg scale-105' 
                      : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
           </div>
        </div>
      </section>

      {/* Materials Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {filteredMaterials.map((m: any) => {
          const style = getTypeStyle(m.type);
          const Icon = style.icon;
          return (
            <div key={m.id} className="bg-white rounded-3xl border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col overflow-hidden relative">
              <div className={`h-32 ${style.bg} relative flex items-center justify-center overflow-hidden`}>
                <Icon size={56} className={`${style.text} opacity-10 group-hover:scale-125 transition-transform duration-700`} />
                <div className="absolute top-5 left-5">
                   <span className={`px-4 py-1.5 ${getSubjectColor(m.subject).bg} ${getSubjectColor(m.subject).text} backdrop-blur-sm text-[9px] font-black uppercase tracking-widest rounded-xl shadow-sm border ${getSubjectColor(m.subject).border}`}>
                      {m.subject}
                   </span>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <span className={`text-[9px] font-black uppercase tracking-widest px-3 py-1.5 ${style.bg} ${style.text} rounded-xl w-fit mb-5`}>
                  {style.label}
                </span>
                <h4 className="text-xl font-black text-slate-800 mb-3 leading-tight group-hover:text-indigo-600 transition-colors line-clamp-2">{m.title}</h4>
                <p className="text-sm text-slate-500 font-medium mb-8 line-clamp-3 leading-relaxed opacity-70">
                  {m.description || 'Pelajari modul ini untuk memperdalam pemahaman mata pelajaran.'}
                </p>
                <button 
                  onClick={() => setSelectedMaterial(m)}
                  className="mt-auto w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-indigo-600 transition-all flex items-center justify-center gap-3 shadow-xl active:scale-95"
                >
                  Buka Modul <ChevronRight size={18}/>
                </button>
              </div>
            </div>
          );
        })}

        {filteredMaterials.length === 0 && (
           <div className="col-span-full py-32 text-center bg-white rounded-3xl border-2 border-dashed border-slate-100">
              {subjectFilter === 'all' ? (
                <>
                  <SearchX size={64} className="mx-auto text-slate-100 mb-6" />
                  <h4 className="text-xl font-black text-slate-300 uppercase tracking-widest">Tidak ada materi ditemukan</h4>
                  <p className="text-slate-400 text-sm mt-2">Belum ada materi yang diunggah untuk kelas Anda.</p>
                </>
              ) : (
                <>
                  <BookMarked size={64} className="mx-auto text-indigo-100 mb-6" />
                  <h4 className="text-xl font-black text-indigo-300 uppercase tracking-widest">Materi {subjectFilter} Kosong</h4>
                  <p className="text-slate-400 text-sm mt-2">Guru pengampu belum mengunggah materi untuk mata pelajaran ini.</p>
                  <button onClick={() => setSubjectFilter('all')} className="mt-8 px-6 py-3 bg-indigo-50 text-indigo-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 hover:text-white transition-all">
                    Lihat Semua Mapel
                  </button>
                </>
              )}
           </div>
        )}
      </section>

      {/* Material Modal */}
      {selectedMaterial && (
        <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-white w-full max-w-7xl h-full md:max-h-[92vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-6 md:px-12 border-b border-slate-100 flex items-center justify-between bg-white shrink-0">
               <div className="flex items-center gap-6">
                  <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${getTypeStyle(selectedMaterial.type).bg} ${getTypeStyle(selectedMaterial.type).text} shadow-inner`}>
                    <BookOpen size={32} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight leading-none truncate max-w-[250px] md:max-w-none">{selectedMaterial.title}</h3>
                    <div className="flex items-center gap-3 mt-3">
                       <span className={`${getSubjectColor(selectedMaterial.subject).text} font-black text-[10px] uppercase tracking-widest ${getSubjectColor(selectedMaterial.subject).bg} px-3 py-1 rounded-lg border ${getSubjectColor(selectedMaterial.subject).border}`}>{selectedMaterial.subject}</span>
                       <div className="w-1.5 h-1.5 bg-slate-200 rounded-full"></div>
                       <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest flex items-center gap-1.5">
                         <Globe size={12} /> E-Learning Al Irsyad Surakarta
                       </p>
                    </div>
                  </div>
               </div>
               <button onClick={() => setSelectedMaterial(null)} className="p-4 bg-slate-50 text-slate-400 rounded-3xl hover:bg-rose-50 hover:text-rose-500 transition-all active:scale-90">
                  <X size={28} />
               </button>
            </div>

            <div className="flex-1 bg-slate-50 relative p-4 md:p-10 flex flex-col overflow-hidden">
               <div className="bg-white border border-slate-200 p-5 rounded-3xl mb-6 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
                  <div className="flex items-center gap-4">
                     <div className="w-10 h-10 bg-indigo-50 text-indigo-500 rounded-xl flex items-center justify-center">
                        <Info size={20} />
                     </div>
                     <p className="text-xs font-bold text-slate-600 leading-relaxed max-w-lg">
                       Materi dimuat dari server eksternal. Gunakan fitur "Buka di Tab Baru" jika tampilan modul tidak maksimal pada layar Anda.
                     </p>
                  </div>
                  <a href={selectedMaterial.content} target="_blank" rel="noreferrer" className="w-full md:w-auto px-8 py-3.5 bg-indigo-600 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-900 transition-all shadow-xl flex items-center justify-center gap-2">
                    Buka di Tab Baru <ArrowUpRight size={14} />
                  </a>
               </div>

               <div className="flex-1 w-full bg-white rounded-2xl shadow-2xl overflow-hidden border-8 border-white">
                  <iframe 
                    src={getEmbedUrl(selectedMaterial.content)} 
                    className="w-full h-full border-0" 
                    allowFullScreen 
                    title="Material View"
                    loading="lazy"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  ></iframe>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MaterialsTab;
