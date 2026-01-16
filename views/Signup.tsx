import React, { useState, useEffect } from 'react';
import { ArrowLeft, Loader2, Eye, EyeOff, AlertCircle } from 'lucide-react';
import { User, ClassRoom } from '../types';
import { auth, firestore } from '../firebase';
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { doc, getDocs, collection, query, where, limit, setDoc } from "firebase/firestore";
import { notifyAdmins } from '../utils/helpers';

interface SignupProps {
  onBack: () => void;
  onSignup: () => void;
  logoUrl: string;
}

const Signup: React.FC<SignupProps> = ({ onBack, onSignup, logoUrl }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [classRoom, setClassRoom] = useState('');
  const [classes, setClasses] = useState<ClassRoom[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const q = query(collection(firestore, 'elearning_classes'));
        const snap = await getDocs(q);
        const classList = snap.docs.map(d => ({ id: d.id, ...d.data() } as ClassRoom));
        
        // Mengurutkan kelas berdasarkan nama secara alfanumerik (7, 8, 9, dst)
        const sortedClasses = classList.sort((a, b) => 
          a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' })
        );
        
        setClasses(sortedClasses);
      } catch (e) {
        console.error("Error fetching classes:", e);
      }
    };
    fetchClasses();
  }, []);

  const checkUsernameAvailable = async (uname: string) => {
    try {
      const q = query(collection(firestore, "users"), where("username", "==", uname), limit(1));
      const snap = await getDocs(q);
      return snap.empty;
    } catch (e) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok!");
      return;
    }

    if (password.length < 6) {
      setError("Password minimal harus 6 karakter.");
      return;
    }

    setLoading(true);
    const cleanUsername = username.trim().toLowerCase();
    const email = `${cleanUsername}@alirsyad.sch.id`;

    try {
      const isAvailable = await checkUsernameAvailable(cleanUsername);
      if (!isAvailable) {
        throw new Error("Username sudah digunakan. Silakan pilih username lain.");
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      const userData: User = {
        id: firebaseUser.uid,
        name,
        username: cleanUsername,
        classId: classRoom,
        role: 'STUDENT',
        status: 'PENDING',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanUsername}`,
        createdAt: new Date().toISOString(),
        password: password
      };

      // Pastikan status adalah PENDING secara eksplisit dan penulisan dokumen selesai
      await setDoc(doc(firestore, "users", firebaseUser.uid), userData);
      
      await notifyAdmins(
        "Pendaftaran Siswa Baru", 
        `${name} (Kelas ${classRoom}) telah mendaftar. Mohon segera verifikasi akun tersebut.`
      );
      
      alert("Pendaftaran Berhasil! Akun Anda sedang menunggu konfirmasi Guru Informatika.");
      
      // Tunggu sejenak sebelum sign out agar auth listener di App.tsx tidak crash
      await new Promise(r => setTimeout(r, 500));
      await signOut(auth);
      onSignup();
    } catch (err: any) {
      if (err.code === 'auth/email-already-in-use') {
        setError("Username/Akun sudah terdaftar. Silakan login.");
      } else {
        setError(err.message || "Gagal melakukan pendaftaran.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-6 py-12 text-black">
      <div className="w-full max-w-xl bg-white p-10 md:p-14 rounded-[3.5rem] shadow-2xl relative overflow-hidden border border-slate-100">
        {loading && (
          <div className="absolute inset-0 bg-white/80 z-20 flex items-center justify-center backdrop-blur-sm">
            <Loader2 className="animate-spin text-emerald-600" size={48} />
          </div>
        )}
        
        <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-10 font-black text-xs uppercase tracking-widest transition-colors">
          <ArrowLeft size={16} /> Kembali
        </button>

        <div className="text-center mb-12 space-y-3">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm p-2 border border-slate-50">
             <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
          </div>
          <h3 className="text-4xl font-black text-slate-900 tracking-tight">Registrasi Cloud</h3>
          <p className="text-slate-400 font-bold text-sm italic">Siswa Informatika SMP Al Irsyad Surakarta</p>
        </div>

        {error && (
          <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-3xl flex items-center gap-4 text-rose-600 animate-in fade-in slide-in-from-top-2">
            <AlertCircle size={24} className="shrink-0" />
            <p className="text-xs font-black uppercase tracking-tight leading-tight">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {step === 1 ? (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Nama Lengkap Siswa</label>
                <input 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[1.8rem] outline-none font-bold text-slate-800 focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                  placeholder="Nama Lengkap..." 
                  required 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Pilih Kelas</label>
                <select 
                  value={classRoom} 
                  onChange={e => setClassRoom(e.target.value)} 
                  className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[1.8rem] outline-none font-bold text-slate-800 focus:border-emerald-500 focus:bg-white transition-all shadow-inner appearance-none cursor-pointer" 
                  required
                >
                  <option value="">-- Pilih Kelas Anda --</option>
                  {classes.map(c => <option key={c.id} value={c.name}>Kelas {c.name}</option>)}
                </select>
              </div>
              <button 
                type="button" 
                onClick={() => setStep(2)} 
                disabled={!name || !classRoom}
                className="w-full py-6 bg-slate-900 text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-xl hover:bg-emerald-600 disabled:opacity-30 active:scale-[0.98] transition-all"
              >
                Lanjut ke Kredensial
              </button>
            </div>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right-4 duration-500">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Username Baru</label>
                <input 
                  value={username} 
                  onChange={e => setUsername(e.target.value.toLowerCase().replace(/\s/g, ''))} 
                  className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[1.8rem] outline-none font-black text-emerald-600 focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                  placeholder="Contoh: fauzi8a" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Password</label>
                  <div className="relative">
                    <input 
                      type={showPassword ? 'text' : 'password'} 
                      value={password} 
                      onChange={e => setPassword(e.target.value)} 
                      className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] outline-none font-bold text-slate-800 focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                      placeholder="Minimal 6 Karakter" 
                      required 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-300 hover:text-slate-600 transition-colors"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Ulangi Password</label>
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    value={confirmPassword} 
                    onChange={e => setConfirmPassword(e.target.value)} 
                    className="w-full p-5 bg-slate-50 border-2 border-slate-50 rounded-[1.5rem] outline-none font-bold text-slate-800 focus:border-emerald-500 focus:bg-white transition-all shadow-inner" 
                    placeholder="Konfirmasi" 
                    required 
                  />
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button type="button" onClick={() => setStep(1)} className="flex-1 py-5 bg-slate-100 text-slate-500 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all">Kembali</button>
                <button type="submit" className="flex-[2] py-5 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-emerald-100 hover:bg-slate-900 active:scale-[0.98] transition-all">Selesaikan Pendaftaran</button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default Signup;