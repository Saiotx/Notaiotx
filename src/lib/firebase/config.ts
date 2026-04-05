import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCP-Y4hnwLIRDFH_Qycm45bWtTaclFOn0c",
  authDomain: "notaiotx.firebaseapp.com",
  projectId: "notaiotx",
  storageBucket: "notaiotx.firebasestorage.app",
  messagingSenderId: "984212304714",
  appId: "1:984212304714:web:57f73a8f79d400894f47b3"
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };
