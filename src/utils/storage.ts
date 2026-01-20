/**
 * localStorage abstraction layer for Skills Locker
 * Provides CRUD operations with type safety
 * Easy to migrate to backend later (Firebase, Supabase, etc.)
 */

import type {
    Domain,
    CourseItem,
    Question,
    Quiz,
    Cohort,
    User,
    LearnerProgress,
} from '@/types';

// Storage keys
const STORAGE_KEYS = {
    DOMAINS: 'skillsLocker_domains',
    COURSES: 'skillsLocker_courses',
    QUESTIONS: 'skillsLocker_questions',
    QUIZZES: 'skillsLocker_quizzes',
    COHORTS: 'skillsLocker_cohorts',
    USERS: 'skillsLocker_users',
    PROGRESS: 'skillsLocker_progress',
    CURRENT_USER: 'skillsLocker_currentUser',
} as const;

// ============================================
// Generic CRUD Operations
// ============================================

function getAll<T>(key: string): T[] {
    const data = localStorage.getItem(key);
    if (!data) return [];
    try {
        const parsed = JSON.parse(data);
        // Convert date strings back to Date objects
        return parsed.map((item: any) => deserializeDates(item));
    } catch (error) {
        console.error(`Error parsing ${key}:`, error);
        return [];
    }
}

function getById<T extends { id: string }>(key: string, id: string): T | null {
    const items = getAll<T>(key);
    return items.find((item) => item.id === id) || null;
}

function save<T extends { id: string }>(key: string, item: T): void {
    const items = getAll<T>(key);
    const index = items.findIndex((i) => i.id === item.id);

    if (index >= 0) {
        items[index] = item;
    } else {
        items.push(item);
    }

    localStorage.setItem(key, JSON.stringify(items));
}

function saveAll<T>(key: string, items: T[]): void {
    localStorage.setItem(key, JSON.stringify(items));
}

function remove(key: string, id: string): void {
    const items = getAll<{ id: string }>(key);
    const filtered = items.filter((item) => item.id !== id);
    localStorage.setItem(key, JSON.stringify(filtered));
}

function clear(key: string): void {
    localStorage.removeItem(key);
}

// ============================================
// Date Serialization Helper
// ============================================

function deserializeDates<T>(obj: T): T {
    if (obj === null || typeof obj !== 'object') return obj;

    const result: any = Array.isArray(obj) ? [] : {};

    for (const [key, value] of Object.entries(obj)) {
        if (typeof value === 'string' && isISODateString(value)) {
            result[key] = new Date(value);
        } else if (typeof value === 'object') {
            result[key] = deserializeDates(value);
        } else {
            result[key] = value;
        }
    }

    return result;
}

function isISODateString(str: string): boolean {
    return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/.test(str);
}

// ============================================
// Domain Operations
// ============================================

export const domainStorage = {
    getAll: () => getAll<Domain>(STORAGE_KEYS.DOMAINS),
    getById: (id: string) => getById<Domain>(STORAGE_KEYS.DOMAINS, id),
    save: (domain: Domain) => save(STORAGE_KEYS.DOMAINS, domain),
    saveAll: (domains: Domain[]) => saveAll(STORAGE_KEYS.DOMAINS, domains),
    remove: (id: string) => remove(STORAGE_KEYS.DOMAINS, id),
    clear: () => clear(STORAGE_KEYS.DOMAINS),
};

// ============================================
// Course Operations
// ============================================

export const courseStorage = {
    getAll: () => getAll<CourseItem>(STORAGE_KEYS.COURSES),
    getById: (id: string) => getById<CourseItem>(STORAGE_KEYS.COURSES, id),
    save: (course: CourseItem) => save(STORAGE_KEYS.COURSES, course),
    saveAll: (courses: CourseItem[]) => saveAll(STORAGE_KEYS.COURSES, courses),
    remove: (id: string) => remove(STORAGE_KEYS.COURSES, id),
    clear: () => clear(STORAGE_KEYS.COURSES),

    getByDomain: (domainId: string) => {
        return getAll<CourseItem>(STORAGE_KEYS.COURSES).filter(
            (course) => course.domainId === domainId
        );
    },

    getByStatus: (status: CourseItem['status']) => {
        return getAll<CourseItem>(STORAGE_KEYS.COURSES).filter(
            (course) => course.status === status
        );
    },
};

// ============================================
// Question Operations
// ============================================

export const questionStorage = {
    getAll: () => getAll<Question>(STORAGE_KEYS.QUESTIONS),
    getById: (id: string) => getById<Question>(STORAGE_KEYS.QUESTIONS, id),
    save: (question: Question) => save(STORAGE_KEYS.QUESTIONS, question),
    saveAll: (questions: Question[]) => saveAll(STORAGE_KEYS.QUESTIONS, questions),
    remove: (id: string) => remove(STORAGE_KEYS.QUESTIONS, id),
    clear: () => clear(STORAGE_KEYS.QUESTIONS),

    getByTags: (tags: string[]) => {
        return getAll<Question>(STORAGE_KEYS.QUESTIONS).filter((q) =>
            q.tags.some((tag) => tags.includes(tag))
        );
    },
};

