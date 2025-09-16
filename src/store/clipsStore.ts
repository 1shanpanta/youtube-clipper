import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { Clip, ClipPreset } from '../types';

interface ClipsStore {
  // State
  clips: Clip[];
  presets: ClipPreset[];
  favoriteClips: string[]; // clip IDs

  // Actions
  addClip: (clip: Omit<Clip, 'id' | 'createdAt'>) => string;
  updateClip: (id: string, updates: Partial<Omit<Clip, 'id' | 'createdAt'>>) => void;
  removeClip: (id: string) => void;
  getClip: (id: string) => Clip | undefined;
  getClipsByVideo: (videoId: string) => Clip[];
  toggleFavorite: (clipId: string) => void;
  clearAllClips: () => void;

  // Presets
  addPreset: (preset: ClipPreset) => void;
  removePreset: (name: string) => void;
  getPreset: (name: string) => ClipPreset | undefined;
}

const defaultPresets: ClipPreset[] = [
  { name: '5sec', duration: 5, label: '5 seconds' },
  { name: '10sec', duration: 10, label: '10 seconds' },
  { name: '30sec', duration: 30, label: '30 seconds' },
  { name: '1min', duration: 60, label: '1 minute' },
  { name: '2min', duration: 120, label: '2 minutes' },
];

const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

export const useClipsStore = create<ClipsStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        clips: [],
        presets: defaultPresets,
        favoriteClips: [],

        // Clip management
        addClip: (clipData) => {
          const id = generateId();
          const clip: Clip = {
            ...clipData,
            id,
            createdAt: new Date(),
          };

          set(
            (state) => ({
              clips: [...state.clips, clip],
            }),
            false,
            'addClip'
          );

          return id;
        },

        updateClip: (id, updates) => {
          set(
            (state) => ({
              clips: state.clips.map((clip) =>
                clip.id === id ? { ...clip, ...updates } : clip
              ),
            }),
            false,
            'updateClip'
          );
        },

        removeClip: (id) => {
          set(
            (state) => ({
              clips: state.clips.filter((clip) => clip.id !== id),
              favoriteClips: state.favoriteClips.filter((clipId) => clipId !== id),
            }),
            false,
            'removeClip'
          );
        },

        getClip: (id) => {
          return get().clips.find((clip) => clip.id === id);
        },

        getClipsByVideo: (videoId) => {
          return get().clips.filter((clip) => clip.videoId === videoId);
        },

        toggleFavorite: (clipId) => {
          set(
            (state) => ({
              favoriteClips: state.favoriteClips.includes(clipId)
                ? state.favoriteClips.filter((id) => id !== clipId)
                : [...state.favoriteClips, clipId],
            }),
            false,
            'toggleFavorite'
          );
        },

        clearAllClips: () => {
          set(
            { clips: [], favoriteClips: [] },
            false,
            'clearAllClips'
          );
        },

        // Preset management
        addPreset: (preset) => {
          set(
            (state) => ({
              presets: [...state.presets.filter((p) => p.name !== preset.name), preset],
            }),
            false,
            'addPreset'
          );
        },

        removePreset: (name) => {
          set(
            (state) => ({
              presets: state.presets.filter((preset) => preset.name !== name),
            }),
            false,
            'removePreset'
          );
        },

        getPreset: (name) => {
          return get().presets.find((preset) => preset.name === name);
        },
      }),
      {
        name: 'clips-storage',
        // Only persist clips and user-added presets, not the default presets
        partialize: (state) => ({
          clips: state.clips,
          favoriteClips: state.favoriteClips,
          presets: state.presets.filter(
            (preset) => !defaultPresets.some((def) => def.name === preset.name)
          ),
        }),
      }
    ),
    {
      name: 'clips-store',
    }
  )
);