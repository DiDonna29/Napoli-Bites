
// src/lib/firebase/config.ts
import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Las variables de entorno de Firebase se leen desde .env.local (o equivalentes en producción)
// y deben tener el prefijo NEXT_PUBLIC_ para ser accesibles en el cliente.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID, // Opcional
};

// Validación básica para asegurar que las variables de entorno esenciales estén cargadas.
// Esto se ejecuta en el servidor durante la construcción o renderizado del lado del servidor,
// y también cuando este archivo se importa en el cliente.
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
  const errorMessage = `Error de configuración de Firebase: Las siguientes variables de entorno NEXT_PUBLIC_FIREBASE_... faltan o están vacías en tu archivo .env.local: ${missingConfigKeys.join(', ')}. Asegúrate de que .env.local esté configurado correctamente y que el servidor de desarrollo de Next.js se haya reiniciado después de los cambios.`;
  console.error(errorMessage);
  // En un entorno de producción, podrías querer lanzar un error aquí para detener la aplicación.
  // throw new Error(errorMessage); 
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
