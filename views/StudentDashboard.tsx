
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Home, BookOpen, ClipboardList, CheckCircle, Settings, Loader2 } from 'lucide-react';
import Layout from '../components/Layout';
import { User, SiteSettings } from '../types';
import { db } from '../App';

import HomeTab from './student/HomeTab.tsx';
import MaterialsTab from './student/MaterialsTab.tsx';
import TasksTab from './student/TasksTab.tsx';
import GradesTab from './student/GradesTab.tsx';
import SettingsTab from './student/SettingsTab.tsx';

interface StudentDashboardProps {
  user: User;
  onLogout: () => void;
  settings: SiteSettings;
  onUpdateUser?: (u: User) => void;
}

const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onLogout, settings, onUpdateUser }) => {
  const [activeView, setActiveView] = useState('home');
  const [materials, setMaterials] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    if (!user.id) return;
    
    try {
      // Siswa hanya boleh menggunakan db.get pada koleksi yang sifatnya publik/terbuka (materi & tugas)
      // Untuk koleksi yang diproteksi per-user (submissions & notifications), WAJIB gunakan getByQuery
      const [storedMaterials, storedTasks, storedSubmissions, storedNotifs] = await Promise.all([
        db.get('elearning_materials'),
        db.get('elearning_tasks'),
        db.getByQuery('elearning_submissions', 'studentId', user.id),
        db.getByQuery('elearning_notifications', 'userId', user.id)
      ]);
      
      setMaterials(Array.isArray(storedMaterials) ? storedMaterials : []);
      setTasks(Array.isArray(storedTasks) ? storedTasks : []);
      setSubmissions(Array.isArray(storedSubmissions) ? storedSubmissions : []);
      setNotifications(Array.isArray(storedNotifs) ? storedNotifs : []);
    } catch (err) {
      console.error("Gagal sinkronisasi data siswa:", err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 30000); 
    return () => clearInterval(interval);
  }, [fetchData]);

  const handleMarkAsRead = async (id: string) => {
    const notif = notifications.find(n => n.id === id);
    if (notif) {
      await db.update('elearning_notifications', id, { ...notif, read: true });
      setNotifications(notifications.map(n => n.id === id ? { ...n, read: true } : n));
    }
  };

  const handleMarkAllRead = async () => {
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    if (unreadIds.length === 0) return;

    try {
      const updated = notifications.map(n => ({ ...n, read: true }));
      setNotifications(updated);
      await db.saveAll('elearning_notifications', updated);
    } catch (err) {
      console.error("Gagal menandai semua terbaca:", err);
    }
  };

  const ensureArray = (data: any): string[] => {
    if (Array.isArray(data)) return data;
    if (typeof data === 'string') return data.split(',').filter(Boolean);
    return [];
  };

  const studentMaterials = useMemo(() => materials.filter(m => ensureArray(m.targetClassIds).includes(user.classId || '')), [materials, user.classId]);
  const studentTasks = useMemo(() => tasks.filter(t => ensureArray(t.targetClassIds).includes(user.classId || '')), [tasks, user.classId]);
  const studentSubmissions = useMemo(() => submissions, [submissions]); 

  const renderContent = () => {
    switch (activeView) {
      case 'home': 
        return <HomeTab user={user} materials={studentMaterials} tasks={studentTasks} submissions={studentSubmissions} setActiveView={setActiveView} />;
      case 'materials': 
        return <MaterialsTab materials={studentMaterials} />;
      case 'tasks': 
        return <TasksTab user={user} tasks={studentTasks} submissions={studentSubmissions} onRefresh={fetchData} />;
      case 'grades': 
        return <GradesTab tasks={tasks} submissions={studentSubmissions} />;
      case 'settings': 
        return <SettingsTab user={user} onUpdateUser={onUpdateUser} />;
      default: 
        return <HomeTab user={user} materials={studentMaterials} tasks={studentTasks} submissions={studentSubmissions} setActiveView={setActiveView} />;
    }
  };

  return (
    <Layout 
      user={user} 
      onLogout={onLogout} 
      sidebarItems={[
        { id: 'home', label: 'Beranda', icon: Home },
        { id: 'materials', label: 'Materi Belajar', icon: BookOpen },
        { id: 'tasks', label: 'Tugas Saya', icon: ClipboardList },
        { id: 'grades', label: 'Nilai & Hasil', icon: CheckCircle },
        { id: 'settings', label: 'Pengaturan', icon: Settings },
      ]} 
      activeView={activeView} 
      setActiveView={setActiveView}
      logoUrl={settings.logoUrl}
      siteName={settings.siteName}
      notifications={notifications}
      onMarkAsRead={handleMarkAsRead}
      onMarkAllAsRead={handleMarkAllRead}
    >
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4">
          <Loader2 className="animate-spin text-emerald-600" size={48} />
          <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Memuat Data Belajar...</p>
        </div>
      ) : renderContent()}
    </Layout>
  );
};

export default StudentDashboard;
