import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: 'AIzaSyAM2xHdGuO61n3OuekMgrN7uYbsDdUjIUU',
  authDomain: 'callmycar-c3e30.firebaseapp.com',
  projectId: 'callmycar-c3e30',
  storageBucket: 'callmycar-c3e30.firebasestorage.app',
  messagingSenderId: '313664963058',
  appId: '1:313664963058:web:dbe3bcd0a3c99057deeb6b',
  measurementId: 'G-WBCMC4KYZ5',
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