import React, { useState } from 'react';
import { DOMAINS } from '../data';
import { useStore } from '../store';
import { Link } from 'react-router-dom';
import { Lock, CheckCircle, Circle } from 'lucide-react';
import { Card, Badge } from '../components/UI';
import { Item } from '../types';

const ItemNode: React.FC<{ item: Item }> = ({ item }) => {
  const { checkPrerequisites, getEnrollment } = useStore();
  const isUnlocked = checkPrerequisites(item.id);
  const enrollment = getEnrollment(item.id);
  const isCompleted = enrollment?.status === 'COMPLETED';

  return (
    <Link 
      to={isUnlocked ? `/items/${item.id}` : '#'} 
      className={`relative flex flex-col items-center p-4 w-64 text-center transition-all ${isUnlocked ? 'hover:scale-105' : 'opacity-60 cursor-not-allowed'}`}
    >
      <div className={`w-16 h-16 rounded-full flex items-center justify-center border-4 mb-3 bg-white z-10 
        ${isCompleted ? 'border-green-500 text-green-500' : isUnlocked ? 'border-primary text-primary' : 'border-slate-300 text-slate-300'}`}>
        {isCompleted ? <CheckCircle size={32} /> : isUnlocked ? <Circle size={32} /> : <Lock size={24} />}
      </div>
      <div className="bg-white p-4 rounded-xl shadow-md border w-full">
          <Badge tier={item.tier} className="mb-2 inline-block" />
          <h4 className="font-bold text-sm mb-1">{item.title}</h4>
          {!isUnlocked && <p className="text-[10px] text-red-500 font-bold uppercase">Locked: Prereqs Missing</p>}
      </div>
    </Link>
  );
};

export const SkillTree = () => {
  const [selectedDomain, setSelectedDomain] = useState<string>(DOMAINS[0].id);

  const domain = DOMAINS.find(d => d.id === selectedDomain);
  const { items } = useStore();
  const domainItems = items.filter(i => i.status === 'PUBLISHED' && i.domainId === selectedDomain);

  // Group by Tier
  const bytes = domainItems.filter(i => i.tier === 'BYTE');
  const micros = domainItems.filter(i => i.tier === 'MICROCRED');
  const shorts = domainItems.filter(i => i.tier === 'SHORT');

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h1 className="text-4xl font-display uppercase text-slate-900 mb-8">Skill Tree</h1>

      {/* Domain Selection */}
      <div className="flex overflow-x-auto gap-4 mb-12 pb-4">
        {DOMAINS.map(d => (
          <button
            key={d.id}
            onClick={() => setSelectedDomain(d.id)}
            className={`flex-shrink-0 px-6 py-4 rounded-xl border-2 font-bold uppercase tracking-wide transition-all ${
              selectedDomain === d.id 
              ? 'border-primary bg-primary text-white shadow-lg' 
              : 'border-slate-200 bg-white text-slate-500 hover:border-primary'
            }`}
          >
            {d.name}
          </button>
        ))}
      </div>

      {/* Ladder View */}
      <div className="relative min-h-[600px] flex flex-col items-center gap-16 py-10 bg-slate-50 rounded-3xl border border-dashed border-slate-300">
        
        {/* Connector Line */}
        <div className="absolute top-10 bottom-10 w-1 bg-slate-200 left-1/2 transform -translate-x-1/2 z-0"></div>

        {/* Level 3: Short Courses */}
        <div className="z-10 flex flex-col items-center">
            <h3 className="bg-slate-900 text-white px-4 py-1 rounded-full text-xs font-bold uppercase mb-4">Mastery Level</h3>
            <div className="flex gap-8 flex-wrap justify-center">
               {shorts.map(i => <ItemNode key={i.id} item={i} />)}
            </div>
        </div>

        {/* Level 2: Microcreds */}
        <div className="z-10 flex flex-col items-center">
            <h3 className="bg-slate-200 text-slate-600 px-4 py-1 rounded-full text-xs font-bold uppercase mb-4">Intermediate Level</h3>
            <div className="flex gap-8 flex-wrap justify-center">
               {micros.map(i => <ItemNode key={i.id} item={i} />)}
            </div>
        </div>

        {/* Level 1: Bytes */}
        <div className="z-10 flex flex-col items-center">
             <h3 className="bg-slate-200 text-slate-600 px-4 py-1 rounded-full text-xs font-bold uppercase mb-4">Foundation Level</h3>
             <div className="flex gap-8 flex-wrap justify-center">
               {bytes.map(i => <ItemNode key={i.id} item={i} />)}
            </div>
        </div>

      </div>
    </div>
  );
};
