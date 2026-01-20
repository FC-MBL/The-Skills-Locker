import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';
import styles from './LoginPage.module.css';

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole>('ADMIN');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await login(email, password);

            // Route based on selected role
            if (selectedRole === 'LEARNER') {
                navigate('/student/dashboard'); // Student-facing UI (to be implemented)
            } else {
                navigate('/admin'); // Admin UI
            }
        } catch (error) {
            console.error('Login failed:', error);
        }
    };

    return (
        <div className={styles.container}>
            <div className={styles.card}>
                <h1 className={styles.title}>Skills Locker</h1>
                <p className={styles.subtitle}>Learning Management System</p>

                {/* Role Selector */}
                <div className={styles.roleSelector}>
                    <button
                        type="button"
                        className={`${styles.roleButton} ${selectedRole === 'LEARNER' ? styles.roleButtonActive : ''}`}
                        onClick={() => setSelectedRole('LEARNER')}
                    >
                        <span className={styles.roleIcon}>🎓</span>
                        <span>Sign in as Student</span>
                    </button>
                    <button
                        type="button"
                        className={`${styles.roleButton} ${selectedRole === 'ADMIN' ? styles.roleButtonActive : ''}`}
                        onClick={() => setSelectedRole('ADMIN')}
                    >
                        <span className={styles.roleIcon}>👨‍💼</span>
                        <span>Sign in as Admin</span>
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.field}>
                        <label htmlFor="email">Email</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={selectedRole === 'LEARNER' ? 'student@example.com' : 'admin@fitcollege.edu.au'}
                            required
                        />
                    </div>

                    <div className={styles.field}>
                        <label htmlFor="password">Password</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter password"
                            required
                        />
                    </div>

                    <button type="submit" className="btn btn-primary" style={{ marginTop: '1rem', width: '100%' }}>
                        Sign In as {selectedRole === 'LEARNER' ? 'Student' : 'Admin'}
                    </button>

                    <p className={styles.hint}>
                        Demo: Enter any email to login (role: {selectedRole})
                    </p>
                </form>
            </div>
        </div>
    );
}
