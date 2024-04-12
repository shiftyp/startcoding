import "./import.meta";
import React from 'react'
import { initializeApp } from "firebase/app";
import { Buffer } from "buffer";
import { createRoot } from 'react-dom/client'
import { Main } from "./components/main";
import * as firebaseui from "firebaseui";
import { getAuth } from "firebase/auth";

// @ts-ignore
window.Buffer = Buffer;

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

const authUI = new firebaseui.auth.AuthUI(getAuth())

navigator.serviceWorker.register("/service-worker.js");

const main = () => {
  const root = createRoot(document.getElementById('container')!)
  root.render(<Main authUI={authUI} />)
};
main();
