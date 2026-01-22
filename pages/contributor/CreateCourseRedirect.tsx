import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseBuilder } from '../../context/CourseBuilderContext';

export const CreateCourseRedirect: React.FC = () => {
  const navigate = useNavigate();
  const { createCourse } = useCourseBuilder();

  useEffect(() => {
    const id = createCourse();
    navigate(`/contribute/${id}/metadata`, { replace: true });
  }, [createCourse, navigate]);

  return <div className="p-8 text-gray-500">Creating course...</div>;
};
