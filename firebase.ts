// Standard Firebase v9+ modular imports
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

/**
 * PANDUAN:
 * 1. Buka Firebase Console (https://console.firebase.google.com/)
 * 2. Masuk ke Project Settings > Your Apps
 * 3. Salin objek firebaseConfig milik Anda dan tempel di bawah ini menggantikan placeholder.
 */

const firebaseConfig = {
  apiKey: "AIzaSyBrpFZyhgJXDBptag25p1jv7UNBgoFwGX4",
  authDomain: "portal-informatika.firebaseapp.com",
  projectId: "portal-informatika",
  storageBucket: "portal-informatika.firebasestorage.app",
  messagingSenderId: "542812253576",
  appId: "1:542812253576:web:eb604c31a654f456445e3d",
  measurementId: "G-WG62LY2M4B"
};

// Inisialisasi Firebase
const app = initializeApp(firebaseConfig);

// Ekspor modul yang dibutuhkan
export const auth = getAuth(app);
export const firestore = getFirestore(app);
