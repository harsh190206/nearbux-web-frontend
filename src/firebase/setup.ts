// src/firebase/setup.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyB_08wQf-gQ7OCtzab4xJu_eBDwTiwNOqs",
  authDomain: "nearbux2.firebaseapp.com",
  projectId: "nearbux2",
  storageBucket: "nearbux2.appspot.com",
  messagingSenderId: "27891946421",
  appId: "1:27891946421:web:ecd7bb69953eea15823ffc"
};

const app = initializeApp(firebaseConfig);
