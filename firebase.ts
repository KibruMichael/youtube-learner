import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAN0JjUvtvdMMCmp6W6rAX8PvJzyuskb1Y",
  authDomain: "learner-fdcc3.firebaseapp.com",
  projectId: "learner-fdcc3",
  storageBucket: "learner-fdcc3.firebasestorage.app",
  messagingSenderId: "351019661676",
  appId: "1:351019661676:web:df99e874215d9e42051b49"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);