// ============================================
// Quiz Operations
// ============================================

export const quizStorage = {
    getAll: () => getAll<Quiz>(STORAGE_KEYS.QUIZZES),
    getById: (id: string) => getById<Quiz>(STORAGE_KEYS.QUIZZES, id),
    save: (quiz: Quiz) => save(STORAGE_KEYS.QUIZZES, quiz),
    saveAll: (quizzes: Quiz[]) => saveAll(STORAGE_KEYS.QUIZZES, quizzes),
    remove: (id: string) => remove(STORAGE_KEYS.QUIZZES, id),
    clear: () => clear(STORAGE_KEYS.QUIZZES),
};

// ============================================
// Cohort Operations
// ============================================

export const cohortStorage = {
    getAll: () => getAll<Cohort>(STORAGE_KEYS.COHORTS),
    getById: (id: string) => getById<Cohort>(STORAGE_KEYS.COHORTS, id),
    save: (cohort: Cohort) => save(STORAGE_KEYS.COHORTS, cohort),
    saveAll: (cohorts: Cohort[]) => saveAll(STORAGE_KEYS.COHORTS, cohorts),
    remove: (id: string) => remove(STORAGE_KEYS.COHORTS, id),
    clear: () => clear(STORAGE_KEYS.COHORTS),
};

// ============================================
// User Operations
// ============================================

export const userStorage = {
    getAll: () => getAll<User>(STORAGE_KEYS.USERS),
    getById: (id: string) => getById<User>(STORAGE_KEYS.USERS, id),
    save: (user: User) => save(STORAGE_KEYS.USERS, user),
    saveAll: (users: User[]) => saveAll(STORAGE_KEYS.USERS, users),
    remove: (id: string) => remove(STORAGE_KEYS.USERS, id),
    clear: () => clear(STORAGE_KEYS.USERS),

    getCurrentUser: (): User | null => {
        const data = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
        if (!data) return null;
        try {
            return deserializeDates(JSON.parse(data));
        } catch {
            return null;
        }
    },

    setCurrentUser: (user: User | null): void => {
        if (user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
        } else {
            localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        }
    },
};

// ============================================
// Progress Operations
// ============================================

export const progressStorage = {
    getAll: () => getAll<LearnerProgress>(STORAGE_KEYS.PROGRESS),
    getById: (userId: string, courseId: string) => {
        const allProgress = getAll<LearnerProgress>(STORAGE_KEYS.PROGRESS);
        return (
            allProgress.find(
                (p) => p.userId === userId && p.courseId === courseId
            ) || null
        );
    },
    save: (progress: LearnerProgress) => {
        const allProgress = getAll<LearnerProgress>(STORAGE_KEYS.PROGRESS);
        const index = allProgress.findIndex(
            (p) => p.userId === progress.userId && p.courseId === progress.courseId
        );

        if (index >= 0) {
            allProgress[index] = progress;
        } else {
            allProgress.push(progress);
        }

        saveAll(STORAGE_KEYS.PROGRESS, allProgress);
    },
    saveAll: (progress: LearnerProgress[]) => saveAll(STORAGE_KEYS.PROGRESS, progress),
    clear: () => clear(STORAGE_KEYS.PROGRESS),
};

// ============================================
// Export/Import for Backups
// ============================================

export interface DataExport {
    version: string;
    exportedAt: string;
    domains: Domain[];
    courses: CourseItem[];
    questions: Question[];
    quizzes: Quiz[];
    cohorts: Cohort[];
    users: User[];
    progress: LearnerProgress[];
}

export function exportAllData(): DataExport {
    return {
        version: '1.0',
        exportedAt: new Date().toISOString(),
        domains: domainStorage.getAll(),
        courses: courseStorage.getAll(),
        questions: questionStorage.getAll(),
        quizzes: quizStorage.getAll(),
        cohorts: cohortStorage.getAll(),
        users: userStorage.getAll(),
        progress: progressStorage.getAll(),
    };
}

export function importAllData(data: DataExport): void {
    domainStorage.saveAll(data.domains);
    courseStorage.saveAll(data.courses);
    questionStorage.saveAll(data.questions);
    quizStorage.saveAll(data.quizzes);
    cohortStorage.saveAll(data.cohorts);
    userStorage.saveAll(data.users);
    progressStorage.saveAll(data.progress);
}

export function clearAllData(): void {
    domainStorage.clear();
    courseStorage.clear();
    questionStorage.clear();
    quizStorage.clear();
    cohortStorage.clear();
    userStorage.clear();
    progressStorage.clear();
}
