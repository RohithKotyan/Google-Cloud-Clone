import firebase from 'firebase'

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
    appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
    measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || ""
};

const isFirebaseConfigured = Boolean(
    firebaseConfig.apiKey &&
    firebaseConfig.projectId &&
    !firebaseConfig.apiKey.includes('your_')
);

let firebaseApp = null;
let db = null;
let auth = null;
let provider = null;

if (isFirebaseConfigured) {
    try {
        firebaseApp = firebase.apps.length ? firebase.app() : firebase.initializeApp(firebaseConfig);
        db = firebaseApp.firestore();
        auth = firebase.auth();
        provider = new firebase.auth.GoogleAuthProvider();
    } catch (err) {
        console.error("Firebase initialization error:", err);
    }
}

export { db, auth, provider, isFirebaseConfigured, firebaseConfig }
