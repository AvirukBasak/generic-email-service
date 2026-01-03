import * as config from "@/config/env";
import * as admin from "firebase-admin";
import { App, getApp, getApps, initializeApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getDatabase } from "firebase-admin/database";
import { DocumentReference, getFirestore } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";
import { Nullable } from "@/types";

let FirebaseApp: Nullable<App> = null;

if (!getApps().some((app) => app.name === config.FIREBASE_PROJECT_ID)) {
  FirebaseApp = initializeApp(
    {
      projectId: config.FIREBASE_PROJECT_ID,
      credential: admin.credential.cert({ ...config.FIREBASE_SERVICE_ACCOUNT_KEY }),
    },
    config.FIREBASE_PROJECT_ID
  );
} else {
  FirebaseApp = getApp(config.FIREBASE_PROJECT_ID);
}

const FirebaseAuth = getAuth(FirebaseApp);
const FirebaseRtDb = getDatabase(FirebaseApp);
const FirebaseFirestore = getFirestore(FirebaseApp);
const FirebaseStorage = getStorage(FirebaseApp);

// Not needed coz FIRESTORE_EMULATOR_HOST env var is set
// if (config.RUN_ON_EMULATOR) {
//   FirebaseFirestore.settings({ host: config.FIRESTORE_EMULATOR_HOST, ssl: false });
// }

/**
 * Firestore paths
 */
class FirestorePaths {
  static EMAIL = !config.IS_DEV_OR_PREVIEW ? "fstr_MemeImages" : "preview_fstr_MemeImages";
  static LOGS = !config.IS_DEV_OR_PREVIEW ? "fstr_Logs" : "preview_fstr_Logs";

  static Email = (id: string): DocumentReference =>
    FirebaseFirestore.collection(FirestorePaths.EMAIL).doc(id);

  static Logs = (uid: string): DocumentReference => FirebaseFirestore.collection(FirestorePaths.LOGS).doc(uid);
}

/**
 * Storage paths
 */
class StoragePaths {
  static Email = {
    apiUrl: (id: string): string => `${config.ApiPaths.EMAIL}/${id}/image`
  };
}

export { FirebaseApp, FirebaseAuth, FirebaseRtDb, FirebaseFirestore, FirebaseStorage, FirestorePaths, StoragePaths };
