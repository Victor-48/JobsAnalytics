import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axiosconfig';

export type Role = 'GUEST' | 'USER' | 'ADMIN';

interface AuthContextType {
    role: Role;
    token: string | null;
    isAuthenticated: boolean;
    login: (token: string, role: Role) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<Role>('GUEST');
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        // Load token and role from storage on mount
        const storedToken = localStorage.getItem('token');
        const storedRole = localStorage.getItem('role') as Role;
        
        if (storedToken && storedRole) {
            setToken(storedToken);
            setRole(storedRole);
            api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
        }
    }, []);

    const login = (newToken: string, newRole: Role) => {
        setToken(newToken);
        setRole(newRole);
        localStorage.setItem('token', newToken);
        localStorage.setItem('role', newRole);
        api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
    };

    const logout = () => {
        setToken(null);
        setRole('GUEST');
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        delete api.defaults.headers.common['Authorization'];
    };

    return (
        <AuthContext.Provider value={{
            role,
            token,
            isAuthenticated: role !== 'GUEST',
            login,
            logout
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}