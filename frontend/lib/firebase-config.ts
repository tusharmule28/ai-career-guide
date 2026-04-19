import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, Messaging } from "firebase/messaging";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase
const isConfigValid = !!firebaseConfig.apiKey && !!firebaseConfig.projectId;

const app = (!getApps().length && isConfigValid) 
  ? initializeApp(firebaseConfig) 
  : (getApps().length ? getApp() : null);

if (!isConfigValid && typeof window !== "undefined") {
  console.warn("Firebase configuration is missing. Notifications will be disabled. Check your environment variables.");
}

let messaging: Messaging | undefined;

// Messaging only works in the browser
if (typeof window !== "undefined" && app) {
  try {
    messaging = getMessaging(app);
  } catch (err) {
    console.error("Firebase Messaging failed to initialize:", err);
  }
}

export { app, messaging };
