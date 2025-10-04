import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "vingo-food-delivery-fbe1b.firebaseapp.com",
  projectId: "vingo-food-delivery-fbe1b",
  storageBucket: "vingo-food-delivery-fbe1b.firebasestorage.app",
  messagingSenderId: "192174631317",
  appId: "1:192174631317:web:b2965d8d692ce95a53ee9c"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export { app, auth };


