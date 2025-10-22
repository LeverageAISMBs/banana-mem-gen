import React, { useState } from 'react';
import type { ApiStatus } from '../types';
import { Loader } from './Loader';
import { MagicIcon, EditIcon, AnalyzeIcon, DownloadIcon } from './icons';

interface ControlPanelProps {
  imageSelected: boolean;
  captionSuggestions: string[];
  analysisResult: string;
  onCaptionSelect: (caption: string) => void;
  onGenerateCaptions: () => void;
  onEditImage: (prompt: string) => void;
  onAnalyzeImage: () => void;
  captionStatus: ApiStatus;
  editStatus: ApiStatus;
  analysisStatus: ApiStatus;
  captionPosition: 'top' | 'bottom';
  onCaptionPositionChange: (position: 'top' | 'bottom') => void;
}

const ActionButton: React.FC<{ onClick: () => void; disabled: boolean; status: ApiStatus; children: React.ReactNode; }> = ({ onClick, disabled, status, children }) => (
    <button
        onClick={onClick}
        disabled={disabled || status === 'loading'}
        className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
    >
        {status === 'loading' ? <Loader /> : children}
    </button>
);


export const ControlPanel: React.FC<ControlPanelProps> = ({
  imageSelected,
  captionSuggestions,
  analysisResult,
  onCaptionSelect,
  onGenerateCaptions,
  onEditImage,
  onAnalyzeImage,
  captionStatus,
  editStatus,
  analysisStatus,
  captionPosition,
  onCaptionPositionChange
}) => {
    const [editPrompt, setEditPrompt] = useState('');
    
    const handleDownloadAnalysis = () => {
        if (!analysisResult) return;

        const blob = new Blob([analysisResult], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'image-analysis.txt';
        document.body.appendChild(link); // Required for Firefox
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    return (
        <div className="space-y-6">
            {/* Caption Generator */}
            <div className="bg-slate-800 p-4 rounded-lg shadow-md space-y-3">
                <h2 className="text-lg font-semibold text-cyan-400">2. Generate Captions</h2>
                <ActionButton onClick={onGenerateCaptions} disabled={!imageSelected} status={captionStatus}>
                    <MagicIcon /> Magic Captions
                </ActionButton>

                {imageSelected && (
                    <div className="flex items-center justify-between pt-2">
                        <span className="text-sm text-slate-300">Caption Position:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => onCaptionPositionChange('top')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${captionPosition === 'top' ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                            >
                                Top
                            </button>
                            <button
                                onClick={() => onCaptionPositionChange('bottom')}
                                className={`px-3 py-1 text-sm rounded-md transition-colors ${captionPosition === 'bottom' ? 'bg-cyan-600 text-white' : 'bg-slate-700 hover:bg-slate-600'}`}
                            >
                                Bottom
                            </button>
                        </div>
                    </div>
                )}
                
                {captionStatus === 'success' && captionSuggestions.length > 0 && (
                    <div className="space-y-2 pt-2">
                        {captionSuggestions.map((caption, index) => (
                            <button
                                key={index}
                                onClick={() => onCaptionSelect(caption)}
                                className="w-full text-left p-2 bg-slate-700 hover:bg-slate-600 rounded-md text-sm transition-colors"
                            >
                                {caption}
                            </button>
                        ))}
                    </div>
                )}
                {captionStatus === 'error' && <p className="text-red-400 text-sm text-center">Failed to get captions. Please try again.</p>}
            </div>

            {/* Image Editor */}
            <div className="bg-slate-800 p-4 rounded-lg shadow-md space-y-3">
                <h2 className="text-lg font-semibold text-cyan-400">3. Edit with AI</h2>
                <textarea
                    value={editPrompt}
                    onChange={(e) => setEditPrompt(e.target.value)}
                    placeholder="e.g., 'add a birthday hat', 'make it look like a sketch'"
                    disabled={!imageSelected || editStatus === 'loading'}
                    className="w-full bg-slate-700 p-2 rounded-md focus:ring-2 focus:ring-cyan-500 focus:outline-none disabled:opacity-50"
                    rows={3}
                />
                <ActionButton onClick={() => onEditImage(editPrompt)} disabled={!imageSelected || !editPrompt} status={editStatus}>
                    <EditIcon /> Apply Edit
                </ActionButton>
                {editStatus === 'error' && <p className="text-red-400 text-sm text-center">Failed to edit image. Please try again.</p>}
            </div>

            {/* Image Analyzer */}
            <div className="bg-slate-800 p-4 rounded-lg shadow-md space-y-3">
                <div className="flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-cyan-400">4. Analyze Image</h2>
                    {analysisStatus === 'success' && analysisResult && (
                        <button
                          onClick={handleDownloadAnalysis}
                          className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
                          aria-label="Download analysis"
                          title="Download analysis"
                        >
                          <DownloadIcon />
                        </button>
                    )}
                </div>
                <ActionButton onClick={onAnalyzeImage} disabled={!imageSelected} status={analysisStatus}>
                    <AnalyzeIcon /> Analyze
                </ActionButton>
                {analysisStatus === 'success' && analysisResult && (
                    <p className="text-sm bg-slate-700 p-2 rounded-md">{analysisResult}</p>
                )}
                {analysisStatus === 'error' && <p className="text-red-400 text-sm text-center">Failed to analyze image. Please try again.</p>}
            </div>
        </div>
    );
};
