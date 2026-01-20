import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import type { UserRole } from '@/types';
import {
    LayoutDashboard,
    BookOpen,
    Users,
    HelpCircle,
    LogOut,
    ChevronRight,
} from 'lucide-react';
import styles from './AdminLayout.module.css';

interface AdminLayoutProps {
    children: ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
    const { currentUser, logout, hasRole } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        {
            to: '/admin',
            icon: LayoutDashboard,
            label: 'Dashboard',
            roles: ['ADMIN', 'EDITOR', 'REVIEWER'] as UserRole[],
        },
        {
            to: '/admin/courses',
            icon: BookOpen,
            label: 'Courses',
            roles: ['ADMIN', 'EDITOR', 'REVIEWER'] as UserRole[],
        },
        {
            to: '/admin/questions',
            icon: HelpCircle,
            label: 'Question Bank',
            roles: ['ADMIN', 'EDITOR'] as UserRole[],
        },
        {
            to: '/admin/cohorts',
            icon: Users,
            label: 'Cohorts',
            roles: ['ADMIN', 'EDITOR'] as UserRole[],
        },
        {
            to: '/admin/users',
            icon: Users,
            label: 'Users',
            roles: ['ADMIN'] as UserRole[],
        },
    ];

    return (
        <div className={styles.layout}>
            {/* Sidebar */}
            <aside className={styles.sidebar}>
                <div className={styles.sidebarHeader}>
                    <h1 className={styles.logo}>Skills Locker</h1>
                    <p className={styles.logoSubtitle}>Admin</p>
                </div>

                <nav className={styles.nav}>
                    {navItems.map((item) => {
                        if (!hasRole(item.roles)) return null;

                        const isActive =
                            location.pathname === item.to ||
                            (item.to !== '/admin' && location.pathname.startsWith(item.to));

                        return (
                            <Link
                                key={item.to}
                                to={item.to}
                                className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                                {isActive && <ChevronRight size={16} className={styles.activeIndicator} />}
                            </Link>
                        );
                    })}
                </nav>

                <div className={styles.sidebarFooter}>
                    <div className={styles.userInfo}>
                        <div className={styles.userAvatar}>
                            {currentUser?.name.charAt(0).toUpperCase()}
                        </div>
                        <div className={styles.userDetails}>
                            <div className={styles.userName}>{currentUser?.name}</div>
                            <div className={styles.userRole}>{currentUser?.role}</div>
                        </div>
                    </div>
                    <button onClick={handleLogout} className={styles.logoutBtn}>
                        <LogOut size={18} />
                        <span>Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className={styles.main}>
                <div className={styles.content}>{children}</div>
            </main>
        </div>
    );
}
