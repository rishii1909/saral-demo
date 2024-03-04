import React, { createContext, useContext, useState } from 'react';
import { login, logout, getToken } from './auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    const isAuthenticated = () => !!user;

    const handleLogin = async (email, password) => {
        const userData = await login(email, password);
        setUser(userData);
    };

    const handleLogout = () => {
        logout();
        setUser(null);
    };

    const getTokenFromStorage = () => {
        const storedToken = getToken();
        if (storedToken) {
            setUser({ username: 'dummy', token: storedToken });
        }
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isAuthenticated,
                login: handleLogin,
                logout: handleLogout,
                getToken: getTokenFromStorage,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};