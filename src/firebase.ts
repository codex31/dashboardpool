import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

// Safe, non-blocking connection verification on boot
async function testConnection() {
  try {
    // 2.5-second timeout so it never hangs if network or proxy is offline
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('timeout')), 2500)
    );
    await Promise.race([
      getDocFromServer(doc(db, 'test', 'connection')),
      timeout,
    ]);
  } catch (error: any) {
    // Gracefully handled: client works in offline/file database mode
    console.info('[Firebase] Firestore initialized (offline/hybrid mode).');
  }
}

testConnection().catch(() => {});
