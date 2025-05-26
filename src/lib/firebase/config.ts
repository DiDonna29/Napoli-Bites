
// src/lib/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration is now read from environment variables
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Optional
};

// Basic validation to ensure environment variables are loaded
if (!firebaseConfig.apiKey || !firebaseConfig.projectId || !firebaseConfig.authDomain) {
  console.error(
    'Firebase configuration error: Crucial Firebase environment variables (apiKey, projectId, authDomain) are missing. ' +
    'Ensure your .env.local file is set up correctly with NEXT_PUBLIC_FIREBASE_ prefixed variables and that the Next.js development server was restarted after changes to .env.local.'
  );
  if (!firebaseConfig.apiKey) console.error("NEXT_PUBLIC_FIREBASE_API_KEY is missing or empty.");
  if (!firebaseConfig.authDomain) console.error("NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN is missing or empty.");
  if (!firebaseConfig.projectId) console.error("NEXT_PUBLIC_FIREBASE_PROJECT_ID is missing or empty.");
  // Depending on how critical Firebase is at boot, you might throw an error here
  // or allow the app to continue with potentially broken Firebase functionality.
}


let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApps()[0];
}

auth = getAuth(app);
db = getFirestore(app);

export { app, auth, db };
