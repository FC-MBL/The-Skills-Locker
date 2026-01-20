import React, { useState } from 'react';
import { useStore } from '../../store';
import { Card, Button } from '../../components/UI';
import { Users, Calendar, Plus, Archive } from 'lucide-react';
import { Cohort, User } from '../../types';

export const UsersCohorts = () => {
  const { cohorts, createCohort, updateCohort } = useStore();
  const [activeTab, setActiveTab] = useState<'COHORTS' | 'USERS'>('COHORTS');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Mock Users List for Display
  const [mockUsers] = useState<User[]>([
      { id: 'u1', name: 'Alex Learner', email: 'alex@test.com', role: 'LEARNER' },
      { id: 'u2', name: 'Sarah Admin', email: 'sarah@skills.com', role: 'ADMIN' },
      { id: 'u3', name: 'Mike Editor', email: 'mike@skills.com', role: 'EDITOR' },
  ]);

  const handleCreateCohort = (e: React.FormEvent) => {
      e.preventDefault();
      const form = e.target as HTMLFormElement;
      createCohort({
          id: `c_${Date.now()}`,
          name: (form.elements.namedItem('name') as HTMLInputElement).value,
          startDate: (form.elements.namedItem('startDate') as HTMLInputElement).value,
          status: 'UPCOMING',
          courseIds: [],
          userIds: []
      });
      setIsModalOpen(false);
  };

  return (
    <div className="p-8">
        <h1 className="text-3xl font-display uppercase text-slate-900 mb-8">Users & Cohorts</h1>
        
        <div className="flex gap-4 mb-8 border-b border-slate-200">
            <button 
              onClick={() => setActiveTab('COHORTS')}
              className={`pb-3 px-4 font-bold uppercase ${activeTab === 'COHORTS' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}
            >
                Cohorts
            </button>
            <button 
              onClick={() => setActiveTab('USERS')}
              className={`pb-3 px-4 font-bold uppercase ${activeTab === 'USERS' ? 'text-primary border-b-2 border-primary' : 'text-slate-400'}`}
            >
                Users & Roles
            </button>
        </div>

        {activeTab === 'COHORTS' && (
            <div>
                <div className="flex justify-end mb-6">
                    <Button onClick={() => setIsModalOpen(true)} className="flex gap-2 items-center"><Plus size={18}/> New Cohort</Button>
                </div>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cohorts.map(cohort => (
                        <Card key={cohort.id} className="p-6 relative">
                            <div className={`absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded uppercase ${cohort.status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                {cohort.status}
                            </div>
                            <h3 className="text-xl font-bold mb-1">{cohort.name}</h3>
                            <div className="text-sm text-slate-500 flex items-center gap-2 mb-4">
                                <Calendar size={14} /> Starts: {cohort.startDate}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 mb-4 py-4 border-y border-slate-100">
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Learners</p>
                                    <p className="text-xl font-bold">{cohort.userIds.length}</p>
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 uppercase font-bold">Courses</p>
                                    <p className="text-xl font-bold">{cohort.courseIds.length}</p>
                                </div>
                            </div>
                            
                            <div className="flex justify-end gap-2">
                                <button className="text-xs font-bold text-slate-500 hover:text-primary">Manage Learners</button>
                            </div>
                        </Card>
                    ))}
                </div>
            </div>
        )}

        {activeTab === 'USERS' && (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-xs font-bold uppercase text-slate-500">
                        <tr>
                            <th className="px-6 py-4">User</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {mockUsers.map(user => (
                            <tr key={user.id}>
                                <td className="px-6 py-4">
                                    <p className="font-bold text-slate-900">{user.name}</p>
                                    <p className="text-xs text-slate-500">{user.email}</p>
                                </td>
                                <td className="px-6 py-4">
                                    <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold uppercase">{user.role}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button className="text-slate-400 hover:text-primary">Edit</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

        {/* Modal */}
        {isModalOpen && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-white p-6 rounded-xl w-full max-w-md">
                    <h2 className="text-2xl font-bold mb-4">Create Cohort</h2>
                    <form onSubmit={handleCreateCohort} className="space-y-4">
                        <div>
                            <label className="block text-sm font-bold mb-1">Cohort Name</label>
                            <input name="name" required className="w-full border rounded p-2" placeholder="e.g. Spring Intake 2024" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold mb-1">Start Date</label>
                            <input name="startDate" type="date" required className="w-full border rounded p-2" />
                        </div>
                        <div className="flex justify-end gap-2 mt-6">
                            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
                            <Button type="submit">Create</Button>
                        </div>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
};