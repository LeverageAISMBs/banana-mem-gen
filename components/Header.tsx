
import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="bg-slate-800/50 backdrop-blur-sm shadow-lg p-4 sticky top-0 z-10">
      <div className="container mx-auto flex items-center gap-4">
        <div className="text-4xl">🎨</div>
        <h1 className="text-2xl font-bold tracking-tight text-cyan-400">
          AI Meme Generator
        </h1>
      </div>
    </header>
  );
};
