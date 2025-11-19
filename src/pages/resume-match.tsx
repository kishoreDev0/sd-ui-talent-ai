import React, { useEffect, useRef, useState } from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Upload,
  FileText,
  Trash2,
  Loader2,
  Sparkles,
  Check,
  Download,
  Eye,
} from 'lucide-react';
import {
  analyzeResumeMatch,
  ResumeMatchAnalysisResponse,
} from '@/store/candidate/service/candidateService';

type ResumeFileItem = {
  id: number;
  file: File;
};

const clampPercentage = (value?: number) => {
  if (!value || Number.isNaN(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
};

const getCircleColor = (value: number) => {
  if (value >= 70) return 'border-emerald-400 text-emerald-600';
  if (value >= 50) return 'border-amber-300 text-amber-500';
  return 'border-rose-300 text-rose-500';
};

const MetricCircles: React.FC<{
  metrics: { label: string; value: number }[];
}> = ({ metrics }) => (
  <div className="flex flex-wrap gap-3">
    {metrics.map((metric) => (
      <div
        key={metric.label}
        className="flex flex-col items-center gap-0.5 min-w-[60px]"
      >
        <div
          className={`h-12 w-12 rounded-full border-2 bg-white flex items-center justify-center text-xs font-semibold ${getCircleColor(metric.value)}`}
        >
          {metric.value}%
        </div>
        <span className="text-[10px] font-medium text-gray-600 text-center">
          {metric.label}
        </span>
      </div>
    ))}
  </div>
);

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const index = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, index)).toFixed(1)} ${units[index]}`;
};

const DOCX_PREVIEW_MODULE =
  'https://cdn.jsdelivr.net/npm/docx-preview@0.3.1/dist/docx-preview.es.js';

const ResumeMatchPage: React.FC = () => {
  const role = useUserRole();
  const { showToast } = useToast();

  const [jobDescription, setJobDescription] = useState('');
  const [jobDocFile, setJobDocFile] = useState<File | null>(null);
  const [resumeFiles, setResumeFiles] = useState<ResumeFileItem[]>([]);
  const [formError, setFormError] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] =
    useState<ResumeMatchAnalysisResponse | null>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [previewFile, setPreviewFile] = useState<{
    url: string;
    name: string;
    type: string;
    docxData?: ArrayBuffer;
  } | null>(null);
  const docxContainerRef = useRef<HTMLDivElement | null>(null);

  const jobFileInputRef = useRef<HTMLInputElement>(null);
  const resumeFileInputRef = useRef<HTMLInputElement>(null);

  const [isDraggingResume, setIsDraggingResume] = useState(false);

  useEffect(() => {
    return () => {
      if (previewFile?.url) {
        URL.revokeObjectURL(previewFile.url);
      }
    };
  }, [previewFile]);

  useEffect(() => {
    if (previewFile?.docxData && docxContainerRef.current) {
      (async () => {
        try {
          // @ts-ignore - docx-preview is loaded dynamically from CDN at runtime
          const docx = await import(/* @vite-ignore */ DOCX_PREVIEW_MODULE);
          docxContainerRef.current!.innerHTML = '';
          await docx.renderAsync(
            previewFile.docxData!,
            docxContainerRef.current!,
            undefined,
            { inWrapper: false },
          );
        } catch (error) {
          docxContainerRef.current!.innerHTML =
            '<p class="text-sm text-gray-600">Unable to preview DOCX file. Please download it instead.</p>';
        }
      })();
    } else if (docxContainerRef.current) {
      docxContainerRef.current.innerHTML = '';
    }
  }, [previewFile]);

  const extractTextFromFile = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();

      // Handle text files
      if (file.type === 'text/plain' || file.name.endsWith('.txt')) {
        reader.onload = (e) => {
          const content = e.target?.result as string;
          resolve(content);
        };
        reader.onerror = () => reject(new Error('Failed to read text file'));
        reader.readAsText(file, 'UTF-8');
        return;
      }

      // Handle PDF files
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        reader.onload = async (e) => {
          try {
            // Try to use pdfjs-dist if available
            // @ts-ignore - Dynamic import, library may not be installed
            const pdfjsLib = await import('pdfjs-dist');
            pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

            const arrayBuffer = e.target?.result as ArrayBuffer;
            const pdf = await pdfjsLib.getDocument({ data: arrayBuffer })
              .promise;
            let fullText = '';

            for (let i = 1; i <= pdf.numPages; i++) {
              const page = await pdf.getPage(i);
              const textContent = await page.getTextContent();
              const pageText = textContent.items
                .map((item: any) => item.str)
                .join(' ');
              fullText += pageText + '\n';
            }

            resolve(fullText.trim());
          } catch (error) {
            // Fallback: PDF parsing failed, return placeholder
            resolve(
              `[PDF file "${file.name}" uploaded. Extracting text... Please wait or paste the job description manually below.]`,
            );
          }
        };
        reader.onerror = () => reject(new Error('Failed to read PDF file'));
        reader.readAsArrayBuffer(file);
        return;
      }

      // Handle DOCX files
      if (
        file.type ===
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        file.name.endsWith('.docx')
      ) {
        reader.onload = async (e) => {
          try {
            // Try to use mammoth if available
            // @ts-ignore - Dynamic import, library may not be installed
            const mammoth = await import('mammoth');
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const result = await mammoth.extractRawText({ arrayBuffer });
            resolve(result.value);
          } catch (error) {
            // Fallback: DOCX parsing failed, return placeholder
            resolve(
              `[DOCX file "${file.name}" uploaded. Extracting text... Please wait or paste the job description manually below.]`,
            );
          }
        };
        reader.onerror = () => reject(new Error('Failed to read DOCX file'));
        reader.readAsArrayBuffer(file);
        return;
      }

      // Handle DOC files (hard to parse in browser)
      if (file.type === 'application/msword' || file.name.endsWith('.doc')) {
        resolve(
          `[DOC file "${file.name}" uploaded. DOC files cannot be parsed in the browser. Please paste the job description manually below or convert to DOCX/PDF.]`,
        );
        return;
      }

      // Try to read as text for other file types
      reader.onload = (e) => {
        const content = e.target?.result as string;
        resolve(content);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file, 'UTF-8');
    });
  };

  const handleJobDocChange = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0] ?? null;
    setJobDocFile(file);

    if (file) {
      try {
        const textContent = await extractTextFromFile(file);
        setJobDescription(textContent);
      } catch (error) {
        console.error('Error extracting text from file:', error);
        setJobDescription(
          `[Error reading file "${file.name}". Please paste the job description manually below.]`,
        );
      }
    } else {
      setJobDescription('');
    }
  };

  const clearJobDoc = () => {
    setJobDocFile(null);
    setJobDescription('');
    if (jobFileInputRef.current) {
      jobFileInputRef.current.value = '';
    }
  };

  const appendResumeFiles = (files: FileList | File[]) => {
    const fileArray = Array.from(files || []);
    if (!fileArray.length) return;

    if (resumeFiles.length >= 1) {
      showToast(
        'Only one resume can be uploaded at a time. Remove the current file to add another.',
        'warning',
      );
      return;
    }

    const firstFile = fileArray[0];
    setResumeFiles([{ id: Date.now() + Math.random(), file: firstFile }]);
  };

  const handleResumeFileInput = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (event.target.files) {
      appendResumeFiles(event.target.files);
      // reset input to allow same file reselect
      event.target.value = '';
    }
  };

  const handleResumeDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingResume(false);
    appendResumeFiles(event.dataTransfer.files);
  };

  const handleResumeDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingResume(true);
  };

  const handleResumeDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDraggingResume(false);
  };

  const removeResumeFile = (id: number) => {
    setResumeFiles((prev) => prev.filter((item) => item.id !== id));
  };

  const viewResumeFile = (file: File) => {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    const extension = file.name.split('.').pop()?.toLowerCase() ?? '';
    const fileURL = URL.createObjectURL(file);

    if (extension === 'docx') {
      const reader = new FileReader();
      reader.onload = () => {
        setPreviewFile({
          url: fileURL,
          name: file.name,
          type:
            file.type ||
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          docxData: reader.result as ArrayBuffer,
        });
      };
      reader.onerror = () => {
        showToast(
          'Unable to preview DOCX file. Please download it instead.',
          'error',
        );
        URL.revokeObjectURL(fileURL);
      };
      reader.readAsArrayBuffer(file);
      return;
    }

    setPreviewFile({
      url: fileURL,
      name: file.name,
      type: file.type || extension || 'file',
    });
  };

  const closePreview = () => {
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
  };

  const validateForm = () => {
    if (!jobDescription.trim() && !jobDocFile) {
      setFormError('Provide a job description or upload a requirement file.');
      return false;
    }

    if (resumeFiles.length === 0) {
      setFormError('Upload at least one resume to analyze.');
      return false;
    }

    setFormError(null);
    return true;
  };

  const handleAnalyze = async () => {
    if (!validateForm()) return;

    const formData = new FormData();

    if (jobDescription.trim()) {
      formData.append('job_description', jobDescription.trim());
    }
    if (jobDocFile) {
      formData.append('job_requirement_file', jobDocFile);
    }
    resumeFiles.forEach((input) => {
      formData.append('resumes', input.file);
    });

    setIsAnalyzing(true);
    setAnalysisResult(null);
    try {
      const result = await analyzeResumeMatch(formData);
      setAnalysisResult(result);
      setCurrentStep(3);
      showToast('Resume analysis completed successfully', 'success');
    } catch (error) {
      console.error(error);
      showToast(
        'Unable to analyze resumes right now. Please try again.',
        'error',
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const startNewAnalysis = () => {
    setAnalysisResult(null);
    setCurrentStep(1);
    setFormError(null);
    setJobDescription('');
    setJobDocFile(null);
    setResumeFiles([]);
    setIsAnalyzing(false);
    setIsDraggingResume(false);
    if (previewFile?.url) {
      URL.revokeObjectURL(previewFile.url);
    }
    setPreviewFile(null);
    if (jobFileInputRef.current) {
      jobFileInputRef.current.value = '';
    }
    if (resumeFileInputRef.current) {
      resumeFileInputRef.current.value = '';
    }
    showToast('Ready for a new analysis', 'info');
  };

  const exportReport = () => {
    if (!analysisResult) return;

    const reportData = {
      reportGeneratedAt: new Date().toISOString(),
      jobDescription: {
        source: jobDocFile ? 'Uploaded File' : 'Manual Text',
        filename: jobDocFile?.name || 'Manual Entry',
        content: jobDescription.trim() || 'N/A',
      },
      resumesAnalyzed: analysisResult.resumes.map((resume) => ({
        filename: resume.filename,
        matchPercentage: resume.match_percentage || 0,
        skillsMatched: resume.skills_matched || 0,
        totalSkills: resume.total_skills || 0,
        skillCoverage: resume.total_skills
          ? Math.round(
              ((resume.skills_matched ?? 0) * 100) /
                Math.max(1, resume.total_skills),
            )
          : 0,
        experienceMatch: resume.experience_match || 0,
        educationMatch: resume.education_match || 0,
        certificationsMatch: resume.certifications_match || 0,
        roleMatch: resume.role_match || 0,
        explanation: resume.explanation || 'No explanation provided.',
        skillTree: resume.skill_tree || [],
        error: resume.error || null,
      })),
      summary: {
        totalResumes: analysisResult.resumes.length,
        averageMatch:
          analysisResult.resumes.length > 0
            ? Math.round(
                analysisResult.resumes.reduce(
                  (sum, r) => sum + (r.match_percentage || 0),
                  0,
                ) / analysisResult.resumes.length,
              )
            : 0,
        highestMatch:
          analysisResult.resumes.length > 0
            ? Math.max(
                ...analysisResult.resumes.map((r) => r.match_percentage || 0),
              )
            : 0,
        lowestMatch:
          analysisResult.resumes.length > 0
            ? Math.min(
                ...analysisResult.resumes.map((r) => r.match_percentage || 0),
              )
            : 0,
      },
    };

    // Generate formatted text report
    let reportText = '='.repeat(80) + '\n';
    reportText += 'RESUME MATCH ANALYSIS REPORT\n';
    reportText += '='.repeat(80) + '\n\n';
    reportText += `Generated At: ${new Date(reportData.reportGeneratedAt).toLocaleString()}\n\n`;

    reportText += '-'.repeat(80) + '\n';
    reportText += 'JOB DESCRIPTION DETAILS\n';
    reportText += '-'.repeat(80) + '\n';
    reportText += `Source: ${reportData.jobDescription.source}\n`;
    reportText += `Filename: ${reportData.jobDescription.filename}\n`;
    reportText += `Content Preview: ${reportData.jobDescription.content.substring(0, 200)}${reportData.jobDescription.content.length > 200 ? '...' : ''}\n\n`;

    reportText += '-'.repeat(80) + '\n';
    reportText += 'SUMMARY\n';
    reportText += '-'.repeat(80) + '\n';
    reportText += `Total Resumes Analyzed: ${reportData.summary.totalResumes}\n`;
    reportText += `Average Match Percentage: ${reportData.summary.averageMatch}%\n`;
    reportText += `Highest Match: ${reportData.summary.highestMatch}%\n`;
    reportText += `Lowest Match: ${reportData.summary.lowestMatch}%\n\n`;

    reportData.resumesAnalyzed.forEach((resume, index) => {
      reportText += '='.repeat(80) + '\n';
      reportText += `RESUME ${index + 1}: ${resume.filename}\n`;
      reportText += '='.repeat(80) + '\n';
      reportText += `Overall Match: ${resume.matchPercentage}%\n`;
      reportText += `Skills Matched: ${resume.skillsMatched} / ${resume.totalSkills} (${resume.skillCoverage}%)\n`;
      reportText += `Experience Match: ${resume.experienceMatch}%\n`;
      reportText += `Education Match: ${resume.educationMatch}%\n`;
      reportText += `Certifications Match: ${resume.certificationsMatch}%\n`;
      reportText += `Role Match: ${resume.roleMatch}%\n\n`;
      reportText += `Explanation:\n${resume.explanation}\n\n`;

      if (resume.skillTree && resume.skillTree.length > 0) {
        reportText += 'Skill Analysis:\n';
        resume.skillTree.forEach((skill: any) => {
          reportText += `  - ${skill.skill_name}: ${skill.match_status}\n`;
        });
        reportText += '\n';
      }

      if (resume.error) {
        reportText += `Error: ${resume.error}\n\n`;
      }
      reportText += '\n';
    });

    reportText += '='.repeat(80) + '\n';
    reportText += 'END OF REPORT\n';
    reportText += '='.repeat(80) + '\n';

    // Create and download the file
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-match-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    showToast('Report exported successfully', 'success');
  };

  const steps = [
    {
      id: 1,
      label: 'Job Description',
      supportText: 'Upload or paste job requirements',
      icon: FileText,
    },
    {
      id: 2,
      label: 'Upload Resumes',
      supportText: 'Add resume files to analyze',
      icon: Upload,
    },
    {
      id: 3,
      label: 'Analysis Results',
      supportText: 'View match insights',
      icon: Sparkles,
    },
  ];

  const getStepStatus = (stepId: number) => {
    if (analysisResult && stepId < 3) return 'completed';
    if (stepId < currentStep) return 'completed';
    if (stepId === currentStep) return 'active';
    return 'inactive';
  };

  const StepperComponent = () => (
    <div className="mb-4 mt-4">
      <div className="relative">
        <div className="flex items-start">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id);
            const Icon = step.icon;
            const isCompleted = status === 'completed';
            const isActive = status === 'active';
            const nextStepCompleted =
              index < steps.length - 1 && currentStep > step.id + 1;

            return (
              <React.Fragment key={step.id}>
                <div className="flex flex-col items-center flex-1 relative z-10">
                  <div
                    className={`h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-200 ${
                      isCompleted
                        ? 'bg-purple-600 border-purple-600 text-white shadow-sm'
                        : isActive
                          ? 'bg-white border-purple-600 text-purple-600 shadow-sm'
                          : 'bg-white border-gray-300 text-gray-400'
                    }`}
                  >
                    {isCompleted ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Icon className="h-4 w-4" />
                    )}
                  </div>
                  <div className="mt-1.5 text-center px-0.5">
                    <p
                      className={`text-[10px] font-semibold mb-0.5 ${
                        isActive || isCompleted
                          ? 'text-purple-600'
                          : 'text-gray-500'
                      }`}
                    >
                      {step.label}
                    </p>
                    <p className="text-[9px] text-gray-500 leading-tight">
                      {step.supportText}
                    </p>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className="flex-1 mx-0.5 relative z-0 flex items-center"
                    style={{ height: '32px', marginTop: '0' }}
                  >
                    <div
                      className={`h-0.5 w-full transition-colors duration-200 ${
                        isCompleted || nextStepCompleted
                          ? 'bg-purple-600'
                          : 'bg-gray-200'
                      }`}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );

  return (
    <MainLayout role={role}>
      <div className="space-y-3">
        <div className="mb-2">
          <h1 className="text-xl font-bold text-gray-900">Resume Match</h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Analyze resume compatibility with job requirements
          </p>
        </div>
        <StepperComponent />

        {currentStep === 1 && (
          <div className="rounded-lg border border-blue-200 bg-blue-50/30 p-3">
            <div className="flex items-center gap-1.5 text-blue-600 mb-2">
              <FileText className="h-4 w-4" />
              <span className="text-sm font-semibold">Job Description</span>
            </div>
            <p className="text-[10px] text-blue-500 mb-2">
              Upload file or paste description.
            </p>

            <div className="flex flex-wrap items-center gap-1.5 mb-2">
              <input
                type="file"
                ref={jobFileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleJobDocChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="flex items-center gap-1 h-7 text-xs"
                onClick={() => jobFileInputRef.current?.click()}
              >
                <Upload className="h-3 w-3" />
                Choose File
              </Button>
              <span className="text-[10px] text-gray-600">
                {jobDocFile?.name || 'No file chosen'}
              </span>
              {jobDocFile && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={clearJobDoc}
                  className="text-rose-500 h-6 w-6"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              )}
            </div>

            <Textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Or paste job description here..."
              className="h-[200px] text-xs mb-2 overflow-y-auto resize-none"
            />

            <div className="flex justify-end">
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (jobDescription.trim() || jobDocFile) {
                    setCurrentStep(2);
                  } else {
                    setFormError(
                      'Please provide a job description or upload a file.',
                    );
                  }
                }}
                className="bg-purple-600 hover:bg-purple-700 text-xs h-7"
              >
                Next: Upload Resumes
              </Button>
            </div>
            {formError && (
              <p className="text-[10px] text-rose-500 mt-1">{formError}</p>
            )}
          </div>
        )}

        {currentStep === 2 && (
          <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 p-3">
            <div className="flex items-center gap-1.5 text-emerald-600 mb-2">
              <Upload className="h-4 w-4" />
              <span className="text-sm font-semibold">Upload Resumes</span>
            </div>
            <p className="text-[10px] text-emerald-600 mb-2">
              Drag & drop or browse (max 2 MB total, 1 resume at a time).
            </p>

            <div
              className={`rounded-lg border-2 border-dashed px-2 py-2.5 text-center transition-colors mb-2 ${
                isDraggingResume
                  ? 'border-emerald-400 bg-white'
                  : 'border-emerald-200 bg-white/70'
              }`}
              onDragOver={handleResumeDragOver}
              onDragLeave={handleResumeDragLeave}
              onDrop={handleResumeDrop}
              onClick={() => resumeFileInputRef.current?.click()}
            >
              <input
                type="file"
                multiple
                ref={resumeFileInputRef}
                className="hidden"
                accept=".pdf,.doc,.docx"
                onChange={handleResumeFileInput}
              />
              <div className="flex flex-col items-center gap-0.5 text-emerald-700">
                <Upload className="h-4 w-4" />
                <p className="text-[10px] font-semibold">
                  Drop a resume here or browse
                </p>
                <p className="text-[9px] text-emerald-500">
                  Single file, up to 2 MB total
                </p>
              </div>
            </div>

            <div className="mt-2 space-y-1.5">
              {resumeFiles.length === 0 ? (
                <p className="text-[10px] text-emerald-600 text-center">
                  No resumes added yet.
                </p>
              ) : (
                resumeFiles.map((item) => {
                  const extension =
                    item.file.name.split('.').pop()?.toUpperCase() ?? 'FILE';
                  return (
                    <div
                      key={item.id}
                      className="flex items-center justify-between rounded-lg border border-emerald-100 bg-white px-2.5 py-1.5 shadow-sm"
                    >
                      <div className="flex items-center gap-2">
                        <div className="rounded bg-emerald-50 px-1.5 py-0.5 text-[9px] font-semibold uppercase text-emerald-600">
                          {extension}
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-gray-900 truncate max-w-[200px]">
                            {item.file.name}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            {formatFileSize(item.file.size)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => viewResumeFile(item.file)}
                          className="text-xs h-6 px-2"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeResumeFile(item.id)}
                          className="text-rose-500 h-6 w-6"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            <div className="flex justify-between items-center mt-3">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setCurrentStep(1)}
                className="text-xs h-7"
              >
                Back
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  if (resumeFiles.length === 0) {
                    setFormError('Upload at least one resume to analyze.');
                    return;
                  }
                  setFormError(null);
                  setCurrentStep(3);
                }}
                className="bg-purple-600 hover:bg-purple-700 text-xs h-7"
              >
                Next
              </Button>
            </div>
            {formError && (
              <p className="text-[10px] text-rose-500 mt-1">{formError}</p>
            )}
          </div>
        )}

        {currentStep === 3 && (
          <div className="rounded-lg border border-purple-200 bg-purple-50/30 p-3">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-purple-900">
                  Analysis Results
                </h2>
                <p className="text-[10px] text-purple-600">
                  AI-generated insights for each resume.
                </p>
              </div>
              <div className="flex flex-wrap gap-1.5 justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setCurrentStep(1)}
                  className="text-xs h-7"
                >
                  Back
                </Button>
                {analysisResult ? (
                  <>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={exportReport}
                      className="text-xs h-7"
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Export Report
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      onClick={startNewAnalysis}
                      className="bg-purple-600 hover:bg-purple-700 text-xs h-7 text-white"
                    >
                      New Analysis
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => {
                      if (!validateForm()) return;
                      handleAnalyze();
                    }}
                    disabled={isAnalyzing}
                    className="bg-purple-600 hover:bg-purple-700 text-xs h-7"
                  >
                    {isAnalyzing ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        Analyzing…
                      </span>
                    ) : (
                      'Analyze'
                    )}
                  </Button>
                )}
              </div>
            </div>

            {isAnalyzing && (
              <div className="flex flex-col items-center justify-center py-6 text-blue-600">
                <Loader2 className="h-5 w-5 animate-spin mb-2" />
                <p className="text-xs font-medium">
                  Running Gemini-powered analysis…
                </p>
              </div>
            )}

            {!analysisResult && !isAnalyzing && (
              <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-8 text-center text-gray-500">
                <FileText className="h-8 w-8 text-gray-300 mb-2" />
                <p className="text-sm font-medium">No resume analysis yet</p>
                <p className="text-xs">
                  Upload resumes and click <strong>Analyze</strong> to generate
                  insights.
                </p>
              </div>
            )}

            {analysisResult && !isAnalyzing && (
              <div className="space-y-3">
                {/* Job Summary section hidden */}
                {/* {jobSummary && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-gray-700 shadow-sm">
                  <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
                    <ClipboardList className="h-4 w-4" />
                    <span>Job Summary</span>
                  </div>
                  <p className="text-xs text-blue-500 italic mb-2">
                    Source: {jobSummary.reference || jobSummary.source}
                  </p>
                  <p className="leading-relaxed">{jobSummary.preview}</p>
                </div>
              )} */}

                {/* Job Requirement Analysis section hidden */}
                {/* {jobRequirementAnalysis && (
                <div className="rounded-2xl border border-violet-100 bg-violet-50/60 p-4 shadow-sm text-sm text-violet-900 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 font-semibold">
                      <Target className="h-4 w-4" />
                      <span>Job Requirement Analysis</span>
                    </div>
                    <p className="text-xs text-violet-500">
                      File: {jobRequirementAnalysis.filename ?? 'Uploaded requirement'}
                    </p>
                  </div>

                  <MetricCircles
                    metrics={[
                      {
                        label: 'Match %',
                        value: clampPercentage(jobRequirementAnalysis.match_percentage),
                      },
                      {
                        label: 'Skill Coverage',
                        value:
                          jobRequirementAnalysis.total_skills && jobRequirementAnalysis.total_skills > 0
                            ? clampPercentage(
                                ((jobRequirementAnalysis.skills_matched ?? 0) * 100) /
                                  Math.max(1, jobRequirementAnalysis.total_skills),
                              )
                            : clampPercentage(jobRequirementAnalysis.match_percentage),
                      },
                      {
                        label: 'Exp. Match',
                        value: clampPercentage(jobRequirementAnalysis.experience_match),
                      },
                      {
                        label: 'Education Match',
                        value: clampPercentage(jobRequirementAnalysis.education_match),
                      },
                      {
                        label: 'Certifications',
                        value: clampPercentage(jobRequirementAnalysis.certifications_match),
                      },
                      {
                        label: 'Role Match',
                        value: clampPercentage(jobRequirementAnalysis.role_match),
                      },
                    ]}
                  />

                  <div className="rounded-xl border border-violet-100 bg-white/70 p-3 text-sm text-violet-900">
                    <p className="font-semibold text-xs uppercase tracking-wide text-violet-500">
                      Explanation
                    </p>
                    <p className="mt-1 leading-relaxed">
                      {jobRequirementAnalysis.explanation}
                    </p>
                  </div>

                  {jobRequirementAnalysis.error && (
                    <p className="rounded-lg bg-white/90 px-3 py-2 text-xs text-rose-600">
                      {jobRequirementAnalysis.error}
                    </p>
                  )}
                </div>
              )} */}

                <div className="grid gap-2.5">
                  {analysisResult.resumes.map((resume) => {
                    const matchPercent = clampPercentage(
                      resume.match_percentage,
                    );
                    const skillCoverage = resume.total_skills
                      ? clampPercentage(
                          ((resume.skills_matched ?? 0) * 100) /
                            Math.max(1, resume.total_skills),
                        )
                      : 0;

                    const experienceFit = clampPercentage(
                      resume.experience_match ?? matchPercent,
                    );
                    const educationFit = clampPercentage(
                      resume.education_match ?? matchPercent,
                    );
                    const certificationFit = clampPercentage(
                      resume.certifications_match ?? matchPercent,
                    );
                    const roleFit = clampPercentage(
                      resume.role_match ?? matchPercent,
                    );
                    return (
                      <div
                        key={resume.filename}
                        className="rounded-lg border border-gray-200 bg-white/80 p-3 shadow-sm space-y-2.5"
                      >
                        <div className="flex flex-col gap-1">
                          <p className="text-xs font-semibold text-gray-900">
                            {resume.filename}
                          </p>
                          <p className="text-[10px] text-gray-500">
                            Resume Match:{' '}
                            <span className="font-semibold text-gray-900">
                              {matchPercent}%
                            </span>
                          </p>
                        </div>

                        {resume.error ? (
                          <p className="rounded bg-rose-50 px-2 py-1.5 text-[10px] text-rose-600">
                            {resume.error}
                          </p>
                        ) : (
                          <>
                            <MetricCircles
                              metrics={[
                                { label: 'Match %', value: matchPercent },
                                {
                                  label: 'Skill Coverage',
                                  value: skillCoverage,
                                },
                                { label: 'Exp. Match', value: experienceFit },
                                {
                                  label: 'Education Match',
                                  value: educationFit,
                                },
                                {
                                  label: 'Certifications',
                                  value: certificationFit,
                                },
                                { label: 'Role Match', value: roleFit },
                              ]}
                            />

                            {resume.skill_tree &&
                              resume.skill_tree.length > 0 && (
                                <div>
                                  <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase text-gray-500">
                                    <Sparkles className="h-3 w-3" />
                                    Skill Insights
                                  </div>
                                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                                    {resume.skill_tree
                                      .slice(0, 6)
                                      .map((skill) => (
                                        <div
                                          key={`${resume.filename}-${skill.skill_name}`}
                                          className="rounded-full border border-gray-200 px-2 py-0.5 text-[10px] text-gray-700"
                                        >
                                          <span className="font-semibold text-gray-900">
                                            {skill.skill_name}
                                          </span>{' '}
                                          · {skill.match_status}
                                        </div>
                                      ))}
                                  </div>
                                </div>
                              )}
                            <div className="rounded-lg border border-gray-100 bg-gray-50 p-2">
                              <p className="text-[10px] font-semibold text-gray-600 uppercase tracking-wide">
                                Explanation
                              </p>
                              <p className="text-xs text-gray-700 leading-snug mt-1">
                                {resume.explanation ||
                                  'Gemini did not return a detailed explanation for this analysis.'}
                              </p>
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Dialog
        open={!!previewFile}
        onOpenChange={(open) => {
          if (!open) {
            closePreview();
          }
        }}
      >
        <DialogContent className="sm:max-w-[50vw] sm:w-full sm:h-screen sm:ml-auto sm:mr-0 sm:rounded-none sm:p-0 sm:top-0 sm:bottom-0 sm:translate-y-0 sm:overflow-hidden sm:transition-transform sm:duration-300 sm:ease-out data-[state=closed]:sm:translate-x-full data-[state=open]:sm:translate-x-0 backdrop-blur-sm sm:[&:not([data-state=open])]:pointer-events-none">
          <div className="flex h-full flex-col bg-white">
            <DialogHeader className="border-b border-gray-100 p-4">
              <DialogTitle className="text-base font-semibold text-gray-900">
                {previewFile ? `Preview – ${previewFile.name}` : 'Preview'}
              </DialogTitle>
            </DialogHeader>
            <div className="flex-1 overflow-hidden">
              {previewFile ? (
                <>
                  {previewFile.type.includes('pdf') ||
                  previewFile.name.toLowerCase().endsWith('.pdf') ? (
                    <iframe
                      src={previewFile.url}
                      title={previewFile.name}
                      className="h-full w-full"
                    />
                  ) : previewFile.docxData ? (
                    <div
                      ref={docxContainerRef}
                      className="h-full w-full overflow-y-auto bg-white px-4 py-6"
                    />
                  ) : previewFile.type.includes('text') ||
                    previewFile.name.toLowerCase().endsWith('.txt') ? (
                    <iframe
                      src={previewFile.url}
                      title={previewFile.name}
                      className="h-full w-full bg-gray-50"
                    />
                  ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-3 p-6 text-sm text-gray-600">
                      <p className="text-center">
                        Inline preview for{' '}
                        <span className="font-semibold">
                          {previewFile.name}
                        </span>{' '}
                        is not supported.
                      </p>
                      <Button
                        asChild
                        className="bg-purple-600 hover:bg-purple-700 text-white"
                      >
                        <a href={previewFile.url} download={previewFile.name}>
                          Download {previewFile.name}
                        </a>
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <p className="p-4 text-sm text-gray-500">No file selected.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </MainLayout>
  );
};

export default ResumeMatchPage;
