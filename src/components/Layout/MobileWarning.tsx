import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface MobileWarningProps {
  className?: string;
}

export const MobileWarning: React.FC<MobileWarningProps> = ({ className = "" }) => {
  return (
    <div className={`block lg:hidden mb-6 rounded-xl bg-amber-500/10 backdrop-blur-sm ring-1 ring-amber-400/20 p-4 ${className}`}>
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-300 mt-0.5 flex-shrink-0" />
        <div className="text-sm text-amber-200">
          <p className="font-medium mb-1">Desktop Experience Recommended</p>
          <p className="text-amber-200/80">
            This app is optimized for laptop/desktop screens. While it works on mobile, the experience might not be the best.
          </p>
        </div>
      </div>
    </div>
  );
};