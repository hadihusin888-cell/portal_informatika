import React, { useState, useEffect } from 'react';
import { BarChart3, BookOpen, ClipboardList, Users, School, Settings, UserPlus, CheckCircle, AlertTriangle } from 'lucide-react';
import Layout from '../components/Layout.tsx';
import { User, SiteSettings, ClassRoom } from '../types.ts';
import { db } from '../App.tsx';
import { firestore } from '../firebase';
import { collection, query, where, onSnapshot } from "firebase/firestore";

import OverviewTab from './admin/OverviewTab.tsx';
import ConfirmRegistrationsTab from './admin/ConfirmRegistrationsTab.tsx';
import ManageMaterialsTab from './admin/ManageMaterialsTab.tsx';
import ManageTasksTab from './admin/ManageTasksTab.tsx';
import GradesTab from './admin/GradesTab.tsx';
import ManageStudentsTab from './admin/ManageStudentsTab.tsx';
import ManageClassesTab from './admin/ManageClassesTab.tsx';
import SettingsTab from './admin/SettingsTab.tsx';

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
  settings: SiteSettings;
  setSettings: React.Dispatch<React.SetStateAction<SiteSettings>>;
  onUpdateUser?: (u: User) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onLogout, settings, setSettings, onUpdateUser }) => {
  const [activeView, setActiveView] = useState('overview');
  const [notifications, setNotifications] = useState<any[]>([]);
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
    type: 'danger' | 'warning';
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {},
    type: 'danger'
  });

  useEffect(() => {
    // 1. Real-time Notifications Listener
    const qNotifs = query(
      collection(firestore, 'elearning_notifications'), 
      where('userId', '==', user.id)
    );
    
    const unsubscribeNotifs = onSnapshot(qNotifs, (snapshot) => {
      const notifList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setNotifications(notifList);
    });

    // 2. Fetch Classes
    const fetchClasses = async () => {
      const c = await db.get('elearning_classes');
      setClasses(Array.isArray(c) ? c : []);
    };
    fetchClasses();
    
    return () => {
      unsubscribeNotifs();
    };
  }, [user.id]);

  const handleMarkAsRead = async (id: string) => {
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      await db.update('elearning_notifications', id, { ...notif, read: true });
      // Notifications will be updated automatically via onSnapshot listener
    }
  };

  const handleMarkAllRead = async () => {
    const updated = notifications.filter(n => !n.read).map(n => ({ ...n, read: true }));
    if (updated.length > 0) {
      await db.saveAll('elearning_notifications', updated);
      // Notifications will be updated automatically via onSnapshot listener
    }
  };

  const sidebarItems = [
    { id: 'overview', label: 'Ringkasan', icon: BarChart3 },
    { id: 'confirmations', label: 'Konfirmasi Siswa', icon: UserPlus },
    { id: 'materials', label: 'Kelola Materi', icon: BookOpen },
    { id: 'tasks', label: 'Kelola Tugas', icon: ClipboardList },
    { id: 'grades', label: 'Nilai Tugas', icon: CheckCircle },
    { id: 'students', label: 'Kelola Siswa', icon: Users },
    { id: 'classes', label: 'Kelola Kelas', icon: School },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const triggerConfirm = (title: string, message: string, onConfirm: () => void, type: 'danger' | 'warning' = 'danger') => {
    setConfirmModal({ isOpen: true, title, message, onConfirm, type });
  };

  const closeConfirm = () => setConfirmModal(prev => ({ ...prev, isOpen: false }));

  const renderContent = () => {
    switch (activeView) {
      case 'overview': return <OverviewTab setActiveView={setActiveView} />;
      case 'confirmations': return <ConfirmRegistrationsTab triggerConfirm={triggerConfirm} />;
      case 'materials': return <ManageMaterialsTab triggerConfirm={triggerConfirm} classes={classes} />;
      case 'tasks': return <ManageTasksTab triggerConfirm={triggerConfirm} classes={classes} />;
      case 'grades': return <GradesTab triggerConfirm={triggerConfirm} classes={classes} />;
      case 'students': return <ManageStudentsTab triggerConfirm={triggerConfirm} classes={classes} />;
      case 'classes': return <ManageClassesTab triggerConfirm={triggerConfirm} classes={classes} setClasses={setClasses} />;
      case 'settings': return <SettingsTab settings={settings} setSettings={setSettings} user={user} onUpdateUser={onUpdateUser!} />;
      default: return <OverviewTab setActiveView={setActiveView} />;
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={onLogout} 
      sidebarItems={sidebarItems} 
      activeView={activeView} 
      setActiveView={setActiveView}
      logoUrl={settings.logoUrl}
      siteName={settings.siteName}
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllRead}
    >
      {renderContent()}

      {confirmModal.isOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6 text-black">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
            <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center mb-6 ${confirmModal.type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-orange-50 text-orange-500'}`}>
              <AlertTriangle size={40} className={confirmModal.type === 'danger' ? 'text-red-500' : 'text-orange-500'} />
            </div>
            <h3 className="text-2xl font-black text-slate-800 mb-2">{confirmModal.title}</h3>
            <p className="text-slate-500 font-medium text-sm leading-relaxed mb-10">{confirmModal.message}</p>
            <div className="flex gap-4">
              <button onClick={closeConfirm} className="flex-1 py-4 bg-slate-50 text-slate-500 rounded-2xl font-black text-sm hover:bg-slate-100 transition-all">Batal</button>
              <button onClick={() => { confirmModal.onConfirm(); closeConfirm(); }} className={`flex-1 py-4 text-white rounded-2xl font-black text-sm shadow-xl transition-all ${confirmModal.type === 'danger' ? 'bg-red-500 hover:bg-red-600' : 'bg-orange-500 hover:bg-orange-600'}`}>Ya, Lanjutkan</button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default AdminDashboard;