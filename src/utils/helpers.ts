/**
 * Utility functions for Skills Locker
 */

import type { CourseItem, CourseTier, PublishChecklistItem } from '@/types';

// ============================================
// ID Generation
// ============================================

export function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// ============================================
// Course Defaults
// ============================================

export function getDefaultDurationLabel(tier: CourseTier): string {
    switch (tier) {
        case 'BYTE':
            return '1 hr';
        case 'MICROCRED':
            return '1–2 days';
        case 'SHORT':
            return '1–3 weeks';
    }
}

export function getDefaultAccredited(tier: CourseTier): boolean {
    return tier === 'MICROCRED';
}

export function getMinOutcomes(tier: CourseTier): number {
    return tier === 'SHORT' ? 4 : 3;
}

// ============================================
// Publish Checklist Validation
// ============================================

export function validatePublishChecklist(
    course: CourseItem
): PublishChecklistItem[] {
    const checklist: PublishChecklistItem[] = [];

    // Title
    checklist.push({
        id: 'title',
        label: 'Course title is set',
        required: true,
        passed: !!course.title && course.title.trim().length > 0,
    });

    // Domain
    checklist.push({
        id: 'domain',
        label: 'Domain is assigned',
        required: true,
        passed: !!course.domainId,
    });

    // Tier
    checklist.push({
        id: 'tier',
        label: 'Tier is selected',
        required: true,
        passed: !!course.tier,
    });

    // Outcomes
    const minOutcomes = getMinOutcomes(course.tier);
    checklist.push({
        id: 'outcomes',
        label: `At least ${minOutcomes} learning outcomes defined`,
        required: true,
        passed: course.outcomes.length >= minOutcomes,
        message: `${course.outcomes.length} of ${minOutcomes} required`,
    });

    // Modules
    const hasModules = course.modules && course.modules.length > 0;
    checklist.push({
        id: 'modules',
        label: 'At least 1 module with content',
        required: true,
        passed: hasModules,
    });

    // Lessons
    const hasLessons =
        hasModules &&
        course.modules.some((module) => module.lessons && module.lessons.length > 0);
    checklist.push({
        id: 'lessons',
        label: 'All modules have at least 1 lesson',
        required: true,
        passed: hasLessons,
    });

    // Blocks
    const allLessonsHaveBlocks =
        hasLessons &&
        course.modules.every((module) =>
            module.lessons.every((lesson) => lesson.blocks && lesson.blocks.length > 0)
        );
    checklist.push({
        id: 'blocks',
        label: 'All lessons have at least 1 content block',
        required: true,
        passed: allLessonsHaveBlocks,
    });

    // Assessments (for Microcreds)
    if (course.tier === 'MICROCRED') {
        const hasQuiz = course.modules.some((module) =>
            module.lessons.some((lesson) =>
                lesson.blocks.some((block) => block.type === 'QUIZ')
            )
        );
        checklist.push({
            id: 'assessments',
            label: 'Required assessments configured (Microcred)',
            required: true,
            passed: hasQuiz,
            message: hasQuiz ? 'Quiz found' : 'No quiz block found',
        });
    }

    // Prerequisites (no circular dependencies)
    const hasCircularDeps = hasCircularDependencies(course);
    checklist.push({
        id: 'prerequisites',
        label: 'No circular prerequisite dependencies',
        required: true,
        passed: !hasCircularDeps,
        message: hasCircularDeps ? 'Circular dependency detected' : 'Valid',
    });

    return checklist;
}

export function canPublish(checklist: PublishChecklistItem[]): boolean {
    return checklist.every((item) => !item.required || item.passed);
}

// ============================================
// Prerequisite Validation
// ============================================

export function hasCircularDependencies(
    course: CourseItem,
    allCourses?: CourseItem[]
): boolean {
    if (!allCourses) return false;

    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    function dfs(courseId: string): boolean {
        if (recursionStack.has(courseId)) return true; // Cycle detected
        if (visited.has(courseId)) return false;

        visited.add(courseId);
        recursionStack.add(courseId);

        const currentCourse = allCourses.find((c) => c.id === courseId);
        if (currentCourse) {
            for (const prereqId of currentCourse.prerequisites || []) {
                if (dfs(prereqId)) return true;
            }
        }

        recursionStack.delete(courseId);
        return false;
    }

    return dfs(course.id);
}

// ============================================
// Date Formatting
// ============================================

export function formatDate(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function formatDateTime(date: Date | string): string {
    const d = typeof date === 'string' ? new Date(date) : date;
    return d.toLocaleString('en-AU', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
    });
}

// ============================================
// Status Badge Helpers
// ============================================

export function getStatusColor(status: CourseItem['status']): string {
    switch (status) {
        case 'DRAFT':
            return 'gray';
        case 'IN_REVIEW':
            return 'orange';
        case 'PUBLISHED':
            return 'green';
        case 'ARCHIVED':
            return 'red';
    }
}

export function getTierColor(tier: CourseTier): string {
    switch (tier) {
        case 'BYTE':
            return 'blue';
        case 'MICROCRED':
            return 'purple';
        case 'SHORT':
            return 'pink';
    }
}
