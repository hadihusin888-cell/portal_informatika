
import React, { useState, useMemo } from 'react';
import { 
  FileText, ExternalLink, Search, Filter, 
  PlayCircle, Link as LinkIcon, Clock, Sparkles, 
  SearchX, ChevronRight, BookOpen, X, Info,
  Monitor, Globe, ArrowUpRight, Zap
} from 'lucide-react';

interface MaterialsTabProps {
  materials: any[];
}

const MaterialsTab: React.FC<MaterialsTabProps> = ({ materials }) => {
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedMaterial, setSelectedMaterial] = useState<any | null>(null);

  const filteredMaterials = useMemo(() => {
    return materials.filter(m => {
      const matchSearch = m.title.toLowerCase().includes(search.toLowerCase()) || 
                          m.description.toLowerCase().includes(search.toLowerCase());
      const matchFilter = activeFilter === 'all' || m.type === activeFilter;
      return matchSearch && matchFilter;
    });
  }, [materials, search, activeFilter]);

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
    
    // YouTube
    if (url.includes('youtube.com/watch?v=')) {
      embedUrl = url.replace('watch?v=', 'embed/');
    } else if (url.includes('youtu.be/')) {
      embedUrl = 'https://www.youtube.com/embed/' + url.split('youtu.be/')[1];
    }
    // Google Forms/Docs/Slides
    else if (url.includes('docs.google.com')) {
      embedUrl = url.includes('?') ? `${url}&embedded=true` : `${url}?embedded=true`;
    }
    
    return embedUrl;
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-black pb-20">
      
      {/* Search & Filter */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-0.5">
            <h3 className="text-xl font-black text-slate-800 tracking-tight">Perpustakaan Digital</h3>
            <p className="text-slate-500 font-medium text-xs">Akses materi Informatika kapan pun.</p>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari materi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-6 py-3 bg-slate-50 border border-slate-100 rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', 'embed', 'file', 'link'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-5 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                activeFilter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'embed' ? 'Video' : f === 'file' ? 'Modul' : 'Tautan'}
            </button>
          ))}
        </div>
      </section>

      {/* Materials Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-5">
        {filteredMaterials.map((m: any) => {
          const style = getTypeStyle(m.type);
          const Icon = style.icon;
          return (
            <div key={m.id} className="bg-white rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden">
              <div className={`h-24 ${style.bg} relative flex items-center justify-center`}>
                <Icon size={32} className={`${style.text} opacity-20 group-hover:scale-110 transition-transform`} />
              </div>
              <div className="p-6 flex-1 flex flex-col">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${style.bg} ${style.text} rounded-md w-fit mb-3`}>
                  {style.label}
                </span>
                <h4 className="text-base font-black text-slate-800 mb-2 leading-tight line-clamp-2">{m.title}</h4>
                <p className="text-[11px] text-slate-500 font-medium mb-6 line-clamp-2 opacity-80">{m.description || 'Pelajari materi ini untuk meningkatkan kompetensi Anda.'}</p>
                <button 
                  onClick={() => setSelectedMaterial(m)}
                  className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-2"
                >
                  Buka Materi <ChevronRight size={14}/>
                </button>
              </div>
            </div>
          );
        })}
      </section>

      {/* Embed Modal for Materials */}
      {selectedMaterial && (() => {
        const style = getTypeStyle(selectedMaterial.type);
        const Icon = style.icon;
        return (
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-xl z-[100] flex items-center justify-center p-4 md:p-8 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl h-full md:max-h-[90vh] rounded-[2.5rem] md:rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="p-6 md:px-10 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                 <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${style.bg} ${style.text} shadow-inner`}>
                      <Icon size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-slate-800 leading-none">{selectedMaterial.title}</h3>
                      <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-2">Pusat Belajar Informatika</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedMaterial(null)} className="p-3 bg-slate-50 text-slate-400 rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                    <X size={24} />
                 </button>
              </div>

              {/* Content Area with Auto-Embed */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Sidebar Info (Mobile hidden or top) */}
                <div className="lg:w-80 bg-slate-50/50 p-8 border-r border-slate-50 overflow-y-auto hidden lg:block">
                   <div className="space-y-8">
                      <div className="space-y-3">
                         <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2"><Zap size={14} className="text-amber-500" /> Ringkasan Materi</h4>
                         <p className="text-[11px] text-slate-600 font-medium leading-relaxed italic">"{selectedMaterial.description}"</p>
                      </div>
                      <div className="p-5 bg-white rounded-3xl border border-slate-100 shadow-sm">
                         <h5 className="text-[9px] font-black text-slate-400 uppercase mb-3">Tindakan Cepat</h5>
                         <a href={selectedMaterial.content} target="_blank" rel="noreferrer" className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-indigo-600 transition-all">
                            Buka di Tab Baru <ArrowUpRight size={14} />
                         </a>
                      </div>
                   </div>
                </div>

                {/* Main Viewer */}
                <div className="flex-1 bg-slate-100 relative p-4 md:p-8 flex flex-col">
                   <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl mb-4 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                         <Info size={16} className="text-amber-500 shrink-0" />
                         <p className="text-[10px] font-bold text-amber-700 leading-tight">Konten tidak muncul? Klik tombol "Buka di Tab Baru" di samping.</p>
                      </div>
                      <a href={selectedMaterial.content} target="_blank" rel="noreferrer" className="md:hidden shrink-0 px-4 py-2 bg-amber-500 text-white rounded-lg text-[9px] font-black uppercase">Buka Link</a>
                   </div>

                   <div className="flex-1 w-full bg-white rounded-[2rem] shadow-xl overflow-hidden border-4 border-white">
                      <iframe 
                        src={getEmbedUrl(selectedMaterial.content)} 
                        className="w-full h-full border-0" 
                        allowFullScreen 
                        title="Material Content"
                        loading="lazy"
                      ></iframe>
                   </div>
                </div>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default MaterialsTab;
