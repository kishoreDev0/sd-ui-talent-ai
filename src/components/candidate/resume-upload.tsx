import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface ResumeUploadProps {
  onUploadComplete?: (data: Record<string, unknown>) => void;
}

const ResumeUpload: React.FC<ResumeUploadProps> = ({ onUploadComplete }) => {
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    if (!file.name.match(/\.(pdf|doc|docx)$/i)) {
      setError('Please upload a PDF or DOC file');
      return;
    }

    setUploading(true);
    setError(null);

    // Simulate upload and parsing
    setTimeout(() => {
      setUploading(false);
      setUploaded(true);
      onUploadComplete?.({
        filename: file.name,
        size: file.size,
        parsedData: {
          name: 'John Doe',
          email: 'john.doe@example.com',
          phone: '+1 (555) 123-4567',
          skills: ['React', 'TypeScript', 'Node.js', 'Python'],
          experience: 5,
          education: 'BSc Computer Science',
        },
      });
    }, 2000);
  };

  const handleReset = () => {
    setUploaded(false);
    setError(null);
    setUploading(false);
  };

  return (
    <div className="space-y-4">
      {!uploaded && (
        <div
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
            dragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 bg-white hover:border-blue-400'
          }`}
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
        >
          <input
            type="file"
            id="resume-upload"
            className="hidden"
            accept=".pdf,.doc,.docx"
            onChange={handleFileInput}
            disabled={uploading}
          />

          {uploading ? (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-16 h-16 text-blue-600 animate-spin" />
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  Processing Resume...
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  AI is extracting candidate information
                </p>
              </div>
            </div>
          ) : (
            <>
              <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <label htmlFor="resume-upload" className="cursor-pointer">
                <p className="text-xl font-semibold text-gray-900 mb-2">
                  Drop your resume here or click to browse
                </p>
                <p className="text-sm text-gray-600 mb-4">
                  Supports PDF, DOC, DOCX (Max 10MB)
                </p>
                <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-6 py-3 rounded-xl font-medium hover:shadow-lg transition-all">
                  Select File
                </button>
              </label>
            </>
          )}
        </div>
      )}

      {uploaded && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-2xl p-6"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-4">
              <div className="bg-green-500 p-3 rounded-xl">
                <CheckCircle2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  Resume Parsed Successfully
                </h3>
                <p className="text-sm text-gray-600 mt-1">
                  Candidate information extracted
                </p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 rounded-2xl p-6"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-red-500" />
            <span className="text-red-700 font-medium">{error}</span>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeUpload;
