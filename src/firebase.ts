import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyA632GgpZeyBZzB7USqA-zy660_q8QtQA4",
  authDomain: "careersphere-ai.firebaseapp.com",
  projectId: "careersphere-ai",
  storageBucket: "careersphere-ai.firebasestorage.app",
  messagingSenderId: "701472845449",
  appId: "1:701472845449:web:e0da68397cec33504da058"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
