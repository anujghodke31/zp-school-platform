const { app } = require('firebase-admin');
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-service-account.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function seed() {
    const users = [
        { email: 'admin@zp.local', password: 'admin123', name: 'System Admin', role: 'SuperAdmin', username: 'admin' },
        { email: 'teacher@zp.local', password: 'teacher123', name: 'Demo Teacher', role: 'Teacher', username: 'teacher' }
    ];

    for (const u of users) {
        try {
            let userRecord;
            try {
                userRecord = await admin.auth().getUserByEmail(u.email);
                console.log(`User already exists: ${userRecord.uid}. Forcing password update...`);
                await admin.auth().updateUser(userRecord.uid, { password: u.password });
                console.log(`Password updated for ${u.email}`);
            } catch (e) {
                if (e.code === 'auth/user-not-found') {
                    userRecord = await admin.auth().createUser({
                        email: u.email,
                        password: u.password,
                        displayName: u.name,
                    });
                    console.log(`Successfully created new user: ${userRecord.uid}`);
                } else {
                    throw e; // rethrow if it's not a user-not-found error
                }
            }
            
            await db.collection('users').doc(userRecord.uid).set({
                name: u.name,
                role: u.role,
                username: u.username,
                email: u.email,
                createdAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`Added/Updated Firestore record for ${u.username}`);
        } catch (error) {
            console.error(`Error processing user ${u.email}:`, error);
        }
    }
}

seed().then(() => process.exit());
