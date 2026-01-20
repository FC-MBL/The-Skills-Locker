import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import { CourseModule, Lesson, Block } from '../../types';
import { Button, Card } from '../../components/UI';
import { ChevronLeft, Plus, Trash2, GripVertical, FileText, Video, List } from 'lucide-react';

export const CourseBuilder = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items, saveCourseStructure } = useStore();
  const item = items.find(i => i.id === id);

  // Initialize structure
  const [modules, setModules] = useState<CourseModule[]>(item?.contentStructure || []);

  if (!item) return <div>Course not found</div>;

  const addModule = () => {
    setModules([...modules, {
        id: `mod_${Date.now()}`,
        title: 'New Module',
        order: modules.length,
        lessons: []
    }]);
  };

  const addLesson = (moduleIndex: number) => {
      const newModules = [...modules];
      newModules[moduleIndex].lessons.push({
          id: `les_${Date.now()}`,
          title: 'New Lesson',
          order: newModules[moduleIndex].lessons.length,
          blocks: []
      });
      setModules(newModules);
  };

  const addBlock = (moduleIndex: number, lessonIndex: number) => {
      const newModules = [...modules];
      newModules[moduleIndex].lessons[lessonIndex].blocks.push({
          id: `blk_${Date.now()}`,
          type: 'TEXT',
          content: '',
          order: newModules[moduleIndex].lessons[lessonIndex].blocks.length
      });
      setModules(newModules);
  };

  const updateModuleTitle = (index: number, title: string) => {
      const newModules = [...modules];
      newModules[index].title = title;
      setModules(newModules);
  };

  const updateLessonTitle = (mIndex: number, lIndex: number, title: string) => {
      const newModules = [...modules];
      newModules[mIndex].lessons[lIndex].title = title;
      setModules(newModules);
  };

  const handleSave = () => {
      saveCourseStructure(item.id, modules);
      navigate('/admin/courses');
  };

  return (
    <div className="p-8">
       <div className="flex items-center justify-between mb-8">
           <div className="flex items-center gap-4">
                <button onClick={() => navigate('/admin/courses')} className="p-2 hover:bg-slate-200 rounded-full">
                    <ChevronLeft size={24} />
                </button>
                <div>
                    <h1 className="text-2xl font-display uppercase">{item.title}</h1>
                    <p className="text-slate-500 text-sm">Course Builder</p>
                </div>
           </div>
           <div className="flex gap-2">
               <Button variant="ghost" onClick={() => navigate('/admin/courses')}>Cancel</Button>
               <Button onClick={handleSave}>Save Structure</Button>
           </div>
       </div>

       <div className="space-y-6 max-w-5xl mx-auto">
           {modules.map((mod, mIndex) => (
               <div key={mod.id} className="bg-white rounded-xl border border-slate-300 overflow-hidden shadow-sm">
                   <div className="bg-slate-100 p-4 border-b border-slate-300 flex items-center gap-4">
                       <GripVertical className="text-slate-400 cursor-move" />
                       <input 
                          value={mod.title}
                          onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                          className="font-bold text-lg bg-transparent border-none focus:ring-0 w-full"
                          placeholder="Module Title"
                       />
                       <button onClick={() => {}} className="text-red-400 hover:text-red-600"><Trash2 size={18} /></button>
                   </div>
                   
                   <div className="p-4 space-y-4">
                       {mod.lessons.map((lesson, lIndex) => (
                           <div key={lesson.id} className="border border-slate-200 rounded-lg p-4 bg-slate-50">
                               <div className="flex items-center gap-3 mb-4">
                                   <div className="w-6 h-6 rounded bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                                       {lIndex + 1}
                                   </div>
                                   <input 
                                      value={lesson.title}
                                      onChange={(e) => updateLessonTitle(mIndex, lIndex, e.target.value)}
                                      className="font-bold bg-transparent border-none focus:ring-0 flex-grow"
                                      placeholder="Lesson Title"
                                   />
                               </div>

                               <div className="space-y-2 pl-9">
                                   {lesson.blocks.map((block, bIndex) => (
                                       <div key={block.id} className="flex items-center gap-2 p-2 bg-white border border-slate-200 rounded text-sm">
                                           {block.type === 'VIDEO' ? <Video size={14} /> : <FileText size={14} />}
                                           <span className="text-xs font-bold uppercase text-slate-400 w-16">{block.type}</span>
                                           <input 
                                              className="flex-grow border-b border-dashed border-slate-300 focus:outline-none text-slate-600"
                                              placeholder="Content / URL..."
                                              value={block.content}
                                              onChange={(e) => {
                                                  const newModules = [...modules];
                                                  newModules[mIndex].lessons[lIndex].blocks[bIndex].content = e.target.value;
                                                  setModules(newModules);
                                              }}
                                           />
                                       </div>
                                   ))}
                                   <button 
                                      onClick={() => addBlock(mIndex, lIndex)}
                                      className="flex items-center gap-2 text-xs font-bold text-primary hover:text-blue-700 px-2 py-1"
                                   >
                                       <Plus size={14} /> Add Block
                                   </button>
                               </div>
                           </div>
                       ))}
                       
                       <Button size="sm" variant="outline" onClick={() => addLesson(mIndex)} className="w-full border-dashed">
                           <Plus size={16} /> Add Lesson
                       </Button>
                   </div>
               </div>
           ))}

           <button 
              onClick={addModule}
              className="w-full py-8 border-2 border-dashed border-slate-300 rounded-xl text-slate-400 font-bold uppercase hover:bg-slate-50 hover:border-slate-400 transition"
           >
               + Add Module
           </button>
       </div>
    </div>
  );
};