import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { ITEMS } from '../data';
import { useStore } from '../store';
import { Button } from '../components/UI';
import { Share2, Download, Linkedin } from 'lucide-react';

export const Credential = () => {
  const { id } = useParams<{ id: string }>();
  const { user, getEnrollment } = useStore();
  const item = ITEMS.find(i => i.id === id);

  if (!item || !user) return <div>Data missing</div>;
  const enrollment = getEnrollment(item.id);

  return (
    <div className="min-h-[calc(100vh-80px)] bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
            
            {/* Certificate Card */}
            <div className="bg-white p-8 rounded-2xl shadow-2xl border-t-8 border-secondary relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/1667px-Apple_logo_black.svg.png" className="w-24" /> 
                </div>

                <div className="text-center py-10 border-b-2 border-dashed border-slate-200">
                    <h1 className="font-display uppercase text-3xl text-slate-900 mb-2">Certificate of Achievement</h1>
                    <p className="text-slate-500 uppercase text-xs tracking-widest">This certifies that</p>
                </div>

                <div className="text-center py-10">
                    <h2 className="font-display text-4xl text-primary mb-6">{user.name}</h2>
                    <p className="text-slate-500 mb-2">Has successfully completed the {item.tier === 'MICROCRED' ? 'Micro-Credential' : 'Short Course'}</p>
                    <h3 className="text-2xl font-bold uppercase">{item.title}</h3>
                </div>

                <div className="flex justify-between items-end pt-8">
                    <div className="text-left">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Issued</p>
                        <p className="font-mono text-sm">{new Date(enrollment?.completedAt || Date.now()).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] text-slate-400 uppercase font-bold">Credential ID</p>
                        <p className="font-mono text-sm">SL-{Math.random().toString(36).substr(2, 9).toUpperCase()}</p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col justify-center space-y-6">
                <div className="text-center md:text-left">
                    <h2 className="text-4xl font-display text-slate-900 uppercase leading-none mb-4">You did it,<br/><span className="text-primary">Legend!</span></h2>
                    <p className="text-slate-600">Show off your new skills. Sharing your credential on LinkedIn increases profile views by 6x.</p>
                </div>

                <div className="space-y-3">
                    <Button fullWidth className="bg-[#0077b5] hover:bg-[#006396] text-white flex items-center justify-center gap-2">
                        <Linkedin size={20} /> Add to LinkedIn
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                        <Button variant="outline" className="flex items-center justify-center gap-2">
                             <Download size={18} /> PDF
                        </Button>
                        <Button variant="outline" className="flex items-center justify-center gap-2">
                             <Share2 size={18} /> Share
                        </Button>
                    </div>
                </div>

                <div className="pt-6 border-t border-slate-300">
                    <Link to="/dashboard">
                        <Button variant="ghost" fullWidth>Back to Dashboard</Button>
                    </Link>
                </div>
            </div>

        </div>
    </div>
  );
};