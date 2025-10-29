import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { FileText, Trash2, Eye, Calendar } from 'lucide-react';
import {
  listSavedAnalysesAsync,
  deleteSavedAnalysisAsync,
} from '@/store/slices/resume/resumeValidation';
import { RootState } from '@/store';
import { Snackbar } from '@/components/snackbar';
import { useState } from 'react';
import { SavedAnalysis } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const SavedAnalyses: React.FC = () => {
  const dispatch = useDispatch();
  const { savedAnalyses, loading } = useSelector(
    (state: RootState) => state.resumeValidation,
  );

  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<
    'success' | 'error' | 'warning'
  >('success');
  const [selectedAnalysis, setSelectedAnalysis] =
    useState<SavedAnalysis | null>(null);

  useEffect(() => {
    dispatch(listSavedAnalysesAsync());
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
    if (!window.confirm('Are you sure you want to delete this analysis?')) {
      return;
    }

    try {
      await dispatch(deleteSavedAnalysisAsync(id));
      showToast('Analysis deleted successfully', 'success');
    } catch {
      showToast('Failed to delete analysis', 'error');
    }
  };

  const handleView = (analysis: SavedAnalysis) => {
    setSelectedAnalysis(analysis);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
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
        <h1 className="text-4xl font-bold text-gray-900">Saved Analyses</h1>
        <p className="text-gray-600 mt-2">
          View and manage your saved resume analyses
        </p>
      </motion.div>

      {/* Analysis List */}
      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading saved analyses...</p>
          </div>
        ) : savedAnalyses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-12 bg-white rounded-2xl border border-gray-100"
          >
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-lg font-medium text-gray-600">
              No saved analyses yet
            </p>
            <p className="text-sm text-gray-500">
              Save analyses from the Resume Validation page to see them here.
            </p>
          </motion.div>
        ) : (
          savedAnalyses.map((analysis) => (
            <motion.div
              key={analysis.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-lg">
                      Analysis #{analysis.id}
                    </h3>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    <span>{formatDate(analysis.timestamp)}</span>
                  </div>
                  {analysis.data.timestamp && (
                    <p className="text-sm text-gray-500">
                      Analysis performed on {analysis.data.timestamp}
                    </p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleView(analysis)}
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="View Details"
                  >
                    <Eye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(analysis.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Dialog for viewing details */}
      <Dialog open={!!selectedAnalysis} onOpenChange={(open) => !open && setSelectedAnalysis(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Analysis Details</DialogTitle>
            <DialogDescription>
              View the complete analysis information
            </DialogDescription>
          </DialogHeader>
          <pre className="text-sm bg-gray-50 p-4 rounded-lg overflow-x-auto">
            {selectedAnalysis && JSON.stringify(selectedAnalysis, null, 2)}
          </pre>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SavedAnalyses;
