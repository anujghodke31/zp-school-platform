const admin = require('firebase-admin');

let serviceAccount;
let db;

try {
    // Prefer FIREBASE_SERVICE_ACCOUNT env var (JSON string) over the file
    // This avoids committing the secret key to version control.
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
        serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    } else {
        // Fallback: local file (must NOT be committed; add to .gitignore)
        try {
            serviceAccount = require('./firebase-service-account.json');
        } catch (err) {
            console.warn('⚠️ Firebase service account file missing and FIREBASE_SERVICE_ACCOUNT env var not set.');
            console.warn('⚠️ Running without Firebase connection. Real data features will fail.');
            // Do not initialize if we don't have credentials
            serviceAccount = null;
        }
    }

    if (serviceAccount) {
        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount),
        });
        db = admin.firestore();
        console.log('✅ Firebase initialized successfully.');
    } else {
        // Create dummy db object that warns when used to prevent immediate crash but document failure
        const dummyQuery = {
            get: async () => { throw new Error('Firebase not configured'); },
            where: () => dummyQuery,
            orderBy: () => dummyQuery,
            limit: () => dummyQuery,
            startAfter: () => dummyQuery,
            count: () => dummyQuery,
            aggregate: () => dummyQuery
        };
        db = {
            collection: () => ({
                doc: () => ({
                    get: async () => { throw new Error('Firebase not configured'); },
                    set: async () => { throw new Error('Firebase not configured'); },
                    update: async () => { throw new Error('Firebase not configured'); },
                    delete: async () => { throw new Error('Firebase not configured'); }
                }),
                add: async () => { throw new Error('Firebase not configured'); },
                ...dummyQuery
            })
        };
        db = {
            collection: () => dummyQuery
        };
        // Also provide dummy admin.firestore.AggregateField to prevent crash during query construction
        if (!admin.firestore) {
            admin.firestore = {
                AggregateField: {
                    average: () => ({}),
                    sum: () => ({}),
                    count: () => ({})
                },
                FieldValue: {
                    serverTimestamp: () => new Date(),
                    increment: () => 1,
                    arrayUnion: () => [],
                    arrayRemove: () => []
                }
            };
        } else if (!admin.firestore.AggregateField) {
            admin.firestore.AggregateField = {
                average: () => ({}),
                sum: () => ({}),
                count: () => ({})
            };
        }
    }
} catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    // Dummy DB for the same reason
    const dummyQuery = {
        get: async () => { throw new Error('Firebase not configured'); },
        where: () => dummyQuery,
        orderBy: () => dummyQuery,
        limit: () => dummyQuery,
        startAfter: () => dummyQuery,
        count: () => dummyQuery,
        aggregate: () => dummyQuery
    };
    db = {
        collection: () => ({
            ...dummyQuery
        })
    };
    db = {
        collection: () => dummyQuery
    };
    if (!admin.firestore) {
        admin.firestore = {
            AggregateField: {
                average: () => ({}),
                sum: () => ({}),
                count: () => ({})
            },
            FieldValue: {
                serverTimestamp: () => new Date(),
                increment: () => 1,
                arrayUnion: () => [],
                arrayRemove: () => []
            }
        };
    } else if (!admin.firestore.AggregateField) {
        admin.firestore.AggregateField = {
            average: () => ({}),
            sum: () => ({}),
            count: () => ({})
        };
    }
}

module.exports = { admin, db };
