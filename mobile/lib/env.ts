const fallbackFirebase = {
  apiKey: 'AIzaSyBJZl8IBwxzMtobUhwY7xJvlYqrJYATnU4',
  authDomain: 'insighted-42893.firebaseapp.com',
  projectId: 'insighted-42893',
  storageBucket: 'insighted-42893.firebasestorage.app',
  messagingSenderId: '875605851923',
  appId: '1:875605851923:web:4a2f33ff8d86dfce9ba4e6',
};

export const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || fallbackFirebase.apiKey,
  authDomain:
    process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN || fallbackFirebase.authDomain,
  projectId:
    process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID || fallbackFirebase.projectId,
  storageBucket:
    process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET ||
    fallbackFirebase.storageBucket,
  messagingSenderId:
    process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ||
    fallbackFirebase.messagingSenderId,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID || fallbackFirebase.appId,
};
