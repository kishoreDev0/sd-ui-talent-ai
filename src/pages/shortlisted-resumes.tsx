import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { Download, Trash2, Star, Calendar } from 'lucide-react';
import {
  listShortlistedResumesAsync,
  deleteShortlistedResumeAsync,
} from '@/store/slices/resume/resumeValidation';
import { RootState } from '@/store';
import { Snackbar } from '@/components/snackbar';
import { useState } from 'react';
import { downloadShortlistedResume } from '@/store/service/resume/resumeValidation';

const ShortlistedResumes: React.FC = () => {
  const dispatch = useDispatch();
  const { shortlistedResumes, loading } = useSelector(
    (state: RootState) => state.resumeValidation,
  );

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<
    'success' | 'error' | 'warning'
  >('success');

  useEffect(() => {
    dispatch(listShortlistedResumesAsync());
  }, [dispatch]);

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning',
  ) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  const handleDelete = async (id: number) => {
    if (
      !window.confirm(
        'Are you sure you want to remove this resume from shortlist?',
      )
    ) {
      return;
    }

    try {
      await dispatch(deleteShortlistedResumeAsync(id));
      showToast('Resume removed from shortlist', 'success');
    } catch {
      showToast('Failed to remove resume', 'error');
    }
  };

  const handleDownload = (resumeId: number, filename: string) => {
    const url = downloadShortlistedResume(resumeId);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getMatchColor = (percentage?: number) => {
    if (!percentage) return 'text-gray-600';
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6 p-6">
      {showSnackbar && (
        <Snackbar
          message={snackbarMessage}
          type={snackbarType}
          onClose={() => setShowSnackbar(false)}
        />
      )}

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900">
          Shortlisted Resumes
        </h1>
        <p className="text-gray-600 mt-2">
          View and manage your shortlisted candidate resumes
        </p>
      </motion.div>

      {/* Shortlisted Resumes List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading shortlisted resumes...</p>
          </div>
        ) : shortlistedResumes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-2xl border border-gray-100"
          >
            <Star className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">
              No shortlisted resumes yet
            </p>
            <p className="text-sm text-gray-500">
              Shortlist candidates from Resume Validation to see them here.
            </p>
          </motion.div>
        ) : (
          shortlistedResumes.map((resume) => (
            <motion.div
              key={resume.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Star className="w-5 h-5 text-orange-500 fill-orange-500" />
                    <h3 className="font-semibold text-lg">
                      {resume.original_filename}
                    </h3>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>{formatDate(resume.timestamp)}</span>
                    </div>
                    {resume.match_percentage !== undefined &&
                      resume.match_percentage !== null && (
                        <div
                          className={`font-semibold ${getMatchColor(resume.match_percentage)}`}
                        >
                          Match: {resume.match_percentage}%
                        </div>
                      )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      handleDownload(resume.id, resume.original_filename)
                    }
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Download Resume"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(resume.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Remove from Shortlist"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ShortlistedResumes;
