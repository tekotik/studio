import admin from 'firebase-admin';

let db: admin.firestore.Firestore;

if (!admin.apps.length) {
  try {
    // Ensure environment variables are present before trying to parse
    if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY && process.env.FIREBASE_PROJECT_ID) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
      db = admin.firestore();
    } else {
      console.warn("Firebase environment variables are not set. Firestore will not be initialized.");
    }
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
} else {
  // If the app is already initialized, just get the firestore instance
  db = admin.firestore();
}

// Export the initialized instance
export { db };
