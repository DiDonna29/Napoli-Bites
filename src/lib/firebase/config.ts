
// src/lib/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Las variables de entorno de Firebase se leen desde .env.local
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Validación de configuración
const requiredKeys: (keyof typeof firebaseConfig)[] = [
  'apiKey',
  'authDomain',
  'projectId',
  'storageBucket',
  'messagingSenderId',
  'appId',
];

const missingConfigKeys = requiredKeys.filter(key => !firebaseConfig[key]);

if (missingConfigKeys.length > 0) {
  const errorMessage = `Faltan variables de entorno de Firebase: ${missingConfigKeys.join(', ')}. Verifica tu archivo .env.local y reinicia el servidor.`;
  console.error("--- ERROR DE CONFIGURACIÓN DE FIREBASE ---");
  console.error(errorMessage);
}

// Advertencia específica para Cloud Workstations
if (typeof window !== "undefined" && firebaseConfig.authDomain?.includes("cloudworkstations.dev")) {
  console.warn("ADVERTENCIA: Tu authDomain parece estar configurado con la URL de la Workstation. Para que Google Login funcione, DEBE ser el dominio original de Firebase (ej: proyecto.firebaseapp.com).");
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
