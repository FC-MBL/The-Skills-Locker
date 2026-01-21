import React from 'react';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import { Button, Card, Badge } from '../../components/UI';
import { DOMAINS } from '../../data';
import { Plus, Layers, Edit, Send } from 'lucide-react';

export const ContributorCourses = () => {
  const { user, items, submitItemForReview } = useStore();
  const myItems = items.filter(i => i.createdById === user?.id);

  const handleSubmit = (itemId: string) => {
    const notes = window.prompt('Add submission notes (optional):', '');
    submitItemForReview(itemId, notes || undefined);
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-display uppercase text-slate-900">Contributor Studio</h1>
          <p className="text-slate-500">Create courses and submit them for admin review.</p>
        </div>
        <Link to="/contribute/new">
          <Button className="flex items-center gap-2"><Plus size={18} /> New Course</Button>
        </Link>
      </div>

      <Card className="p-0 overflow-hidden border border-slate-200">
        <div className="bg-slate-50 px-6 py-4 text-xs font-bold uppercase text-slate-500 grid grid-cols-12 gap-4">
          <div className="col-span-5">Course</div>
          <div className="col-span-3">Domain</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-2 text-right">Actions</div>
        </div>
        <div className="divide-y divide-slate-100">
          {myItems.length === 0 ? (
            <div className="p-8 text-center text-slate-500">No courses yet. Start a new one.</div>
          ) : (
            myItems.map(item => {
              const domain = DOMAINS.find(d => d.id === item.domainId);
              return (
                <div key={item.id} className="px-6 py-4 grid grid-cols-12 gap-4 items-center">
                  <div className="col-span-5">
                    <div className="font-bold text-slate-900">{item.title || 'Untitled Course'}</div>
                    <div className="mt-1">
                      <Badge tier={item.tier} />
                    </div>
                  </div>
                  <div className="col-span-3 text-sm text-slate-600">{domain?.name}</div>
                  <div className="col-span-2">
                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${
                      item.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' :
                      item.status === 'IN_REVIEW' ? 'bg-yellow-100 text-yellow-700' :
                      'bg-gray-100 text-gray-600'
                    }`}>
                      {item.status}
                    </span>
                  </div>
                  <div className="col-span-2 flex justify-end gap-2">
                    <Link to={`/contribute/${item.id}/builder`}>
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded transition" title="Course Builder">
                        <Layers size={18} />
                      </button>
                    </Link>
                    <Link to={`/contribute/${item.id}`}>
                      <button className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded transition" title="Edit Metadata">
                        <Edit size={18} />
                      </button>
                    </Link>
                    {item.status === 'DRAFT' && (
                      <button
                        onClick={() => handleSubmit(item.id)}
                        className="p-2 text-slate-400 hover:text-primary hover:bg-blue-50 rounded transition"
                        title="Submit for Review"
                      >
                        <Send size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>
    </div>
  );
};
