import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Helper: Save Vehicle
export const saveVehicleToFirebase = async (plateNumber, ownerData) => {
  const cleanPlate = plateNumber.replace(/\s+/g, '').toUpperCase();
  await setDoc(doc(db, "vehicles", cleanPlate), {
    plateNumber: cleanPlate,
    plateDisplay: ownerData.plateDisplay || plateNumber.trim().toUpperCase(),
    ownerName: ownerData.name || ownerData.ownerName || "Vehicle Owner",
    phone: ownerData.phone || "",
    emergencyContact: ownerData.emergencyContact || "",
    telegramChatId: ownerData.telegramChatId || "",
    make: ownerData.make || "",
    model: ownerData.model || "",
    color: ownerData.color || "",
    year: ownerData.year || "",
    displayName: ownerData.displayName || `${ownerData.color || ''} ${ownerData.make || ''} ${ownerData.model || ''} (${ownerData.year || ''})`.trim(),
    createdAt: new Date().toISOString()
  });
};

export const getVehicleFromFirebase = async (plateNumber) => {
  const cleanPlate = plateNumber.replace(/\s+/g, '').toUpperCase();
  const docSnap = await getDoc(doc(db, "vehicles", cleanPlate));
  return docSnap.exists() ? docSnap.data() : null;
};

