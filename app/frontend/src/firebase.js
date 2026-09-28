import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY || process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyAM2xHdGuO61n3OuekMgrN7uYbsDdUjIUU",
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN || process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "callmycar-c3e30.firebaseapp.com",
  projectId: process.env.VITE_FIREBASE_PROJECT_ID || process.env.REACT_APP_FIREBASE_PROJECT_ID || "callmycar-c3e30",
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET || process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "callmycar-c3e30.firebasestorage.app",
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID || process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "313664963058",
  appId: process.env.VITE_FIREBASE_APP_ID || process.env.REACT_APP_FIREBASE_APP_ID || "1:313664963058:web:dbe3bcd0a3c99057deeb6b",
  measurementId: process.env.VITE_FIREBASE_MEASUREMENT_ID || process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || "G-WBCMC4KYZ5"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper: Save Vehicle
export const saveVehicleToFirebase = async (plateNumber, ownerData) => {
  const cleanPlate = plateNumber.replace(/\s+/g, '').toUpperCase();
  await setDoc(doc(db, "vehicles", cleanPlate), {
    plateNumber: cleanPlate,
    ownerName: ownerData.name || ownerData.ownerName || "Vehicle Owner",
    phone: ownerData.phone || "",
    telegramChatId: ownerData.telegramChatId || "",
    createdAt: new Date().toISOString()
  });
};

// Helper: Get Vehicle
export const getVehicleFromFirebase = async (plateNumber) => {
  const cleanPlate = plateNumber.replace(/\s+/g, '').toUpperCase();
  const docRef = doc(db, "vehicles", cleanPlate);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};