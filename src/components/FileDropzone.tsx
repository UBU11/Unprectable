'use client';

import { useCallback, useState } from 'react';
import { useDropzone, type Accept, type FileRejection } from 'react-dropzone';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileAccepted: (file: File) => void;
  isProcessing: boolean;
}

const ACCEPTED_EXTENSIONS: Accept = {
  'text/plain': ['.txt'],
  'text/markdown': ['.md'],
  'application/pdf': ['.pdf'],
  'text/csv': ['.csv'],
};

const MAX_SIZE = 10 * 1024 * 1024; // 10MB

export function FileDropzone({ onFileAccepted, isProcessing }: FileDropzoneProps) {
  const [rejectionError, setRejectionError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[], fileRejections: FileRejection[]) => {
      setRejectionError(null);

      if (fileRejections.length > 0) {
        const errors = fileRejections[0].errors.map((e) => e.message).join(', ');
        setRejectionError(errors);
        return;
      }

      if (acceptedFiles.length > 0) {
        onFileAccepted(acceptedFiles[0]);
      }
    },
    [onFileAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: ACCEPTED_EXTENSIONS,
    maxSize: MAX_SIZE,
    multiple: false,
    disabled: isProcessing,
  });

  return (
    <div className="flex flex-col gap-2">
      <div
        {...getRootProps()}
        className={cn(
          'flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-6 transition-colors cursor-pointer',
          isDragActive
            ? 'border-purple-400 bg-purple-500/10'
            : 'border-slate-700 bg-slate-800/50 hover:border-purple-500/50 hover:bg-slate-800',
          isProcessing && 'opacity-50 cursor-not-allowed'
        )}
      >
        <input {...getInputProps()} />
        <div className="text-3xl mb-2">{isDragActive ? '📥' : '📂'}</div>
        {isProcessing ? (
          <p className="text-sm text-slate-400">Processing file...</p>
        ) : isDragActive ? (
          <p className="text-sm text-purple-300 font-medium">Drop the file here</p>
        ) : (
          <>
            <p className="text-sm text-slate-300 font-medium">
              Drag & drop a file here, or click to browse
            </p>
            <p className="text-xs text-slate-500 mt-1">
              Supports .txt, .md, .pdf, .csv (max 10MB)
            </p>
          </>
        )}
      </div>

      {rejectionError && (
        <p className="text-xs text-red-400">{rejectionError}</p>
      )}
    </div>
  );
}
