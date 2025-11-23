import React from 'react';
import { useModelStore } from '../stores/useModelStore';


const ModelSelector = () => {
    const { selectedModel, setModel, availableModels } = useModelStore();

    return (
        <div className="mt-4">
            <label className="block text-sm font-medium text-gray-300 mb-1">
                Gemini Model
            </label>
            <select
                value={selectedModel}
                onChange={(e) => setModel(e.target.value)}
                className="w-full rounded-md bg-dark-800 border border-gray-600 text-gray-200 py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-400"
            >
                {availableModels.map((model) => (
                    <option key={model} value={model}>
                        {model}
                    </option>
                ))}
            </select>
        </div>
    );
};

export default ModelSelector;
