import React, { useCallback, useState } from 'react';
import { UploadCloud } from 'lucide-react';

interface FileUploadProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSizeInMB?: number;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileSelect, accept, maxSizeInMB = 5 }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsHovered(false);
    setError(null);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.size > maxSizeInMB * 1024 * 1024) {
        setError(`File exceeds maximum size of ${maxSizeInMB}MB`);
        return;
      }
      onFileSelect(file);
    }
  }, [onFileSelect, maxSizeInMB]);

  return (
    <div className="w-full">
      <div 
        onDragOver={(e) => { e.preventDefault(); setIsHovered(true); }}
        onDragLeave={() => setIsHovered(false)}
        onDrop={handleDrop}
        className={`relative flex flex-col items-center justify-center p-10 border-2 border-dashed rounded-3xl transition-all duration-300 ease-out cursor-pointer overflow-hidden
          ${isHovered 
            ? 'border-blue-500 bg-blue-50 shadow-inner' 
            : 'border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-gray-300'}`}
      >
        <div className={`p-4 rounded-full mb-4 transition-transform duration-300 ${isHovered ? 'bg-blue-100 scale-110' : 'bg-white shadow-sm ring-1 ring-gray-100'}`}>
          <UploadCloud size={32} className={isHovered ? 'text-blue-600' : 'text-gray-400'} />
        </div>
        
        <h4 className="text-base font-semibold text-gray-800 mb-1">
          Drag & drop your file here
        </h4>
        <p className="text-sm text-gray-500 mb-6 flex space-x-1">
          <span>or</span>
          <label htmlFor="file-upload" className="text-blue-600 hover:text-blue-700 font-medium hover:underline cursor-pointer">
            browse from your computer
          </label>
        </p>
        
        <div className="flex items-center space-x-2 text-xs text-gray-400">
          <span className="bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">{accept || 'All formats'}</span>
          <span className="bg-white px-2 py-1 rounded-md border border-gray-100 shadow-sm">Max {maxSizeInMB}MB</span>
        </div>
        <input 
          type="file" 
          id="file-upload" 
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
          accept={accept}
          onChange={(e) => {
            setError(null);
            if (e.target.files && e.target.files[0]) {
              const file = e.target.files[0];
              if (file.size > maxSizeInMB * 1024 * 1024) {
                setError(`File exceeds maximum size of ${maxSizeInMB}MB`);
                return;
              }
              onFileSelect(file);
            }
          }}
        />
      </div>
      {error && <p className="mt-3 text-sm font-medium text-red-500 flex items-center">{error}</p>}
    </div>
  );
};
