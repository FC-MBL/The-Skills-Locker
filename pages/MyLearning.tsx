import React, { useState } from 'react';
import { useStore } from '../store';
import { Card, Badge, Button, ProgressBar } from '../components/UI';
import { Link } from 'react-router-dom';
import { Play } from 'lucide-react';

export const MyLearning = () => {
  const { enrollments, items } = useStore();
  const [tab, setTab] = useState<'IN_PROGRESS' | 'COMPLETED'>('IN_PROGRESS');

  const filtered = enrollments.filter(e => 
      tab === 'IN_PROGRESS' 
      ? (e.status === 'IN_PROGRESS' || e.status === 'ENROLLED') 
      : e.status === 'COMPLETED'
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-display uppercase mb-8">My Learning</h1>

      {/* Tabs */}
      <div className="flex gap-8 border-b border-slate-200 mb-8">
        <button 
          onClick={() => setTab('IN_PROGRESS')}
          className={`pb-4 font-bold uppercase tracking-wide transition-colors ${tab === 'IN_PROGRESS' ? 'text-primary border-b-4 border-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
            In Progress ({enrollments.filter(e => e.status !== 'COMPLETED').length})
        </button>
        <button 
          onClick={() => setTab('COMPLETED')}
          className={`pb-4 font-bold uppercase tracking-wide transition-colors ${tab === 'COMPLETED' ? 'text-primary border-b-4 border-primary' : 'text-slate-400 hover:text-slate-600'}`}
        >
            Completed ({enrollments.filter(e => e.status === 'COMPLETED').length})
        </button>
      </div>

      <div className="grid gap-6">
        {filtered.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-500 mb-4">No courses found in this tab.</p>
                <Link to="/catalogue"><Button>Browse Courses</Button></Link>
            </div>
        ) : (
            filtered.map(enrollment => {
                const item = items.find(i => i.id === enrollment.itemId);
                if (!item) return null;

                return (
                    <Card key={item.id} className="flex flex-col md:flex-row p-4 md:p-6 gap-6 items-center">
                        <div className="w-full md:w-48 h-32 rounded-lg overflow-hidden flex-shrink-0">
                            <img src={item.image} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-grow w-full">
                            <div className="flex items-center gap-2 mb-2">
                                <Badge tier={item.tier} />
                                {enrollment.credentialIssued && <span className="bg-green-100 text-green-800 text-[10px] font-bold px-2 py-1 rounded uppercase">Credential Earned</span>}
                            </div>
                            <h3 className="text-xl font-bold mb-2">{item.title}</h3>
                            <div className="w-full max-w-md mb-4">
                                <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                                    <span>Progress</span>
                                    <span>{enrollment.progressPercent}%</span>
                                </div>
                                <ProgressBar progress={enrollment.progressPercent} />
                            </div>
                        </div>
                        <div className="flex-shrink-0 w-full md:w-auto">
                            {tab === 'IN_PROGRESS' ? (
                                <Link to={`/learn/${item.id}`}>
                                    <Button fullWidth className="flex items-center justify-center gap-2">
                                        <Play size={16} /> Continue
                                    </Button>
                                </Link>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <Link to={`/items/${item.id}`}><Button variant="outline" fullWidth size="sm">Review</Button></Link>
                                    {enrollment.credentialIssued && (
                                        <Link to={`/credential/${item.id}`}><Button variant="secondary" fullWidth size="sm">View Credential</Button></Link>
                                    )}
                                </div>
                            )}
                        </div>
                    </Card>
                )
            })
        )}
      </div>
    </div>
  );
};
