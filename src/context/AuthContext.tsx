// src/context/AuthContext.tsx
"use client";

import type { User as FirebaseUser } from 'firebase/auth';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import type { ReactNode } from 'react';
import { createContext, useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase/config';
import type { UserProfile } from '@/types';

interface AuthContextType {
  user: FirebaseUser | null;
  userData: UserProfile | null;
  loading: boolean;
  error: Error | null;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  loading: true,
  error: null,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setError(null);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            setUserData(userDocSnap.data() as UserProfile);
          } else {
            // This case might happen if user doc creation failed or for other reasons
            // For now, we'll just not set userData, but you might want to handle this
            console.warn("User document not found in Firestore for UID:", firebaseUser.uid);
            setUserData(null); 
          }
        } catch (e) {
          console.error("Error fetching user data from Firestore:", e);
          setError(e as Error);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userData, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};
