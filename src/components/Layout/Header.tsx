import React from 'react';

interface HeaderProps {
  className?: string;
}

export const Header: React.FC<HeaderProps> = ({ className = "" }) => {
  return (
    <div className={`mx-auto mb-6 sm:mb-8 w-full flex items-center justify-center ${className}`}>
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-xl bg-white/5 ring-1 ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.06),0_8px_30px_rgba(0,0,0,0.45)] flex items-center justify-center">
          <span className="text-white/80 font-semibold tracking-tight">YL</span>
        </div>
        <div className="flex flex-col">
          <h1 className="text-xl sm:text-2xl md:text-3xl tracking-tight font-semibold text-white/90">
            YouTube Looper
          </h1>
          <p className="text-xs sm:text-sm text-white/60">
            Paste a link, set a range, loop it endlessly.
          </p>
        </div>
      </div>
    </div>
  );
};