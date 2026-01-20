/**
 * Authentication Context for Skills Locker
 * Simple role-based auth with localStorage persistence
 * Can be swapped with Firebase Auth, Auth0, etc. later
 */

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { User, UserRole } from '@/types';
import { userStorage } from '@/utils/storage';

interface AuthContextType {
    currentUser: User | null;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => void;
    hasRole: (role: UserRole | UserRole[]) => boolean;
    canEditCourse: (courseId: string) => boolean;
    canPublishCourse: () => boolean;
    canManageCohorts: () => boolean;
    canManageUsers: () => boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);

    useEffect(() => {
        // Load current user from localStorage on mount
        const user = userStorage.getCurrentUser();
        setCurrentUser(user);
    }, []);

    const login = async (email: string, _password: string): Promise<void> => {
        // TODO: Replace with real authentication
        // For now, simple demo login

        const users = userStorage.getAll();
        let user = users.find((u) => u.email === email);

        if (!user) {
            // Create demo user if doesn't exist
            user = {
                id: `user-${Date.now()}`,
                email,
                name: email.split('@')[0],
                role: 'ADMIN', // Default to ADMIN for demo
                status: 'ACTIVE',
                createdAt: new Date(),
            };
            userStorage.save(user);
        }

        userStorage.setCurrentUser(user);
        setCurrentUser(user);
    };

    const logout = () => {
        userStorage.setCurrentUser(null);
        setCurrentUser(null);
    };

    const hasRole = (role: UserRole | UserRole[]): boolean => {
        if (!currentUser) return false;
        const roles = Array.isArray(role) ? role : [role];
        return roles.includes(currentUser.role);
    };

    const canEditCourse = (_courseId: string): boolean => {
        if (!currentUser) return false;

        // ADMIN can edit anything
        if (currentUser.role === 'ADMIN') return true;

        // EDITOR can edit courses in their assigned domains
        if (currentUser.role === 'EDITOR') {
            // TODO: Check if course's domain is in user's assignedDomains
            return true;
        }

        return false;
    };

    const canPublishCourse = (): boolean => {
        return hasRole(['ADMIN', 'REVIEWER']);
    };

    const canManageCohorts = (): boolean => {
        return hasRole(['ADMIN', 'EDITOR']);
    };

    const canManageUsers = (): boolean => {
        return hasRole('ADMIN');
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                isAuthenticated: !!currentUser,
                login,
                logout,
                hasRole,
                canEditCourse,
                canPublishCourse,
                canManageCohorts,
                canManageUsers,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
}
