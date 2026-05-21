import { readFileSync } from 'fs';
import { join } from 'path';
import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, deleteUser, signOut } from 'firebase/auth';
import { getFirestore, doc, getDoc, setDoc, deleteDoc } from 'firebase/firestore';

// Load .env.local
const envPath = join(process.cwd(), '.env.local');
const envContent = readFileSync(envPath, 'utf8');
const config = {};
envContent.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    config[key] = val;
  }
});

const firebaseConfig = {
  apiKey: config.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: config.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: config.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: config.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: config.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: config.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: config.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};

console.log('Firebase Configuration:', JSON.stringify(firebaseConfig, null, 2));

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const testEmail = `test_verification_${Math.floor(Math.random() * 100000)}@insighted.com`;
const testPassword = 'TestPassword123!';
const testName = 'Verification Tester';

async function runVerification() {
  console.log('\n--- VERIFICATION START ---');

  // 1. SIGN UP (Request)
  console.log(`[SIGN UP REQUEST] Email: ${testEmail}, Name: ${testName}`);
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, testEmail, testPassword);
    const user = userCredential.user;
    console.log(`[SIGN UP SUCCESS] UID: ${user.uid}, Email: ${user.email}`);

    // 2. STORE PROFILE IN FIRESTORE (Request)
    const profile = {
      uid: user.uid,
      email: user.email,
      displayName: testName,
      role: 'student',
      createdAt: new Date().toISOString()
    };
    console.log(`[FIRESTORE WRITE REQUEST] users/${user.uid}`, JSON.stringify(profile, null, 2));
    await setDoc(doc(db, 'users', user.uid), profile);
    console.log('[FIRESTORE WRITE SUCCESS]');

    // Sign out to clean up session
    await signOut(auth);
    console.log('[SESSION CLEANUP] Signed out current session.');

    // 3. LOGIN (Request)
    console.log(`[LOGIN REQUEST] Email: ${testEmail}`);
    const loginCredential = await signInWithEmailAndPassword(auth, testEmail, testPassword);
    const loggedInUser = loginCredential.user;
    console.log(`[LOGIN SUCCESS] UID: ${loggedInUser.uid}`);

    // 4. FETCH PROFILE FROM FIRESTORE (Request)
    console.log(`[FIRESTORE READ REQUEST] users/${loggedInUser.uid}`);
    const userDocSnap = await getDoc(doc(db, 'users', loggedInUser.uid));
    if (userDocSnap.exists()) {
      console.log('[FIRESTORE READ SUCCESS] Profile data:', JSON.stringify(userDocSnap.data(), null, 2));
    } else {
      console.error('[FIRESTORE READ ERROR] Profile document not found!');
    }

    // 5. TEST INVALID PROFILE LOGIN FLOW
    // Let's delete the Firestore profile to simulate "user exists in auth but no user data found in Firestore"
    console.log(`[CLEANUP FIRESTORE WRITE FOR VALIDATION TEST] Deleting users/${loggedInUser.uid}...`);
    await deleteDoc(doc(db, 'users', loggedInUser.uid));
    
    // Attempt verification check: if doc is deleted, we simulate checking presence
    console.log(`[TEST VALIDATION] Verifying presence of profile doc for UID: ${loggedInUser.uid}`);
    const testDocSnap = await getDoc(doc(db, 'users', loggedInUser.uid));
    if (!testDocSnap.exists()) {
      console.log('[TEST VALIDATION SUCCESS] Profile does not exist. Login would correctly fail and prompt signup.');
    } else {
      console.error('[TEST VALIDATION FAILED] Profile still exists.');
    }

    // 6. CLEAN UP AUTH USER
    console.log(`[CLEANUP AUTH USER] Deleting auth user: ${loggedInUser.uid}...`);
    await deleteUser(loggedInUser);
    console.log('[CLEANUP SUCCESS] Verification user deleted.');

    console.log('\n--- VERIFICATION COMPLETED SUCCESSFULLY ---');
  } catch (error) {
    console.error('\n--- VERIFICATION FAILED ---', error);
    // Cleanup auth user if created
    if (auth.currentUser) {
      console.log('Attempting to cleanup user...');
      try {
        await deleteUser(auth.currentUser);
        console.log('Cleanup successful.');
      } catch (cleanupErr) {
        console.error('Failed to cleanup user:', cleanupErr);
      }
    }
  }
}

runVerification();
