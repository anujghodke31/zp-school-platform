import React, { createContext, useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '../config/firebase';
import axios from 'axios';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Get token
                    const token = await firebaseUser.getIdToken();
                    // Fetch user role/profile from our backend
                    const res = await axios.get('http://localhost:8000/api/auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (res.data.success) {
                        // Store full user object including token for future API calls
                        const fullUser = {
                            ...res.data,
                            token
                        };
                        setUser(fullUser);
                        // Make sure legacy code can still read token if needed
                        localStorage.setItem('userInfo', JSON.stringify(fullUser));
                    } else {
                        await signOut(auth);
                        setUser(null);
                        localStorage.removeItem('userInfo');
                    }
                } catch (err) {
                    console.error("Failed to fetch user profile", err);
                    await signOut(auth);
                    setUser(null);
                    localStorage.removeItem('userInfo');
                }
            } else {
                setUser(null);
                localStorage.removeItem('userInfo');
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const login = (userData) => {
        // Compatibility wrapper for components that manually set it before refactoring
        setUser(userData);
        localStorage.setItem('userInfo', JSON.stringify(userData));
    };

    const logout = async () => {
        await signOut(auth);
        localStorage.removeItem('userInfo');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
