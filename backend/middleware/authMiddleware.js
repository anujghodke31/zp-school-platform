const { admin, db } = require('../firebase');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];

            // Verify Firebase ID token
            const decodedToken = await admin.auth().verifyIdToken(token);
            
            // Get user record from Firestore
            const userDoc = await db.collection('users').doc(decodedToken.uid).get();
            
            if (!userDoc.exists) {
                return res.status(401).json({ success: false, message: 'User record not found in database' });
            }

            req.user = { id: decodedToken.uid, ...userDoc.data() };
            // Provide _id for backwards compatibility with existing code where _id might be used
            req.user._id = req.user.id;

            next();
        } catch (error) {
            console.error("Token verification failed:", error);
            res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }
};

const roleProtect = (...roles) => {
    return (req, res, next) => {
        if (req.user && roles.includes(req.user.role)) {
            next();
        } else {
            res.status(403).json({ success: false, message: 'Not authorized for this role' });
        }
    };
};

module.exports = { protect, roleProtect };
