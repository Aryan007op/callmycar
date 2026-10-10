import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAM2xHdGuO61n3OuekMgrN7uYbsDdUjIUU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "callmycar-c3e30.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "callmycar-c3e30",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "callmycar-c3e30.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "313664963058",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:313664963058:web:dbe3bcd0a3c99057deeb6b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WBCMC4KYZ5",
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

let analytics = null;
if (typeof window !== 'undefined') {
  getAnalytics(app).then((a) => {
    analytics = a;
  }).catch(() => {});
}

export { analytics };
