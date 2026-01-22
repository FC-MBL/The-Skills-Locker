import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCourse } from '../context/CourseContext';
import { DOMAINS, MOCK_COURSES } from '../constants';
import { Button, Input, Label, Select, TextArea, Card, FileUpload } from '../components/UI';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { Tier } from '../types';

export const CourseMetadata: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { activeCourse, loadCourse, updateCourse, saveCourse, lastSaved } = useCourse();
  
  // Local state for immediate form feedback
  const [formData, setFormData] = useState<any>(null);

  useEffect(() => {
    if (courseId) loadCourse(courseId);
  }, [courseId, loadCourse]);

  useEffect(() => {
    if (activeCourse) setFormData(activeCourse);
  }, [activeCourse]);

  if (!formData) return <div className="p-8 text-center font-display text-2xl text-gray-400">Loading...</div>;

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
    updateCourse(formData.id, { [field]: value });
  };

  const handleOutcomeChange = (index: number, value: string) => {
    const newOutcomes = [...formData.outcomes];
    newOutcomes[index] = value;
    handleChange('outcomes', newOutcomes);
  };

  const addOutcome = () => {
    handleChange('outcomes', [...formData.outcomes, '']);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 pb-20">
      <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
              <button onClick={() => navigate('/')} className="text-gray-400 hover:text-navy transition-colors">
                  <ArrowLeft size={24} />
              </button>
              <div>
                <h2 className="text-3xl font-display text-navy">Course Metadata</h2>
                <p className="text-gray-500 text-sm">Define the core identity of your training.</p>
              </div>
          </div>
          <div className="flex items-center gap-4">
             {lastSaved && (
                 <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                     <CheckCircle size={12} className="text-green-500" />
                     Saved {Math.floor((new Date().getTime() - lastSaved.getTime()) / 1000)}s ago
                 </span>
             )}
             <Button onClick={() => saveCourse(formData)} icon={Save}>Save Draft</Button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Main Column */}
        <div className="md:col-span-2 space-y-8">
          <Card className="p-8">
            <h3 className="font-display text-xl text-navy mb-6 border-b border-gray-100 pb-2">Basic Info</h3>
            <div className="space-y-6">
                <div>
                    <Label htmlFor="title" required>Course Title</Label>
                    <Input 
                        id="title" 
                        value={formData.title} 
                        onChange={(e) => handleChange('title', e.target.value)} 
                        placeholder="e.g. Advanced Hypertrophy"
                    />
                </div>
                <div>
                    <Label htmlFor="desc">Description</Label>
                    <TextArea 
                        id="desc" 
                        rows={4} 
                        value={formData.description} 
                        onChange={(e) => handleChange('description', e.target.value)} 
                        placeholder="What will the athlete achieve?"
                    />
                </div>
            </div>
          </Card>

          <Card className="p-8">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-2">
                <h3 className="font-display text-xl text-navy">Learning Outcomes</h3>
                <span className="text-xs text-gray-400 font-medium">Learner-visible</span>
            </div>
            <div className="space-y-4">
                {formData.outcomes.map((outcome: string, idx: number) => (
                    <div key={idx} className="flex gap-2">
                        <div className="flex-none pt-3 text-gray-400 text-xs font-bold w-6">0{idx + 1}</div>
                        <Input 
                            value={outcome} 
                            onChange={(e) => handleOutcomeChange(idx, e.target.value)}
                            placeholder="Learner will be able to..."
                        />
                    </div>
                ))}
                <Button variant="ghost" size="sm" onClick={addOutcome} icon={CheckCircle}>Add Outcome</Button>
            </div>
          </Card>
        </div>

        {/* Sidebar Column */}
        <div className="space-y-8">
            <Card className="p-6 bg-gray-50 border-none">
                <h3 className="font-display text-lg text-navy mb-4">Configuration</h3>
                <div className="space-y-4">
                    <div>
                        <Label>Domain</Label>
                        <Select 
                            value={formData.domainId} 
                            onChange={(e) => handleChange('domainId', e.target.value)}
                        >
                            {DOMAINS.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </Select>
                    </div>
                    <div>
                        <Label>Tier</Label>
                        <div className="grid grid-cols-3 gap-2">
                            {(['BYTE', 'MICROCRED', 'SHORT'] as Tier[]).map(t => (
                                <button
                                    key={t}
                                    onClick={() => handleChange('tier', t)}
                                    className={`text-xs font-bold py-2 rounded-lg border transition-all ${formData.tier === t ? 'bg-navy text-white border-navy' : 'bg-white text-gray-500 border-gray-200 hover:border-gray-400'}`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div>
                        <Label>Duration Label</Label>
                        <Input 
                            value={formData.durationLabel} 
                            onChange={(e) => handleChange('durationLabel', e.target.value)}
                            placeholder="e.g. 2 Hours" 
                        />
                    </div>
                    <div>
                        <Label>Price ($)</Label>
                        <Input 
                            type="number"
                            value={formData.price} 
                            onChange={(e) => handleChange('price', Number(e.target.value))}
                            placeholder="0" 
                        />
                    </div>
                    <div className="pt-4 border-t border-gray-200">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={formData.accredited}
                                onChange={(e) => handleChange('accredited', e.target.checked)}
                                className="w-5 h-5 text-gold rounded focus:ring-gold"
                            />
                            <span className="font-bold text-navy uppercase text-sm">Accredited Course</span>
                        </label>
                    </div>
                </div>
            </Card>

            <Card className="p-6">
                <Label>Cover Image</Label>
                <FileUpload 
                    accept="image/*"
                    currentPreviewUrl={formData.image}
                    onChange={(file, url) => handleChange('image', url)}
                    className="mb-4"
                />
                <Label>Or Image URL</Label>
                <Input 
                    value={formData.image} 
                    onChange={(e) => handleChange('image', e.target.value)}
                    placeholder="https://..." 
                />
            </Card>

            <Card className="p-6">
                <Label>Prerequisites</Label>
                <div className="max-h-48 overflow-y-auto space-y-2 border border-gray-200 rounded-lg p-2">
                    {MOCK_COURSES.filter(c => c.id !== formData.id).map(course => (
                        <label key={course.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                            <input 
                                type="checkbox"
                                checked={formData.prerequisites.includes(course.id)}
                                onChange={(e) => {
                                    const newPrereqs = e.target.checked 
                                        ? [...formData.prerequisites, course.id]
                                        : formData.prerequisites.filter((id: string) => id !== course.id);
                                    handleChange('prerequisites', newPrereqs);
                                }}
                                className="text-blue rounded focus:ring-blue"
                            />
                            <span className="text-xs font-medium text-gray-700 truncate">{course.title}</span>
                        </label>
                    ))}
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};