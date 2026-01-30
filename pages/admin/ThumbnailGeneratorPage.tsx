import React, { useState, ChangeEvent } from 'react';
import ThumbnailCanvas from '../../components/ThumbnailCanvas';
import ControlPanel from '../../components/ControlPanel';
import { ThumbnailData, ProcessingStatus } from '../../types/thumbnail';
import { processImageWithGemini } from '../../services/geminiService';

const ThumbnailGeneratorPage: React.FC = () => {
    const [fullName, setFullName] = useState("");
    const [branch, setBranch] = useState("Strength & Conditioning");
    const [courseName, setCourseName] = useState("");
    const [profileImage, setProfileImage] = useState<string | null>(null);
    const [processedImage, setProcessedImage] = useState<string | null>(null);
    const [aiStatus, setAiStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
    const [canvasInstance, setCanvasInstance] = useState<HTMLCanvasElement | null>(null);

    const handleImageUpload = (e: ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setProfileImage(event.target.result as string);
                    setProcessedImage(null); // Reset processed image on new upload // Keep status as IDLE until user clicks process
                    setAiStatus(ProcessingStatus.IDLE);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    const handleProcessAI = async () => {
        if (!profileImage) return;

        setAiStatus(ProcessingStatus.PROCESSING);
        try {
            const resultBase64 = await processImageWithGemini(profileImage);
            setProcessedImage(resultBase64);
            setAiStatus(ProcessingStatus.SUCCESS);
        } catch (error) {
            console.error("AI Processing Failed", error);
            setAiStatus(ProcessingStatus.ERROR);
            alert("AI Processing Failed. Please check your API Key or try again.");
        }
    };

    const handleDownload = () => {
        if (canvasInstance) {
            const link = document.createElement('a');
            link.download = `thumbnail-${courseName.replace(/\s+/g, '-').toLowerCase() || 'untitled'}.png`;
            link.href = canvasInstance.toDataURL('image/png');
            link.click();
        }
    };

    const thumbnailData: ThumbnailData = {
        fullName,
        branch,
        courseName,
        profileImage,
        processedImage
    };

    return (
        <div className="flex-1 flex flex-col font-sans text-gray-900">
            <main className="flex-1 p-8">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Thumbnail Generator</h1>
                            <p className="text-gray-600 mt-1">Create course thumbnails with AI-powered background removal.</p>
                        </div>
                        <button
                            onClick={handleDownload}
                            className="bg-blue-900 hover:bg-blue-800 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition flex items-center gap-2"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                            Download PNG
                        </button>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Column: Controls */}
                        <div className="w-full lg:w-1/3 order-2 lg:order-1">
                            <ControlPanel
                                fullName={fullName}
                                setFullName={setFullName}
                                branch={branch}
                                setBranch={setBranch}
                                courseName={courseName}
                                setCourseName={setCourseName}
                                onImageUpload={handleImageUpload}
                                onProcessAI={handleProcessAI}
                                aiStatus={aiStatus}
                                hasImage={!!profileImage}
                            />
                        </div>

                        {/* Right Column: Preview */}
                        <div className="w-full lg:w-2/3 order-1 lg:order-2 flex flex-col gap-4">
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Live Preview</h2>
                                    <span className="text-xs text-gray-400">1920 x 1080</span>
                                </div>
                                <ThumbnailCanvas
                                    data={thumbnailData}
                                    onCanvasReady={setCanvasInstance}
                                />
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg text-sm text-blue-800">
                                <strong>Tip:</strong> For best AI results, upload a photo with good lighting and a simple background. The AI will attempt to remove the background and apply the signature FIT College posterized effect.
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ThumbnailGeneratorPage;
