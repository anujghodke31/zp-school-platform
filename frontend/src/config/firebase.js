import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDEtOse-LVaPWh0J2_hRMVU5gJQwW-Txyc",
  authDomain: "zp-school-platform.firebaseapp.com",
  projectId: "zp-school-platform",
  storageBucket: "zp-school-platform.firebasestorage.app",
  messagingSenderId: "513690999618",
  appId: "1:513690999618:web:144afc927178d76c9dc6db",
  measurementId: "G-1B6K4C8V7D"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
auth.useDeviceLanguage(); // Apply the default browser preference
export const db = getFirestore(app);
