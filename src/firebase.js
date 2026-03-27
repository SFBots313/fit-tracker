// src/firebase.js
// ─────────────────────────────────────────────────────────────────────────────
// STEP: Replace the values below with your Firebase project config.
// You get these from: Firebase Console → Project Settings → Your Apps → SDK setup
// ─────────────────────────────────────────────────────────────────────────────
import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey:            "AIzaSyASg_Foh1NoOfLXtBBGHAYbNLG2Lab0kPM",
  authDomain:        "fit-tracker-70d8f.firebaseapp.com",
  databaseURL:       "https://fit-tracker-70d8f-default-rtdb.firebaseio.com/",
  projectId:         "fit-tracker-70d8f",
  storageBucket:     "fit-tracker-70d8f.firebasestorage.app",
  messagingSenderId: "729344477032",
  appId:             "1:729344477032:web:e47c48a12841928af178dd",
};

const app = initializeApp(firebaseConfig);
export const db = getDatabase(app);
