import React, { ChangeEvent, useRef } from 'react';
import { BRANCH_OPTIONS } from '../constants/thumbnailConstants';
import { ProcessingStatus } from '../types/thumbnail';

interface ControlPanelProps {
    fullName: string;
    setFullName: (val: string) => void;
    branch: string;
    setBranch: (val: string) => void;
    courseName: string;
    setCourseName: (val: string) => void;
    onImageUpload: (e: ChangeEvent<HTMLInputElement>) => void;
    onProcessAI: () => void;
    aiStatus: ProcessingStatus;
    hasImage: boolean;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
    fullName, setFullName,
    branch, setBranch,
    courseName, setCourseName,
    onImageUpload,
    onProcessAI,
    aiStatus,
    hasImage
}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    return (
        <div className="bg-white p-6 rounded-xl shadow-lg h-full flex flex-col gap-8 overflow-y-auto">
            <div>
                <h2 className="text-2xl font-bold text-gray-800 mb-6 border-b pb-2">Thumbnail Controls</h2>

                {/* Section 1: Profile */}
                <div className="mb-8 space-y-4">
                    <h3 className="text-lg font-semibold text-blue-900 uppercase tracking-wide">1. Profile Section</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <input
                            type="text"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            placeholder="e.g. Josh Jones"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Profile Photo</label>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md border border-gray-300 transition text-sm font-medium"
                            >
                                Upload Photo
                            </button>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={onImageUpload}
                                className="hidden"
                            />
                            {hasImage && <span className="text-green-600 text-sm">Image loaded</span>}
                        </div>

                        {hasImage && (
                            <div className="mt-3 p-4 bg-blue-50 rounded-lg border border-blue-100">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <p className="text-sm font-semibold text-blue-900">AI Enhancement</p>
                                        <p className="text-xs text-blue-700 mt-1 max-w-[200px]">
                                            Auto-remove background, apply B&W filter, and add white outline.
                                        </p>
                                    </div>
                                    <button
                                        onClick={onProcessAI}
                                        disabled={aiStatus === ProcessingStatus.PROCESSING || aiStatus === ProcessingStatus.SUCCESS}
                                        className={`px-4 py-2 rounded-md text-white font-medium text-sm transition shadow-sm
                      ${aiStatus === ProcessingStatus.PROCESSING
                                                ? 'bg-blue-400 cursor-wait'
                                                : aiStatus === ProcessingStatus.SUCCESS
                                                    ? 'bg-green-600 cursor-default'
                                                    : 'bg-blue-600 hover:bg-blue-700'
                                            }`}
                                    >
                                        {aiStatus === ProcessingStatus.PROCESSING ? 'Processing...' :
                                            aiStatus === ProcessingStatus.SUCCESS ? 'Enhanced' : 'Magic Enhance'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Section 2: Course Info */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-red-700 uppercase tracking-wide">2. Course Details</h3>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Branch</label>
                        <div className="relative">
                            <select
                                value={branch}
                                onChange={(e) => setBranch(e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none appearance-none transition"
                            >
                                <option value="">Select a Branch...</option>
                                {BRANCH_OPTIONS.map((opt) => (
                                    <option key={opt} value={opt}>{opt}</option>
                                ))}
                            </select>
                            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" /></svg>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Course Name</label>
                        <input
                            type="text"
                            value={courseName}
                            onChange={(e) => setCourseName(e.target.value)}
                            placeholder="e.g. A Career in S&C (ASCA)"
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-500 focus:border-red-500 outline-none transition"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-auto pt-6 text-xs text-gray-400 border-t">
                <p>Ensure you have permission to use uploaded images.</p>
                <p className="mt-1">Generated images are for FIT College internal use.</p>
            </div>
        </div>
    );
};

export default ControlPanel;
