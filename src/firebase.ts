import {initializeApp} from "firebase/app";
import {initializeFirestore} from "firebase/firestore";
import {persistentLocalCache, persistentSingleTabManager} from "@firebase/firestore";
import {getAuth, GoogleAuthProvider} from "firebase/auth";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: import.meta.env.VITE_API_KEY,
    authDomain: import.meta.env.VITE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firestore with IndexedDB persistence
const db = initializeFirestore(app, {
    localCache: persistentLocalCache({
        tabManager: persistentSingleTabManager(undefined)
    })
});

const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export {db, auth, googleProvider};
