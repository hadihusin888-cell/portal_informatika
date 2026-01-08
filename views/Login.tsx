
import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, RefreshCw, ShieldCheck, GraduationCap, Laptop, X, Send, Mail } from 'lucide-react';
import { Role, User } from '../types';
import { auth, firestore } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, sendPasswordResetEmail } from "firebase/auth";
import { doc, getDoc, getDocs, collection, setDoc, query, where, limit } from "firebase/firestore";

interface LoginProps {
  role: Role;
  onBack: () => void;
  onLogin: (user: User) => void;
  onNavigateSignup: () => void;
}

const Login: React.FC<LoginProps> = ({ role, onBack, onLogin, onNavigateSignup }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{message: string; hint?: string}>({message: ''});
  const [loading, setLoading] = useState(false);
  const [isEmptyDb, setIsEmptyDb] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  // Forgot Password State
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotUsername, setForgotUsername] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotSuccess, setForgotSuccess] = useState(false);

  const isAdmin = role === 'ADMIN';

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(firestore, "users"), limit(1)));
        if (querySnapshot.empty) {
          setIsEmptyDb(true);
        }
      } catch (e) {
        // Ignore error
      }
    };
    if (isAdmin) checkUsers();
  }, [isAdmin]);

  const handleCreateInitialAdmin = async () => {
    if (!isAdmin) return;
    
    setIsInitializing(true);
    setError({message: ''});
    const adminUsername = "admin";
    const adminPass = "admin123";
    const email = `${adminUsername}@alirsyad.sch.id`;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, adminPass);
      const firebaseUser = userCredential.user;

      const adminData: User = {
        id: firebaseUser.uid,
        name: "Admin Utama Informatika",
        username: adminUsername,
        role: 'ADMIN',
        status: 'ACTIVE',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=admin`
      };

      await setDoc(doc(firestore, "users", firebaseUser.uid), adminData);
      
      alert(`ADMIN BERHASIL DIBUAT!\n\nUsername: ${adminUsername}\nPassword: ${adminPass}`);
      setIsEmptyDb(false);
      setUsername(adminUsername);
      setPassword(adminPass);
    } catch (err: any) {
      setError({message: "Gagal Inisialisasi: " + err.message});
    } finally {
      setIsInitializing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError({message: ''});
    setLoading(true);

    const cleanUsername = username.trim().toLowerCase();
    const email = `${cleanUsername}@alirsyad.sch.id`;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // HANYA BACA DATA (TANPA UPDATE/WRITE)
      const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
      
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        
        // Cek kecocokan Role
        if (userData.role !== role) {
          await auth.signOut();
          setError({message: `Akses Ditolak: Akun ini terdaftar sebagai ${userData.role}.`});
          return;
        }

        // Cek Status (Hanya Izinkan ACTIVE)
        if (userData.role === 'STUDENT' && userData.status !== 'ACTIVE') {
          await auth.signOut();
          setError({message: "Akun Anda sedang menunggu verifikasi Guru Informatika."});
          return;
        }

        // Jika semua oke, login ke Dashboard
        onLogin({ ...userData, id: firebaseUser.uid });
      } else {
        await auth.signOut();
        setError({message: "Profil akun tidak ditemukan di database Cloud."});
      }
    } catch (err: any) {
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError({message: "Username atau Password salah."});
      } else {
        setError({message: "Gagal masuk: " + (err.message || "Kesalahan sistem.")});
      }
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotUsername) return;
    
    setForgotLoading(true);
    const email = `${forgotUsername.trim().toLowerCase()}@alirsyad.sch.id`;

    try {
      await sendPasswordResetEmail(auth, email);
      setForgotSuccess(true);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess(false);
        setForgotUsername('');
      }, 5000);
    } catch (err: any) {
      alert("Gagal mengirim email reset: " + (err.message || "Akun tidak ditemukan."));
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white selection:bg-indigo-100 selection:text-indigo-900">
      <div className={`hidden md:flex flex-1 items-center justify-center p-20 relative overflow-hidden transition-colors duration-700 ${isAdmin ? 'bg-slate-900' : 'bg-blue-600'}`}>
        <div className={`absolute top-0 right-0 w-96 h-96 rounded-full blur-[120px] -mr-48 -mt-48 transition-colors ${isAdmin ? 'bg-emerald-500/20' : 'bg-white/20'}`}></div>
        <div className="relative z-10 text-white max-w-md space-y-8 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className={`w-20 h-20 rounded-3xl flex items-center justify-center shadow-2xl ${isAdmin ? 'bg-emerald-500' : 'bg-white text-blue-600'}`}>
             {isAdmin ? <ShieldCheck size={40} /> : <GraduationCap size={40} />}
          </div>
          <div className="space-y-4">
            <h2 className="text-6xl font-black leading-tight tracking-tighter">
              Portal Cloud<br/>
              <span className={isAdmin ? 'text-emerald-400 italic' : 'text-blue-200 italic'}>
                {isAdmin ? 'Guru / Admin' : 'Siswa Informatika'}
              </span>
            </h2>
            <div className="h-1.5 w-24 bg-white/20 rounded-full"></div>
            <p className="text-xl text-white/70 font-medium leading-relaxed">
              {isAdmin ? "Manajemen kurikulum & pantau progres siswa." : "Akses materi digital & kumpulkan tugas Anda."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white flex flex-col justify-center items-center px-8 py-12 md:px-20">
        <div className="w-full max-w-md">
          <button onClick={onBack} className="flex items-center gap-3 text-slate-400 hover:text-slate-900 mb-12 font-black text-xs uppercase tracking-widest group">
            <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Beranda
          </button>
          
          <div className="mb-10 space-y-2">
            <h3 className="text-5xl font-black text-slate-900 tracking-tighter">
              {isAdmin ? 'Masuk Guru' : 'Masuk Siswa'}
            </h3>
            <p className="text-slate-500 font-bold italic">SMP Al Irsyad Surakarta</p>
          </div>

          {error.message && (
            <div className="mb-8 p-5 bg-rose-50 border border-rose-100 rounded-3xl animate-in fade-in slide-in-from-top-2">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center shrink-0">
                  <AlertCircle size={20} />
                </div>
                <p className="text-xs font-black text-rose-600 leading-tight">{error.message}</p>
              </div>
            </div>
          )}

          {isEmptyDb && isAdmin && (
            <div className="mb-10 p-8 bg-indigo-50 border-2 border-dashed border-indigo-200 rounded-[2.5rem] space-y-4">
               <p className="text-xs text-indigo-600 font-bold">Admin belum ada. Klik di bawah untuk inisialisasi akun Admin utama.</p>
               <button onClick={handleCreateInitialAdmin} disabled={isInitializing} className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl disabled:opacity-50">
                 {isInitializing ? <RefreshCw className="animate-spin" size={18} /> : 'Buat Admin Sekarang'}
               </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-3">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest ml-2">Username</label>
              <div className="relative group">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500" size={22} />
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Username"
                  className="w-full pl-14 pr-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.8rem] outline-none transition-all font-black text-slate-800 focus:border-blue-500/30 shadow-inner"
                  required
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center ml-2">
                <label className="text-[11px] font-black text-slate-400 uppercase tracking-widest">Kata Sandi</label>
                <button 
                  type="button" 
                  onClick={() => setShowForgotModal(true)}
                  className="text-[10px] font-black text-blue-600 uppercase tracking-widest hover:underline"
                >
                  Lupa Password?
                </button>
              </div>
              <div className="relative group">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500" size={22} />
                <input 
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-14 pr-14 py-5 bg-slate-50 border-2 border-slate-50 rounded-[1.8rem] font-bold text-slate-800 focus:border-blue-500/30 shadow-inner"
                  required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={22} /> : <Eye size={22} />}
                </button>
              </div>
            </div>

            <button 
              disabled={loading} 
              className={`w-full py-6 rounded-[1.8rem] font-black text-lg shadow-2xl transition-all disabled:opacity-50 active:scale-[0.98] flex items-center justify-center gap-4 ${isAdmin ? 'bg-slate-900 text-white hover:bg-emerald-600' : 'bg-blue-600 text-white hover:bg-slate-900'}`}
            >
              {loading ? <RefreshCw className="animate-spin" size={26} /> : 'Login Sekarang'}
            </button>
            
            {role === 'STUDENT' && (
              <div className="text-center pt-4">
                <p className="text-slate-500 font-bold text-sm">
                  Belum punya akun? <button type="button" onClick={onNavigateSignup} className="text-blue-600 font-black hover:underline underline-offset-4">Daftar Cloud Siswa</button>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-6 animate-in fade-in duration-300">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full -mr-16 -mt-16"></div>
             
             <div className="relative z-10 text-center space-y-6">
                <div className="w-20 h-20 bg-blue-100 text-blue-600 rounded-3xl flex items-center justify-center mx-auto shadow-inner">
                   <Mail size={32} />
                </div>
                
                <div className="space-y-2">
                   <h4 className="text-2xl font-black text-slate-900 tracking-tight">Pulihkan Password</h4>
                   <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                     Masukkan Username Anda untuk menerima link reset melalui email.
                   </p>
                </div>

                {forgotSuccess ? (
                  <div className="p-6 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 animate-in zoom-in-95 duration-300">
                     <p className="text-xs font-black uppercase tracking-widest">Email Terkirim!</p>
                     <p className="text-[10px] font-bold mt-2 leading-relaxed opacity-80">Silakan periksa kotak masuk (atau spam) email {forgotUsername}@alirsyad.sch.id</p>
                  </div>
                ) : (
                  <form onSubmit={handleForgotPassword} className="space-y-4">
                    <input 
                      type="text"
                      placeholder="Username Siswa"
                      value={forgotUsername}
                      onChange={(e) => setForgotUsername(e.target.value.toLowerCase())}
                      className="w-full p-5 bg-slate-50 border-2 border-slate-100 rounded-2xl outline-none font-bold text-slate-800 focus:border-blue-500 transition-all text-center"
                      required
                    />
                    <button 
                      type="submit" 
                      disabled={forgotLoading || !forgotUsername}
                      className="w-full py-4 bg-slate-900 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-blue-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {forgotLoading ? <RefreshCw className="animate-spin" size={16} /> : <Send size={16} />}
                      Kirim Link Reset
                    </button>
                  </form>
                )}

                <button 
                  onClick={() => setShowForgotModal(false)}
                  className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] hover:text-slate-900 pt-4"
                >
                  Batalkan
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
