import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourseBuilder } from '../../context/CourseBuilderContext';
import { useStore } from '../../store';
import { DOMAINS } from '../../data';
import { Button, Badge, Card, Input, Select } from '../../components/builder/UI';
import { Search, Plus, Edit3, Layout, Send, Award, Clock, Trash2 } from 'lucide-react';

export const BuilderDashboard: React.FC = () => {
  const { courses, user, createCourse, submitForReview } = useCourseBuilder();
  const { deleteItem } = useStore();
  const navigate = useNavigate();
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterBranch, setFilterBranch] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');

  const handleCreate = () => {
    const id = createCourse();
    navigate(`/contribute/${id}/metadata`);
  };

  const contributorCourses = courses.filter(c => c.createdById === user?.id);
  const filteredCourses = contributorCourses.filter(c => {
    const matchStatus = filterStatus === 'ALL' || c.status === filterStatus;
    const matchBranch = filterBranch === 'ALL' || c.domainId === filterBranch;
    const matchSearch = c.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchStatus && matchBranch && matchSearch;
  });

  const getDomainName = (id: string) => DOMAINS.find(d => d.id === id)?.name || 'Unknown';

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
        <div>
          <h1 className="text-5xl font-display text-navy mb-2">Contributor Studio</h1>
          <p className="text-xl text-gray-500 font-medium">Build a course athletes will remember.</p>
        </div>
        <Button onClick={handleCreate} size="lg" icon={Plus}>New Course</Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-4 rounded-xl shadow-sm border border-gray-200">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3.5 text-gray-400" size={20} />
          <Input
            placeholder="Search courses..."
            className="pl-10 border-none bg-gray-50"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full md:w-56">
          <Select
            value={filterBranch}
            onChange={(e) => setFilterBranch(e.target.value)}
            className="bg-gray-50 border-none"
          >
            <option value="ALL">All Branches</option>
            {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
          </Select>
        </div>
        <div className="w-full md:w-48">
          <Select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="bg-gray-50 border-none"
          >
            <option value="ALL">All Status</option>
            <option value="DRAFT">Draft</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="PUBLISHED">Published</option>
          </Select>
        </div>
      </div>

      {/* Grid */}
      {filteredCourses.length === 0 ? (
        <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-300">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
            <Layout size={32} />
          </div>
          <h3 className="text-xl font-bold text-navy mb-2">No courses yet</h3>
          <p className="text-gray-500 mb-6">Start your first build and share your knowledge.</p>
          <Button onClick={handleCreate} variant="outline">Create Course</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map(course => (
            <Card key={course.id} className="flex flex-col h-full group">
              <div className="relative h-48 bg-gray-200 overflow-hidden">
                <img src={course.image} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-4 left-4 flex gap-2">
                  <Badge variant={
                    course.status === 'DRAFT' ? 'draft' :
                      course.status === 'IN_REVIEW' ? 'review' : 'published'
                  }>
                    {course.status.replace('_', ' ')}
                  </Badge>
                  {course.accredited && (
                    <Badge variant="accredited">
                      <Award size={12} /> Accredited
                    </Badge>
                  )}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-bold text-blue tracking-wider uppercase">{getDomainName(course.domainId)}</span>
                  <span className="flex items-center gap-1 text-xs font-bold text-gray-500 uppercase">
                    <Clock size={12} /> {course.durationLabel}
                  </span>
                </div>

                <h3 className="text-2xl font-display text-navy mb-2 leading-tight">{course.title}</h3>
                <p className="text-gray-600 text-sm mb-6 line-clamp-2">{course.description || "No description provided."}</p>

                <div className="mt-auto pt-6 border-t border-gray-100 flex justify-between items-center">
                  <div className="grid grid-cols-3 gap-2 flex-1">
                    <button
                      onClick={() => navigate(`/contribute/${course.id}/metadata`)}
                      className="flex flex-col items-center justify-center gap-1 text-xs font-bold text-gray-500 hover:text-blue transition-colors py-2 rounded hover:bg-blue-50"
                    >
                      <Edit3 size={16} />
                      METADATA
                    </button>
                    <button
                      onClick={() => navigate(`/contribute/${course.id}/structure`)}
                      className="flex flex-col items-center justify-center gap-1 text-xs font-bold text-gray-500 hover:text-blue transition-colors py-2 rounded hover:bg-blue-50"
                    >
                      <Layout size={16} />
                      BUILDER
                    </button>
                    <button
                      onClick={() => submitForReview(course.id)}
                      className={`flex flex-col items-center justify-center gap-1 text-xs font-bold transition-colors py-2 rounded hover:bg-gray-50 ${course.status === 'PUBLISHED' ? 'text-green-600 opacity-50 cursor-default' : 'text-gray-500 hover:text-red'}`}
                      disabled={course.status === 'PUBLISHED'}
                    >
                      <Send size={16} />
                      {course.status === 'PUBLISHED' ? 'LIVE' : 'SUBMIT'}
                    </button>
                  </div>
                  {course.status === 'DRAFT' && (
                    <button
                      onClick={() => {
                        if (window.confirm('Are you sure you want to delete this draft course?')) {
                          deleteItem(course.id);
                        }
                      }}
                      className="ml-2 p-2 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete Draft"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
