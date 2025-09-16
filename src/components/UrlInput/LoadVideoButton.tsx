import React from 'react';
import { Download } from 'lucide-react';

interface LoadVideoButtonProps {
  onLoad: () => void;
  disabled?: boolean;
  className?: string;
}

export const LoadVideoButton: React.FC<LoadVideoButtonProps> = ({
  onLoad,
  disabled = false,
  className = "",
}) => {
  return (
    <button
      onClick={onLoad}
      disabled={disabled}
      className={`group inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-medium bg-cyan-400/20 text-cyan-200 ring-1 ring-cyan-300/30 hover:bg-cyan-400/25 hover:ring-cyan-300/40 transition shadow-[inset_0_1px_0_rgba(255,255,255,0.05),0_10px_30px_rgba(0,0,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
      title="Load video from URL"
    >
      <Download className="h-4 w-4 text-cyan-300 group-hover:text-cyan-200" />
      Load Video
    </button>
  );
};