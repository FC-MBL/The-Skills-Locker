import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { Badge, Button, Card } from '../components/UI';
import { Check, X, Eye, FileText } from 'lucide-react';

export const AdminSubmissions: React.FC = () => {
  const { courses, publishCourse, rejectCourse } = useCourse();
  const navigate = useNavigate();

  const submissions = courses.filter(c => c.status === 'IN_REVIEW');

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
       <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-4xl font-display text-navy mb-1">Course Submissions</h1>
                <p className="text-gray-500">Review and approve content for the catalogue.</p>
            </div>
            <Button variant="outline" onClick={() => navigate('/')}>Back to Dashboard</Button>
       </div>

       <div className="space-y-4">
           {submissions.length === 0 ? (
               <div className="text-center py-20 bg-white rounded-xl border border-gray-200">
                   <p className="text-gray-400 font-bold uppercase">No pending submissions</p>
               </div>
           ) : (
               submissions.map(course => (
                   <Card key={course.id} className="p-6 flex flex-col md:flex-row md:items-center gap-6">
                       <div className="w-24 h-24 bg-gray-200 rounded-lg flex-none overflow-hidden">
                           <img src={course.image} className="w-full h-full object-cover" alt="" />
                       </div>
                       
                       <div className="flex-1">
                           <div className="flex items-center gap-2 mb-2">
                               <Badge variant="review">In Review</Badge>
                               <span className="text-xs font-bold text-gray-400 uppercase">
                                   Submitted {new Date(course.submittedAt || '').toLocaleDateString()}
                               </span>
                           </div>
                           <h3 className="text-xl font-display text-navy mb-1">{course.title}</h3>
                           <p className="text-sm text-gray-600">by {course.createdByName}</p>
                       </div>

                       <div className="flex items-center gap-3">
                           <Button variant="ghost" size="sm" icon={FileText} onClick={() => navigate(`/editor/${course.id}/metadata`)}>Metadata</Button>
                           <Button variant="ghost" size="sm" icon={Eye} onClick={() => navigate(`/editor/${course.id}/structure`)}>Preview</Button>
                           <div className="w-px h-8 bg-gray-200 mx-2"></div>
                           <button 
                                onClick={() => rejectCourse(course.id, 'Changes requested by admin.')}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title="Reject"
                            >
                               <X size={20} />
                           </button>
                           <button 
                                onClick={() => publishCourse(course.id)}
                                className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                title="Approve"
                           >
                               <Check size={20} />
                           </button>
                       </div>
                   </Card>
               ))
           )}
       </div>
    </div>
  );
};