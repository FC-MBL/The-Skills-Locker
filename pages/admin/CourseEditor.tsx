import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useStore } from '../../store';
import { Item, Tier, ContentStatus } from '../../types';
import { DOMAINS } from '../../data';
import { Button, Card } from '../../components/UI';
import { ChevronLeft } from 'lucide-react';

export const CourseEditor = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, updateItem, createItem } = useStore();
  
  const isNew = !id;
  const initialData: Item = {
      id: `new_${Date.now()}`,
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
      contentStructure: []
  };

  const [formData, setFormData] = useState<Item>(initialData);

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

  const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (isNew) {
          createItem(formData);
      } else {
          updateItem(formData);
      }
      navigate('/admin/courses');
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
        <button onClick={() => navigate('/admin/courses')} className="flex items-center gap-2 text-slate-500 mb-6 hover:text-slate-800">
            <ChevronLeft size={20} /> Back to Courses
        </button>

        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-display uppercase text-slate-900">{isNew ? 'Create New Course' : 'Edit Course'}</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
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
                        <label className="block text-sm font-bold text-slate-700 mb-1">Status</label>
                        <select name="status" value={formData.status} onChange={handleChange} className="w-full border rounded p-2">
                            <option value="DRAFT">Draft</option>
                            <option value="IN_REVIEW">In Review</option>
                            <option value="PUBLISHED">Published</option>
                        </select>
                    </div>
                    
                    <div>
                         <label className="block text-sm font-bold text-slate-700 mb-1">Price ($)</label>
                         <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full border rounded p-2" />
                    </div>
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

            <div className="flex justify-end gap-4">
                <Button type="button" variant="ghost" onClick={() => navigate('/admin/courses')}>Cancel</Button>
                <Button type="submit">{isNew ? 'Create Course' : 'Save Changes'}</Button>
            </div>
        </form>
    </div>
  );
};