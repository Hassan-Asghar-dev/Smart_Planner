// firebase/firebaseConfig.js

import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAVdZLMbAubaYoeRdVq1wPDT_rc_bGLsc4",
  authDomain: "smart-teacher-planner-bfe1f.firebaseapp.com",
  projectId: "smart-teacher-planner-bfe1f",
  storageBucket: "smart-teacher-planner-bfe1f.appspot.com",
  messagingSenderId: "792258417685",
  appId: "1:792258417685:web:ee6b3a264f7bb866e32a1c",
  measurementId: "G-NVSEZ68TQ2"
};

// Prevent multiple initializations
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();
const facebookProvider = new FacebookAuthProvider();
const db = getFirestore(app);

export { app, auth, googleProvider, facebookProvider, db };
