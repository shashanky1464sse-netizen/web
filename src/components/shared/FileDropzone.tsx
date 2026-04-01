import React, { useCallback, useState } from 'react';
import { useDropzone, DropzoneOptions } from 'react-dropzone';
import { UploadCloud, File as FileIcon, X, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: DropzoneOptions['accept'];
  maxSize?: number; // bytes
  isLoading?: boolean;
}

export const FileDropzone: React.FC<FileDropzoneProps> = ({ 
  onFileSelect, 
  accept = { 'application/pdf': ['.pdf'] },
  maxSize = 5 * 1024 * 1024, // 5MB default
  isLoading = false
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
    disabled: isLoading
  });

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
  };

  return (
    <div
      {...getRootProps()}
      className={cn(
        "border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center min-h-[240px] cursor-pointer",
        isDragActive ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-surface-2/50 outline-none",
        isDragReject && "border-destructive bg-destructive/5",
        isLoading && "opacity-70 cursor-not-allowed",
        "bg-surface"
      )}
    >
      <input {...getInputProps()} />
      
      {isLoading ? (
        <div className="flex flex-col items-center text-center">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h3 className="text-lg font-medium text-foreground">Processing File...</h3>
          <p className="text-sm text-muted-foreground mt-2 max-w-xs">
            Extracting skills using backend NLP pipeline. This may take a moment.
          </p>
        </div>
      ) : selectedFile ? (
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-4 relative">
            <FileIcon className="h-8 w-8" />
            <button 
              onClick={handleRemove}
              className="absolute -top-1 -right-1 bg-surface border border-border rounded-full p-1 hover:bg-destructive hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <h3 className="text-lg font-medium text-foreground truncate max-w-[250px]">{selectedFile.name}</h3>
          <p className="text-sm text-muted-foreground mt-1">
            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
          </p>
        </div>
      ) : (
        <div className="flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-secondary text-muted-foreground rounded-full flex items-center justify-center mb-6">
            <UploadCloud className="h-8 w-8" />
          </div>
          <h3 className="text-xl font-syne font-medium text-foreground mb-2">
            {isDragActive ? "Drop file here" : "Click or drag to upload"}
          </h3>
          <p className="text-sm text-muted-foreground max-w-xs">
            Supports PDF format up to {maxSize / (1024 * 1024)}MB.
          </p>
        </div>
      )}
    </div>
  );
};
