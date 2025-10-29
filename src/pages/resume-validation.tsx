import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { FileText, Upload, Loader2, Star, Save, ArrowLeft } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  analyzeResumeAsync,
  getJobRequirementsAsync,
  saveAnalysisAsync,
  shortlistResumeAsync,
  listShortlistedResumesAsync,
  listSavedAnalysesAsync,
} from '@/store/slices/resume/resumeValidation';
import { useAppDispatch, useAppSelector } from '@/store';
import { Snackbar } from '@/components/snackbar';
import { ResumeMatch, JobRequirement } from '@/types';
import { Button } from '@/components/ui/button';
import Breadcrumb from '@/components/ui/breadcrumb';

const ResumeValidation: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { analysisResult, jobRequirements, loading } = useAppSelector(
    (state) => state.resumeValidation,
  );

  // Get job data from navigation state
  const job = (location.state as any)?.job;

  const [jobDescription, setJobDescription] = useState('');
  const [selectedJobRequirement, setSelectedJobRequirement] = useState('');
  const [resumeFiles, setResumeFiles] = useState<File[]>([]);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarType, setSnackbarType] = useState<
    'success' | 'error' | 'warning'
  >('success');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileNames, setFileNames] = useState<string[]>([]);

  // Pre-fill job description if coming from job detail
  useEffect(() => {
    if (job) {
      setJobDescription(job.description || '');
    }
  }, [job]);

  useEffect(() => {
    dispatch(getJobRequirementsAsync());
    dispatch(listSavedAnalysesAsync());
    dispatch(listShortlistedResumesAsync());
  }, [dispatch]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setResumeFiles(files);
    setFileNames(files.map((f) => f.name));
  };

  const handleAddResume = () => {
    fileInputRef.current?.click();
  };

  const showToast = (
    message: string,
    type: 'success' | 'error' | 'warning',
  ) => {
    setSnackbarMessage(message);
    setSnackbarType(type);
    setShowSnackbar(true);
    setTimeout(() => setShowSnackbar(false), 3000);
  };

  const handleAnalyze = async () => {
    if (!selectedJobRequirement && !jobDescription.trim()) {
      showToast(
        'Please provide a job description or select a job requirement',
        'error',
      );
      return;
    }

    if (!selectedJobRequirement && resumeFiles.length === 0) {
      showToast('Please upload at least one resume', 'error');
      return;
    }

    const formData = new FormData();

    if (selectedJobRequirement) {
      formData.append('job_requirement_id', selectedJobRequirement);
    } else {
      formData.append('job_description', jobDescription);
      resumeFiles.forEach((file) => {
        formData.append('resume', file);
      });
    }

    try {
      await dispatch(analyzeResumeAsync(formData));
      showToast('Resume analyzed successfully!', 'success');
    } catch {
      showToast('Failed to analyze resume', 'error');
    }
  };

  const handleSave = async () => {
    if (!analysisResult) {
      showToast('No analysis result to save', 'error');
      return;
    }

    const data = {
      resumeHTML: JSON.stringify(analysisResult),
      timestamp: new Date().toLocaleString(),
      rawData: {
        resume: analysisResult,
      },
    };

    try {
      await dispatch(saveAnalysisAsync(data));
      await dispatch(listSavedAnalysesAsync());
      showToast('Analysis saved successfully!', 'success');
    } catch {
      showToast('Failed to save analysis', 'error');
    }
  };

  const handleShortlist = async () => {
    if (resumeFiles.length === 0) {
      showToast('No resume to shortlist', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('shortlist_resume', resumeFiles[0]);
    formData.append('timestamp', new Date().toLocaleString());

    if (analysisResult?.resumes && analysisResult.resumes.length > 0) {
      const firstResume = analysisResult.resumes[0];
      if (
        firstResume &&
        typeof firstResume === 'object' &&
        'match_percentage' in firstResume
      ) {
        formData.append(
          'match_percentage',
          String((firstResume as ResumeMatch).match_percentage || 0),
        );
      }
    }

    try {
      await dispatch(shortlistResumeAsync(formData));
      await dispatch(listShortlistedResumesAsync());
      showToast('Resume shortlisted successfully!', 'success');
    } catch {
      showToast('Failed to shortlist resume', 'error');
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Breadcrumb - Show when coming from job detail */}
      {job && (
        <Breadcrumb 
          items={[
            { label: 'Job Board', href: '/job-board' },
            { label: job.title, href: `/jobs/${job.id}` },
            { label: 'Apply Now' }
          ]} 
        />
      )}

      {/* Job Header - Show when coming from job detail */}
      {job && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(-1)}
                className="flex items-center gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Job
              </Button>
              <div className="h-6 w-px bg-gray-200" />
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center text-lg">
                  {job.companyIcon}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">{job.title}</h1>
                  <p className="text-sm text-gray-600">{job.company}</p>
                </div>
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-700">
            <p className="font-medium mb-2">Job Description:</p>
            <p className="leading-relaxed">{job.description}</p>
          </div>
        </div>
      )}

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
        <h1 className="text-4xl font-bold text-gray-900">Resume Validation</h1>
        <p className="text-gray-600 mt-2">
          Analyze resumes against job requirements
        </p>
      </motion.div>

      {/* Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Job Description */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Job Description
            </h2>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Select Job Requirement
              </label>
              <select
                value={selectedJobRequirement}
                onChange={(e) => setSelectedJobRequirement(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Select a job requirement --</option>
                {jobRequirements.map((req: JobRequirement) => (
                  <option key={req.id} value={req.filename}>
                    {req.job_title || req.filename}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Or Paste Job Description
              </label>
              <textarea
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Enter job description here..."
                rows={5}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Resume Upload */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload Resume
            </h2>

            <div className="space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".pdf,.docx"
                onChange={handleFileChange}
                className="hidden"
              />

              <button
                onClick={handleAddResume}
                className="w-full p-4 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
              >
                <Upload className="w-5 h-5" />
                <span>Choose Resume Files</span>
              </button>

              {fileNames.length > 0 && (
                <div className="space-y-2 mt-2">
                  {fileNames.map((name, idx) => (
                    <div
                      key={idx}
                      className="text-sm text-gray-600 bg-gray-50 p-2 rounded"
                    >
                      {name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Analyze Button */}
        <div className="mt-6 flex justify-center">
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze'
            )}
          </button>
        </div>
      </motion.div>

      {/* Results Section */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-xl font-bold mb-4">Analysis Results</h2>

          {/* Actions */}
          <div className="flex gap-4 mb-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Save className="w-4 h-4" />
              Save Analysis
            </button>
            <button
              onClick={handleShortlist}
              className="flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700"
            >
              <Star className="w-4 h-4" />
              Shortlist Resume
            </button>
          </div>

          {/* Resume Results */}
          {Array.isArray(analysisResult.resumes) &&
            analysisResult.resumes.length > 0 && (
              <div className="space-y-4">
                {analysisResult.resumes.map(
                  (resume: ResumeMatch, idx: number) => (
                    <div
                      key={idx}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <h3 className="font-semibold text-lg">
                        {resume.filename}
                      </h3>
                      {resume.error ? (
                        <p className="text-red-600">{resume.error}</p>
                      ) : (
                        <>
                          <div className="mt-2">
                            <span className="text-sm text-gray-600">
                              Match Percentage:{' '}
                            </span>
                            <span className="text-lg font-bold text-blue-600">
                              {resume.match_percentage || 0}%
                            </span>
                          </div>
                          <p className="text-sm text-gray-700 mt-2">
                            {resume.explanation}
                          </p>
                        </>
                      )}
                    </div>
                  ),
                )}
              </div>
            )}

          {/* Job Requirement Analysis */}
          {analysisResult.job_requirement_analysis && (
            <div className="border border-gray-200 rounded-lg p-4 mt-4">
              <h3 className="font-semibold text-lg">
                Job Requirement Analysis
              </h3>
              <pre className="mt-2 text-sm text-gray-700 whitespace-pre-wrap">
                {JSON.stringify(
                  analysisResult.job_requirement_analysis,
                  null,
                  2,
                )}
              </pre>
            </div>
          )}
        </motion.div>
      )}

      {/* Placeholder when no results */}
      {!analysisResult && !loading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12 bg-white rounded-2xl border border-gray-100"
        >
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-lg font-medium text-gray-600">No analysis yet</p>
          <p className="text-sm text-gray-500">
            Please upload resumes and click Analyze to get started.
          </p>
        </motion.div>
      )}
    </div>
  );
};

export default ResumeValidation;
