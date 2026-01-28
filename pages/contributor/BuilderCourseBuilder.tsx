import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";
import { useCourseBuilder } from '../../context/CourseBuilderContext';
import { BLOCK_TYPE_ICONS } from '../../constants/builderConstants';
import { Button, Input, Badge, Label, TextArea, FileUpload, Toast, ProgressBar } from '../../components/builder/UI';
import { uploadScormPackage, listenToScormStatus, ScormProcessingStatus, exportCourse } from '../../src/firebase';
import {
  ArrowLeft, Plus, Trash2, GripVertical, ChevronDown, ChevronRight,
  FileText, Video, Link as LinkIcon, CheckSquare,
  HelpCircle, Type, Eye, Save, Layout, Package,
  Edit2, X, Sparkles, Loader2, Wand2, Download
} from 'lucide-react';
import { Block, BlockType, Lesson, CourseModule } from '../../types';
import * as LucideIcons from 'lucide-react';

export const BuilderCourseBuilder: React.FC = () => {
  const { courseId } = useParams<{ courseId: string }>();
  const navigate = useNavigate();
  const { activeCourse, loadCourse, updateModules, lastSaved } = useCourseBuilder();

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [previewMode, setPreviewMode] = useState(false);
  const [editingModuleId, setEditingModuleId] = useState<string | null>(null);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('Course saved successfully!');
  const [dragData, setDragData] = useState<{ type: 'MODULE' | 'LESSON', id: string, parentId?: string } | null>(null);

  const [activeAiBlockId, setActiveAiBlockId] = useState<string | null>(null);
  const [aiPrompt, setAiPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<{ [blockId: string]: number }>({});
  const [scormStatuses, setScormStatuses] = useState<{ [blockId: string]: ScormProcessingStatus }>({});
  const [scormImportProgress, setScormImportProgress] = useState<number>(0);
  const [isImportingScorm, setIsImportingScorm] = useState(false);

  useEffect(() => {
    if (courseId) loadCourse(courseId);
  }, [courseId, loadCourse]);

  useEffect(() => {
    if (activeCourse) {
      setModules(activeCourse.modules);
      if (activeCourse.modules.length > 0 && !selectedLessonId) {
        setExpandedModules([activeCourse.modules[0].id]);
        if (activeCourse.modules[0].lessons.length > 0) {
          setSelectedLessonId(activeCourse.modules[0].lessons[0].id);
        }
      }
    }
  }, [activeCourse]);

  const saveChanges = () => {
    if (courseId) {
      updateModules(courseId, modules);
      setToastMessage('Course saved successfully!');
      setShowToast(true);
    }
  };

  const addModule = () => {
    const newModule: CourseModule = {
      id: `m${Date.now()}`,
      title: 'New Module',
      order: modules.length,
      lessons: []
    };
    const newModules = [...modules, newModule];
    setModules(newModules);
    setExpandedModules([...expandedModules, newModule.id]);
    setEditingModuleId(newModule.id);
    if (courseId) updateModules(courseId, newModules);
  };

  const updateModuleTitle = (moduleId: string, newTitle: string) => {
    setModules(prev => prev.map(m => m.id === moduleId ? { ...m, title: newTitle } : m));
  };

  const addLesson = (moduleId: string) => {
    const newModules = modules.map(m => {
      if (m.id === moduleId) {
        const newLesson: Lesson = {
          id: `l${Date.now()}`,
          title: 'New Lesson',
          order: m.lessons.length,
          blocks: []
        };
        if (!selectedLessonId) setSelectedLessonId(newLesson.id);
        return { ...m, lessons: [...m.lessons, newLesson] };
      }
      return m;
    });
    setModules(newModules);
    if (courseId) updateModules(courseId, newModules);
  };

  const updateLessonTitle = (moduleId: string, lessonId: string, newTitle: string) => {
    const newModules = modules.map(m => {
      if (m.id === moduleId) {
        return {
          ...m,
          lessons: m.lessons.map(l => l.id === lessonId ? { ...l, title: newTitle } : l)
        };
      }
      return m;
    });
    setModules(newModules);
  };

  const addBlock = (type: BlockType) => {
    if (!selectedLessonId) return;
    const newBlock: Block = {
      id: `b${Date.now()}`,
      type,
      content: '',
      order: 999
    };
    const newModules = modules.map(m => ({
      ...m,
      lessons: m.lessons.map(l => l.id === selectedLessonId ? { ...l, blocks: [...l.blocks, newBlock] } : l)
    }));
    setModules(newModules);
    if (courseId) updateModules(courseId, newModules);
  };

  const updateBlockContent = (lessonId: string, blockId: string, content: string) => {
    const newModules = modules.map(m => ({
      ...m,
      lessons: m.lessons.map(l => l.id === lessonId ? { ...l, blocks: l.blocks.map(b => b.id === blockId ? { ...b, content } : b) } : l)
    }));
    setModules(newModules);
  };

  const deleteBlock = (lessonId: string, blockId: string) => {
    const newModules = modules.map(m => ({
      ...m,
      lessons: m.lessons.map(l => l.id === lessonId ? { ...l, blocks: l.blocks.filter(b => b.id !== blockId) } : l)
    }));
    setModules(newModules);
    if (courseId) updateModules(courseId, newModules);
  };

  const toggleModule = (id: string) => {
    setExpandedModules(prev => prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]);
  };

  const handleAiGenerate = async (lessonId: string, blockId: string, currentContent: string) => {
    if (!aiPrompt.trim()) return;
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (!apiKey) {
      setToastMessage('Add VITE_GEMINI_API_KEY to enable AI writer.');
      setShowToast(true);
      return;
    }

    setIsGenerating(true);
    try {
      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: aiPrompt,
        config: {
          systemInstruction: "You are an expert fitness coach and educator creating content for 'The Skills Locker', a premium LMS. Write authoritative, concise, and educational content in markdown format where appropriate. Use a confident, athletic tone.",
        }
      });

      const text = response.text;
      if (text) {
        const newContent = currentContent ? `${currentContent}\n\n${text}` : text;
        updateBlockContent(lessonId, blockId, newContent);
        setActiveAiBlockId(null);
        setAiPrompt('');
        setToastMessage('Content generated by AI');
        setShowToast(true);
      }
    } catch (error) {
      console.error("AI Error", error);
      setToastMessage('Failed to generate content. Please try again.');
      setShowToast(true);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleScormUpload = async (lessonId: string, blockId: string, file: File) => {
    if (!courseId) return;
    try {
      setUploadProgress(prev => ({ ...prev, [blockId]: 1 })); // Start progress
      // 1. Upload
      const { storagePath, downloadUrl } = await uploadScormPackage(file, courseId, (progress) => {
        setUploadProgress(prev => ({ ...prev, [blockId]: progress }));
      });

      // 2. Update Context
      // Store initial metadata. Backend will pick up from here.
      // We need to update the block metadata.
      // Since updateBlockContent takes a string, we might only store the filename or status there,
      // but ideally we utilize the 'scormMetadata' field we added to types.
      // For now, let's look at how to update scormMetadata. 
      // We need to add a new function or modify updateBlockContent to accept entire block override.
      // Or just assume updateBlockContent handles string content (filename) and we use a new helper for metadata.
      // Let's create a specialized updater for metadata in this scope since `updateBlockContent` is restricted.
      // Actually, we can just modify the state locally and call updateModules.

      const newModules = modules.map(m => ({
        ...m,
        lessons: m.lessons.map(l => l.id === lessonId ? {
          ...l,
          blocks: l.blocks.map(b => b.id === blockId ? {
            ...b,
            content: file.name,
            scormMetadata: { status: 'PROCESSING' as const, storagePath }
          } : b)
        } : l)
      }));
      setModules(newModules);
      if (courseId) updateModules(courseId, newModules);

      // 3. Listen for status
      listenToScormStatus(storagePath, (status) => {
        setScormStatuses(prev => ({ ...prev, [blockId]: status }));

        // Update persistent state if Launch URL is ready
        if (status.status === 'READY' && status.launchUrl) {
          const updatedModules = modules.map(m => ({
            ...m,
            lessons: m.lessons.map(l => l.id === lessonId ? {
              ...l,
              blocks: l.blocks.map(b => b.id === blockId ? {
                ...b,
                scormMetadata: { ...status }
              } : b)
            } : l)
          }));
          // Only update if changed to avoid loop - checking roughly
          // setModules(updatedModules); // React state might loop if we are not careful with onSnapshot.
          // Better to just keep local state for live updates and save periodically?
          // For now, let's just rely on local state 'scormStatuses' for the UI and 'modules' for persistence.
          if (activeCourse?.id) updateModules(activeCourse.id, updatedModules);
        }
      });

    } catch (e) {
      console.error(e);
      setToastMessage('Upload failed');
      setShowToast(true);
      setUploadProgress(prev => ({ ...prev, [blockId]: 0 }));
    }
  };

  const handleDragStart = (e: React.DragEvent, type: 'MODULE' | 'LESSON', id: string, parentId?: string) => {
    e.stopPropagation();
    setDragData({ type, id, parentId });
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetType: 'MODULE' | 'LESSON', targetId: string, targetParentId?: string) => {
    e.preventDefault();
    e.stopPropagation();

    if (!dragData) return;
    if (dragData.type !== targetType) return;
    if (dragData.id === targetId) return;

    if (targetType === 'MODULE') {
      const newModules = [...modules];
      const draggedIdx = newModules.findIndex(m => m.id === dragData.id);
      const targetIdx = newModules.findIndex(m => m.id === targetId);

      const [removed] = newModules.splice(draggedIdx, 1);
      newModules.splice(targetIdx, 0, removed);

      newModules.forEach((m, i) => m.order = i);
      setModules(newModules);
      if (courseId) updateModules(courseId, newModules);
    } else if (targetType === 'LESSON') {
      if (dragData.parentId !== targetParentId) return;

      const newModules = [...modules];
      const modIdx = newModules.findIndex(m => m.id === targetParentId);
      if (modIdx === -1) return;

      const newLessons = [...newModules[modIdx].lessons];
      const draggedIdx = newLessons.findIndex(l => l.id === dragData.id);
      const targetIdx = newLessons.findIndex(l => l.id === targetId);

      const [removed] = newLessons.splice(draggedIdx, 1);
      newLessons.splice(targetIdx, 0, removed);

      newLessons.forEach((l, i) => l.order = i);
      newModules[modIdx] = { ...newModules[modIdx], lessons: newLessons };

      setModules(newModules);
      if (courseId) updateModules(courseId, newModules);
    }
    setDragData(null);
  };

  const getActiveLesson = () => {
    for (const m of modules) {
      const l = m.lessons.find(l => l.id === selectedLessonId);
      if (l) return { module: m, lesson: l };
    }
    return null;
  };

  const activeData = getActiveLesson();

  const BlockIcon = ({ type }: { type: string }) => {
    const Icon = (LucideIcons as Record<string, React.FC<{ size?: number }>>)[BLOCK_TYPE_ICONS[type] || 'Box'];
    return <Icon size={18} />;
  };

  const PreviewOverlay = () => {
    if (!activeData) return null;
    return (
      <div className="fixed inset-0 z-50 bg-white flex flex-col">
        <div className="h-16 bg-navy text-white flex items-center justify-between px-6 flex-none">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-display tracking-wide">{activeCourse?.title}</h1>
            <Badge variant="published">Preview Mode</Badge>
          </div>
          <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-white" onClick={() => setPreviewMode(false)} icon={X}>
            Exit Preview
          </Button>
        </div>
        <div className="flex flex-1 overflow-hidden">
          <div className="w-80 bg-gray-50 border-r border-gray-200 overflow-y-auto p-6">
            {modules.map((mod, i) => (
              <div key={mod.id} className="mb-6">
                <h3 className="font-display text-lg text-gray-400 mb-2">Module {i + 1}: {mod.title}</h3>
                <div className="space-y-1">
                  {mod.lessons.map(lesson => (
                    <div
                      key={lesson.id}
                      onClick={() => setSelectedLessonId(lesson.id)}
                      className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition-colors ${selectedLessonId === lesson.id ? 'bg-blue text-white shadow' : 'text-gray-700 hover:bg-white'}`}
                    >
                      <div className={`w-2 h-2 rounded-full ${selectedLessonId === lesson.id ? 'bg-white' : 'bg-gray-300'}`} />
                      <span className="text-sm font-medium">{lesson.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="flex-1 overflow-y-auto p-12 bg-white">
            <div className="max-w-3xl mx-auto">
              <h1 className="text-4xl font-display text-navy mb-8">{activeData.lesson.title}</h1>
              <div className="space-y-8">
                {activeData.lesson.blocks.map(block => (
                  <div key={block.id} className="prose max-w-none">
                    {block.type === 'VIDEO' ? (
                      <div className="aspect-video bg-black rounded-xl flex items-center justify-center text-white">
                        Video Placeholder ({block.content})
                      </div>
                    ) : block.type === 'SCORM' ? (
                      <div className="p-8 bg-gray-100 rounded-xl border border-gray-200 text-center">
                        <Package size={48} className="mx-auto text-gray-400 mb-4" />
                        <h4 className="font-bold text-navy">Interactive Module</h4>
                        <p className="text-sm text-gray-500 mb-2">{block.content}</p>
                        {block.scormMetadata?.status === 'PROCESSING' && (
                          <div className="mb-4">
                            <Badge variant="draft">Processing...</Badge>
                          </div>
                        )}
                        {block.scormMetadata?.status === 'READY' && (
                          <div className="mb-4">
                            <Badge variant="published">Ready to Launch</Badge>
                          </div>
                        )}
                        {block.scormMetadata?.status === 'ERROR' && (
                          <div className="mb-4 text-red-500 text-xs">
                            Processing Failed
                          </div>
                        )}
                        <Button
                          size="sm"
                          disabled={block.scormMetadata?.status !== 'READY'}
                          onClick={() => {
                            if (block.scormMetadata?.launchUrl) window.open(block.scormMetadata.launchUrl, '_blank');
                          }}
                        >
                          Launch Module
                        </Button>
                      </div>
                    ) : block.type === 'HTML_VIEWER' ? (
                      <div className="p-8 bg-gray-100 rounded-xl border border-gray-200 text-center">
                        <Eye size={48} className="mx-auto text-gray-400 mb-4" />
                        <h4 className="font-bold text-navy">HTML Viewer</h4>
                        <p className="text-sm text-gray-500 mb-2">{block.content}</p>
                        <Button
                          size="sm"
                          disabled={!block.launchUrl}
                          onClick={() => {
                            if (block.launchUrl) window.open(block.launchUrl, '_blank');
                          }}
                        >
                          Open Page
                        </Button>
                      </div>
                    ) : (
                      <div className="p-4 bg-transparent whitespace-pre-wrap">
                        {block.content || <em className="text-gray-400">Empty block content</em>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100 overflow-hidden relative">
      {showToast && <Toast message={toastMessage} onClose={() => setShowToast(false)} />}
      {previewMode && <PreviewOverlay />}

      {/* Top Bar */}
      <div className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-none z-10">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/contribute')} className="text-gray-400 hover:text-navy">
            <ArrowLeft size={20} />
          </button>
          <div className="h-6 w-px bg-gray-200"></div>
          <h1 className="text-lg font-display text-navy tracking-wide truncate max-w-xs">{activeCourse?.title || 'Loading...'}</h1>
          <Badge variant="draft">Builder Mode</Badge>
        </div>
        <div className="flex items-center gap-3">
          {lastSaved && <span className="text-xs text-gray-400 font-bold mr-2">Saved</span>}
          <Button variant="outline" size="sm" icon={Eye} onClick={() => setPreviewMode(true)}>Preview</Button>
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={async () => {
              if (!activeCourse || !courseId) return;
              try {
                setToastMessage('Exporting course...');
                setShowToast(true);
                const downloadUrl = await exportCourse(courseId, {
                  metadata: {
                    title: activeCourse.title,
                    description: activeCourse.description || '',
                    tier: activeCourse.tier,
                    branch: activeCourse.branch,
                    accredited: activeCourse.accredited || false,
                    thumbnail: activeCourse.thumbnail || ''
                  },
                  modules: modules
                });
                // Trigger download
                window.open(downloadUrl, '_blank');
                setToastMessage('Course exported successfully!');
                setShowToast(true);
              } catch (error) {
                console.error('Export failed:', error);
                setToastMessage('Export failed. Please try again.');
                setShowToast(true);
              }
            }}
          >
            Export
          </Button>
          <Button variant="primary" size="sm" icon={Save} onClick={saveChanges}>Save</Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar Structure */}
        <div className="w-80 bg-white border-r border-gray-200 flex flex-col flex-none">
          <div className="p-4 border-b border-gray-100">
            <Input
              placeholder="Search lessons..."
              className="py-2 text-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {modules.map((mod, mIdx) => (
              <div
                key={mod.id}
                className={`select-none transition-opacity ${dragData?.id === mod.id ? 'opacity-50' : 'opacity-100'}`}
                draggable
                onDragStart={(e) => handleDragStart(e, 'MODULE', mod.id)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, 'MODULE', mod.id)}
              >
                <div
                  className="flex items-center gap-2 py-2 px-2 hover:bg-gray-50 rounded cursor-pointer group"
                  onClick={() => toggleModule(mod.id)}
                >
                  <GripVertical size={14} className="text-gray-300 cursor-grab active:cursor-grabbing hover:text-gray-500" />
                  {expandedModules.includes(mod.id) ? <ChevronDown size={14} /> : <ChevronRight size={14} />}

                  <div className="flex-1 min-w-0">
                    {editingModuleId === mod.id ? (
                      <Input
                        autoFocus
                        className="py-1 px-2 text-sm h-8"
                        value={mod.title}
                        onChange={(e) => updateModuleTitle(mod.id, e.target.value)}
                        onBlur={() => setEditingModuleId(null)}
                        onKeyDown={(e) => e.key === 'Enter' && setEditingModuleId(null)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col truncate">
                          <span className="text-xs font-bold text-gray-500 uppercase">Module {mIdx + 1}</span>
                          <span className="text-sm font-bold text-navy truncate">{mod.title}</span>
                        </div>
                        <button
                          className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-blue transition-opacity"
                          onClick={(e) => { e.stopPropagation(); setEditingModuleId(mod.id); }}
                          title="Edit Title"
                        >
                          <Edit2 size={12} />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-1 hover:text-blue" onClick={(e) => { e.stopPropagation(); addLesson(mod.id); }} title="Add Lesson">
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {expandedModules.includes(mod.id) && (
                  <div className="ml-6 mt-1 space-y-1 pl-2 border-l-2 border-gray-100">
                    {mod.lessons.map((lesson, lIdx) => (
                      <div
                        key={lesson.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'LESSON', lesson.id, mod.id)}
                        onDragOver={handleDragOver}
                        onDrop={(e) => handleDrop(e, 'LESSON', lesson.id, mod.id)}
                        onClick={() => setSelectedLessonId(lesson.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-sm transition-colors ${selectedLessonId === lesson.id ? 'bg-blue text-white shadow-md' : 'text-gray-600 hover:bg-gray-50'} ${dragData?.id === lesson.id ? 'opacity-50' : 'opacity-100'}`}
                      >
                        <GripVertical size={14} className={`opacity-50 cursor-grab active:cursor-grabbing ${selectedLessonId === lesson.id ? 'text-blue-200' : 'text-gray-300'}`} />
                        <span className="truncate flex-1">{lesson.title}</span>
                      </div>
                    ))}
                    {mod.lessons.length === 0 && (
                      <div className="text-xs text-gray-400 italic py-2 px-3">No lessons. Click + to add.</div>
                    )}
                  </div>
                )}
              </div>
            ))}

            <button
              onClick={addModule}
              className="w-full py-3 border-2 border-dashed border-gray-200 rounded-xl text-gray-400 font-bold uppercase text-xs hover:border-blue hover:text-blue transition-colors flex items-center justify-center gap-2"
            >
              <Plus size={16} /> Add Module
            </button>

            <div className="pt-4 border-t border-gray-100">
              <Label>Import Content</Label>

              {isImportingScorm && (
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>Uploading SCORM package...</span>
                    <span>{Math.round(scormImportProgress)}%</span>
                  </div>
                  <ProgressBar value={scormImportProgress} />
                </div>
              )}

              <FileUpload
                accept=".zip"
                label="Import SCORM Course"
                readContent={false}
                disabled={isImportingScorm}
                onChange={(file, _) => {
                  if (file && courseId) {
                    setIsImportingScorm(true);
                    setScormImportProgress(0);
                    setToastMessage("Uploading SCORM Course...");
                    setShowToast(true);
                    uploadScormPackage(file, courseId, (p) => {
                      setScormImportProgress(p);
                    }).then(({ storagePath }) => {
                      listenToScormStatus(storagePath, (status) => {
                        if (status.status === 'READY' && status.courseStructure) {
                          // Merge imported structure
                          const importedModules = status.courseStructure as CourseModule[];
                          // Adjust IDs to ensure uniqueness if needed, assuming backend did ok
                          // Adjust Order
                          const currentMaxOrder = modules.length > 0 ? Math.max(...modules.map(m => m.order)) + 1 : 0;
                          importedModules.forEach((m, i) => m.order = currentMaxOrder + i);

                          const newModules = [...modules, ...importedModules];
                          setModules(newModules);
                          updateModules(courseId, newModules);
                          setToastMessage("SCORM Structure Imported Successfully!");
                          setShowToast(true);
                          setIsImportingScorm(false);
                          setScormImportProgress(0);
                        } else if (status.status === 'ERROR') {
                          setToastMessage(`Import Failed: ${status.error}`);
                          setShowToast(true);
                          setIsImportingScorm(false);
                          setScormImportProgress(0);
                        }
                      });
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 bg-gray-50 flex flex-col overflow-hidden relative">
          {activeData ? (
            <div className="flex-1 overflow-y-auto p-8 lg:p-12">
              <div className="max-w-3xl mx-auto space-y-8">
                {/* Lesson Header */}
                <div className="bg-white p-8 rounded-card shadow-sm border border-gray-200">
                  <div className="flex items-center justify-between mb-4">
                    <Badge variant="tier">{activeData.module.title}</Badge>
                  </div>
                  <Input
                    className="text-3xl font-display text-navy border-none p-0 focus:ring-0 placeholder-gray-300"
                    value={activeData.lesson.title}
                    onChange={(e) => updateLessonTitle(activeData.module.id, activeData.lesson.id, e.target.value)}
                    placeholder="LESSON TITLE"
                  />
                </div>

                {/* Blocks List */}
                <div className="space-y-4">
                  {activeData.lesson.blocks.length === 0 ? (
                    <div className="text-center py-12">
                      <p className="text-gray-400 mb-2">This lesson is empty.</p>
                      <p className="text-sm text-gray-500">Add a block below to start building.</p>
                    </div>
                  ) : (
                    activeData.lesson.blocks.map((block, idx) => (
                      <div key={block.id} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
                        <div className="bg-gray-50 px-4 py-2 flex items-center justify-between border-b border-gray-200">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase">
                            <GripVertical size={14} className="cursor-move text-gray-400" />
                            <BlockIcon type={block.type} />
                            <span>{block.type} BLOCK</span>
                          </div>
                          <button
                            onClick={() => deleteBlock(activeData.lesson.id, block.id)}
                            className="text-gray-400 hover:text-red transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div className="p-4">
                          {block.type === 'VIDEO' ? (
                            <div className="space-y-2">
                              <Label>Video Embed URL</Label>
                              <Input
                                value={block.content}
                                onChange={(e) => updateBlockContent(activeData.lesson.id, block.id, e.target.value)}
                                placeholder="Vimeo / YouTube link..."
                              />
                            </div>
                          ) : block.type === 'SCORM' ? (
                            <div className="space-y-2">
                              <Label>SCORM Package (.zip)</Label>
                              <FileUpload
                                accept=".zip"
                                label="Upload SCORM Package"
                                readContent={false}
                                currentPreviewUrl={block.content}
                                onChange={(file, _) => {
                                  if (file) handleScormUpload(activeData.lesson.id, block.id, file);
                                }}
                              />
                              {uploadProgress[block.id] > 0 && uploadProgress[block.id] < 100 && (
                                <div className="mt-2">
                                  <div className="text-xs font-bold text-gray-500 mb-1 flex justify-between">
                                    <span>UPLOADING...</span>
                                    <span>{Math.round(uploadProgress[block.id])}%</span>
                                  </div>
                                  <ProgressBar progress={uploadProgress[block.id]} />
                                </div>
                              )}
                              {block.content && (
                                <div className="flex items-center justify-between gap-2 text-sm text-green-600 font-bold bg-green-50 p-2 rounded mt-2">
                                  <div className="flex items-center gap-2">
                                    <Package size={16} />
                                    {block.content}
                                  </div>
                                  <div className="flex items-center">
                                    {/* Show status from metadata or local listener */}
                                    {scormStatuses[block.id]?.status === 'PROCESSING' && <span className="text-xs text-orange-500 animate-pulse">PROCESSING</span>}
                                    {block.scormMetadata?.status === 'READY' && <span className="text-xs text-green-600">READY</span>}
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : block.type === 'HTML_VIEWER' ? (
                            <div className="space-y-2">
                              <Label>HTML Viewer</Label>
                              <div className="flex items-center justify-between gap-3 bg-gray-50 border border-gray-200 rounded-lg p-3">
                                <div className="flex flex-col min-w-0">
                                  <span className="text-sm font-semibold text-navy truncate">
                                    {block.content || 'Imported HTML page'}
                                  </span>
                                  <span className="text-xs text-gray-500 truncate">
                                    {block.launchUrl || 'Launch URL not available.'}
                                  </span>
                                </div>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  disabled={!block.launchUrl}
                                  onClick={() => {
                                    if (block.launchUrl) window.open(block.launchUrl, '_blank');
                                  }}
                                >
                                  Open
                                </Button>
                              </div>
                            </div>
                          ) : (
                            <div className="relative">
                              {block.type === 'TEXT' && (
                                <div className="flex items-center justify-between mb-2">
                                  <Label>Text Content</Label>
                                  <button
                                    onClick={() => {
                                      setActiveAiBlockId(activeAiBlockId === block.id ? null : block.id);
                                      setAiPrompt('');
                                    }}
                                    className="text-xs font-bold text-blue flex items-center gap-1 hover:text-blue-700 transition-colors"
                                  >
                                    <Sparkles size={14} />
                                    AI WRITER
                                  </button>
                                </div>
                              )}

                              {activeAiBlockId === block.id && block.type === 'TEXT' && (
                                <div className="bg-blue-50 p-3 rounded-lg mb-3 border border-blue-100">
                                  <div className="flex gap-2">
                                    <Input
                                      value={aiPrompt}
                                      onChange={(e) => setAiPrompt(e.target.value)}
                                      placeholder="e.g. Explain the Principle of Overload..."
                                      className="bg-white text-sm py-2"
                                      onKeyDown={(e) => e.key === 'Enter' && handleAiGenerate(activeData.lesson.id, block.id, block.content)}
                                    />
                                    <Button
                                      size="sm"
                                      variant="secondary"
                                      onClick={() => handleAiGenerate(activeData.lesson.id, block.id, block.content)}
                                      disabled={isGenerating}
                                      className="w-32"
                                    >
                                      {isGenerating ? <Loader2 size={14} className="animate-spin" /> : <><Wand2 size={14} /> Write</>}
                                    </Button>
                                  </div>
                                  <p className="text-[10px] text-blue-600 mt-2 font-bold uppercase tracking-wide">
                                    Powered by Gemini 3 Flash
                                  </p>
                                </div>
                              )}

                              <TextArea
                                rows={block.type === 'TEXT' ? 5 : 2}
                                value={block.content}
                                onChange={(e) => updateBlockContent(activeData.lesson.id, block.id, e.target.value)}
                                placeholder={`Enter ${block.type.toLowerCase()} content...`}
                                className="border-none bg-transparent px-0 focus:ring-0"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Add Block Widget */}
                <div className="py-4 border-t-2 border-dashed border-gray-200">
                  <div className="text-xs font-bold text-center text-gray-400 uppercase mb-4 tracking-widest">Add Content Block</div>
                  <div className="flex flex-wrap justify-center gap-3">
                    <Button size="sm" variant="outline" icon={Video} onClick={() => addBlock('VIDEO')}>Video</Button>
                    <Button size="sm" variant="outline" icon={Type} onClick={() => addBlock('TEXT')}>Text</Button>
                    <Button size="sm" variant="outline" icon={FileText} onClick={() => addBlock('FILE')}>File</Button>
                    <Button size="sm" variant="outline" icon={CheckSquare} onClick={() => addBlock('CHECKLIST')}>Checklist</Button>
                    <Button size="sm" variant="outline" icon={LinkIcon} onClick={() => addBlock('LINK')}>Link</Button>
                    <Button size="sm" variant="outline" icon={HelpCircle} onClick={() => addBlock('QUIZ')}>Quiz</Button>
                    <Button size="sm" variant="outline" icon={Package} onClick={() => addBlock('SCORM')}>SCORM</Button>
                  </div>
                </div>

                <div className="h-20"></div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
              <Layout size={48} className="mb-4 opacity-20" />
              <p>Select a lesson to begin editing</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
