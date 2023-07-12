import { initializeApp, getDatabase } from 'firebase/app';
import { getDatabase } from 'firebase/database' ;
import 'firebase/database';
import 'firebase/auth';
import 'firebase/functions';
import { getFunctions } from "firebase/functions";
import { getAuth } from "firebase/auth";

initializeApp({
    apiKey: "AIzaSyDPO-yGJev7gxGLCGkOKDMlDlZsjlZ--i0",
    authDomain: "escape-from-space.firebaseapp.com",
    databaseURL: "https://escape-from-space.firebaseio.com",
    projectId: "escape-from-space",
    storageBucket: "escape-from-space.appspot.com",
    appId: "1:1016708495078:web:7a9b748c8e29383e"
});

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const database = getDatabase(app);
export const functions = getFunctions(app);

// firebase.functions().useFunctionsEmulator('http://localhost:5000');