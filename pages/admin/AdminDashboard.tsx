import React from 'react';
import { useStore } from '../../store';
import { Card } from '../../components/UI';
import { Book, Users, CheckCircle, AlertCircle } from 'lucide-react';

export const AdminDashboard = () => {
  const { items, enrollments, cohorts } = useStore();

  const published = items.filter(i => i.status === 'PUBLISHED').length;
  const draft = items.filter(i => i.status === 'DRAFT').length;
  const activeCohorts = cohorts.filter(c => c.status === 'ACTIVE').length;
  
  return (
    <div className="p-8">
      <h1 className="text-3xl font-display uppercase text-slate-900 mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
         <Card className="p-6 border-l-4 border-blue-500">
             <div className="flex justify-between items-start">
                 <div>
                     <p className="text-slate-500 text-xs font-bold uppercase mb-1">Total Courses</p>
                     <h3 className="text-3xl font-bold">{items.length}</h3>
                 </div>
                 <Book className="text-blue-500" />
             </div>
             <div className="mt-4 text-xs text-slate-400">
                 {published} Published • {draft} Drafts
             </div>
         </Card>

         <Card className="p-6 border-l-4 border-green-500">
             <div className="flex justify-between items-start">
                 <div>
                     <p className="text-slate-500 text-xs font-bold uppercase mb-1">Active Enrollments</p>
                     <h3 className="text-3xl font-bold">{enrollments.length}</h3>
                 </div>
                 <Users className="text-green-500" />
             </div>
             <div className="mt-4 text-xs text-slate-400">
                 Across {activeCohorts} Active Cohorts
             </div>
         </Card>

         <Card className="p-6 border-l-4 border-purple-500">
             <div className="flex justify-between items-start">
                 <div>
                     <p className="text-slate-500 text-xs font-bold uppercase mb-1">Completions</p>
                     <h3 className="text-3xl font-bold">{enrollments.filter(e => e.status === 'COMPLETED').length}</h3>
                 </div>
                 <CheckCircle className="text-purple-500" />
             </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Recent Activity</h3>
              <div className="space-y-4">
                  <p className="text-slate-500 italic text-sm">No recent activity logs available.</p>
              </div>
          </Card>

          <Card className="p-6">
              <h3 className="font-bold text-lg mb-4">Draft Courses</h3>
              <div className="space-y-3">
                  {items.filter(i => i.status === 'DRAFT').length > 0 ? (
                      items.filter(i => i.status === 'DRAFT').slice(0,5).map(i => (
                          <div key={i.id} className="flex justify-between items-center p-3 bg-slate-50 rounded">
                              <span className="font-medium">{i.title}</span>
                              <span className="text-xs bg-gray-200 px-2 py-1 rounded">Draft</span>
                          </div>
                      ))
                  ) : (
                      <p className="text-slate-500 text-sm">No courses in draft.</p>
                  )}
              </div>
          </Card>
      </div>
    </div>
  );
};