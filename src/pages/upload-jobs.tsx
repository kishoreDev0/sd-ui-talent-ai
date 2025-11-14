import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { isAxiosError } from 'axios';
import {
  Upload,
  CheckCircle,
  ArrowLeft,
  Loader2,
  X,
  Download,
} from 'lucide-react';
import { bulkUploadJobs } from '@/store/job/service/jobService';
import type { JobBulkUploadSummary } from '@/store/job/types/jobTypes';

const UploadJobs: React.FC = () => {
  const role = useUserRole();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState<
    Array<{ fileName: string; summary: JobBulkUploadSummary }>
  >([]);
  const templatePath =
    '/src/../template/jobImportTemplate.55fa75b25009a9a5d85bc4e765a97479.xlsx';

  const getErrorMessage = (error: unknown, fallback: string): string => {
    if (isAxiosError(error)) {
      const apiError = error.response?.data;
      const serverMessage =
        apiError?.error?.[0] ?? apiError?.message ?? apiError?.detail;
      if (typeof serverMessage === 'string') {
        return serverMessage;
      }
    }
    if (error instanceof Error && error.message) {
      return error.message;
    }
    return fallback;
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'jobImportTemplate.xlsx';
      link.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      showToast('Unable to download template. Please try again.', 'error');
    }
  };

  const handleUpload = (files: FileList | null) => {
    if (!files) {
      return;
    }
    const newFiles = Array.from(files);
    setUploadFiles((prev) => [...prev, ...newFiles]);
    setResults([]);
  };

  const handleRemoveFile = (index: number) => {
    setUploadFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleUploadSubmit = async () => {
    if (uploadFiles.length === 0) {
      showToast('Please select at least one file to upload', 'error');
      return;
    }

    setIsSubmitting(true);
    const summaries: Array<{ fileName: string; summary: JobBulkUploadSummary }> = [];

    try {
      for (const file of uploadFiles) {
        const summary = await bulkUploadJobs(file);
        summaries.push({ fileName: file.name, summary });
      }

      const totalCreated = summaries.reduce(
        (acc, item) => acc + item.summary.created,
        0,
      );
      const totalFailed = summaries.reduce(
        (acc, item) => acc + item.summary.failed,
        0,
      );

      setResults(summaries);
      setUploadFiles([]);

      showToast(
        totalFailed > 0
          ? `Created ${totalCreated} job${totalCreated === 1 ? '' : 's'} with ${totalFailed} failure${totalFailed === 1 ? '' : 's'}.`
          : `Successfully created ${totalCreated} job${totalCreated === 1 ? '' : 's'}.`,
        totalFailed > 0 ? 'warning' : 'success',
      );
    } catch (error) {
      const message = getErrorMessage(error, 'Upload failed. Please try again.');
      showToast(message, 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout role={role}>
      <div className="mx-auto w-full max-w-4xl space-y-4 px-4 pb-8 pt-6">
        <div className="flex flex-col gap-3 rounded-2xl bg-white px-5 py-4 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold text-slate-900">
              Upload Jobs in Bulk
            </h1>
            <p className="text-sm text-slate-600">
              Upload a CSV or Excel file containing job listings to import them
              in bulk. Make sure the file follows the template structure.
            </p>
          </div>
          <div className="flex w-full flex-wrap gap-2 md:w-auto md:justify-end">
            <Button
              variant="outline"
              className="w-full rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100 md:w-auto"
              onClick={handleDownloadTemplate}
            >
              <Download className="mr-2 h-4 w-4" />
              Download template
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100 md:w-auto"
              onClick={() => navigate(-1)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </div>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-5 py-6 shadow-sm">
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-indigo-50 text-indigo-500">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">
                Drag & drop your file here
              </p>
              <p className="text-xs text-slate-500">CSV / XLSX • Max 10MB</p>
            </div>
          </div>
          <div className="mt-4 flex flex-col items-center gap-2">
            <input
              type="file"
              accept=".csv,.xlsx"
              id="upload-jobs-input"
              className="hidden"
              onChange={(event) => handleUpload(event.target.files)}
            />
            <label
              htmlFor="upload-jobs-input"
              className="inline-flex items-center gap-2 rounded-lg bg-[#4F39F6] px-4 py-2 text-sm font-medium text-white hover:bg-[#3D2DC4]"
            >
              <Upload className="h-4 w-4" />
              Browse files
            </label>
            <span className="text-xs text-slate-400">
              or paste files into the area
            </span>
          </div>

          {uploadFiles.length > 0 && (
            <div className="mt-5">
              <p className="text-sm font-semibold text-slate-900">
                Files to upload
              </p>
              <div className="mt-3 space-y-2">
                {uploadFiles.map((file, index) => (
                  <div
                    key={`${file.name}-${index}`}
                    className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-sm"
                  >
                    <span className="truncate pr-4 text-slate-600">
                      {file.name}
                    </span>
                    <button
                      type="button"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleRemoveFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.length > 0 && (
            <div className="mt-5 space-y-3 rounded-2xl border border-slate-100 bg-slate-50 p-4 text-sm">
              <p className="font-semibold text-slate-800">Upload summary</p>
              <div className="space-y-3">
                {results.map((item) => (
                  <div key={item.fileName} className="rounded-lg bg-white p-3 shadow-sm">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span className="font-medium text-slate-700">{item.fileName}</span>
                      <span>
                        {item.summary.created} created • {item.summary.failed} failed
                      </span>
                    </div>
                    {item.summary.failures.length > 0 && (
                      <ul className="mt-2 space-y-1 text-xs text-rose-600">
                        {item.summary.failures.slice(0, 3).map((failure) => (
                          <li key={`${item.fileName}-${failure.row}`}>
                            Row {failure.row}: {failure.error}
                          </li>
                        ))}
                        {item.summary.failures.length > 3 && (
                          <li className="text-rose-500">
                            +{item.summary.failures.length - 3} more errors
                          </li>
                        )}
                      </ul>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 rounded-2xl bg-white px-5 py-3 shadow-sm">
          <Button
            variant="outline"
            className="rounded-lg border-slate-200 text-slate-700 hover:bg-slate-100"
            onClick={() => setUploadFiles([])}
            disabled={uploadFiles.length === 0 || isSubmitting}
          >
            Clear
          </Button>
          <Button
            className="rounded-lg bg-[#4F39F6] px-4 text-sm font-semibold text-white hover:bg-[#3D2DC4]"
            onClick={handleUploadSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CheckCircle className="mr-2 h-4 w-4" />
            )}
            Upload Jobs
          </Button>
        </div>
      </div>
    </MainLayout>
  );
};

export default UploadJobs;
