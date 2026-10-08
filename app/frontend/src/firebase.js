import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyAM2xHdGuO61n3OuekMgrN7uYbsDdUjIUU",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "callmycar-c3e30.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "callmycar-c3e30",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "callmycar-c3e30.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "313664963058",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:313664963058:web:dbe3bcd0a3c99057deeb6b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-WBCMC4KYZ5"
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
    make: ownerData.make || "",
    model: ownerData.model || "",
    color: ownerData.color || "",
    year: ownerData.year || "",
    displayName: ownerData.displayName || `${ownerData.color || ''} ${ownerData.make || ''} ${ownerData.model || ''} (${ownerData.year || ''})`.trim(),
    createdAt: new Date().toISOString()
  });
  await setDoc(doc(db, "vehicleTelegramDestinations", cleanPlate), {
    plateNumber: cleanPlate,
    telegramChatId: ownerData.telegramChatId || ""
  });
};

export const getVehicleFromFirebase = async (plateNumber) => {
  const cleanPlate = plateNumber.replace(/\s+/g, '').toUpperCase();
  const docSnap = await getDoc(doc(db, "vehicles", cleanPlate));
  return docSnap.exists() ? docSnap.data() : null;
};

// Helper: Get Vehicle
export const getTelegramDestinationForVehicle = async (plateNumber) => {
  const cleanPlate = plateNumber.replace(/\s+/g, '').toUpperCase();
  const docRef = doc(db, "vehicleTelegramDestinations", cleanPlate);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? docSnap.data() : null;
};
