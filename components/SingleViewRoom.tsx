import React, { useState, useRef } from 'react';
import { RoomTheme, TransformationConfig } from '../types';
import { transformRoomImage } from '../services/geminiService';
import { Controls } from './Controls';
import { BeforeAfterSlider } from './BeforeAfterSlider';

export const SingleViewRoom: React.FC = () => {
  const [originalFile, setOriginalFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [transformedImage, setTransformedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [config, setConfig] = useState<TransformationConfig>({
    theme: RoomTheme.MODERN,
    intensity: 75,
    preserveLayout: true,
    addOns: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle File Upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File | undefined) => {
    if (file) {
      // Validate File Type
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        setError('Please upload a valid JPG or PNG image.');
        return;
      }
      
      // Validate File Size (Max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('File size exceeds 5MB limit. Please upload a smaller image.');
        return;
      }

      setOriginalFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setTransformedImage(null); // Reset result on new upload
      setError(null);
    }
  };

  // Convert File to Base64 (helper)
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data URL prefix (e.g., "data:image/jpeg;base64,")
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (!originalFile || !previewUrl) return;

    setIsLoading(true);
    setError(null);

    try {
      const base64Data = await fileToBase64(originalFile);
      const resultUrl = await transformRoomImage(base64Data, originalFile.type, config);
      setTransformedImage(resultUrl);
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    if (transformedImage) {
      const link = document.createElement('a');
      link.href = transformedImage;
      link.download = `room-transformed-${config.theme.toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    validateAndSetFile(file);
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Error Alert */}
      {error && (
        <div className="lg:col-span-12 mb-6 rounded-md bg-red-50 p-4 border border-red-200">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>{error}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Left Column: Controls & Input */}
      <div className="lg:col-span-4 space-y-6">
        
        {/* Image Upload Area */}
        <div 
          className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all cursor-pointer group
            ${previewUrl 
              ? 'border-indigo-300 bg-indigo-50/50' 
              : 'border-gray-300 hover:border-[#22D3EE] hover:bg-gray-50 hover:shadow-md'
            }`}
          onClick={() => fileInputRef.current?.click()}
          onDrop={onDrop}
          onDragOver={onDragOver}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/png, image/jpeg" 
            className="hidden" 
          />
          
          {!previewUrl ? (
            <div className="space-y-4">
              <div className="mx-auto h-16 w-16 text-indigo-200 bg-indigo-50 rounded-full flex items-center justify-center group-hover:text-[#22D3EE] group-hover:bg-cyan-50 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
              <div className="text-gray-600">
                <span className="font-semibold text-indigo-600 hover:text-indigo-500">Click to upload</span> or drag and drop
                <p className="text-xs text-gray-400 mt-2">PNG, JPG up to 5MB</p>
              </div>
            </div>
          ) : (
            <div className="relative group">
              <div className="aspect-[4/3] w-full overflow-hidden rounded-lg bg-gray-100 shadow-sm">
                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-40 transition-all flex items-center justify-center rounded-lg">
                <button className="opacity-0 group-hover:opacity-100 bg-white text-gray-800 px-4 py-2 rounded-full text-sm font-medium shadow-lg hover:bg-gray-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                  Change Photo
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-2 truncate">{originalFile?.name}</p>
            </div>
          )}
        </div>

        {/* Controls */}
        <Controls 
          config={config} 
          onChange={setConfig} 
          isLoading={isLoading} 
          onGenerate={handleGenerate}
          hasImage={!!previewUrl}
        />
      </div>

      {/* Right Column: Results & Visualization */}
      <div className="lg:col-span-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 h-full min-h-[500px] flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-semibold text-gray-800">
              {transformedImage ? "Transformation Result" : "Preview Area"}
            </h3>
            {transformedImage && (
              <button 
                onClick={handleDownload}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                Download Result
              </button>
            )}
          </div>
          
          <div className="flex-grow flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100 overflow-hidden relative">
            {isLoading ? (
              <div className="text-center p-10">
                <div className="relative w-24 h-24 mx-auto mb-4">
                   <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
                   <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 font-medium text-lg">AI is redesigning your room...</p>
                <p className="text-gray-400 text-sm mt-2">Analyzing geometry, materials, and lighting. This may take 15–30s.</p>
              </div>
            ) : transformedImage && previewUrl ? (
              <BeforeAfterSlider 
                beforeImage={previewUrl} 
                afterImage={transformedImage} 
                labelBefore="Original"
                labelAfter={`${config.theme}`}
              />
            ) : previewUrl ? (
              <img src={previewUrl} alt="Upload Preview" className="max-w-full max-h-[600px] object-contain shadow-lg rounded-lg" />
            ) : (
              <div className="text-center p-12 text-gray-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p>Upload an image to see the magic happen</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
