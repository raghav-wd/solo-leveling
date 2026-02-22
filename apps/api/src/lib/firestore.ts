import admin from "firebase-admin";

const shouldUseMemory = process.env.USE_IN_MEMORY_DB === "true";

const app = (() => {
  if (shouldUseMemory) return null;
  if (admin.apps.length) return admin.apps[0];
  if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    return admin.initializeApp({
      credential: admin.credential.applicationDefault(),
    });
  }
  return admin.initializeApp();
})();

export const db = shouldUseMemory || !app ? null : admin.firestore(app);
