import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Store for selecting Gemini model (e.g., gemini-2.0-flash-exp, gemini-2.5-flash, gemini-3.0-pro)
export const useModelStore = create(
    persist(
        (set, get) => ({
            selectedModel: 'gemini-2.0-flash-exp', // default model
            setModel: (model) => set({ selectedModel: model }),
            // Available options (can be extended)
            availableModels: [
                'gemini-2.0-flash-exp',
                'gemini-2.5-flash',
                'gemini-3.0-pro'
            ]
        }),
        {
            name: 'model-store' // key in localStorage
        }
    )
);
