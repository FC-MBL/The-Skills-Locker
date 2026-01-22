export type Tier = 'BYTE' | 'MICROCRED' | 'SHORT';
export type CourseStatus = 'DRAFT' | 'IN_REVIEW' | 'PUBLISHED';
export type BlockType = 'VIDEO' | 'TEXT' | 'FILE' | 'CHECKLIST' | 'REFLECTION' | 'LINK' | 'QUIZ' | 'ASSIGNMENT' | 'SCORM';

export interface Block {
  id: string;
  type: BlockType;
  content: string;
  order: number;
}

export interface Lesson {
  id: string;
  title: string;
  order: number;
  blocks: Block[];
}

export interface Module {
  id: string;
  title: string;
  order: number;
  lessons: Lesson[];
}

export interface Course {
  id: string;
  title: string;
  description: string;
  domainId: string;
  tier: Tier;
  durationLabel: string;
  price: number;
  image: string;
  accredited: boolean;
  outcomes: string[];
  prerequisites: string[]; // List of Course IDs
  status: CourseStatus;
  submittedAt?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  createdById: string;
  createdByName: string;
  modules: Module[];
}

export interface Domain {
  id: string;
  name: string;
}

export interface User {
  id: string;
  name: string;
  role: 'CONTRIBUTOR' | 'ADMIN';
  title?: string;
  expertise?: string;
  avatarUrl?: string;
}