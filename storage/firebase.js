const firebaseConfig = {
  apiKey: "AIzaSyAoj2PqPlx9nvzQbG2IKr30ye7JQ1Dud20",
  authDomain: "portfolio-19913.firebaseapp.com",
  projectId: "portfolio-19913",
  storageBucket: "portfolio-19913.firebasestorage.app",
  messagingSenderId: "58453596473",
  appId: "1:58453596473:web:713c7084577bd6276f30e8"
};

let firebaseApp;
let firebaseAuth;
let firebaseDb;
let firebaseSdk;

export const isFirebaseConfigured = !Object.values(firebaseConfig).some((value) => (
    String(value).startsWith("YOUR_")
));

async function loadFirebaseSdk() {
    if (!firebaseSdk) {
        const [appSdk, authSdk, firestoreSdk] = await Promise.all([
            import("https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js"),
            import("https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js"),
            import("https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js")
        ]);

        firebaseSdk = {
            ...appSdk,
            ...authSdk,
            ...firestoreSdk
        };
    }

    return firebaseSdk;
}

export async function getFirebase() {
    if (!isFirebaseConfigured) return null;

    if (!firebaseApp) {
        const sdk = await loadFirebaseSdk();
        firebaseApp = sdk.initializeApp(firebaseConfig);
        firebaseAuth = sdk.getAuth(firebaseApp);
        firebaseDb = sdk.getFirestore(firebaseApp);
    }

    return {
        app: firebaseApp,
        auth: firebaseAuth,
        db: firebaseDb
    };
}

export async function watchAuth(callback) {
    const firebase = await getFirebase();
    if (!firebase) {
        callback(null);
        return () => {};
    }

    const sdk = await loadFirebaseSdk();
    return sdk.onAuthStateChanged(firebase.auth, callback);
}

export async function login(email, password) {
    const firebase = await getFirebase();
    if (!firebase) throw new Error("Firebase is not configured yet.");

    const sdk = await loadFirebaseSdk();
    return sdk.signInWithEmailAndPassword(firebase.auth, email, password);
}

export async function logout() {
    const firebase = await getFirebase();
    if (!firebase) return;

    const sdk = await loadFirebaseSdk();
    await sdk.signOut(firebase.auth);
}

export async function getPortfolioContent() {
    const firebase = await getFirebase();
    if (!firebase) return null;

    const sdk = await loadFirebaseSdk();
    const snapshot = await sdk.getDoc(sdk.doc(firebase.db, "portfolio", "content"));
    return snapshot.exists() ? snapshot.data() : null;
}

export async function savePortfolioContent(content) {
    const firebase = await getFirebase();
    if (!firebase) throw new Error("Firebase is not configured yet.");

    const sdk = await loadFirebaseSdk();
    await sdk.setDoc(sdk.doc(firebase.db, "portfolio", "content"), {
        ...content,
        updatedAt: sdk.serverTimestamp()
    }, { merge: true });
}
