import { Course, Domain, User } from './types';

export const DOMAINS: Domain[] = [
  { id: 'dom_sc', name: 'Strength & Conditioning' },
  { id: 'dom_nut', name: 'Nutrition' },
  { id: 'dom_fitbiz', name: 'Fitness Business' },
];

export const MOCK_USER: User = {
    id: 'u1',
    name: 'Coach Mike',
    role: 'CONTRIBUTOR',
    title: 'Head of Performance',
    expertise: 'Hypertrophy, Biomechanics',
    avatarUrl: 'https://i.pravatar.cc/150?u=u1'
};

export const MOCK_COURSES: Course[] = [
  {
    id: 'c1',
    title: 'Supercompensation',
    description: 'Master the art of recovery and timing for peak athletic performance.',
    domainId: 'dom_sc',
    tier: 'BYTE',
    durationLabel: '1 hr',
    price: 0,
    image: 'https://picsum.photos/seed/c1/400/300',
    accredited: false,
    outcomes: ['Define supercompensation', 'Map training cycles', 'Optimize timing'],
    prerequisites: [],
    status: 'PUBLISHED',
    createdById: 'u1',
    createdByName: 'Coach Mike',
    modules: [
      {
        id: 'm1',
        title: 'Introduction',
        order: 0,
        lessons: [
          {
            id: 'l1',
            title: 'What is Supercompensation?',
            order: 0,
            blocks: [
              { id: 'b1', type: 'VIDEO', content: 'Intro Video URL', order: 0 },
              { id: 'b2', type: 'TEXT', content: 'Key definitions related to homeostasis.', order: 1 }
            ]
          }
        ]
      }
    ]
  },
  {
    id: 'c2',
    title: 'Energy Systems in Training',
    description: 'Deep dive into ATP-PC, Glycolytic, and Oxidative systems.',
    domainId: 'dom_sc',
    tier: 'MICROCRED',
    durationLabel: '2 days',
    price: 120,
    image: 'https://picsum.photos/seed/c2/400/300',
    accredited: true,
    outcomes: ['Identify energy demands', 'Program intervals', 'Assess capacity'],
    prerequisites: ['c1'],
    status: 'IN_REVIEW',
    submittedAt: '2023-10-25T14:30:00Z',
    createdById: 'u1',
    createdByName: 'Coach Mike',
    modules: []
  },
  {
    id: 'c3',
    title: 'Systemised Personal Training',
    description: 'Scale your business with robust standard operating procedures.',
    domainId: 'dom_fitbiz',
    tier: 'SHORT',
    durationLabel: '3 weeks',
    price: 499,
    image: 'https://picsum.photos/seed/c3/400/300',
    accredited: false,
    outcomes: ['Build SOPs', 'Scale operations', 'Hire staff'],
    prerequisites: [],
    status: 'DRAFT',
    createdById: 'u1',
    createdByName: 'Coach Mike',
    modules: []
  }
];

export const BLOCK_TYPE_ICONS: Record<string, string> = {
  VIDEO: 'PlayCircle',
  TEXT: 'Type',
  FILE: 'FileText',
  CHECKLIST: 'CheckSquare',
  REFLECTION: 'BrainCircuit',
  LINK: 'Link',
  QUIZ: 'HelpCircle',
  ASSIGNMENT: 'ClipboardList',
  SCORM: 'Package',
};