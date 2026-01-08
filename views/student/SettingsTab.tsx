
import React, { useState, useRef } from 'react';
import { 
  Camera, UserCog, Lock, Eye, EyeOff, 
  Info, Save, Loader2, User as UserIcon,
  ShieldCheck, BadgeCheck, LayoutGrid, Trash2,
  RefreshCw
} from 'lucide-react';
import { db } from '../../App';
import { User } from '../../types';
import { auth, firestore } from '../../firebase';
import { updatePassword, updateEmail } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

interface SettingsTabProps {
  user: User;
  onUpdateUser?: (u: User) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({ user, onUpdateUser }) => {
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [previewAvatar, setPreviewAvatar] = useState(user.avatar || '');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) {
        alert("Ukuran foto terlalu besar! Maksimal 500KB.");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewAvatar(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetAvatar = () => {
    setPreviewAvatar(`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`);
  };

  const handleUpdate = async () => {
    if (!username || !name) return alert("Nama dan Username tidak boleh kosong!");
    
    setIsSaving(true);
    let authError = false;
    let errorMsg = "";

    try {
      const currentUser = auth.currentUser;

      if (password && currentUser) {
        if (password.length < 6) throw new Error("Password minimal 6 karakter.");
        try {
          await updatePassword(currentUser, password);
        } catch (e: any) {
          authError = true;
          errorMsg += "Gagal update password. ";
        }
      }

      if (username !== user.username && currentUser) {
        const newEmail = `${username}@alirsyad.sch.id`;
        try {
          await updateEmail(currentUser, newEmail);
        } catch (e: any) {
          authError = true;
          errorMsg += "Gagal update username. ";
        }
      }

      // KUNCI STATUS: Gunakan status saat ini (ACTIVE) agar tidak berubah ke PENDING
      const updatedUser: User = { 
        ...user, 
        name,
        username: authError && username !== user.username ? user.username : username, 
        avatar: previewAvatar,
        status: user.status || 'ACTIVE' // Memastikan status tetap terjaga
      };
      
      // Simpan ke Firestore
      await setDoc(doc(firestore, "users", user.id), updatedUser, { merge: true });
      
      if (onUpdateUser) onUpdateUser(updatedUser);
      
      if (authError) {
        alert("Nama & Foto berhasil diperbarui, namun ada kendala di autentikasi: " + errorMsg);
      } else {
        setPassword('');
        alert("Profil Anda berhasil diperbarui!");
      }
    } catch (err: any) {
      alert("Gagal menyimpan: " + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-10 animate-in fade-in slide-in-from-bottom-8 duration-700 text-black pb-32 px-4">
      <section className="bg-white rounded-[3.5rem] p-10 border border-slate-100 shadow-sm relative overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-50 rounded-full -mr-32 -mt-32 opacity-50"></div>
        <div className="relative z-10 space-y-6">
          <div className="relative group mx-auto w-max">
            <div className="absolute -inset-2 bg-gradient-to-tr from-emerald-500 to-indigo-500 rounded-full blur opacity-20"></div>
            <img 
              src={previewAvatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.username}`} 
              className="w-40 h-40 rounded-full border-8 border-white shadow-2xl bg-white object-cover relative" 
              alt="Avatar"
            />
            <div className="absolute bottom-2 right-2 flex gap-2">
              <button onClick={() => fileInputRef.current?.click()} className="p-3 bg-emerald-600 text-white rounded-2xl shadow-lg border-4 border-white hover:scale-110 transition-all"><Camera size={20}/></button>
              <button onClick={resetAvatar} className="p-3 bg-white text-rose-500 rounded-2xl shadow-lg border-4 border-white hover:bg-rose-50 transition-all"><RefreshCw size={20}/></button>
            </div>
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
          </div>
          <div>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">{name}</h2>
            <div className="flex items-center justify-center gap-2 mt-2">
              <span className="px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-2 border border-indigo-100">
                <BadgeCheck size={14} /> Siswa Aktif
              </span>
              <span className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-[10px] font-black uppercase tracking-widest">
                Kelas {user.classId}
              </span>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-7 space-y-8">
          <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-sm">
            <div className="flex items-center gap-4 mb-10">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center"><UserCog size={24}/></div>
              <h4 className="text-xl font-black text-slate-800">Identitas Diri</h4>
            </div>
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Nama Lengkap</label>
                <input value={name} onChange={e => setName(e.target.value)} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Username (Login ID)</label>
                <input value={username} onChange={e => setUsername(e.target.value.toLowerCase())} className="w-full p-5 bg-slate-50 border border-slate-200 rounded-2xl font-black text-emerald-600 outline-none focus:border-emerald-500 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-1">Ganti Password (Opsional)</label>
                <div className="relative">
                  <input type={showPassword ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" className="w-full p-5 pr-14 bg-slate-50 border border-slate-200 rounded-2xl font-bold outline-none focus:border-emerald-500 transition-all" />
                  <button onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400">{showPassword ? <EyeOff size={20}/> : <Eye size={20}/>}</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-5 flex flex-col gap-6">
          <div className="bg-slate-900 p-10 rounded-[3rem] text-white shadow-2xl relative overflow-hidden flex flex-col">
             <h4 className="text-xl font-black mb-6">Status Cloud</h4>
             <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                   <span className="text-xs text-slate-400 font-bold uppercase">ID Database</span>
                   <span className="text-xs font-mono">{user.id.substring(0, 12)}...</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-white/10">
                   <span className="text-xs text-slate-400 font-bold uppercase">Email Login</span>
                   <span className="text-xs font-bold text-emerald-400">{username}@alirsyad.sch.id</span>
                </div>
             </div>
          </div>
          <button onClick={handleUpdate} disabled={isSaving} className="w-full py-6 bg-emerald-600 text-white rounded-[2rem] font-black text-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-4 shadow-xl active:scale-95 disabled:opacity-50">
            {isSaving ? <Loader2 className="animate-spin" size={24}/> : <Save size={24}/>}
            {isSaving ? 'Memproses...' : 'Update Profil'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;
