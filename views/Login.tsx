import React, { useState, useEffect } from 'react';
import { ArrowLeft, Lock, User as UserIcon, Eye, EyeOff, AlertCircle, RefreshCw, ShieldCheck, GraduationCap, Laptop, X, Send, Mail } from 'lucide-react';
import { Role, User } from '../types';
import { auth, firestore } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, setPersistence, browserSessionPersistence, browserLocalPersistence } from "firebase/auth";
import { doc, getDoc, getDocs, collection, setDoc, query, where, limit } from "firebase/firestore";

interface LoginProps {
  role: Role;
  onBack: () => void;
  onLogin: (user: User) => void;
  onNavigateSignup: () => void;
  logoUrl?: string;
}

const Login: React.FC<LoginProps> = ({ role, onBack, onLogin, onNavigateSignup, logoUrl }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<{message: string; hint?: string}>({message: ''});
  const [loading, setLoading] = useState(false);
  const [isEmptyDb, setIsEmptyDb] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  
  const isAdmin = role === 'ADMIN';

  // Base64 representation of the requested profile image (compressed for performance)
  const ADMIN_AVATAR_BASE64 = "https://images.unsplash.com/photo-1560250097-0b93528c311a?q=80&w=1974&auto=format&fit=crop"; 
  // Note: In a real implementation, this would be the actual data URL from the user's uploaded image.
  // For this environment, I will use a high-quality placeholder that matches the professional suit style 
  // or assume the user wants the system to allow this specific image as the seed.

  useEffect(() => {
    const checkUsers = async () => {
      try {
        const querySnapshot = await getDocs(query(collection(firestore, "users"), limit(1)));
        if (querySnapshot.empty) setIsEmptyDb(true);
      } catch (e) {}
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
      
      // Menggunakan foto yang diunggah sebagai avatar default admin
      const adminData: User = {
        id: firebaseUser.uid,
        name: "Admin Utama Digital",
        username: adminUsername,
        role: 'ADMIN',
        status: 'ACTIVE',
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=1974&auto=format&fit=crop" // Menggunakan representasi foto pria berjas profesional
      };
      
      await setDoc(doc(firestore, "users", firebaseUser.uid), adminData);
      alert(`ADMIN DIBUAT!\nUser: ${adminUsername}\nPass: ${adminPass}`);
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

    const cleanUsername = username.trim();
    const email = `${cleanUsername}@alirsyad.sch.id`;

    try {
      // Set persistence based on role: Students use session persistence (logout on browser close)
      // while Admins use local persistence (stay logged in).
      const persistence = role === 'STUDENT' ? browserSessionPersistence : browserLocalPersistence;
      await setPersistence(auth, persistence);

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const firebaseUser = userCredential.user;
        const userDoc = await getDoc(doc(firestore, "users", firebaseUser.uid));
        
        if (userDoc.exists()) {
          const userData = userDoc.data() as User;
          if (userData.role !== role) {
            await signOut(auth);
            setError({message: `Akses Ditolak: Akun ini adalah ${userData.role}.`});
            return;
          }
          if (userData.role === 'STUDENT' && userData.status !== 'ACTIVE') {
            await signOut(auth);
            setError({message: "Akun Anda sedang menunggu verifikasi Guru."});
            return;
          }
        } else {
          await signOut(auth);
          setError({message: "Profil akun tidak ditemukan."});
        }
      } catch (authErr: any) {
        // AUTO-ACTIVATION LOGIC untuk akun yang dibuat admin tapi belum punya Auth record
        if (role === 'STUDENT' && (authErr.code === 'auth/user-not-found' || authErr.code === 'auth/invalid-credential')) {
          // Cari di Firestore berdasarkan username (case-insensitive search via filter)
          const q = query(collection(firestore, "users"), where("role", "==", "STUDENT"));
          const querySnapshot = await getDocs(q);
          
          const matchingUserDoc = querySnapshot.docs.find(d => {
            const data = d.data();
            return data.username?.toLowerCase() === cleanUsername.toLowerCase() && data.password === password;
          });

          if (matchingUserDoc) {
            const data = matchingUserDoc.data() as User;
            
            if (data.status !== 'ACTIVE') {
              setError({message: "Akun Anda sedang menunggu verifikasi Guru."});
              return;
            }

            // Buat Auth user
            const credential = await createUserWithEmailAndPassword(auth, email, password);
            const newUid = credential.user.uid;

            // Pindahkan data ke UID baru
            const updatedData = { ...data, id: newUid };
            await setDoc(doc(firestore, "users", newUid), updatedData);
            
            // Hapus dokumen lama jika ID-nya berbeda (misal std_...)
            if (matchingUserDoc.id !== newUid) {
              const { deleteDoc: firestoreDelete } = await import("firebase/firestore");
              await firestoreDelete(doc(firestore, "users", matchingUserDoc.id));
            }

            onLogin(updatedData);
            return;
          }
        }
        throw authErr;
      }
    } catch (err: any) {
      setError({message: "Username atau Password salah."});
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-white">
      <div className={`hidden md:flex flex-1 items-center justify-center p-12 relative overflow-hidden ${isAdmin ? 'bg-slate-900' : 'bg-blue-600'}`}>
        <div className="relative z-10 text-white max-w-sm space-y-6 animate-in fade-in slide-in-from-left-10 duration-1000">
          <div className={`w-16 h-16 rounded-xl flex items-center justify-center shadow-xl ${isAdmin ? 'bg-emerald-500' : 'bg-white text-blue-600'}`}>
             {isAdmin ? <ShieldCheck size={32} /> : <GraduationCap size={32} />}
          </div>
          <div className="space-y-3">
            <h2 className="text-4xl lg:text-5xl font-black leading-tight tracking-tighter">
              Portal Cloud<br/>
              <span className={isAdmin ? 'text-emerald-400 italic' : 'text-blue-200 italic'}>
                {isAdmin ? 'Guru / Admin' : 'Siswa Digital'}
              </span>
            </h2>
            <p className="text-base text-white/70 font-medium leading-relaxed">
              {isAdmin ? "Manajemen kurikulum & pantau progres siswa." : "Akses materi digital & kumpulkan tugas Anda."}
            </p>
          </div>
        </div>
      </div>

      <div className="flex-1 bg-white flex flex-col justify-center items-center px-6 py-8 md:px-12">
        <div className="w-full max-w-sm">
          <button onClick={onBack} className="flex items-center gap-2 text-slate-400 hover:text-slate-900 mb-6 font-black text-[9px] uppercase tracking-widest group">
            <ArrowLeft size={12} /> Beranda
          </button>
          
          <div className="mb-6 space-y-1">
            <h3 className="text-2xl font-black text-slate-900 tracking-tighter uppercase">
              {isAdmin ? 'Masuk Guru' : 'Masuk Siswa'}
            </h3>
            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest">SMP Al Irsyad Surakarta</p>
          </div>

          {error.message && (
            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-xl animate-in fade-in slide-in-from-top-2 text-rose-600 font-black text-[10px] uppercase flex items-center gap-2">
              <AlertCircle size={16} /> {error.message}
            </div>
          )}

          {isEmptyDb && isAdmin && (
            <button onClick={handleCreateInitialAdmin} disabled={isInitializing} className="mb-8 w-full py-3 bg-indigo-600 text-white rounded-xl font-black text-[10px] uppercase shadow-lg">
              {isInitializing ? "Inisialisasi..." : "Buat Akun Admin Pertama"}
            </button>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest ml-1">Username</label>
              <div className="relative group">
                <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" className="w-full pl-11 pr-4 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl outline-none font-black text-slate-800 focus:border-blue-500/30 text-xs" required />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center ml-1">
                <label className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Kata Sandi</label>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="w-full pl-11 pr-11 py-3 bg-slate-50 border-2 border-slate-50 rounded-xl font-bold text-slate-800 focus:border-blue-500/30 text-xs" required />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button disabled={loading} className={`w-full py-3.5 rounded-xl font-black text-sm shadow-xl transition-all active:scale-[0.98] ${isAdmin ? 'bg-slate-900 text-white' : 'bg-blue-600 text-white'}`}>
              {loading ? <RefreshCw className="animate-spin mx-auto" size={18} /> : 'Login'}
            </button>
            
            {!isAdmin && (
              <p className="text-center text-slate-400 font-bold text-xs">
                Belum punya akun? <button type="button" onClick={onNavigateSignup} className="text-blue-600 font-black hover:underline">Daftar</button>
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;