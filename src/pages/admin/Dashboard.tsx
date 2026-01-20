import { useAuth } from '@/contexts/AuthContext';

export default function AdminDashboard() {
    const { currentUser } = useAuth();

    return (
        <div style={{ padding: '2rem' }}>
            <h1>Welcome to Skills Locker Admin</h1>
            <p>Logged in as: {currentUser?.name} ({currentUser?.role})</p>
            <p>Dashboard coming soon...</p>
        </div>
    );
}
