import React, { useState, useRef } from 'react';
import { RoomTheme, TransformationConfig } from '../types';
import { transformMultiViewImages } from '../services/geminiService';
import { Controls } from './Controls';
import { BeforeAfterSlider } from './BeforeAfterSlider';

interface ImageFile {
  file: File;
  id: string;
  previewUrl: string;
}

export const MultiViewRoom: React.FC = () => {
  const [images, setImages] = useState<ImageFile[]>([]);
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [config, setConfig] = useState<TransformationConfig>({
    theme: RoomTheme.MODERN,
    intensity: 75,
    preserveLayout: true,
    addOns: [],
  });

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      const newFiles = Array.from(event.target.files) as File[];
      addFiles(newFiles);
    }
  };

  const addFiles = (files: File[]) => {
    // Basic validation
    if (images.length + files.length > 5) {
      setError("Maximum 5 images allowed.");
      return;
    }

    const validFiles: ImageFile[] = [];
    let errorMessage = "";

    files.forEach(file => {
      if (file.type !== 'image/jpeg' && file.type !== 'image/png') {
        errorMessage = "Only JPG and PNG files are supported.";
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        errorMessage = "One or more files exceed 5MB.";
        return;
      }
      validFiles.push({
        file,
        id: Math.random().toString(36).substr(2, 9),
        previewUrl: URL.createObjectURL(file)
      });
    });

    if (errorMessage) setError(errorMessage);
    else setError(null);

    setImages(prev => [...prev, ...validFiles]);
    setResults([]); // Reset results if new images added
  };

  const removeImage = (id: string) => {
    setImages(prev => prev.filter(img => img.id !== id));
    setResults([]);
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        const base64Data = result.split(',')[1];
        resolve(base64Data);
      };
      reader.onerror = error => reject(error);
    });
  };

  const handleGenerate = async () => {
    if (images.length < 2) {
      setError("Please upload at least 2 images for multi-view processing.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);

    try {
      const imagesPayload = await Promise.all(images.map(async (img) => ({
        base64: await fileToBase64(img.file),
        mimeType: img.file.type
      })));

      const generatedImages = await transformMultiViewImages(imagesPayload, config);
      setResults(generatedImages);
      
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setIsLoading(false);
    }
  };

  const downloadImage = (dataUrl: string, index: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `view-${index + 1}-${config.theme.toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
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
             <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="lg:col-span-4 space-y-6">
        <div 
          className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center hover:border-indigo-400 hover:bg-gray-50 transition-all cursor-pointer"
          onClick={() => fileInputRef.current?.click()}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileChange} 
            accept="image/png, image/jpeg" 
            multiple
            className="hidden" 
          />
          <div className="mx-auto h-12 w-12 text-gray-400 mb-3">
             <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </div>
          <span className="block text-sm font-semibold text-indigo-600">Upload Multiple Views</span>
          <span className="block text-xs text-gray-500 mt-1">2-5 Images (JPG/PNG)</span>
        </div>

        {/* Thumbnail List */}
        {images.length > 0 && (
          <div className="grid grid-cols-3 gap-2">
            {images.map((img, idx) => (
              <div key={img.id} className="relative group aspect-square rounded-lg overflow-hidden bg-gray-100 border border-gray-200">
                <img src={img.previewUrl} alt={`View ${idx + 1}`} className="w-full h-full object-cover" />
                <button 
                  onClick={(e) => { e.stopPropagation(); removeImage(img.id); }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove image"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
                <span className="absolute bottom-1 left-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  View {idx + 1}
                </span>
              </div>
            ))}
          </div>
        )}

        <Controls 
          config={config}
          onChange={setConfig}
          isLoading={isLoading}
          onGenerate={handleGenerate}
          hasImage={images.length >= 2}
        />
      </div>

      {/* Results Area */}
      <div className="lg:col-span-8 space-y-6">
        {isLoading && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="relative w-20 h-20 mx-auto mb-4">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-100 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-600 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h3 className="text-lg font-medium text-gray-900">AI is redesigning your room...</h3>
            <p className="text-gray-500 mt-2">Applying {config.theme} style consistently across {images.length} views. This may take up to 45s.</p>
          </div>
        )}

        {!isLoading && results.length === 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center min-h-[400px] flex flex-col items-center justify-center">
             <div className="bg-indigo-50 p-4 rounded-full mb-4">
               <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
               </svg>
             </div>
             <h3 className="text-lg font-medium text-gray-900">Multi-View Mode</h3>
             <p className="text-gray-500 max-w-sm mt-2">Upload multiple photos of the same room (different angles) to transform them with a consistent style.</p>
          </div>
        )}

        {!isLoading && results.length > 0 && (
          <div className="grid grid-cols-1 gap-8">
            {images.map((img, idx) => (
              <div key={img.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                  <span className="font-semibold text-gray-700">View {idx + 1}</span>
                  <button 
                    onClick={() => results[idx] && downloadImage(results[idx], idx)}
                    className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                    disabled={!results[idx]}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download
                  </button>
                </div>
                <div className="p-4">
                  {results[idx] ? (
                    <BeforeAfterSlider 
                      beforeImage={img.previewUrl} 
                      afterImage={results[idx]} 
                      labelBefore={`Original ${idx + 1}`}
                      labelAfter="Transformed"
                    />
                  ) : (
                    <div className="aspect-video bg-gray-100 flex items-center justify-center text-gray-400 rounded-lg">
                      Transformation failed for this view
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
