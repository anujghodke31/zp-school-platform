const admin = require('firebase-admin');

let serviceAccount;

// Prefer FIREBASE_SERVICE_ACCOUNT env var (JSON string) over the file
// This avoids committing the secret key to version control.
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
} else {
    // Fallback: local file (must NOT be committed; add to .gitignore)
    serviceAccount = require('./firebase-service-account.json');
}

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});

const db = admin.firestore();

module.exports = { admin, db };
