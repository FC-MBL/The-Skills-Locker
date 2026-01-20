import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';

interface ProtectedRouteProps {
    children: ReactNode;
    allowedRoles?: UserRole[];
}

export default function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
    const { isAuthenticated, hasRole } = useAuth();

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !hasRole(allowedRoles)) {
        return (
            <div style={{ padding: '2rem', textAlign: 'center' }}>
                <h1>Unauthorized</h1>
                <p>You do not have permission to access this page.</p>
            </div>
        );
    }

    return <>{children}</>;
}
