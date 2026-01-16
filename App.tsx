
import React, { useState, useEffect, useRef } from 'react';
import LandingPage from './views/LandingPage';
import AdminDashboard from './views/AdminDashboard';
import StudentDashboard from './views/StudentDashboard';
import Login from './views/Login';
import Signup from './views/Signup';
import { User, Role, SiteSettings } from './types';
import { firestore, auth } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  addDoc,
  deleteDoc,
  onSnapshot,
  query,
  where
} from "firebase/firestore"; 
import { onAuthStateChanged, signOut, Unsubscribe } from "firebase/auth";
import { AlertCircle, Database, ShieldAlert, ExternalLink, X } from 'lucide-react';

const sanitize = (obj: any) => {
  const result: any = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] !== undefined && obj[key] !== null) {
      result[key] = obj[key];
    }
  });
  return result;
};

export const db = {
  get: async (collName: string) => {
    try {
      const querySnapshot = await getDocs(collection(firestore, collName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err: any) {
      console.error(`Firestore Get Error (${collName}):`, err);
      if (err.code === 'permission-denied') window.dispatchEvent(new CustomEvent('db-permission-error'));
      return [];
    }
  },

  getByQuery: async (collName: string, field: string, value: any) => {
    try {
      const q = query(collection(firestore, collName), where(field, "==", value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (err: any) {
      console.error(`Firestore Query Error (${collName}):`, err);
      if (err.code === 'permission-denied') window.dispatchEvent(new CustomEvent('db-permission-error'));
      return [];
    }
  },
  
  getSingle: async (collName: string, id: string) => {
    try {
      const docSnap = await getDoc(doc(firestore, collName, id));
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (err: any) {
      console.error(`Firestore Get Single Error (${collName}):`, err);
      return null;
    }
  },

  update: async (collName: string, id: string, data: any) => {
    window.dispatchEvent(new CustomEvent('sync-start'));
    try {
      await setDoc(doc(firestore, collName, id), sanitize(data), { merge: true });
      window.dispatchEvent(new CustomEvent('sync-end'));
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('sync-error'));
      throw err;
    }
  },

  add: async (collName: string, data: any) => {
    window.dispatchEvent(new CustomEvent('sync-start'));
    try {
      const docData = sanitize(data);
      if (data.id) {
        await setDoc(doc(firestore, collName, data.id), docData, { merge: true });
        window.dispatchEvent(new CustomEvent('sync-end'));
        return data.id;
      } else {
        const docRef = await addDoc(collection(firestore, collName), docData);
        window.dispatchEvent(new CustomEvent('sync-end'));
        return docRef.id;
      }
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('sync-error'));
      throw err;
    }
  },

  delete: async (collName: string, id: string) => {
    window.dispatchEvent(new CustomEvent('sync-start'));
    try {
      await deleteDoc(doc(firestore, collName, id));
      window.dispatchEvent(new CustomEvent('sync-end'));
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('sync-error'));
      throw err;
    }
  },

  saveAll: async (collName: string, data: any[]) => {
    window.dispatchEvent(new CustomEvent('sync-start'));
    try {
      const promises = data.map(item => {
        const id = item.id || doc(collection(firestore, collName)).id;
        return setDoc(doc(firestore, collName, id), sanitize(item), { merge: true });
      });
      await Promise.all(promises);
      window.dispatchEvent(new CustomEvent('sync-end'));
    } catch (err: any) {
      window.dispatchEvent(new CustomEvent('sync-error'));
      throw err;
    }
  },

  append: async (collName: string, data: any) => {
    return db.add(collName, data);
  }
};

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'landing' | 'login' | 'signup' | 'dashboard'>('landing');
  // Gunakan ref untuk melacak view saat ini di dalam callback async
  const viewRef = useRef(view);
  useEffect(() => { viewRef.current = view; }, [view]);

  const [loginRole, setLoginRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'success' | 'error'>('idle');
  const [dbError, setDbError] = useState<boolean>(false);
  const [settings, setSettings] = useState<SiteSettings>({
    logoUrl: 'https://www.alirsyad.or.id/wp-content/uploads/download/alirsyad-alislamiyyah.png',
    heroImageUrl: 'https://media.vitecoelearning.eu/vitecoelearning.eu/wp-content/uploads/2023/09/e-learning-1-fb-EN.jpg',
    siteName: 'Informatika SMP Al Irsyad Surakarta'
  });

  useEffect(() => {
    let profileUnsubscribe: Unsubscribe | null = null;

    const authUnsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      // Bersihkan listener profil lama jika ada
      if (profileUnsubscribe) {
        profileUnsubscribe();
        profileUnsubscribe = null;
      }

      if (firebaseUser) {
        // PERBAIKAN: Gunakan onSnapshot untuk profil agar status selalu up-to-date dari server
        profileUnsubscribe = onSnapshot(doc(firestore, "users", firebaseUser.uid), async (docSnap) => {
          if (docSnap.exists()) {
            const userData = { id: docSnap.id, ...docSnap.data() } as User;
            
            // Logika Akses: Hanya izinkan ACTIVE masuk ke Dashboard
            if (userData.role === 'ADMIN' || (userData.role === 'STUDENT' && userData.status === 'ACTIVE')) {
              setUser(userData);
              setView('dashboard');
            } else if (userData.role === 'STUDENT' && userData.status === 'PENDING') {
              // Jika status PENDING, paksa logout kecuali jika user sedang di halaman signup
              if (viewRef.current !== 'signup') {
                await signOut(auth);
                setUser(null);
                setView('login');
                setLoginRole('STUDENT');
                alert("Akses Ditolak: Akun Anda sedang menunggu verifikasi Guru Informatika.");
              }
            }
          } else {
            // Jika dokumen user tidak ada (mungkin dihapus admin)
            if (viewRef.current !== 'signup') {
              setUser(null);
              setView('landing');
            }
          }
          setIsLoading(false);
        }, (err) => {
          console.error("Profile Snapshot Error:", err);
          setIsLoading(false);
        });
      } else {
        setUser(null);
        if (viewRef.current === 'dashboard') setView('landing');
        setIsLoading(false);
      }
    });

    const unsubSettings = onSnapshot(doc(firestore, 'settings', 'site_configs'), (doc) => {
      if (doc.exists()) setSettings(doc.data() as SiteSettings);
    });

    return () => {
      authUnsubscribe();
      unsubSettings();
      if (profileUnsubscribe) profileUnsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleSyncStart = () => setSyncStatus('syncing');
    const handleSyncEnd = () => {
      setSyncStatus('success');
      setTimeout(() => setSyncStatus('idle'), 3000);
    };
    const handleSyncError = () => {
      setSyncStatus('error');
      setTimeout(() => setSyncStatus('idle'), 5000);
    };
    const handlePermissionError = () => setDbError(true);

    window.addEventListener('sync-start', handleSyncStart);
    window.addEventListener('sync-end', handleSyncEnd);
    window.addEventListener('sync-error', handleSyncError);
    window.addEventListener('db-permission-error', handlePermissionError);
    
    return () => {
      window.removeEventListener('sync-start', handleSyncStart);
      window.removeEventListener('sync-end', handleSyncEnd);
      window.removeEventListener('sync-error', handleSyncError);
      window.removeEventListener('db-permission-error', handlePermissionError);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-black">
        <div className="w-16 h-16 border-4 border-emerald-100 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest text-center">Menghubungkan ke Cloud...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen selection:bg-emerald-100 selection:text-emerald-900 relative">
      {dbError && (
        <div className="fixed inset-x-0 top-0 z-[1000] bg-rose-600 text-white p-4 shadow-2xl animate-in slide-in-from-top duration-500">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <ShieldAlert size={24} />
              <p className="text-xs font-black uppercase tracking-widest">Akses Database Terbatas</p>
            </div>
            <button onClick={() => setDbError(false)} className="px-4 py-2 bg-white/20 text-white rounded-lg text-[10px] font-black uppercase">Tutup</button>
          </div>
        </div>
      )}

      <div className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-6 py-3 rounded-full shadow-2xl border backdrop-blur-md transition-all duration-500 transform ${
        syncStatus === 'idle' ? 'translate-y-[-140%] opacity-0' : 'translate-y-0 opacity-100'
      } ${
        syncStatus === 'syncing' ? 'bg-slate-900 text-white' : 
        syncStatus === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
      }`}>
        <span className="text-[10px] font-black uppercase tracking-[0.2em]">{syncStatus === 'syncing' ? 'Menyimpan...' : syncStatus === 'success' ? 'Tersimpan' : 'Gagal'}</span>
      </div>

      {view === 'landing' && <LandingPage onNavigateLogin={(role) => { setLoginRole(role); setView('login'); }} onNavigateSignup={() => setView('signup')} settings={settings} />}
      {view === 'login' && <Login role={loginRole || 'STUDENT'} onBack={() => setView('landing')} onLogin={(u) => { setUser(u); setView('dashboard'); }} onNavigateSignup={() => setView('signup')} logoUrl={settings.logoUrl} />}
      {view === 'signup' && <Signup onBack={() => setView('login')} onSignup={() => { setLoginRole('STUDENT'); setView('login'); }} logoUrl={settings.logoUrl} />}
      {view === 'dashboard' && user && (
        user.role === 'ADMIN' 
          ? <AdminDashboard user={user} onLogout={() => signOut(auth)} settings={settings} setSettings={setSettings} onUpdateUser={setUser} /> 
          : <StudentDashboard user={user} onLogout={() => signOut(auth)} settings={settings} onUpdateUser={setUser} />
      )}
    </div>
  );
};

export default App;
