
import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

// Check if the service account key is available
const serviceAccount = process.env.SERVICE_ACCOUNT_KEY;
if (!serviceAccount) {
  throw new Error("The SERVICE_ACCOUNT_KEY environment variable is not set.");
}

const firebaseConfig = {
  credential: cert(JSON.parse(Buffer.from(serviceAccount, 'base64').toString('utf-8'))),
  storageBucket: process.env.STORAGE_BUCKET,
};

// Initialize Firebase
if (!getApps().length) {
  initializeApp(firebaseConfig);
}

// Export Firestore and Storage instances
export const db = getFirestore();
export const storage = getStorage();
