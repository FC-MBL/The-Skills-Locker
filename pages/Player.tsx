import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useStore } from '../store';
import { Button, Toast } from '../components/UI';
import { CheckCircle, Play, FileText, Activity, ChevronLeft, ArrowRight } from 'lucide-react';

export const Player = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, modules, user, getEnrollment, completeByte, completeModule } = useStore();
  const [showToast, setShowToast] = useState(false);
  
  const item = items.find(i => i.id === id);
  if (!item) return <div>Not Found</div>;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const isContributor = user?.role === 'CONTRIBUTOR';
  const canViewDraft = isAdmin || (isContributor && item.createdById === user?.id);
  if (item.status !== 'PUBLISHED' && !canViewDraft) {
    return <div className="p-8 text-slate-600">This course is not published yet.</div>;
  }

  const enrollment = getEnrollment(item.id);
  const structuredModules = (item.contentStructure || []).map((mod, index) => ({
    id: mod.id,
    itemId: item.id,
    title: mod.title,
    order: mod.order ?? index,
    type: 'READING' as const,
    estimatedMinutes: Math.max(10, mod.lessons.length * 10)
  }));
  const courseModules = (structuredModules.length > 0 ? structuredModules : modules.filter(m => m.itemId === item.id))
    .sort((a,b) => a.order - b.order);

  // Simple Byte Player
  if (item.tier === 'BYTE') {
      const handleComplete = () => {
          completeByte(item.id);
          setShowToast(true);
          setTimeout(() => navigate('/dashboard'), 2000);
      };

      return (
          <div className="max-w-4xl mx-auto px-4 py-8">
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 font-bold mb-6 hover:text-primary"><ChevronLeft size={20}/> Exit</Link>
              
              <div className="aspect-video bg-black rounded-xl mb-8 flex items-center justify-center relative group cursor-pointer">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm group-hover:scale-110 transition">
                      <Play size={40} className="text-white ml-1" fill="white" />
                  </div>
                  <p className="absolute bottom-4 text-white opacity-50 text-sm">Video Player Placeholder</p>
              </div>

              <h1 className="text-3xl font-display uppercase mb-4">{item.title}</h1>
              <p className="text-slate-600 mb-8">{item.description}</p>

              <div className="bg-blue-50 p-6 rounded-xl border border-blue-100 mb-8">
                  <h3 className="font-bold uppercase text-blue-900 mb-2">Reflection Prompt</h3>
                  <p className="text-blue-800 mb-4">How can you apply this concept to your next client session?</p>
                  <textarea className="w-full p-3 rounded-lg border-blue-200" rows={3} placeholder="Write your thoughts..."></textarea>
              </div>

              <div className="flex justify-end">
                   {enrollment?.status === 'COMPLETED' ? (
                       <Button variant="secondary" disabled>Completed</Button>
                   ) : (
                       <Button onClick={handleComplete}>Mark Complete</Button>
                   )}
              </div>
              {showToast && <Toast message="Course Completed! +100 XP" onClose={() => setShowToast(false)} />}
          </div>
      )
  }

  // Multi-Module Player (Short/Micro)
  if (courseModules.length === 0) {
      return <div className="p-8 text-slate-600">Course content is being prepared.</div>;
  }
  const isModulesComplete = enrollment && enrollment.completedModuleIds.length === courseModules.length;

  return (
      <div className="flex flex-col md:flex-row min-h-[calc(100vh-80px)]">
          {/* Sidebar */}
          <div className="w-full md:w-80 bg-white border-r border-slate-200 p-6">
              <Link to="/dashboard" className="flex items-center gap-2 text-slate-500 font-bold mb-8 hover:text-primary"><ChevronLeft size={20}/> Dashboard</Link>
              <h2 className="font-display uppercase text-lg mb-6">{item.title}</h2>
              <div className="space-y-2">
                  {courseModules.map(m => {
                      const isDone = enrollment?.completedModuleIds.includes(m.id);
                      return (
                          <div 
                            key={m.id} 
                            onClick={() => !isDone && completeModule(item.id, m.id)}
                            className={`p-3 rounded-lg border flex items-center gap-3 cursor-pointer transition-colors ${isDone ? 'bg-green-50 border-green-200' : 'hover:bg-slate-50 border-slate-200'}`}
                          >
                              {isDone ? <CheckCircle size={20} className="text-green-600" /> : <div className="w-5 h-5 rounded-full border-2 border-slate-300"></div>}
                              <div className="flex-1">
                                  <p className={`text-sm font-bold ${isDone ? 'text-green-800' : 'text-slate-700'}`}>{m.title}</p>
                                  <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 uppercase">
                                     {m.type === 'VIDEO' ? <Play size={10} /> : m.type === 'READING' ? <FileText size={10} /> : <Activity size={10} />}
                                     {m.type} • {m.estimatedMinutes}m
                                  </div>
                              </div>
                          </div>
                      )
                  })}
              </div>
              
              <div className="mt-8 pt-6 border-t">
                  <p className="text-xs font-bold uppercase text-slate-400 mb-2">Next Step</p>
                  {isModulesComplete ? (
                      <Link to={`/assessment/${item.id}`}>
                          <Button fullWidth variant="secondary" className="flex justify-between items-center">
                              Take Assessment <ArrowRight size={16} />
                          </Button>
                      </Link>
                  ) : (
                      <div className="text-sm text-slate-500 italic">Complete all modules to unlock assessment.</div>
                  )}
              </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 bg-slate-50 p-8 flex items-center justify-center">
              <div className="text-center opacity-40">
                  <Play size={64} className="mx-auto mb-4" />
                  <h3 className="text-2xl font-bold">Select a module to begin</h3>
                  <p>Content would be rendered here.</p>
              </div>
          </div>
      </div>
  );
};
