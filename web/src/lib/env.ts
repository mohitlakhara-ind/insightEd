const fallbackFirebase = {
  apiKey: "AIzaSyBJZl8IBwxzMtobUhwY7xJvlYqrJYATnU4",
  authDomain: "insighted-42893.firebaseapp.com",
  projectId: "insighted-42893",
  storageBucket: "insighted-42893.firebasestorage.app",
  messagingSenderId: "875605851923",
  appId: "1:875605851923:web:4a2f33ff8d86dfce9ba4e6",
  measurementId: "G-VNNNCDP4FR",
};

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || fallbackFirebase.apiKey,
  authDomain:
    process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackFirebase.authDomain,
  projectId:
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || fallbackFirebase.projectId,
  storageBucket:
    process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    fallbackFirebase.storageBucket,
  messagingSenderId:
    process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    fallbackFirebase.messagingSenderId,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || fallbackFirebase.appId,
  measurementId:
    process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ||
    fallbackFirebase.measurementId,
};

export const educatorPasscode =
  process.env.NEXT_PUBLIC_EDUCATOR_PASSCODE || "";

export const isFirebaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
);
