import { useAuth } from '@/contexts/AuthContext';
import { courseStorage, domainStorage, cohortStorage } from '@/utils/storage';
import AdminLayout from '@/components/AdminLayout';
import { BookOpen, FolderOpen, Users, TrendingUp } from 'lucide-react';
import styles from './Dashboard.module.css';

export default function AdminDashboard() {
    const { currentUser } = useAuth();

    // Get stats
    const courses = courseStorage.getAll();
    const domains = domainStorage.getAll();
    const cohorts = cohortStorage.getAll();

    const stats = [
        {
            label: 'Total Courses',
            value: courses.length,
            icon: BookOpen,
            color: '#6366f1',
            bgColor: 'rgba(99, 102, 241, 0.1)',
        },
        {
            label: 'Domains',
            value: domains.length,
            icon: FolderOpen,
            color: '#ec4899',
            bgColor: 'rgba(236, 72, 153, 0.1)',
        },
        {
            label: 'Active Cohorts',
            value: cohorts.length,
            icon: Users,
            color: '#10b981',
            bgColor: 'rgba(16, 185, 129, 0.1)',
        },
        {
            label: 'Published',
            value: courses.filter((c) => c.status === 'PUBLISHED').length,
            icon: TrendingUp,
            color: '#f59e0b',
            bgColor: 'rgba(245, 158, 11, 0.1)',
        },
    ];

    return (
        <AdminLayout>
            <div className={styles.dashboard}>
                <header className={styles.header}>
                    <div>
                        <h1>Welcome back, {currentUser?.name}!</h1>
                        <p className="text-muted">Here's what's happening with your courses today.</p>
                    </div>
                </header>

                {/* Stats Grid */}
                <div className={styles.statsGrid}>
                    {stats.map((stat) => (
                        <div key={stat.label} className={styles.statCard}>
                            <div
                                className={styles.statIcon}
                                style={{ backgroundColor: stat.bgColor, color: stat.color }}
                            >
                                <stat.icon size={24} />
                            </div>
                            <div className={styles.statContent}>
                                <div className={styles.statValue}>{stat.value}</div>
                                <div className={styles.statLabel}>{stat.label}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quick Actions */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Quick Actions</h2>
                    <div className={styles.actionsGrid}>
                        <a href="/admin/courses/new" className={styles.actionCard}>
                            <BookOpen size={24} className={styles.actionIcon} />
                            <h3>Create Course</h3>
                            <p>Start building a new course from scratch</p>
                        </a>
                        <a href="/admin/cohorts/new" className={styles.actionCard}>
                            <Users size={24} className={styles.actionIcon} />
                            <h3>Create Cohort</h3>
                            <p>Set up a new learner cohort</p>
                        </a>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className={styles.section}>
                    <h2 className={styles.sectionTitle}>Recent Activity</h2>
                    <div className={styles.activityList}>
                        {courses.length === 0 ? (
                            <div className={styles.emptyState}>
                                <BookOpen size={48} className={styles.emptyIcon} />
                                <p>No courses yet. Create your first course to get started!</p>
                            </div>
                        ) : (
                            courses.slice(0, 5).map((course) => (
                                <div key={course.id} className={styles.activityItem}>
                                    <div className={styles.activityContent}>
                                        <h4>{course.title}</h4>
                                        <p className="text-muted text-sm">
                                            {course.tier} • {course.status}
                                        </p>
                                    </div>
                                    <a href={`/admin/courses/${course.id}`} className="btn btn-secondary">
                                        View
                                    </a>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
