
import React, { useState } from 'react';
import { 
  Globe, LayoutDashboard, Link as LinkIcon, Image as ImageIcon, 
  Shield, UserCog, Key, User as UserIcon, EyeOff, Eye, 
  Loader2, Save, Cloud, Palette, Monitor, Camera, 
  CheckCircle2, Info, ArrowRight, Sparkles, Database,
  TableProperties, Lock, AlertTriangle, ShieldAlert, Play, Trash2
} from 'lucide-react';
import { db } from '../../App';
import { SiteSettings, User, ClassRoom, Material, Task } from '../../types';
import { doc, setDoc } from "firebase/firestore";
import { firestore, auth } from '../../firebase';
import { updatePassword, updateEmail } from "firebase/auth";

interface SettingsTabProps {
  settings: SiteSettings;
  setSettings: (s: SiteSettings) => void;
  user: User;
  onUpdateUser: (u: User) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ settings, setSettings, user, onUpdateUser }) => {
  const [adminName, setAdminName] = useState(user.name);
  const [adminUsername, setAdminUsername] = useState(user.username);
  const [adminPassword, setAdminPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);

  const handleSave = async () => {
    if (!settings.siteName || !adminName || !adminUsername) {
      alert("Nama Platform, Nama Guru, dan Username tidak boleh kosong.");
      return;
    }

    setIsSaving(true);
    let authErrorOccurred = false;
    let authErrorMessage = "";

    try {
      await db.update('settings', 'site_configs', settings);
      const currentUser = auth.currentUser;

      if (currentUser) {
        if (adminPassword) {
          if (adminPassword.length < 6) throw new Error("Password minimal harus 6 karakter.");
          try {
            await updatePassword(currentUser, adminPassword);
          } catch (pErr: any) {
            authErrorOccurred = true;
            authErrorMessage += `Gagal Update Password: ${pErr.message}\n`;
          }
        }

        if (adminUsername !== user.username) {
          const newEmail = `${adminUsername}@alirsyad.sch.id`;
          try {
            await updateEmail(currentUser, newEmail);
          } catch (eErr: any) {
            authErrorOccurred = true;
            authErrorMessage += `Gagal Update Username: ${eErr.message}\n`;
            setAdminUsername(user.username);
          }
        }
      }

      const updatedUser: User = { 
        ...user, 
        name: adminName, 
        username: authErrorOccurred && adminUsername !== user.username ? user.username : adminUsername, 
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUsername}`
      };
      
      await setDoc(doc(firestore, "users", user.id), updatedUser, { merge: true });
      if (onUpdateUser) onUpdateUser(updatedUser);

      if (authErrorOccurred) {
        alert(`Profil berhasil diperbarui dengan catatan:\n${authErrorMessage}`);
      } else {
        setAdminPassword('');
        alert('Pengaturan berhasil disimpan!');
      }
    } catch (err: any) {
      alert('Gagal menyimpan: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleGenerateDummy = async () => {
    if (!confirm("Apakah Anda ingin memasukkan data dummy (Kelas, Materi, & Tugas) untuk testing?")) return;
    
    setIsInitializing(true);
    try {
      // 1. Data Kelas Dummy
      const dummyClasses: ClassRoom[] = [
        { id: 'cls_7a', name: '7A', homeroomTeacher: 'Ustadz Ahmad' },
        { id: 'cls_8a', name: '8A', homeroomTeacher: 'Ustadzah Fatimah' },
        { id: 'cls_9a', name: '9A', homeroomTeacher: 'Ustadz Umar' }
      ];
      for (const c of dummyClasses) await db.update('elearning_classes', c.id, c);

      // 2. Data Materi Dummy
      const dummyMaterials: Material[] = [
        {
          id: 'mat_1',
          title: 'Pengenalan Perangkat Keras (Hardware)',
          description: 'Mengenal komponen fisik komputer seperti CPU, RAM, dan Storage.',
          type: 'link',
          content: 'https://www.youtube.com/watch?v=HG8_tT02BvY',
          targetClassIds: ['7A', '8A', '9A'],
          createdAt: new Date().toLocaleString('id-ID')
        },
        {
          id: 'mat_2',
          title: 'Berpikir Komputasional',
          description: 'Belajar dekomposisi, pengenalan pola, dan algoritma dasar.',
          type: 'embed',
          content: 'https://docs.google.com/presentation/d/1Xy_J8_Dummy/embed',
          targetClassIds: ['8A'],
          createdAt: new Date().toLocaleString('id-ID')
        }
      ];
      for (const m of dummyMaterials) await db.update('elearning_materials', m.id, m);

      // 3. Data Tugas Dummy
      const dummyTasks: Task[] = [
        {
          id: 'tsk_1',
          title: 'Tugas Flowchart Algoritma',
          description: 'Buatlah flowchart untuk proses membuat teh manis di buku tulis atau aplikasi diagram.',
          type: 'link',
          content: 'https://canva.com/design/example',
          targetClassIds: ['8A'],
          dueDate: '2025-12-31',
          isSubmissionEnabled: true,
          createdAt: new Date().toLocaleString('id-ID')
        }
      ];
      for (const t of dummyTasks) await db.update('elearning_tasks', t.id, t);

      alert("Data Dummy Berhasil Dimasukkan! Silakan cek tab Ringkasan, Materi, atau Kelas.");
      window.location.reload(); // Refresh untuk melihat perubahan
    } catch (err: any) {
      alert("Gagal Inisialisasi: " + err.message);
    } finally {
      setIsInitializing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-700 text-black pb-32 px-4">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <div className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
              <Sparkles size={12} /> System Configuration
            </div>
          </div>
          <h2 className="text-4xl font-black text-slate-900 tracking-tight">Pengaturan Platform</h2>
          <p className="text-slate-500 font-medium text-lg mt-2">Personalisasi identitas visual dan keamanan akun administrator.</p>
        </div>
        
        <button 
          onClick={handleSave} 
          disabled={isSaving}
          className="group px-8 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-emerald-600 transition-all flex items-center justify-center gap-4 shadow-2xl shadow-slate-200 active:scale-95 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="animate-spin" size={24} /> : <Save size={24} />}
          {isSaving ? 'Menyimpan...' : 'Simpan Semua'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        {/* Kolom Kiri: Site Settings */}
        <div className="lg:col-span-7 space-y-10">
          <div className="bg-white p-10 rounded-[3.5rem] border border-slate-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-50/50 rounded-full -mr-16 -mt-16"></div>
            
            <div className="flex items-center gap-5 mb-10 relative z-10">
              <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Globe size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">Visual & Identitas</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Branding Website</p>
              </div>
            </div>

            <div className="space-y-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Platform E-Learning</label>
                <div className="relative group">
                  <LayoutDashboard className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    value={settings.siteName} 
                    onChange={e => setSettings({...settings, siteName: e.target.value})} 
                    className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-[1.8rem] font-black text-slate-800 focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-300 outline-none transition-all shadow-inner" 
                    placeholder="Contoh: Informatika SMP Al Irsyad"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Logo Sekolah URL</label>
                <div className="relative group">
                  <LinkIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    value={settings.logoUrl} 
                    onChange={e => setSettings({...settings, logoUrl: e.target.value})} 
                    className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-[1.8rem] font-bold text-slate-600 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner" 
                    placeholder="https://link-gambar-logo.png"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Hero Image URL</label>
                <div className="relative group">
                  <ImageIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
                  <input 
                    value={settings.heroImageUrl} 
                    onChange={e => setSettings({...settings, heroImageUrl: e.target.value})} 
                    className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-[1.8rem] font-bold text-slate-600 focus:ring-4 focus:ring-emerald-500/10 outline-none transition-all shadow-inner" 
                    placeholder="https://link-hero-image.jpg"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* New: Data Playground Section */}
          <div className="bg-slate-900 p-10 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -mr-32 -mt-32"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-5 mb-8">
                <div className="w-14 h-14 bg-white/10 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
                  <Database size={28} />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-white">Database Inisialisasi</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Testing & Development</p>
                </div>
              </div>
              
              <div className="bg-white/5 border border-white/10 p-6 rounded-[2rem] space-y-6">
                <p className="text-xs text-slate-300 font-medium leading-relaxed italic">
                  Gunakan tombol di bawah untuk mengisi database Anda dengan materi informatika, daftar kelas, dan contoh penugasan secara otomatis.
                </p>
                <button 
                  onClick={handleGenerateDummy}
                  disabled={isInitializing}
                  className="w-full py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-500 transition-all flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
                >
                  {isInitializing ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} className="fill-white" />}
                  {isInitializing ? 'Sedang Memasukkan Data...' : 'Isi Data Dummy (Testing)'}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Kolom Kanan: Admin Account Security */}
        <div className="lg:col-span-5 space-y-10">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm relative overflow-hidden h-fit">
            <div className="flex items-center gap-5 mb-10 relative z-10">
              <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shadow-inner">
                <Shield size={28} />
              </div>
              <div>
                <h3 className="text-2xl font-black text-slate-800">Profil & Keamanan</h3>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Kredensial Guru</p>
              </div>
            </div>

            <div className="space-y-6 relative z-10">
              <div className="flex flex-col items-center py-6 bg-slate-50 rounded-[2.5rem] border border-slate-100 mb-2 shadow-inner">
                <img 
                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${adminUsername}`} 
                  className="w-24 h-24 rounded-full border-4 border-white shadow-lg bg-white mb-4" 
                  alt="Admin Avatar"
                />
                <h4 className="font-black text-slate-800">{adminName || 'Nama Guru'}</h4>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Administrator Cloud</p>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap Guru</label>
                <div className="relative group">
                  <UserCog className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    value={adminName} 
                    onChange={e => setAdminName(e.target.value)} 
                    className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1 text-blue-600">Username Login</label>
                <div className="relative group">
                  <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    value={adminUsername} 
                    onChange={e => setAdminUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} 
                    className="w-full p-5 pl-14 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-black text-blue-700 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner" 
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Ganti Kata Sandi</label>
                  <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">Min. 6 Karakter</span>
                </div>
                <div className="relative group">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors" size={20} />
                  <input 
                    type={showPassword ? 'text' : 'password'}
                    value={adminPassword} 
                    onChange={e => setAdminPassword(e.target.value)} 
                    placeholder="Biarkan kosong jika tidak ingin ganti"
                    className="w-full p-5 pl-14 pr-14 bg-slate-50 border border-slate-100 rounded-[1.5rem] font-bold text-slate-800 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all shadow-inner" 
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition-colors">
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="p-6 bg-slate-900 rounded-[2rem] border border-white/10 space-y-4">
                <div className="flex items-center gap-3 text-amber-400">
                  <ShieldAlert size={20} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Peringatan Keamanan</span>
                </div>
                <p className="text-[10px] text-slate-300 font-bold leading-relaxed">
                  Perubahan Username atau Password adalah operasi sensitif. Jika gagal, silakan Logout dan Login kembali.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
