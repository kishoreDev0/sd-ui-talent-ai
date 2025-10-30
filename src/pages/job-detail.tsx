import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, CheckCircle, Paperclip } from 'lucide-react';
import Breadcrumb from '@/components/ui/breadcrumb';

interface JobState {
  job?: {
    id: number;
    company: string;
    title: string;
    location: string;
    description: string;
    hourlyRate?: string;
    tags?: string[];
    [key: string]: unknown;
  };
}

const JobDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useUserRole();
  // Job object is expected to be passed via navigation state from JobBoard
  const job = (location.state as JobState)?.job;

  return (
    <MainLayout role={role}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Job Board', href: '/job-board' },
              { label: job?.title || 'Job Details' },
            ]}
          />

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Jobs
          </button>

          {/* Guard when navigated directly */}
          {!job ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <h1 className="text-lg font-semibold text-gray-900 mb-2">
                Job not found
              </h1>
              <p className="text-sm text-gray-600 mb-4">
                The job details were not provided. Please return to the job list
                and open a job.
              </p>
              <Button onClick={() => navigate('/jobs')}>Go to Job List</Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl">
                    {job.companyIcon}
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                      {job.title}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">
                        {job.company}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-gray-300" />
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {job.location}
                      </div>
                      {job.paymentVerified && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-purple-600" />
                          Payment verified
                        </div>
                      )}
                      <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium">
                        {job.applicants} applicants
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline">Save</Button>
                  <Button
                    onClick={() =>
                      navigate('/resume-validation', { state: { job } })
                    }
                    className="bg-black hover:bg-gray-800 text-white"
                  >
                    Apply Now
                  </Button>
                </div>
              </div>

              {/* Body */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">
                <section>
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">
                    About this role
                  </h2>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {job.description}
                  </p>
                </section>

                <section>
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">
                    Required skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(job.tags as string[]).map((t: string, i: number) => (
                      <span
                        key={i}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </section>

                <section className="grid md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Responsibilities
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                      <li>
                        Create intuitive and user-friendly experiences across
                        platforms.
                      </li>
                      <li>
                        Collaborate with cross-functional teams to drive product
                        innovation.
                      </li>
                      <li>
                        Translate research into highly-polished visual designs.
                      </li>
                      <li>
                        Maintain and evolve design systems and documentation.
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">
                      Qualifications
                    </h3>
                    <ul className="space-y-2 text-sm text-gray-700 list-disc pl-5">
                      <li>2-4+ years experience in the relevant field.</li>
                      <li>
                        Strong proficiency with modern tools (e.g., Figma).
                      </li>
                      <li>Good communication and collaboration skills.</li>
                      <li>Analytics mindset to gather insights from users.</li>
                    </ul>
                  </div>
                </section>

                <section>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">
                    Attachments
                  </h3>
                  <div className="flex flex-wrap gap-3">
                    {['Job_Requirement.pdf', 'Company_Benefits.pdf'].map(
                      (file) => (
                        <div
                          key={file}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm bg-gray-50"
                        >
                          <Paperclip className="h-4 w-4 text-gray-500" /> {file}
                        </div>
                      ),
                    )}
                  </div>
                </section>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

export default JobDetail;
