import React, { createContext, useContext, useState, useEffect } from 'react';
import { Enrollment, User, Item, Module, Quiz, Cohort, UserRole } from './types';
import { ITEMS, MODULES, QUIZZES, COHORTS, ADMIN_USERS } from './data';

interface AppState {
  user: User | null;
  enrollments: Enrollment[];
  items: Item[];
  cohorts: Cohort[];
  modules: Module[];
  quizzes: Quiz[];
  
  // Auth
  login: (email: string) => void;
  signup: (name: string, email: string) => void;
  logout: () => void;
  
  // Learner Actions
  enroll: (itemId: string) => void;
  unenroll: (itemId: string) => void;
  getEnrollment: (itemId: string) => Enrollment | undefined;
  checkPrerequisites: (itemId: string) => boolean;
  completeModule: (itemId: string, moduleId: string) => void;
  completeByte: (itemId: string) => void;
  submitAssessment: (itemId: string, score: number) => { passed: boolean; credentialIssued: boolean };

  // Admin Actions
  updateItem: (item: Item) => void;
  createItem: (item: Item) => void;
  deleteItem: (itemId: string) => void;
  saveCourseStructure: (itemId: string, structure: any) => void;
  updateCohort: (cohort: Cohort) => void;
  createCohort: (cohort: Cohort) => void;
}

const StoreContext = createContext<AppState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [items, setItems] = useState<Item[]>(ITEMS);
  const [cohorts, setCohorts] = useState<Cohort[]>(COHORTS);
  const [modules, setModules] = useState<Module[]>(MODULES);
  const [quizzes, setQuizzes] = useState<Quiz[]>(QUIZZES);

  const login = (email: string) => {
    // Check if admin
    const adminUser = ADMIN_USERS.find(u => u.email === email);
    if (adminUser) {
      setUser(adminUser);
    } else {
      // Mock learner login
      setUser({ id: 'u1', name: 'Alex Learner', email, role: 'LEARNER' });
    }
  };

  const signup = (name: string, email: string) => {
    setUser({ id: 'u2', name, email, role: 'LEARNER' });
  };

  const logout = () => {
    setUser(null);
    setEnrollments([]);
  };

  const getEnrollment = (itemId: string) => enrollments.find(e => e.itemId === itemId);

  const checkPrerequisites = (itemId: string): boolean => {
    const item = items.find(i => i.id === itemId);
    if (!item || item.prerequisites.length === 0) return true;
    return item.prerequisites.every(prereqId => {
      const enrollment = enrollments.find(e => e.itemId === prereqId);
      if (!enrollment) return false;
      return enrollment.status === 'COMPLETED';
    });
  };

  const enroll = (itemId: string) => {
    if (!checkPrerequisites(itemId)) return;
    if (!enrollments.find(e => e.itemId === itemId)) {
      const item = items.find(i => i.id === itemId);
      const newEnrollment: Enrollment = {
        itemId,
        status: 'ENROLLED',
        progressPercent: 0,
        completedModuleIds: [],
        assessmentStatus: item?.tier === 'BYTE' ? 'NOT_REQUIRED' : 'NOT_STARTED',
        attemptsUsed: 0,
        credentialIssued: false,
        lastAccessedAt: new Date().toISOString()
      };
      setEnrollments([...enrollments, newEnrollment]);
    }
  };

  const unenroll = (itemId: string) => {
    setEnrollments(enrollments.filter(e => e.itemId !== itemId));
  };

  const completeByte = (itemId: string) => {
    setEnrollments(prev => prev.map(e => {
        if (e.itemId === itemId) {
            return {
                ...e,
                status: 'COMPLETED',
                progressPercent: 100,
                completedAt: new Date().toISOString(),
                credentialIssued: false
            }
        }
        return e;
    }));
  };

  const completeModule = (itemId: string, moduleId: string) => {
    setEnrollments(prev => prev.map(e => {
      if (e.itemId === itemId) {
        if (e.completedModuleIds.includes(moduleId)) return e;
        const newCompleted = [...e.completedModuleIds, moduleId];
        const courseModules = modules.filter(m => m.itemId === itemId);
        // Simple fallback if no modules defined but somehow called
        const total = courseModules.length || 1; 
        const progress = Math.round((newCompleted.length / total) * 100);
        
        return {
          ...e,
          completedModuleIds: newCompleted,
          progressPercent: progress,
          status: 'IN_PROGRESS',
          lastAccessedAt: new Date().toISOString()
        };
      }
      return e;
    }));
  };

  const submitAssessment = (itemId: string, score: number) => {
    let result = { passed: false, credentialIssued: false };
    
    setEnrollments(prev => prev.map(e => {
      if (e.itemId === itemId) {
        const quiz = quizzes.find(q => q.itemId === itemId);
        const passed = quiz ? score >= quiz.passMark : false;
        const item = items.find(i => i.id === itemId);

        let newStatus = e.status;
        let credIssued = false;

        if (passed) {
             if (item?.tier === 'MICROCRED') {
                 newStatus = 'COMPLETED';
                 credIssued = true;
             } else if (item?.tier === 'SHORT') {
                 const courseModules = modules.filter(m => m.itemId === itemId);
                 if (e.completedModuleIds.length >= courseModules.length) {
                     newStatus = 'COMPLETED';
                     credIssued = true;
                 }
             }
        }
        result = { passed, credentialIssued: credIssued };

        return {
          ...e,
          assessmentStatus: passed ? 'PASSED' : 'FAILED',
          attemptsUsed: e.attemptsUsed + 1,
          status: newStatus,
          progressPercent: passed ? 100 : e.progressPercent,
          credentialIssued: credIssued,
          completedAt: credIssued ? new Date().toISOString() : undefined
        };
      }
      return e;
    }));
    return result;
  };

  // --- Admin Actions ---

  const updateItem = (updatedItem: Item) => {
    setItems(prev => prev.map(i => i.id === updatedItem.id ? updatedItem : i));
  };

  const createItem = (newItem: Item) => {
    setItems(prev => [...prev, newItem]);
  };

  const deleteItem = (itemId: string) => {
    setItems(prev => prev.filter(i => i.id !== itemId));
  };

  const saveCourseStructure = (itemId: string, structure: any) => {
      setItems(prev => prev.map(i => {
          if (i.id === itemId) {
              return { ...i, contentStructure: structure };
          }
          return i;
      }));
  };

  const updateCohort = (cohort: Cohort) => {
    setCohorts(prev => prev.map(c => c.id === cohort.id ? cohort : c));
  };

  const createCohort = (cohort: Cohort) => {
    setCohorts(prev => [...prev, cohort]);
  };

  return (
    <StoreContext.Provider value={{ 
      user, enrollments, items, modules, quizzes, cohorts,
      login, signup, logout, enroll, unenroll, 
      getEnrollment, checkPrerequisites, completeModule, completeByte, submitAssessment,
      updateItem, createItem, deleteItem, saveCourseStructure, updateCohort, createCohort
    }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
};