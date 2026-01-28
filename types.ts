export type Tier = "BYTE" | "MICROCRED" | "SHORT";
export type EnrollmentStatus = "NOT_ENROLLED" | "ENROLLED" | "IN_PROGRESS" | "COMPLETED";
export type AssessmentStatus = "NOT_REQUIRED" | "NOT_STARTED" | "IN_PROGRESS" | "SUBMITTED" | "PASSED" | "FAILED";
export type ModuleType = "VIDEO" | "READING" | "ACTIVITY";

// Admin & Auth Types
export type UserRole = "ADMIN" | "EDITOR" | "REVIEWER" | "ASSESSOR" | "CONTRIBUTOR" | "LEARNER";
export type ContentStatus = "DRAFT" | "IN_REVIEW" | "PUBLISHED";

export interface Domain {
  id: string;
  name: string;
  partners?: string[];
}

// Deep Content Structure for Builder
export type BlockType = "VIDEO" | "TEXT" | "FILE" | "CHECKLIST" | "REFLECTION" | "LINK" | "QUIZ" | "ASSIGNMENT" | "SCORM" | "HTML_VIEWER";

export interface Block {
  id: string;
  type: BlockType;
  content: string; // JSON or simple text
  launchUrl?: string;
  scormMetadata?: {
    status: 'QUEUED' | 'PROCESSING' | 'READY' | 'ERROR';
    launchUrl?: string;
    packageId?: string;
    error?: string;
  };
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  blocks: Block[];
  completionCriteria?: {
    minTime?: number;
    required?: boolean;
  };
}

export interface CourseModule {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Item {
  id: string;
  reviewNotes?: string;
  image: string;
  price: number;
  // Admin Fields
  status: ContentStatus;
  versionNumber: number;
  lastPublishedAt?: string;
  changelog?: string[];
  contentStructure?: CourseModule[];
}

// Legacy flat module structure support (for transition)
export interface Module {
  id: string;
  itemId: string;
  title: string;
  order: number;
  type: ModuleType;
  estimatedMinutes: number;
  content?: string;
}

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
  tags?: string[]; // Admin field
}

export interface Quiz {
  id: string;
  itemId: string;
  passMark: number;
  attemptsAllowed: number;
  questions: Question[];
  timeLimitMinutes: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  title?: string;
  expertise?: string;
  avatarUrl?: string;
}

export interface Enrollment {
  itemId: string;
  status: EnrollmentStatus;
  progressPercent: number;
  completedModuleIds: string[];
  assessmentStatus: AssessmentStatus;
  attemptsUsed: number;
  credentialIssued: boolean;
  completedAt?: string;
  lastAccessedAt?: string;
}

export interface Cohort {
  id: string;
  name: string;
  courseIds: string[];
  userIds: string[]; // Learner IDs
  startDate: string;
  endDate?: string;
  status: 'ACTIVE' | 'UPCOMING' | 'ARCHIVED';
}
