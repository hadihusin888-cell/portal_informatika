
import React from 'react';
import { BookOpen, Users, Clock, ArrowRight, ShieldCheck, GraduationCap, Zap, Layers, Globe, Star, Cpu } from 'lucide-react';
import { Role, SiteSettings } from '../types';

interface LandingPageProps {
  onNavigateLogin: (role: Role) => void;
  onNavigateSignup: () => void;
  settings: SiteSettings;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigateLogin, onNavigateSignup, settings }) => {
  return (
    <div className="bg-[#fdfdfd] min-h-screen selection:bg-emerald-100">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 glass-effect h-20 px-6 lg:px-20 flex items-center justify-between border-b border-slate-100/50">
        <div className="flex items-center gap-4">
          <img 
            src={settings.logoUrl} 
            alt="Logo SMP Al Irsyad" 
            className="h-12 w-auto object-contain hover:scale-105 transition-transform duration-300"
          />
          <div className="hidden lg:block h-6 w-[1px] bg-slate-200 mx-1"></div>
          <h1 className="hidden sm:block text-lg font-black tracking-tight text-slate-800">
            AL IRSYAD <span className="text-emerald-600">INFORMATIKA</span>
          </h1>
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => onNavigateLogin('STUDENT')}
            className="text-slate-500 font-bold px-4 py-2 hover:text-emerald-600 transition-colors text-sm"
          >
            Siswa
          </button>
          <button 
            onClick={() => onNavigateLogin('ADMIN')}
            className="hidden md:block text-slate-500 font-bold px-4 py-2 hover:text-emerald-600 transition-colors text-sm"
          >
            Guru
          </button>
          <button 
            onClick={onNavigateSignup}
            className="bg-slate-900 text-white px-6 py-2.5 rounded-full font-black text-xs uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-xl shadow-slate-200 active:scale-95"
          >
            Daftar
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 lg:px-20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-emerald-50 rounded-full blur-[120px] -mr-96 -mt-96 opacity-60"></div>
        <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-blue-50 rounded-full blur-[120px] -ml-72 -mb-72 opacity-40"></div>
        
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-20 relative z-10">
          <div className="flex-[1.2] text-center lg:text-left space-y-8">
            <div className="inline-flex items-center gap-3 px-4 py-2 rounded-2xl bg-white border border-slate-100 shadow-sm text-emerald-600 text-xs font-black uppercase tracking-[0.2em] animate-bounce">
              <Star size={14} className="fill-emerald-600" />
              E-Learning v2.0 Cloud
            </div>
            <h2 className="text-5xl lg:text-7xl font-black text-slate-900 leading-[1.1] tracking-tighter">
              Transformasi Belajar <br/> 
              <span className="bg-gradient-to-r from-emerald-600 to-blue-600 bg-clip-text text-transparent italic">Digital Informatika.</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Platform eksklusif SMP Al Irsyad Surakarta untuk menguasai teknologi masa depan melalui pembelajaran yang interaktif dan berbasis cloud.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-5 justify-center lg:justify-start pt-4">
              <button 
                onClick={onNavigateSignup}
                className="w-full sm:w-auto px-10 py-5 bg-emerald-600 text-white rounded-[2rem] font-black text-lg hover:bg-slate-900 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-200 group active:scale-95"
              >
                Mulai Belajar <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
              </button>
              <button 
                onClick={() => onNavigateLogin('STUDENT')}
                className="w-full sm:w-auto px-10 py-5 bg-white text-slate-700 border-2 border-slate-100 rounded-[2rem] font-black text-lg hover:bg-slate-50 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg"
              >
                Cek Nilai Saya
              </button>
            </div>
          </div>
          <div className="flex-1 w-full">
            <div className="relative">
              <div className="absolute -inset-6 bg-gradient-to-tr from-emerald-400 to-blue-500 rounded-[4rem] blur-[40px] opacity-10 animate-pulse"></div>
              <div className="relative bg-white p-3 rounded-[3.5rem] shadow-2xl border border-slate-100">
                <img 
                  src={settings.heroImageUrl} 
                  alt="Hero" 
                  className="rounded-[2.8rem] w-full object-cover aspect-[4/3] shadow-inner"
                />
              </div>
              
              {/* Floating Element - Real-time Sync (Bottom Left) */}
              <div className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.1)] border border-slate-50 hidden sm:block animate-bounce">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center">
                       <Zap size={24} className="fill-blue-600" />
                    </div>
                    <div>
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Real-time</p>
                       <p className="text-lg font-black text-slate-800">Sync Cloud</p>
                    </div>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features with Luxury Cards */}
      <section className="py-32 bg-white relative">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-24 space-y-4">
            <h3 className="text-sm font-black text-emerald-600 uppercase tracking-[0.4em]">Inovasi Digital</h3>
            <h2 className="text-5xl font-black text-slate-900 tracking-tight">Kurikulum Informatika Terbaik</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { 
                icon: Layers, 
                title: 'Computational Thinking', 
                desc: 'Melatih logika dan pemecahan masalah kompleks dengan pendekatan algoritma yang menyenangkan.', 
                color: 'from-blue-500 to-indigo-600' 
              },
              { 
                icon: Zap, 
                title: 'Pembelajaran Hybrid', 
                desc: 'Akses materi dan penugasan secara fleksibel kapanpun dan dimanapun dengan sistem cloud modern.', 
                color: 'from-emerald-500 to-teal-600' 
              },
              { 
                icon: Globe, 
                title: 'Literasi Digital', 
                desc: 'Membentuk karakter siswa yang bijak dalam teknologi dan siap menghadapi era industri 4.0.', 
                color: 'from-purple-500 to-pink-600' 
              },
            ].map((f, i) => (
              <div key={i} className="group relative">
                <div className="absolute inset-0 bg-slate-50 rounded-[3rem] transition-all duration-500 group-hover:scale-105 group-hover:bg-white group-hover:shadow-2xl group-hover:shadow-slate-200"></div>
                <div className="relative p-12 space-y-8">
                  <div className={`w-20 h-20 rounded-[2rem] bg-gradient-to-br ${f.color} flex items-center justify-center text-white shadow-xl shadow-emerald-100 group-hover:rotate-12 transition-transform duration-500`}>
                    <f.icon size={36} />
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-2xl font-black text-slate-900 tracking-tight">{f.title}</h4>
                    <p className="text-slate-500 font-medium leading-relaxed">{f.desc}</p>
                  </div>
                  <div className="pt-4">
                    <div className="w-10 h-1 bg-slate-100 rounded-full group-hover:w-full group-hover:bg-emerald-500 transition-all duration-500"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-slate-950 text-slate-500 border-t border-white/5">
        <div className="max-w-7xl mx-auto flex flex-col items-center text-center space-y-10">
          <div className="flex items-center gap-4">
            <img 
              src={settings.logoUrl} 
              alt="Logo SMP Al Irsyad" 
              className="h-16 w-auto object-contain" 
            />
            <span className="text-2xl font-black text-white tracking-tighter italic">AL IRSYAD <span className="text-emerald-500">INFORMATIKA</span></span>
          </div>
          <div className="h-[1px] w-full max-w-md bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
          <p className="text-sm font-medium">© 2026 SMP AL Irsyad Surakarta. Membangun Generasi Literat Teknologi.</p>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest">
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Instagram</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">YouTube Channel</span>
            <span className="hover:text-emerald-400 cursor-pointer transition-colors">Portal Sekolah</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
