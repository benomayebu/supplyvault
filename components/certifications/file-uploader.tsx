"use client";

import { useState, useCallback } from "react";
import { Upload, X, File } from "lucide-react";
import { validateFile } from "@/lib/s3";

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  onRemove: () => void;
  error?: string;
}

export function FileUploader({
  onFileSelect,
  selectedFile,
  onRemove,
  error,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = Array.from(e.dataTransfer.files);
      if (files.length > 0) {
        const file = files[0];
        const validation = validateFile(file);
        if (validation.valid) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        const file = files[0];
        const validation = validateFile(file);
        if (validation.valid) {
          onFileSelect(file);
        }
      }
    },
    [onFileSelect]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  if (selectedFile) {
    return (
      <div className="rounded-lg border-2 border-gray-300 bg-gray-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <File className="h-8 w-8 text-primary-navy" />
            <div>
              <p className="text-sm font-medium text-gray-900">
                {selectedFile.name}
              </p>
              <p className="text-xs text-gray-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
          </div>
          <button
            onClick={onRemove}
            className="text-gray-400 hover:text-red-600"
            aria-label="Remove file"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative rounded-lg border-2 border-dashed p-8 text-center transition-colors
          ${
            isDragging
              ? "border-secondary-teal bg-secondary-teal/10"
              : "border-gray-300 hover:border-primary-navy"
          }
          ${error ? "border-red-500" : ""}
        `}
      >
        <input
          type="file"
          id="file-upload"
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={handleFileInput}
        />
        <Upload
          className={`mx-auto h-12 w-12 ${
            isDragging ? "text-secondary-teal" : "text-gray-400"
          }`}
        />
        <p className="mt-2 text-sm text-gray-600">
          <span className="font-medium text-primary-navy">Click to upload</span>{" "}
          or drag and drop
        </p>
        <p className="text-xs text-gray-500">PDF, JPG, or PNG (MAX. 10MB)</p>
      </div>
      {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
