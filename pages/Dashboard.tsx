import React from 'react';
import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { Button, Card, ProgressRing, Badge } from '../components/UI';
import { Play, Award, Zap } from 'lucide-react';

export const Dashboard = () => {
  const { user, enrollments, items } = useStore();

  const activeEnrollments = enrollments.filter(e => e.status === 'IN_PROGRESS' || e.status === 'ENROLLED');
  const completedEnrollments = enrollments.filter(e => e.status === 'COMPLETED');
  
  // XP Calculation Mock
  const xp = completedEnrollments.length * 500 + activeEnrollments.reduce((acc, curr) => acc + curr.progressPercent, 0);

  return (
    <div className="bg-bgLight min-h-full pb-12">
      {/* Hero Header */}
      <div className="bg-primary pt-10 pb-20 px-4">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl md:text-6xl text-white font-display uppercase tracking-tighter mb-4">
            Welcome Back, <br/>
            <span className="text-secondary">{user?.name.split(' ')[0]}</span>
          </h1>
          <p className="text-blue-100 max-w-xl text-lg">
            You're currently on a <strong>3 day streak</strong>! You have {activeEnrollments.length} active courses and have earned {xp} XP.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-10 grid gap-8">
        {/* Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Active', value: activeEnrollments.length, icon: Zap, color: 'text-yellow-500' },
            { label: 'Completed', value: completedEnrollments.length, icon: Award, color: 'text-purple-500' },
            { label: 'XP', value: xp, icon: Zap, color: 'text-green-500' },
            { label: 'Level', value: Math.floor(xp / 1000) + 1, icon: Award, color: 'text-pink-500' },
          ].map((stat, i) => (
             <Card key={i} className="p-4 flex flex-col items-center justify-center text-center shadow-lg border-b-4 border-slate-200">
               <stat.icon className={`mb-2 ${stat.color}`} size={24} />
               <span className="text-3xl font-display">{stat.value}</span>
               <span className="text-xs font-bold uppercase text-slate-400">{stat.label}</span>
             </Card>
          ))}
        </div>

        {/* Continue Learning */}
        <section>
          <div className="flex justify-between items-end mb-6">
            <h2 className="text-2xl font-display uppercase text-slate-800">Continue Learning</h2>
            <Link to="/my-learning" className="text-primary font-bold text-sm hover:underline">View All</Link>
          </div>
          
          {activeEnrollments.length === 0 ? (
            <div className="bg-white p-8 rounded-xl text-center border-2 border-dashed border-slate-300">
              <h3 className="text-xl font-bold mb-2">Your locker is empty!</h3>
              <p className="text-slate-500 mb-6">Explore our catalogue to start your first course.</p>
              <Link to="/catalogue">
                <Button>Browse Catalogue</Button>
              </Link>
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-6">
              {activeEnrollments.slice(0, 3).map(enrollment => {
                const item = items.find(i => i.id === enrollment.itemId);
                if (!item) return null;
                return (
                  <Card key={item.id} className="flex flex-col h-full hover:-translate-y-1 transition-transform duration-300">
                    <div className="h-32 bg-slate-200 relative">
                       <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                       <div className="absolute top-3 right-3">
                         <ProgressRing progress={enrollment.progressPercent} size={40} stroke={3} />
                       </div>
                    </div>
                    <div className="p-5 flex-grow flex flex-col">
                      <div className="mb-2">
                        <Badge tier={item.tier} />
                      </div>
                      <h3 className="font-bold text-lg leading-tight mb-2">{item.title}</h3>
                      <p className="text-xs text-slate-500 mb-4">{item.durationLabel} remaining</p>
                      <div className="mt-auto">
                        <Link to={`/items/${item.id}`}>
                           <Button size="sm" fullWidth variant="secondary" className="flex items-center justify-center gap-2">
                             <Play size={14} /> Continue
                           </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Completed / Credentials */}
        {completedEnrollments.length > 0 && (
          <section>
             <h2 className="text-2xl font-display uppercase text-slate-800 mb-6">Your Credentials</h2>
             <div className="grid md:grid-cols-2 gap-4">
               {completedEnrollments.filter(e => e.credentialIssued).map(enrollment => {
                 const item = items.find(i => i.id === enrollment.itemId);
                 if(!item) return null;
                 return (
                   <div key={item.id} className="bg-slate-900 text-white p-6 rounded-xl flex items-center justify-between">
                      <div>
                        <h4 className="font-display text-lg mb-1">{item.title}</h4>
                        <p className="text-xs text-slate-400">Completed on {new Date(enrollment.completedAt || '').toLocaleDateString()}</p>
                      </div>
                      <Link to={`/credential/${item.id}`}>
                        <Button variant="primary" size="sm">View</Button>
                      </Link>
                   </div>
                 )
               })}
             </div>
          </section>
        )}
      </div>
    </div>
  );
};
