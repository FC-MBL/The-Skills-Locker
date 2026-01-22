import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Course, Block, Lesson, Module, User } from '../types';
import { MOCK_COURSES, MOCK_USER } from '../constants';

interface CourseContextType {
  courses: Course[];
  activeCourse: Course | null;
  user: User;
  loadCourse: (id: string) => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  createCourse: () => string; // returns new ID
  updateModules: (courseId: string, modules: Module[]) => void;
  saveCourse: (course: Course) => void;
  submitForReview: (courseId: string) => void;
  publishCourse: (courseId: string) => void;
  rejectCourse: (courseId: string, notes: string) => void;
  updateUser: (updates: Partial<User>) => void;
  lastSaved: Date | null;
}

const CourseContext = createContext<CourseContextType | undefined>(undefined);

export const CourseProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [courses, setCourses] = useState<Course[]>(MOCK_COURSES);
  const [activeCourse, setActiveCourse] = useState<Course | null>(null);
  const [user, setUser] = useState<User>(MOCK_USER);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const loadCourse = useCallback((id: string) => {
    const course = courses.find(c => c.id === id);
    setActiveCourse(course || null);
  }, [courses]);

  const createCourse = () => {
    const newId = `c${Date.now()}`;
    const newCourse: Course = {
      id: newId,
      title: 'Untitled Course',
      description: '',
      domainId: 'dom_sc',
      tier: 'BYTE',
      durationLabel: '',
      price: 0,
      image: 'https://picsum.photos/400/300',
      accredited: false,
      outcomes: [],
      prerequisites: [],
      status: 'DRAFT',
      createdById: user.id,
      createdByName: user.name,
      modules: []
    };
    setCourses([...courses, newCourse]);
    return newId;
  };

  const updateCourse = (id: string, updates: Partial<Course>) => {
    const updatedCourses = courses.map(c => 
      c.id === id ? { ...c, ...updates } : c
    );
    setCourses(updatedCourses);
    if (activeCourse?.id === id) {
      setActiveCourse({ ...activeCourse, ...updates });
    }
    setLastSaved(new Date());
  };

  const updateModules = (courseId: string, modules: Module[]) => {
    updateCourse(courseId, { modules });
  };

  const saveCourse = (course: Course) => {
    updateCourse(course.id, course);
  };
  
  const submitForReview = (courseId: string) => {
      updateCourse(courseId, { 
          status: 'IN_REVIEW', 
          submittedAt: new Date().toISOString() 
      });
  };

  const publishCourse = (courseId: string) => {
      updateCourse(courseId, { 
          status: 'PUBLISHED', 
          reviewedAt: new Date().toISOString() 
      });
  };

  const rejectCourse = (courseId: string, notes: string) => {
      updateCourse(courseId, { 
          status: 'DRAFT', 
          reviewNotes: notes 
      });
  };

  const updateUser = (updates: Partial<User>) => {
      setUser({ ...user, ...updates });
      setLastSaved(new Date());
  };

  return (
    <CourseContext.Provider value={{ 
        courses, 
        activeCourse, 
        user,
        loadCourse, 
        updateCourse, 
        createCourse, 
        updateModules,
        saveCourse,
        submitForReview,
        publishCourse,
        rejectCourse,
        updateUser,
        lastSaved 
    }}>
      {children}
    </CourseContext.Provider>
  );
};

export const useCourse = () => {
  const context = useContext(CourseContext);
  if (!context) throw new Error('useCourse must be used within CourseProvider');
  return context;
};