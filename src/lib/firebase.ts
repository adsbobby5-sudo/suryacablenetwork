import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDZ2NcbXK4lktFixK7bai9GDmSVEuAr-W8",
  authDomain: "suryacablenetwork-26617.firebaseapp.com",
  projectId: "suryacablenetwork-26617",
  storageBucket: "suryacablenetwork-26617.firebasestorage.app",
  messagingSenderId: "491380697054",
  appId: "1:491380697054:web:4eee43a827f46c371e1f4f",
  measurementId: "G-1CRCZTV3LJ"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Auth and Firestore
export const auth = getAuth(app);
export const db = getFirestore(app);
