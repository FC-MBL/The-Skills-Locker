import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useStore } from '../store';
import { Badge, Button, Card } from '../components/UI';
import { Clock, Check, Lock, Award, Play } from 'lucide-react';

export const ItemDetail = () => {
  const { id } = useParams<{ id: string }>();
  const { items, user, enroll, getEnrollment, checkPrerequisites } = useStore();
  const item = items.find(i => i.id === id);

  if (!item) return <div>Item not found</div>;
  const isAdmin = user?.role === 'ADMIN' || user?.role === 'EDITOR';
  const isContributor = user?.role === 'CONTRIBUTOR';
  const canViewDraft = isAdmin || (isContributor && item.createdById === user?.id);
  if (item.status !== 'PUBLISHED' && !canViewDraft) {
    return <div className="p-8 text-slate-600">This course is not published yet.</div>;
  }

  const enrollment = getEnrollment(item.id);
  const isUnlocked = checkPrerequisites(item.id);
  const isEnrolled = !!enrollment;

  const handleEnroll = () => {
    enroll(item.id);
  };

  return (
    <div className="bg-bgLight min-h-[calc(100vh-80px)]">
      {/* Banner */}
      <div className="bg-slate-900 text-white py-12 px-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-1/2 h-full opacity-20">
            <img src={item.image} className="w-full h-full object-cover mix-blend-overlay" />
        </div>
        <div className="max-w-5xl mx-auto relative z-10">
           <div className="flex gap-2 mb-4">
              <Badge tier={item.tier} />
              {item.accredited && <span className="bg-yellow-400 text-black px-2 py-1 rounded text-[10px] font-bold uppercase">Accredited</span>}
           </div>
           <h1 className="text-4xl md:text-5xl font-display uppercase tracking-tight mb-4">{item.title}</h1>
           <p className="text-xl text-slate-300 max-w-2xl">{item.description}</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8 grid md:grid-cols-3 gap-8 -mt-10 relative z-20">
        
        {/* Main Content */}
        <div className="md:col-span-2 space-y-8">
           <Card className="p-6">
              <h3 className="font-display uppercase text-lg mb-4">What you'll learn</h3>
              <ul className="grid gap-3">
                 {item.outcomes.map((o, i) => (
                    <li key={i} className="flex gap-3 items-start">
                        <div className="bg-green-100 p-1 rounded-full text-green-600 mt-1"><Check size={14} /></div>
                        <span className="text-slate-700">{o}</span>
                    </li>
                 ))}
              </ul>
           </Card>

           {item.prerequisites.length > 0 && (
              <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl">
                 <h3 className="font-display uppercase text-lg mb-4 text-blue-900">Prerequisites</h3>
                 <div className="flex gap-4">
                    {item.prerequisites.map(pid => {
                        const pItem = items.find(i => i.id === pid);
                        return (
                            <div key={pid} className="flex items-center gap-3 bg-white p-3 rounded-lg shadow-sm">
                                <span className="text-sm font-bold">{pItem?.title}</span>
                                {getEnrollment(pid)?.status === 'COMPLETED' ? <Check size={16} className="text-green-500" /> : <Lock size={16} className="text-slate-400" />}
                            </div>
                        )
                    })}
                 </div>
              </div>
           )}
        </div>

        {/* Action Sidebar */}
        <div className="md:col-span-1">
           <Card className="p-6 sticky top-24">
              <div className="text-3xl font-bold mb-6 text-slate-900">
                  {item.price === 0 ? 'Free' : `$${item.price}`}
              </div>

              {isEnrolled ? (
                  <div className="space-y-4">
                     {enrollment?.status === 'COMPLETED' ? (
                        <>
                           <div className="bg-green-100 text-green-800 p-3 rounded-lg text-center font-bold mb-4">
                              Course Completed!
                           </div>
                           {enrollment.credentialIssued && (
                               <Link to={`/credential/${item.id}`}>
                                  <Button fullWidth variant="secondary" className="mb-2">View Credential</Button>
                               </Link>
                           )}
                           <Link to={`/learn/${item.id}`}>
                              <Button fullWidth variant="outline">Review Content</Button>
                           </Link>
                        </>
                     ) : (
                        <Link to={`/learn/${item.id}`}>
                           <Button fullWidth className="flex justify-center items-center gap-2">
                              Continue Learning <Play size={16} />
                           </Button>
                        </Link>
                     )}
                  </div>
              ) : (
                  <Button 
                    fullWidth 
                    onClick={handleEnroll} 
                    disabled={!isUnlocked}
                    variant={!isUnlocked ? 'ghost' : 'primary'}
                  >
                     {!isUnlocked ? 'Locked' : 'Enroll Now'}
                  </Button>
              )}

              <div className="mt-6 space-y-3 pt-6 border-t">
                  <div className="flex items-center gap-3 text-sm text-slate-600">
                      <Clock size={18} /> <span>{item.durationLabel}</span>
                  </div>
                  {item.accredited && (
                      <div className="flex items-center gap-3 text-sm text-slate-600">
                          <Award size={18} /> <span>Official Certification</span>
                      </div>
                  )}
              </div>
           </Card>
        </div>

      </div>
    </div>
  );
};
