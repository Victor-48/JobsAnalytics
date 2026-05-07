import React from 'react';
import { useAuth, Role } from '../contexts/AuthContext';

// A development tool to quickly switch between roles to test the UI.
export function RoleSwitcher() {
    const { role, login } = useAuth();

    const roles: { id: Role, label: string, color: string }[] = [
        { id: 'GUEST', label: 'Guest', color: 'bg-slate-500' },
        { id: 'USER', label: 'User', color: 'bg-blue-500' },
        { id: 'ADMIN', label: 'Admin', color: 'bg-red-500' }
    ];

    return (
        <div className="fixed bottom-4 left-4 z-[100] flex flex-col gap-2 bg-background border border-border p-3 rounded-xl shadow-2xl opacity-90 hover:opacity-100 transition-opacity">
            <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Dev: Switch Role</h4>
            <div className="flex gap-2">
                {roles.map(r => (
                    <button
                        key={r.id}
                        // Mock token for dev switching
                        onClick={() => login('dev-mock-token', r.id)}
                        className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${role === r.id ? `${r.color} text-white shadow-md scale-105` : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>
            <div className="text-[10px] text-center text-muted-foreground mt-1">
                Current: <strong className="text-foreground">{role}</strong>
            </div>
        </div>
    );
}