import React from 'react';
import { RoomTheme, TransformationConfig, RoomAddOn } from '../types';

interface ControlsProps {
  config: TransformationConfig;
  onChange: (newConfig: TransformationConfig) => void;
  isLoading: boolean;
  onGenerate: () => void;
  hasImage: boolean;
}

export const Controls: React.FC<ControlsProps> = ({ config, onChange, isLoading, onGenerate, hasImage }) => {
  
  const updateField = <K extends keyof TransformationConfig>(field: K, value: TransformationConfig[K]) => {
    onChange({ ...config, [field]: value });
  };

  const toggleAddOn = (addOn: RoomAddOn) => {
    const currentAddOns = config.addOns || [];
    const newAddOns = currentAddOns.includes(addOn)
      ? currentAddOns.filter(item => item !== addOn)
      : [...currentAddOns, addOn];
    updateField('addOns', newAddOns);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Transformation Settings</h2>
        
        {/* Theme Selection */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Room Theme</label>
          <div className="relative">
            <select
              value={config.theme}
              onChange={(e) => updateField('theme', e.target.value as RoomTheme)}
              disabled={isLoading}
              className="block w-full pl-3 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md bg-gray-50 border"
            >
              {Object.values(RoomTheme).map((theme) => (
                <option key={theme} value={theme}>
                  {theme}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Intensity Slider */}
        <div className="mb-5">
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-medium text-gray-700">Theme Intensity</label>
            <span className="text-sm font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
              {config.intensity}%
            </span>
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={config.intensity}
            onChange={(e) => updateField('intensity', parseInt(e.target.value))}
            disabled={isLoading}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-1">
            <span>Subtle</span>
            <span>Balanced</span>
            <span>Extreme</span>
          </div>
        </div>

        {/* Layout Preservation */}
        <div className="mb-6">
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="preserveLayout"
                type="checkbox"
                checked={config.preserveLayout}
                onChange={(e) => updateField('preserveLayout', e.target.checked)}
                disabled={isLoading}
                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
              />
            </div>
            <div className="ml-3 text-sm">
              <label htmlFor="preserveLayout" className="font-medium text-gray-700">Preserve Furniture Layout</label>
              <p className="text-gray-500">Lock furniture positions. Uncheck to allow AI to rearrange items.</p>
            </div>
          </div>
        </div>

        {/* Customization Add-Ons */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-3">Customize Your Room (Optional)</label>
          <div className="grid grid-cols-2 gap-3">
            {Object.values(RoomAddOn).map((addOn) => (
              <label key={addOn} className={`
                flex items-center p-2 rounded border cursor-pointer transition-colors
                ${config.addOns?.includes(addOn) 
                  ? 'bg-indigo-50 border-indigo-200' 
                  : 'bg-white border-gray-200 hover:bg-gray-50'}
                ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
              `}>
                <input
                  type="checkbox"
                  checked={config.addOns?.includes(addOn) || false}
                  onChange={() => !isLoading && toggleAddOn(addOn)}
                  disabled={isLoading}
                  className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
                <span className="ml-2 text-xs font-medium text-gray-700">{addOn}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Additional Custom Instructions */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Instructions (Optional)
          </label>
          <textarea
            value={config.customInstructions || ''}
            onChange={(e) => updateField('customInstructions', e.target.value)}
            disabled={isLoading}
            placeholder="e.g. Make the walls soft cream color, add a chalkboard to the back, remove the bottle on the table."
            rows={3}
            className="block w-full px-3 py-2 text-sm border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 bg-gray-50 focus:bg-white resize-none"
          />
        </div>

        {/* Generate Button */}
        <button
          onClick={onGenerate}
          disabled={!hasImage || isLoading}
          className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all
            ${!hasImage || isLoading 
              ? 'bg-gray-300 cursor-not-allowed' 
              : 'bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 hover:shadow-lg'
            }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Transforming Room...
            </span>
          ) : (
            'Generate Transformation'
          )}
        </button>
      </div>
    </div>
  );
};