import { useState, useCallback, useRef } from "react";
import { Upload, File, X, CheckCircle, AlertCircle } from "lucide-react";

const ALLOWED_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "text/plain",
  "text/markdown",
  "text/x-markdown",
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "image/svg+xml",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

const fileTypeLabels = {
  "application/pdf": "PDF",
  "application/msword": "DOC",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
  "application/vnd.ms-powerpoint": "PPT",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation": "PPTX",
  "text/plain": "TXT",
  "text/markdown": "MD",
  "text/x-markdown": "MD",
  "image/jpeg": "JPG",
  "image/png": "PNG",
  "image/gif": "GIF",
  "image/webp": "WEBP",
  "image/svg+xml": "SVG",
};

export function FileUploader({ onFileSelect, onFileRemove, maxFiles = 1, accept = ALLOWED_TYPES.join(",") }) {
  const [files, setFiles] = useState([]);
  const [dragActive, setDragActive] = useState(false);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef(null);

  const validateFile = useCallback((file) => {
    const errors = {};
    
    if (!ALLOWED_TYPES.includes(file.type)) {
      errors.type = `File type "${fileTypeLabels[file.type] || file.type}" is not allowed`;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      errors.size = `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`;
    }
    
    return Object.keys(errors).length > 0 ? errors : null;
  }, []);

  const addFiles = useCallback((newFiles) => {
    const fileArray = Array.from(newFiles);
    const validFiles = [];
    const newErrors = {};
    
    fileArray.forEach((file, index) => {
      const error = validateFile(file);
      if (error) {
        newErrors[`${file.name}-${index}`] = error;
      } else if (files.length + validFiles.length < maxFiles) {
        validFiles.push(file);
      }
    });
    
    if (validFiles.length > 0) {
      setFiles(prev => [...prev, ...validFiles]);
      onFileSelect?.(validFiles);
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
    }
  }, [files.length, maxFiles, onFileSelect, validateFile]);

  const removeFile = useCallback((index) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
    onFileRemove?.(index);
  }, [onFileRemove]);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      addFiles(e.target.files);
      e.target.value = "";
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div 
      className={`border-2 border-dashed rounded-xl p-6 transition-colors ${dragActive ? "border-primary-500 bg-primary-50" : "border-gray-300 hover:border-primary-400"}`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        multiple={maxFiles > 1}
        onChange={handleFileSelect}
        className="hidden"
        id="file-upload"
        disabled={files.length >= maxFiles}
      />

      {files.length === 0 ? (
        <div className="text-center">
          <Upload className="w-12 h-12 mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
          <p className="text-sm text-gray-500">
            Supported: PDF, DOC, DOCX, PPT, PPTX, TXT, MD, SVG, Images (Max 10MB)
          </p>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mt-4 btn-primary"
            disabled={files.length >= maxFiles}
          >
            Choose Files
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {files.map((file, index) => {
            const error = errors[`${file.name}-${index}`];
            return (
              <div key={index} className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-lg">
                <File className="w-10 h-10 text-gray-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">{file.name}</p>
                  <p className="text-sm text-gray-500">{fileTypeLabels[file.type] || file.type} • {formatFileSize(file.size)}</p>
                  {error && (
                    <p className="text-sm text-red-600 mt-1">{error.type || error.size}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  aria-label="Remove file"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            );
          })}

          {files.length < maxFiles && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-full btn-outline"
            >
              <Upload className="w-4 h-4 mr-2" />
              Add Another File
            </button>
          )}
        </div>
      )}

      {Object.keys(errors).length > 0 && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-red-700 mb-2">
            <AlertCircle className="w-5 h-5" />
            <span className="font-medium">File validation errors:</span>
          </div>
          <ul className="text-sm text-red-600 space-y-1">
            {Object.entries(errors).map(([key, error]) => (
              <li key={key} className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error.type || error.size}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}