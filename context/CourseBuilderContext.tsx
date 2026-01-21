import React, { createContext, useContext, useMemo, useState } from 'react';
import { Item, CourseModule, User } from '../types';
import { useStore } from '../store';

export interface BuilderCourse extends Item {
  modules: CourseModule[];
}

interface CourseBuilderContextType {
  courses: BuilderCourse[];
  activeCourse: BuilderCourse | null;
  user: User | null;
  loadCourse: (id: string) => void;
  updateCourse: (id: string, updates: Partial<BuilderCourse>) => void;
  createCourse: () => string;
  updateModules: (courseId: string, modules: CourseModule[]) => void;
  saveCourse: (course: BuilderCourse) => void;
  submitForReview: (courseId: string) => void;
  publishCourse: (courseId: string) => void;
  rejectCourse: (courseId: string, notes: string) => void;
  lastSaved: Date | null;
}

const CourseBuilderContext = createContext<CourseBuilderContextType | undefined>(undefined);

const mapItemToCourse = (item: Item): BuilderCourse => ({
  ...item,
  modules: item.contentStructure || []
});

export const CourseBuilderProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, items, createItem, updateItem, submitItemForReview, approveItem, rejectItem } = useStore();
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const courses = useMemo(() => items.map(mapItemToCourse), [items]);
  const activeCourse = useMemo(() => {
    const found = items.find(i => i.id === activeCourseId);
    return found ? mapItemToCourse(found) : null;
  }, [items, activeCourseId]);

  const loadCourse = (id: string) => {
    setActiveCourseId(id);
  };

  const updateCourse = (id: string, updates: Partial<BuilderCourse>) => {
    const current = items.find(i => i.id === id);
    if (!current) return;

    const { modules, ...rest } = updates;
    const mappedUpdates: Partial<Item> = {
      ...rest,
      ...(modules ? { contentStructure: modules } : {})
    };

    updateItem({ ...current, ...mappedUpdates });
    setLastSaved(new Date());
  };

  const createCourse = () => {
    const newId = `contrib_${Date.now()}`;
    const newCourse: Item = {
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
      versionNumber: 1,
      changelog: [],
      contentStructure: [],
      createdById: user?.id,
      createdByName: user?.name
    };
    createItem(newCourse);
    setLastSaved(new Date());
    return newId;
  };

  const updateModules = (courseId: string, modules: CourseModule[]) => {
    updateCourse(courseId, { modules });
  };

  const saveCourse = (course: BuilderCourse) => {
    updateCourse(course.id, course);
  };

  const submitForReview = (courseId: string) => {
    submitItemForReview(courseId);
  };

  const publishCourse = (courseId: string) => {
    approveItem(courseId);
  };

  const rejectCourse = (courseId: string, notes: string) => {
    rejectItem(courseId, notes);
  };

  return (
    <CourseBuilderContext.Provider value={{
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
      lastSaved
    }}>
      {children}
    </CourseBuilderContext.Provider>
  );
};

export const useCourseBuilder = () => {
  const context = useContext(CourseBuilderContext);
  if (!context) throw new Error('useCourseBuilder must be used within CourseBuilderProvider');
  return context;
};
