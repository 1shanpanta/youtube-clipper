import React from 'react';
import { ClipPreset } from '../../types';

interface TimePresetsProps {
  presets: ClipPreset[];
  onPresetSelect: (preset: ClipPreset) => void;
  className?: string;
}

export const TimePresets: React.FC<TimePresetsProps> = ({
  presets,
  onPresetSelect,
  className = "",
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      <label className="text-sm font-medium text-white/70 mb-1 block">
        Quick Duration Presets
      </label>
      <div className="flex flex-wrap gap-2">
        {presets.map((preset) => (
          <button
            key={preset.name}
            onClick={() => onPresetSelect(preset)}
            className="px-3 py-2 text-xs rounded-lg ring-1 transition bg-white/5 text-white/70 ring-white/10 hover:bg-white/10 hover:text-white/90 focus:outline-none focus:ring-2 focus:ring-white/30"
          >
            {preset.label}
          </button>
        ))}
      </div>
    </div>
  );
};