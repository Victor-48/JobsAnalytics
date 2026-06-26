import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api from '../api/axiosconfig';

export type Role = 'GUEST' | 'USER' | 'ADMIN';

interface AuthContextType {
    role: Role;
    isAuthenticated: boolean;
    login: (role: Role) => void;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [role, setRole] = useState<Role>('GUEST');

    useEffect(() => {
        // Load role from storage on mount
        const storedRole = localStorage.getItem('role') as Role;
        
        if (storedRole) {
            setRole(storedRole);
        }
    }, []);

    const login = (newRole: Role) => {
        setRole(newRole);
        localStorage.setItem('role', newRole);
    };

    const logout = () => {
        setRole('GUEST');
        localStorage.removeItem('role');
    };

    return (
        <AuthContext.Provider value={{
            role,
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