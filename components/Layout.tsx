
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  LogOut, User as UserIcon, Bell, X, Check, 
  Info, BookOpen, ClipboardList, CheckCircle, 
  UserPlus, ChevronDown, Settings, UserCircle 
} from 'lucide-react';

interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  type: 'material' | 'task' | 'grade' | 'registration';
  createdAt: string;
}

interface LayoutProps {
  children: React.ReactNode;
  user: any;
  onLogout: () => void;
  sidebarItems: { icon: any; label: string; id: string }[];
  activeView: string;
  setActiveView: (id: string) => void;
  logoUrl: string;
  siteName: string;
  notifications?: Notification[];
  onMarkAsRead?: (id: string) => void;
  onMarkAllAsRead?: () => void;
}

const Layout: React.FC<LayoutProps> = ({ 
  children, 
  user, 
  onLogout, 
  sidebarItems, 
  activeView, 
  setActiveView,
  logoUrl,
  siteName,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  
  const sortedNotifications = useMemo(() => {
    return [...notifications].sort((a, b) => b.id.localeCompare(a.id));
  }, [notifications]);

  const unreadCount = useMemo(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);
  
  const notificationRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getIcon = (type: string) => {
    switch(type) {
      case 'material': return <BookOpen size={16} className="text-emerald-500" />;
      case 'task': return <ClipboardList size={16} className="text-purple-500" />;
      case 'grade': return <CheckCircle size={16} className="text-blue-500" />;
      case 'registration': return <UserPlus size={16} className="text-orange-500" />;
      default: return <Info size={16} className="text-slate-400" />;
    }
  };

  const NotificationBadge = ({ count }: { count: number }) => (
    count > 0 ? (
      <span className="absolute -top-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-rose-500 text-white text-[8px] md:text-[9px] font-black flex items-center justify-center rounded-full border-2 border-white shadow-lg animate-in zoom-in-50 duration-300">
        {count > 9 ? '9+' : count}
      </span>
    ) : null
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Sidebar Desktop */}
      <aside className="w-72 bg-white border-r border-slate-200 hidden md:flex flex-col sticky top-0 h-screen">
        <div className="p-8 flex flex-col gap-4">
          <img src={logoUrl} alt="Logo" className="h-14 w-auto object-contain self-start" />
          <span className="font-black text-slate-800 text-[10px] leading-tight opacity-40 uppercase tracking-[0.3em]">{siteName}</span>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center gap-4 px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                activeView === item.id 
                  ? 'bg-slate-900 text-white shadow-2xl shadow-slate-200 translate-x-1' 
                  : 'text-slate-400 hover:bg-slate-50 hover:text-slate-600'
              }`}
            >
              <item.icon size={20} />
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-50">
          <div className="p-5 bg-emerald-50 rounded-[2rem] border border-emerald-100/50">
             <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
               <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div>
               Status Sistem
             </p>
             <span className="text-[11px] font-bold text-slate-700">Cloud Terhubung</span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Navbar */}
        <header className="h-16 md:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-10 flex items-center justify-between sticky top-0 z-40">
          <div className="flex items-center gap-4">
            <h2 className="text-lg md:text-xl font-black text-slate-900 tracking-tighter truncate max-w-[150px] md:max-w-none">
              {sidebarItems.find(i => i.id === activeView)?.label || 'Dashboard'}
            </h2>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`p-2.5 md:p-3.5 rounded-xl md:rounded-2xl transition-all relative ${showNotifications ? 'bg-slate-900 text-white shadow-xl' : 'bg-slate-50 text-slate-400 hover:text-slate-900'}`}
              >
                <Bell size={18} className="md:w-5 md:h-5" />
                <NotificationBadge count={unreadCount} />
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-4 w-[280px] md:w-[28rem] bg-white rounded-3xl md:rounded-[3rem] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-5 md:p-8 border-b border-slate-50 flex items-center justify-between bg-white">
                    <div>
                      <h4 className="font-black text-slate-900 text-base md:text-lg tracking-tight">Notifikasi</h4>
                      <p className="text-[8px] md:text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Kamu punya {unreadCount} pesan baru</p>
                    </div>
                    {unreadCount > 0 && (
                      <button 
                        onClick={() => {
                          onMarkAllAsRead?.();
                          setShowNotifications(false);
                        }}
                        className="text-[8px] md:text-[10px] font-black text-emerald-600 uppercase hover:bg-emerald-50 px-3 py-1.5 rounded-lg transition-all active:scale-95"
                      >
                        Tandai Semua
                      </button>
                    )}
                  </div>
                  <div className="max-h-[350px] md:max-h-[450px] overflow-y-auto scrollbar-hide bg-white">
                    {sortedNotifications.length === 0 ? (
                      <div className="py-12 md:py-20 text-center">
                        <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                           <Bell size={30} />
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Belum ada aktivitas baru</p>
                      </div>
                    ) : (
                      sortedNotifications.map((notif) => (
                        <div 
                          key={notif.id} 
                          onClick={() => {
                            onMarkAsRead?.(notif.id);
                            if (!notif.read) setShowNotifications(false);
                          }}
                          className={`p-4 md:p-6 flex gap-4 md:gap-5 cursor-pointer transition-all border-b border-slate-50 last:border-0 ${!notif.read ? 'bg-emerald-50/30 hover:bg-emerald-50/50' : 'hover:bg-slate-50 opacity-60'}`}
                        >
                          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${!notif.read ? 'bg-white' : 'bg-slate-100 grayscale'}`}>
                            {getIcon(notif.type)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-0.5 md:mb-1">
                              <p className={`text-xs md:text-sm truncate ${!notif.read ? 'font-black text-slate-900' : 'font-bold text-slate-500'}`}>{notif.title}</p>
                              <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest shrink-0">{notif.createdAt.split(',')[0]}</p>
                            </div>
                            <p className="text-[10px] md:text-xs text-slate-500 font-medium line-clamp-2 leading-relaxed">{notif.message}</p>
                          </div>
                          {!notif.read && (
                            <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(16,185,129,0.8)]"></div>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="h-8 w-[1px] bg-slate-100 mx-1 md:mx-2"></div>

            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className={`flex items-center gap-2 p-1 md:p-1.5 md:pr-5 rounded-full transition-all ${
                  showProfileMenu 
                    ? 'bg-slate-900 text-white shadow-2xl' 
                    : 'bg-slate-50 border border-slate-100 text-slate-800'
                }`}
              >
                <img 
                  src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                  alt="Profile" 
                  className={`w-8 h-8 md:w-9 md:h-9 rounded-full border-2 ${showProfileMenu ? 'border-white/20' : 'border-white'} bg-white object-cover`}
                />
                <div className="text-left hidden sm:block">
                  <p className="text-xs font-black leading-none">{user.name.split(' ')[0]}</p>
                </div>
                <ChevronDown size={12} className={`transition-transform duration-300 hidden md:block ${showProfileMenu ? 'rotate-180' : ''}`} />
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 mt-4 w-64 md:w-72 bg-white rounded-3xl md:rounded-[2.5rem] shadow-2xl border border-slate-100 overflow-hidden z-50 animate-in fade-in slide-in-from-top-4 duration-300">
                  <div className="p-6 md:p-8 bg-slate-50 border-b border-slate-100 flex flex-col items-center text-center">
                    <img 
                      src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
                      className="w-16 h-16 md:w-20 md:h-20 rounded-full border-4 border-white shadow-xl mb-4"
                      alt=""
                    />
                    <h5 className="text-sm md:text-base font-black text-slate-900">{user.name}</h5>
                    <p className="text-[8px] md:text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mt-1">Siswa Informatika</p>
                  </div>
                  
                  <div className="p-2 md:p-3 space-y-1">
                    <button 
                      onClick={() => { setActiveView('settings'); setShowProfileMenu(false); }}
                      className="w-full flex items-center gap-3 md:gap-4 px-4 py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black text-slate-600 hover:bg-slate-50 transition-colors uppercase tracking-widest"
                    >
                      <Settings size={18} className="text-slate-400" /> Profil Akun
                    </button>
                    <button 
                      onClick={onLogout}
                      className="w-full flex items-center gap-3 md:gap-4 px-4 py-3 rounded-xl md:rounded-2xl text-[10px] md:text-xs font-black text-rose-500 hover:bg-rose-50 transition-colors uppercase tracking-widest"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-12 scrollbar-hide">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around items-center h-16 px-2 z-50 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] rounded-t-[1.5rem] md:rounded-t-[2.5rem]">
        {/* Main navigation items (Home, Materials, Tasks, and Grades for Students) */}
        {sidebarItems.slice(0, 4).map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveView(item.id)}
            className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
              activeView === item.id ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-400'
            }`}
          >
            <item.icon size={20} />
          </button>
        ))}
        {/* Settings button is always at the end on mobile nav */}
        <button
          onClick={() => setActiveView('settings')}
          className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all ${
            activeView === 'settings' ? 'bg-slate-900 text-white shadow-lg scale-105' : 'text-slate-400'
          }`}
        >
          <UserIcon size={20} />
        </button>
      </nav>
    </div>
  );
};

export default Layout;
