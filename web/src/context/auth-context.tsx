"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { 
  User, 
  onAuthStateChanged, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/services/firebase";

export type UserRole = "student" | "educator";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

function resolveRole(email: string | null | undefined, requested?: UserRole): UserRole {
  const isEducatorEmail =
    email?.endsWith("@insighted.org") || email === "admin@insighted.com";
  if (isEducatorEmail) return "educator";
  return requested === "educator" ? "student" : requested ?? "student";
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  role: UserRole | null;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string, displayName: string, desiredRole?: UserRole) => Promise<void>;
  signOutUser: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  // Synchronize auth state with Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      
      if (currentUser) {
        try {
          // Fetch user profile from Firestore to determine their role (Authz)
          const userDocRef = doc(db, "users", currentUser.uid);
          const userDocSnap = await getDoc(userDocRef);
          
          if (userDocSnap.exists()) {
            setProfile(userDocSnap.data() as UserProfile);
          } else {
            // No Firestore profile — email/password users must sign up first.
            setProfile(null);
          }
        } catch (e) {
          console.warn("Firestore error during auth syncing, using default profile:", e);
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || "",
            displayName: currentUser.displayName || "Learner",
            role: resolveRole(currentUser.email),
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithEmail = async (email: string, password: string) => {
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          await signOut(auth);
          throw new Error("No user profile found. Please sign up instead of logging in.");
        }
      } catch (lookupError) {
        if (
          lookupError instanceof Error &&
          lookupError.message.includes("No user profile found")
        ) {
          throw lookupError;
        }
        // Firestore unavailable — allow auth session; profile syncs when DB is reachable.
      }
    } catch (e) {
      setLoading(false);
      const err = e as { code?: string };
      if (err.code === "auth/configuration-not-found") {
        throw new Error(
          "Firebase Authentication is not configured for this project. Check the Firebase console."
        );
      }
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential") {
        throw new Error("No user account found. Please sign up instead of logging in.");
      }
      throw e;
    }
  };

  const signUpWithEmail = async (email: string, password: string, displayName: string, desiredRole: UserRole = "student") => {
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const currentUser = userCredential.user;

      // Update name profile on FirebaseAuth
      await updateProfile(currentUser, { displayName });

      const newProfile: UserProfile = {
        uid: currentUser.uid,
        email: currentUser.email || "",
        displayName,
        role: resolveRole(currentUser.email, desiredRole),
        createdAt: new Date().toISOString(),
      };

      try {
        await setDoc(doc(db, "users", currentUser.uid), newProfile);
      } catch (firestoreError) {
        console.warn("Firestore profile write failed; using in-memory profile:", firestoreError);
      }
      setProfile(newProfile);
    } catch (e) {
      setLoading(false);
      const err = e as { code?: string };
      if (err.code === "auth/configuration-not-found") {
        throw new Error(
          "Firebase Authentication is not configured for this project. Check the Firebase console."
        );
      }
      throw e;
    }
  };

  const signOutUser = async () => {
    setLoading(true);
    try {
      await signOut(auth);
      setUser(null);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email.trim());
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        loading,
        role: profile ? profile.role : null,
        signInWithEmail,
        signUpWithEmail,
        signOutUser,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
