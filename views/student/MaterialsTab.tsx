
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
    // Canva
    else if (url.includes('canva.com/design/')) {
      const baseUrl = url.split('?')[0]; // Ambil URL dasar tanpa utm_content dll
      // Cek apakah sudah ada /view di akhir, jika belum tambahkan
      if (baseUrl.includes('/view')) {
        embedUrl = `${baseUrl}?embed`;
      } else {
        // Menangani format link canva yang berbeda-apa
        const match = baseUrl.match(/design\/([^\/]+)\//);
        if (match && match[1]) {
           embedUrl = `https://www.canva.com/design/${match[1]}/view?embed`;
        } else {
           embedUrl = `${baseUrl}/view?embed`;
        }
      }
    }
    
    return embedUrl;
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-700 text-black pb-20">
      
      {/* Search & Filter */}
      <section className="bg-white p-4 md:p-6 rounded-2xl md:rounded-[2.5rem] border border-slate-100 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div className="space-y-0.5">
            <h3 className="text-lg md:text-xl font-black text-slate-800 tracking-tight">Perpustakaan Digital</h3>
            <p className="text-slate-500 font-medium text-[10px] md:text-xs">Akses materi Informatika kapan pun.</p>
          </div>
          <div className="relative w-full md:w-80 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 w-4 h-4 md:w-[18px] md:h-[18px] group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Cari materi..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-11 pr-5 py-2.5 md:py-3 bg-slate-50 border border-slate-100 rounded-xl md:rounded-2xl font-bold outline-none focus:ring-4 focus:ring-emerald-500/5 transition-all text-xs md:text-sm shadow-inner"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 md:gap-2">
          {['all', 'embed', 'file', 'link'].map((f) => (
            <button
              key={f}
              onClick={() => setActiveFilter(f)}
              className={`px-4 py-2 rounded-lg md:rounded-xl text-[7px] md:text-[9px] font-black uppercase tracking-widest transition-all ${
                activeFilter === f ? 'bg-slate-900 text-white shadow-lg' : 'bg-slate-50 text-slate-400 border border-slate-100 hover:bg-slate-100'
              }`}
            >
              {f === 'all' ? 'Semua' : f === 'embed' ? 'Video' : f === 'file' ? 'Modul' : 'Tautan'}
            </button>
          ))}
        </div>
      </section>

      {/* Materials Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {filteredMaterials.map((m: any) => {
          const style = getTypeStyle(m.type);
          const Icon = style.icon;
          return (
            <div key={m.id} className="bg-white rounded-2xl md:rounded-[2rem] border border-slate-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group flex flex-col overflow-hidden">
              <div className={`h-20 md:h-24 ${style.bg} relative flex items-center justify-center`}>
                <Icon size={28} className={`${style.text} opacity-20 group-hover:scale-110 transition-transform md:w-8 md:h-8`} />
              </div>
              <div className="p-5 md:p-6 flex-1 flex flex-col">
                <span className={`text-[7px] md:text-[8px] font-black uppercase tracking-widest px-2 py-0.5 ${style.bg} ${style.text} rounded-md w-fit mb-2 md:mb-3`}>
                  {style.label}
                </span>
                <h4 className="text-sm md:text-base font-black text-slate-800 mb-1.5 md:mb-2 leading-tight line-clamp-2">{m.title}</h4>
                <p className="text-[10px] md:text-[11px] text-slate-500 font-medium mb-4 line-clamp-2 opacity-80 leading-relaxed">{m.description || 'Pelajari materi ini.'}</p>
                <button 
                  onClick={() => setSelectedMaterial(m)}
                  className="mt-auto w-full py-3 bg-slate-900 text-white rounded-xl font-black text-[8px] md:text-[9px] uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center justify-center gap-1.5 shadow-sm"
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
          <div className="fixed inset-0 bg-slate-900/95 backdrop-blur-md z-[100] flex items-center justify-center p-2 md:p-8 animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-6xl h-full md:max-h-[90vh] rounded-2xl md:rounded-[3.5rem] shadow-2xl flex flex-col overflow-hidden">
              
              {/* Header */}
              <div className="p-4 md:px-10 border-b border-slate-50 flex items-center justify-between bg-white shrink-0">
                 <div className="flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center ${style.bg} ${style.text} shadow-inner`}>
                      <Icon size={20} className="md:w-6 md:h-6" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm md:text-xl font-black text-slate-800 leading-none truncate max-w-[180px] md:max-w-none">{selectedMaterial.title}</h3>
                      <p className="text-slate-400 font-bold text-[8px] md:text-[9px] uppercase tracking-widest mt-1 md:mt-2">Materi Informatika</p>
                    </div>
                 </div>
                 <button onClick={() => setSelectedMaterial(null)} className="p-2 md:p-3 bg-slate-50 text-slate-400 rounded-lg md:rounded-2xl hover:bg-rose-50 hover:text-rose-500 transition-all">
                    <X size={20} className="md:w-6 md:h-6" />
                 </button>
              </div>

              {/* Content Area */}
              <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Main Viewer */}
                <div className="flex-1 bg-slate-100 relative p-3 md:p-8 flex flex-col">
                   <div className="bg-blue-50 border border-blue-100 p-3 md:p-4 rounded-xl md:rounded-2xl mb-3 md:mb-4 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                         <Info size={14} className="text-blue-500 shrink-0 md:w-4 md:h-4" />
                         <p className="text-[9px] md:text-[10px] font-bold text-blue-700 leading-tight">Lihat materi di bawah atau buka di tab baru.</p>
                      </div>
                      <a href={selectedMaterial.content} target="_blank" rel="noreferrer" className="shrink-0 px-3 md:px-5 py-2 bg-white text-blue-600 rounded-lg md:rounded-xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-blue-100 hover:bg-blue-600 hover:text-white transition-all">Tab Baru</a>
                   </div>

                   <div className="flex-1 w-full bg-white rounded-xl md:rounded-[2rem] shadow-xl overflow-hidden border-2 md:border-4 border-white">
                      <iframe 
                        src={getEmbedUrl(selectedMaterial.content)} 
                        className="w-full h-full border-0" 
                        allowFullScreen 
                        title="Material Content"
                        loading="lazy"
                        allow="fullscreen"
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
