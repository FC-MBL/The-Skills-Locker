import React, { useState, useEffect } from 'react';
import { useCourse } from '../context/CourseContext';
import { Button, Input, Label, Card, FileUpload } from '../components/UI';
import { Save, CheckCircle, AlertCircle } from 'lucide-react';

export const Profile: React.FC = () => {
  const { user, updateUser, lastSaved } = useCourse();
  const [formData, setFormData] = useState({
      name: '',
      title: '',
      expertise: '',
      avatarUrl: ''
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
      if (user) {
          setFormData({
              name: user.name || '',
              title: user.title || '',
              expertise: user.expertise || '',
              avatarUrl: user.avatarUrl || ''
          });
      }
  }, [user]);

  const handleChange = (field: string, value: string) => {
      setFormData(prev => ({ ...prev, [field]: value }));
      if (error) setError(null);
  };

  const handleSave = () => {
      // Validation: All fields mandatory
      if (!formData.name.trim() || !formData.title.trim() || !formData.expertise.trim() || !formData.avatarUrl.trim()) {
          setError('All fields are mandatory. Please complete your profile.');
          return;
      }
      
      updateUser(formData);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
       <div className="flex items-center justify-between mb-8">
            <div>
                <h1 className="text-4xl font-display text-navy mb-1">My Profile</h1>
                <p className="text-gray-500">Manage your contributor identity.</p>
            </div>
            <div className="flex items-center gap-4">
                 {lastSaved && (
                     <span className="text-xs font-bold text-gray-400 uppercase tracking-wide flex items-center gap-1">
                         <CheckCircle size={12} className="text-green-500" />
                         Saved
                     </span>
                 )}
                 <Button onClick={handleSave} icon={Save}>Save Profile</Button>
            </div>
       </div>

       {error && (
           <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 mb-6 rounded-r-lg flex items-center gap-3">
               <AlertCircle size={20} />
               <span className="font-medium">{error}</span>
           </div>
       )}

       <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
           <Card className="p-8 md:col-span-1">
               <Label required>Profile Photo</Label>
               <div className="mb-4">
                   <FileUpload 
                       accept="image/*"
                       currentPreviewUrl={formData.avatarUrl}
                       onChange={(file, url) => handleChange('avatarUrl', url)}
                       className="w-full"
                   />
               </div>
               <p className="text-xs text-gray-500 text-center">
                   Upload a professional headshot.
                   <br />Recommended: 400x400px.
               </p>
           </Card>

           <Card className="p-8 md:col-span-2 space-y-6">
               <h3 className="font-display text-xl text-navy mb-4 border-b border-gray-100 pb-2">Details</h3>
               
               <div>
                   <Label required>Full Name</Label>
                   <Input 
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        placeholder="e.g. Coach Mike"
                   />
               </div>

               <div>
                   <Label required>Title / Occupation</Label>
                   <Input 
                        value={formData.title}
                        onChange={(e) => handleChange('title', e.target.value)}
                        placeholder="e.g. Head of Performance"
                   />
               </div>

               <div>
                   <Label required>Area of Expertise</Label>
                   <Input 
                        value={formData.expertise}
                        onChange={(e) => handleChange('expertise', e.target.value)}
                        placeholder="e.g. Strength & Conditioning, Biomechanics"
                   />
               </div>
           </Card>
       </div>
    </div>
  );
};