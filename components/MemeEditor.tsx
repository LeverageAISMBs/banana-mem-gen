
import React from 'react';
import { Loader } from './Loader';
import { DownloadIcon } from './icons';

interface MemeEditorProps {
  imageUrl?: string;
  captionText?: string;
  isLoading: boolean;
  captionPosition: 'top' | 'bottom';
  onDownload: () => void;
}

export const MemeEditor: React.FC<MemeEditorProps> = ({ imageUrl, captionText, isLoading, captionPosition, onDownload }) => {
  return (
    <div className="w-full max-w-lg aspect-square bg-slate-800 rounded-lg shadow-lg flex items-center justify-center p-2 relative overflow-hidden">
      {imageUrl ? (
        <>
          <img src={imageUrl} alt="Meme preview" className="max-w-full max-h-full object-contain rounded" />
          {captionText && (
            <div className={`absolute ${captionPosition === 'top' ? 'top-4' : 'bottom-4'} left-4 right-4 p-2 text-center`}>
              <h2 className="text-3xl md:text-4xl font-extrabold text-white uppercase tracking-wider [text-shadow:_2px_2px_4px_rgb(0_0_0_/_100%)]">
                {captionText}
              </h2>
            </div>
          )}
           <button
            onClick={onDownload}
            disabled={!imageUrl}
            className="absolute top-2 right-2 bg-slate-900/50 hover:bg-cyan-600 text-white p-2 rounded-full transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Download meme"
            title="Download meme"
          >
            <DownloadIcon />
          </button>
          {isLoading && (
            <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-4 transition-opacity">
              <Loader />
              <p className="text-lg font-semibold text-cyan-400">AI is editing...</p>
            </div>
          )}
        </>
      ) : (
        <div className="text-center text-slate-400">
          <p>Select an image to start</p>
          <p className="text-sm">Upload or choose a template</p>
        </div>
      )}
    </div>
  );
};
