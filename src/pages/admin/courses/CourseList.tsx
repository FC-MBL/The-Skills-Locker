import { useState } from 'react';
import { Link } from 'react-router-dom';
import AdminLayout from '@/components/AdminLayout';
import { courseStorage, domainStorage } from '@/utils/storage';
import type { CourseTier, CourseStatus } from '@/types';
import { Search, Plus, Filter } from 'lucide-react';
import styles from './CourseList.module.css';

export default function CourseList() {
    const courses = courseStorage.getAll();
    const domains = domainStorage.getAll();

    const [searchTerm, setSearchTerm] = useState('');
    const [filterTier, setFilterTier] = useState<CourseTier | 'ALL'>('ALL');
    const [filterStatus, setFilterStatus] = useState<CourseStatus | 'ALL'>('ALL');
    const [filterDomain, setFilterDomain] = useState<string>('ALL');

    // Filter courses
    const filteredCourses = courses.filter((course) => {
        const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesTier = filterTier === 'ALL' || course.tier === filterTier;
        const matchesStatus = filterStatus === 'ALL' || course.status === filterStatus;
        const matchesDomain = filterDomain === 'ALL' || course.domainId === filterDomain;

        return matchesSearch && matchesTier && matchesStatus && matchesDomain;
    });

    const getDomainName = (domainId: string) => {
        return domains.find((d) => d.id === domainId)?.name || 'Unknown';
    };

    const getStatusBadgeClass = (status: CourseStatus) => {
        switch (status) {
            case 'DRAFT':
                return styles.badgeDraft;
            case 'IN_REVIEW':
                return styles.badgeReview;
            case 'PUBLISHED':
                return styles.badgePublished;
            case 'ARCHIVED':
                return styles.badgeArchived;
        }
    };

    const getTierBadgeClass = (tier: CourseTier) => {
        switch (tier) {
            case 'BYTE':
                return styles.tierByte;
            case 'MICROCRED':
                return styles.tierMicrocred;
            case 'SHORT':
                return styles.tierShort;
        }
    };

    return (
        <AdminLayout>
            <div className={styles.courseList}>
                <header className={styles.header}>
                    <div>
                        <h1>Courses</h1>
                        <p className="text-muted">Manage your course library</p>
                    </div>
                    <Link to="/admin/courses/new" className="btn btn-primary">
                        <Plus size={18} />
                        <span>Create Course</span>
                    </Link>
                </header>

                {/* Filters */}
                <div className={styles.filters}>
                    <div className={styles.searchBox}>
                        <Search size={18} className={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search courses..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.filterGroup}>
                        <Filter size={16} />
                        <select
                            value={filterDomain}
                            onChange={(e) => setFilterDomain(e.target.value)}
                            className={styles.filterSelect}
                        >
                            <option value="ALL">All Domains</option>
                            {domains.map((domain) => (
                                <option key={domain.id} value={domain.id}>
                                    {domain.name}
                                </option>
                            ))}
                        </select>

                        <select
                            value={filterTier}
                            onChange={(e) => setFilterTier(e.target.value as CourseTier | 'ALL')}
                            className={styles.filterSelect}
                        >
                            <option value="ALL">All Tiers</option>
                            <option value="BYTE">Bytes</option>
                            <option value="MICROCRED">Microcreds</option>
                            <option value="SHORT">Short Courses</option>
                        </select>

                        <select
                            value={filterStatus}
                            onChange={(e) => setFilterStatus(e.target.value as CourseStatus | 'ALL')}
                            className={styles.filterSelect}
                        >
                            <option value="ALL">All Statuses</option>
                            <option value="DRAFT">Draft</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="PUBLISHED">Published</option>
                            <option value="ARCHIVED">Archived</option>
                        </select>
                    </div>
                </div>

                {/* Results count */}
                <div className={styles.resultsCount}>
                    Showing {filteredCourses.length} of {courses.length} courses
                </div>

                {/* Course Table */}
                {filteredCourses.length === 0 ? (
                    <div className={styles.empty}>
                        <p>No courses found. Create your first course to get started!</p>
                        <Link to="/admin/courses/new" className="btn btn-primary" style={{ marginTop: '1rem' }}>
                            <Plus size={18} />
                            <span>Create Course</span>
                        </Link>
                    </div>
                ) : (
                    <div className={styles.tableWrapper}>
                        <table className={styles.table}>
                            <thead>
                                <tr>
                                    <th>Title</th>
                                    <th>Domain</th>
                                    <th>Tier</th>
                                    <th>Status</th>
                                    <th>Last Updated</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredCourses.map((course) => (
                                    <tr key={course.id}>
                                        <td className={styles.titleCell}>
                                            <Link to={`/admin/courses/${course.id}`} className={styles.courseTitle}>
                                                {course.title}
                                            </Link>
                                        </td>
                                        <td>{getDomainName(course.domainId)}</td>
                                        <td>
                                            <span className={`${styles.tierBadge} ${getTierBadgeClass(course.tier)}`}>
                                                {course.tier}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`${styles.statusBadge} ${getStatusBadgeClass(course.status)}`}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td className="text-muted text-sm">
                                            {new Date(course.updatedAt).toLocaleDateString()}
                                        </td>
                                        <td>
                                            <div className={styles.actions}>
                                                <Link to={`/admin/courses/${course.id}`} className="btn btn-secondary">
                                                    Edit
                                                </Link>
                                                <Link to={`/admin/courses/${course.id}/builder`} className="btn btn-secondary">
                                                    Builder
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
