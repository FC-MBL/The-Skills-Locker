import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useStore } from '../../store';
import { Item } from '../../types';
import { DOMAINS } from '../../data';
import { Button, Card } from '../../components/UI';
import { ChevronLeft } from 'lucide-react';

export const ContributorCourseEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, items, updateItem, createItem, submitItemForReview } = useStore();

  const isNew = !id;
  const initialData: Item = {
    id: `contrib_${Date.now()}`,
    title: '',
    domainId: DOMAINS[0].id,
    tier: 'BYTE',
    description: '',
    durationLabel: '1 hr',
    accredited: false,
    outcomes: [],
    prerequisites: [],
    price: 0,
    image: 'https://picsum.photos/400/300',
    status: 'DRAFT',
    versionNumber: 1,
    changelog: [],
    contentStructure: [],
    createdById: user?.id,
    createdByName: user?.name
  };

  const [formData, setFormData] = useState<Item>(initialData);
  const [submissionNotes, setSubmissionNotes] = useState('');

  const existingItem = !isNew ? items.find(i => i.id === id) : null;
  if (existingItem && existingItem.createdById && existingItem.createdById !== user?.id) {
    return <div className="p-8 text-slate-600">You do not have access to edit this course.</div>;
  }

  useEffect(() => {
    if (!isNew && id) {
      const found = items.find(i => i.id === id);
      if (found) setFormData(found);
    }
  }, [id, items, isNew]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : (name === 'price' ? Number(value) : value)
    }));
  };

  const handleOutcomesChange = (text: string) => {
    setFormData(prev => ({ ...prev, outcomes: text.split('\n').filter(s => s.trim() !== '') }));
  };

  const saveDraft = () => {
    const payload = {
      ...formData,
      createdById: formData.createdById || user?.id,
      createdByName: formData.createdByName || user?.name
    };
    if (isNew) {
      createItem(payload);
    } else {
      updateItem(payload);
    }
    navigate('/contribute');
  };

  const submitForReview = () => {
    const payload = {
      ...formData,
      createdById: formData.createdById || user?.id,
      createdByName: formData.createdByName || user?.name
    };
    if (isNew) {
      createItem(payload);
    } else {
      updateItem(payload);
    }
    submitItemForReview(payload.id, submissionNotes);
    navigate('/contribute');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <button onClick={() => navigate('/contribute')} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-800">
        <ChevronLeft size={20} /> Back to Contributions
      </button>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-display uppercase text-slate-900">{isNew ? 'Create New Course' : 'Edit Course'}</h1>
        {!isNew && (
          <Link to={`/contribute/${formData.id}/builder`}>
            <Button variant="outline">Open Builder</Button>
          </Link>
        )}
      </div>

      <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
        <Card className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-bold text-slate-700 mb-1">Title</label>
              <input name="title" value={formData.title} onChange={handleChange} required className="w-full border rounded p-2" />
            </div>
            
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Domain</label>
              <select name="domainId" value={formData.domainId} onChange={handleChange} className="w-full border rounded p-2">
                {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Tier</label>
              <select name="tier" value={formData.tier} onChange={handleChange} className="w-full border rounded p-2">
                <option value="BYTE">Byte</option>
                <option value="MICROCRED">Micro-Credential</option>
                <option value="SHORT">Short Course</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Duration Label</label>
              <input name="durationLabel" value={formData.durationLabel} onChange={handleChange} className="w-full border rounded p-2" />
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Price ($)</label>
              <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border rounded p-2" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Thumbnail URL</label>
            <input name="image" value={formData.image} onChange={handleChange} className="w-full border rounded p-2" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Description</label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full border rounded p-2" />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Learning Outcomes (one per line)</label>
            <textarea 
              value={formData.outcomes.join('\n')} 
              onChange={(e) => handleOutcomesChange(e.target.value)} 
              rows={4} 
              className="w-full border rounded p-2" 
              placeholder="e.g. Understand core concepts..."
            />
          </div>

          <div className="flex items-center gap-2">
            <input type="checkbox" name="accredited" checked={formData.accredited} onChange={handleChange} id="accredited" />
            <label htmlFor="accredited" className="text-sm font-bold text-slate-700">Accredited Course</label>
          </div>
        </Card>

        <Card className="p-6 space-y-3">
          <h3 className="font-bold text-slate-800">Submission Notes</h3>
          <p className="text-sm text-slate-500">Add context or special review requests for the admin team.</p>
          <textarea
            value={submissionNotes}
            onChange={(e) => setSubmissionNotes(e.target.value)}
            rows={3}
            className="w-full border rounded p-2"
            placeholder="Optional notes..."
          />
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => navigate('/contribute')}>Cancel</Button>
          <Button type="button" variant="outline" onClick={saveDraft}>Save Draft</Button>
          <Button type="button" onClick={submitForReview}>Submit for Review</Button>
        </div>
      </form>
    </div>
  );
};
