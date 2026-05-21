import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import type { FirebaseError } from 'firebase/app';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '@/services/firebase';

export type UserRole = 'student' | 'educator';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: string;
}

function resolveRole(email: string | null | undefined): UserRole {
  if (email?.endsWith('@insighted.org') || email === 'admin@insighted.com') {
    return 'educator';
  }
  return 'student';
}

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOutUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);

      if (currentUser) {
        try {
          const ref = doc(db, 'users', currentUser.uid);
          const snap = await getDoc(ref);

          if (snap.exists()) {
            setProfile(snap.data() as UserProfile);
          } else {
            const newProfile: UserProfile = {
              uid: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || 'Learner',
              role: resolveRole(currentUser.email),
              createdAt: new Date().toISOString(),
            };
            await setDoc(ref, newProfile);
            setProfile(newProfile);
          }
        } catch {
          setProfile({
            uid: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || 'Learner',
            role: resolveRole(currentUser.email),
            createdAt: new Date().toISOString(),
          });
        }
      } else {
        setProfile(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const userCredential = await signInWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      try {
        const userDocRef = doc(db, 'users', userCredential.user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) {
          await signOut(auth);
          throw new Error(
            'No user profile found. Please sign up instead of logging in.'
          );
        }
      } catch (lookupError) {
        if (
          lookupError instanceof Error &&
          lookupError.message.includes('No user profile found')
        ) {
          throw lookupError;
        }
        // Firestore unavailable — allow auth session; profile syncs when DB is reachable.
      }
    } catch (e) {
      const err = e as FirebaseError;
      if (err.code === 'auth/configuration-not-found') {
        throw new Error(
          'Firebase Authentication is not configured for this project. Check the Firebase console.'
        );
      }
      if (
        err.code === 'auth/user-not-found' ||
        err.code === 'auth/invalid-credential'
      ) {
        throw new Error(
          'No user account found. Please sign up instead of logging in.'
        );
      }
      throw e;
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      await updateProfile(cred.user, { displayName: displayName.trim() });
      const newProfile: UserProfile = {
        uid: cred.user.uid,
        email: cred.user.email || '',
        displayName: displayName.trim(),
        role: resolveRole(cred.user.email),
        createdAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'users', cred.user.uid), newProfile);
      } catch {
        // Firestore may be unavailable; keep local profile so sign-up still completes.
      }
      setProfile(newProfile);
    } catch (e) {
      const err = e as FirebaseError;
      if (err.code === 'auth/configuration-not-found') {
        throw new Error(
          'Firebase Authentication is not configured for this project. Check the Firebase console.'
        );
      }
      throw e;
    }
  };

  const signOutUser = async () => {
    await signOut(auth);
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, signIn, signUp, signOutUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
