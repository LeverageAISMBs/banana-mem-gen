
import React, { useRef } from 'react';
import type { MemeTemplate } from '../types';
import { UploadIcon, ShuffleIcon } from './icons';

interface ImageSelectorProps {
  templates: MemeTemplate[];
  onImageSelect: (imageSource: string | File) => void;
  onShuffle: () => void;
}

export const ImageSelector: React.FC<ImageSelectorProps> = ({ templates, onImageSelect, onShuffle }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      onImageSelect(event.target.files[0]);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="bg-slate-800 p-4 rounded-lg shadow-md space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-cyan-400">1. Choose Image</h2>
        <button
          onClick={onShuffle}
          className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-700 transition-colors focus:outline-none focus:ring-2 focus:ring-cyan-500"
          aria-label="Shuffle templates"
          title="Shuffle templates"
        >
          <ShuffleIcon />
        </button>
      </div>
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept="image/png, image/jpeg, image/webp"
      />
      
      <button
        onClick={handleUploadClick}
        className="w-full flex items-center justify-center gap-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg transition-colors duration-300"
      >
        <UploadIcon />
        Upload Your Own
      </button>

      <div className="text-center text-slate-400">or select a template</div>

      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {templates.map((template: MemeTemplate) => (
          <button
            key={template.id}
            onClick={() => onImageSelect(template.url)}
            className="group relative rounded-lg overflow-hidden border-2 border-transparent hover:border-cyan-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:ring-offset-2 focus:ring-offset-slate-800"
          >
            <img src={template.url} alt={template.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/20 transition-colors flex items-end p-1">
              <span className="text-white text-xs font-semibold truncate">{template.name}</span>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
