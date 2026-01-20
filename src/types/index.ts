/**
 * Core domain type definitions for Skills Locker LMS
 */

// ============================================
// User & Authentication
// ============================================

export type UserRole = "ADMIN" | "EDITOR" | "REVIEWER" | "ASSESSOR" | "LEARNER";

export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    assignedDomains?: string[];  // for EDITOR/REVIEWER roles
    status: "ACTIVE" | "INACTIVE";
    createdAt: Date;
}

// ============================================
// Course Taxonomy
// ============================================

export interface Domain {
    id: string;
    name: string;
    partners: string[];  // industry partners/contributors (placeholders)
}

export type CourseTier = "BYTE" | "MICROCRED" | "SHORT";

export type CourseStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED" | "ARCHIVED";

export interface CourseItem {
    // Core metadata
    id: string;
    domainId: string;
    tier: CourseTier;
    title: string;
    durationLabel: string;         // "1 hr", "1–2 days", "1–3 weeks"
    accredited: boolean;
    outcomes: string[];             // 3-6 learning outcomes
    prerequisites: string[];        // course IDs
    placeholderContributor?: string;

    // Workflow fields
    status: CourseStatus;
    versionNumber: number;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;              // user ID
    lastPublishedAt?: Date;
    changelog?: string;

    // Full course structure
    modules: Module[];
}

// ============================================
// Course Structure
// ============================================

export interface Module {
    id: string;
    title: string;
    description: string;
    order: number;
    lessons: Lesson[];
    completionCriteria: CompletionRule;
}

export interface Lesson {
    id: string;
    title: string;
    description: string;
    order: number;
    estimatedMinutes: number;
    blocks: Block[];
    completionCriteria: CompletionRule;
}

export type BlockType =
    | "VIDEO"
    | "TEXT"
    | "FILE"
    | "CHECKLIST"
    | "REFLECTION"
    | "LINK"
    | "QUIZ"
    | "ASSIGNMENT";

export interface Block {
    id: string;
    type: BlockType;
    order: number;
    content:
    | VideoContent
    | TextContent
    | FileContent
    | ChecklistContent
    | ReflectionContent
    | LinkContent
    | QuizContent
    | AssignmentContent;
}

// ============================================
// Block Content Types
// ============================================

export interface VideoContent {
    url: string;
    title: string;
    duration?: number;  // seconds
    transcript?: string;
}

export interface TextContent {
    html: string;  // rich text HTML
}

export interface FileContent {
    url: string;
    filename: string;
    fileSize: number;  // bytes
    mimeType: string;
}

export interface ChecklistContent {
    items: ChecklistItem[];
}

export interface ChecklistItem {
    id: string;
    text: string;
    order: number;
}

export interface ReflectionContent {
    prompt: string;  // rich text
    characterLimit?: number;
}

export interface LinkContent {
    url: string;
    title: string;
    description?: string;
}

export interface QuizContent {
    quizId: string;  // reference to Quiz
}

export interface AssignmentContent {
    brief: string;  // rich text
    submissionType: "FILE" | "TEXT" | "BOTH";
    rubricId?: string;  // Phase 2
}

// ============================================
// Completion Rules
// ============================================

export type CompletionRuleType = "ALL_BLOCKS" | "PASSING_SCORE" | "MANUAL";

export interface CompletionRule {
    type: CompletionRuleType;
    passingScore?: number;  // percentage (0-100) for PASSING_SCORE type
}

// ============================================
// Assessments
// ============================================

export type QuestionType = "MCQ" | "TRUE_FALSE" | "SHORT_ANSWER";

export interface Question {
    id: string;
    type: QuestionType;
    prompt: string;  // rich text
    tags: string[];

    // MCQ only
    options?: QuestionOption[];

    // TRUE_FALSE only
    correctAnswer?: boolean;

    // SHORT_ANSWER only
    modelAnswer?: string;
    autoGrade?: boolean;  // exact match grading

    // Feedback
    correctFeedback?: string;
    incorrectFeedback?: string;

    // Metadata
    createdBy: string;
    createdAt: Date;
    difficulty?: "EASY" | "MEDIUM" | "HARD";
}

export interface QuestionOption {
    id: string;
    text: string;
    isCorrect: boolean;
    order: number;
}

export interface Quiz {
    id: string;
    title: string;
    description?: string;
    questions: string[];  // question IDs
    passingScore: number;  // percentage (0-100)
    timeLimit?: number;    // minutes
    attemptsAllowed: number;
    shuffleQuestions: boolean;
    shuffleOptions: boolean;  // for MCQs
    showCorrectAnswers: boolean;
    createdBy: string;
    createdAt: Date;
}

// ============================================
// Cohorts & Enrollment
// ============================================

export interface Cohort {
    id: string;
    name: string;
    courses: string[];  // course IDs
    startDate: Date;
    endDate?: Date;
    learners: string[];  // user IDs
    createdBy: string;
    createdAt: Date;
}

export type CohortStatus = "UPCOMING" | "ACTIVE" | "COMPLETED";

// ============================================
// Progress Tracking
// ============================================

export interface LearnerProgress {
    userId: string;
    courseId: string;
    cohortId?: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    progressPercentage: number;  // 0-100
    moduleProgress: ModuleProgress[];
    lastAccessedAt?: Date;
    completedAt?: Date;
}

export interface ModuleProgress {
    moduleId: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    lessonProgress: LessonProgress[];
}

export interface LessonProgress {
    lessonId: string;
    status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
    blockProgress: BlockProgress[];
}

export interface BlockProgress {
    blockId: string;
    completed: boolean;
    completedAt?: Date;
}

// ============================================
// Form & Validation Types
// ============================================

export interface PublishChecklistItem {
    id: string;
    label: string;
    required: boolean;
    passed: boolean;
    message?: string;
}

// ============================================
// Utility Types
// ============================================

export interface FilterOptions {
    domains?: string[];
    tiers?: CourseTier[];
    statuses?: CourseStatus[];
    search?: string;
}

export interface SortOption {
    field: keyof CourseItem;
    direction: "asc" | "desc";
}
