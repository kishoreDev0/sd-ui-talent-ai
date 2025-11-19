import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { Button } from '@/components/ui/button';
import { ChevronLeft, MapPin, Paperclip, Edit } from 'lucide-react';
import Breadcrumb from '@/components/ui/breadcrumb';
import type { Job } from '@/store/job/types/jobTypes';

const JobDetail: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = useUserRole();

  // Get job from navigation state only
  const job = (location.state as { job?: Job })?.job;

  const handleEdit = () => {
    if (job?.id) {
      // Pass job data through state instead of fetching by ID
      navigate(`/register-job/${job.id}`, { state: { job } });
    }
  };

  return (
    <MainLayout role={role}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {/* Breadcrumb */}
          <Breadcrumb
            items={[
              { label: 'Job Board', href: '/job-board' },
              { label: job?.job_title || 'Job Details' },
            ]}
          />

          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="mb-4 inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900"
          >
            <ChevronLeft className="h-4 w-4" /> Back to Jobs
          </button>

          {/* No job in state */}
          {!job ? (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
              <h1 className="text-lg font-semibold text-gray-900 mb-2">
                Job not found
              </h1>
              <p className="text-sm text-gray-600 mb-4">
                The job details were not provided. Please return to the job
                board and open a job.
              </p>
              <Button onClick={() => navigate('/job-board')}>
                Go to Job Board
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header card */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-xl font-semibold text-blue-700">
                    {(job as Job).job_title?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <h1 className="text-xl md:text-2xl font-bold text-gray-900 mb-1">
                      {(job as Job).job_title || 'Job Title'}
                    </h1>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
                      <span className="font-semibold text-gray-900">
                        {(job as Job).organization || 'Organization'}
                      </span>
                      <span className="h-1 w-1 rounded-full bg-gray-300" />
                      <div className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {(job as Job).level || 'Location'}
                      </div>
                      {(job as Job).job_category && (
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-1 rounded-full text-xs font-medium">
                          {(job as Job).job_category}
                        </span>
                      )}
                      {(job as Job).no_of_vacancy && (
                        <span className="bg-primary-100 text-[#4F39F6] px-2 py-1 rounded-full text-xs font-medium">
                          {(job as Job).no_of_vacancy} vacancy
                          {(job as Job).no_of_vacancy > 1 ? 'ies' : 'y'}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="flex items-center gap-2"
                  >
                    <Edit className="h-4 w-4" />
                    Edit Job
                  </Button>
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
                  <div
                    className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{
                      __html:
                        (job as Job).job_description ||
                        'No description available',
                    }}
                  />
                </section>

                {(job as Job).job_responsibilities && (
                  <section>
                    <h2 className="text-sm font-semibold text-gray-900 mb-2">
                      Responsibilities
                    </h2>
                    <div
                      className="text-sm text-gray-700 leading-relaxed prose prose-sm max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: (job as Job).job_responsibilities || '',
                      }}
                    />
                  </section>
                )}

                <section>
                  <h2 className="text-sm font-semibold text-gray-900 mb-2">
                    Required skills
                  </h2>
                  <div className="flex flex-wrap gap-2">
                    {(job as Job).major_skills?.map((skill) => (
                      <span
                        key={skill.id}
                        className="bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs font-medium"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {(job as Job).skills?.map((skill) => (
                      <span
                        key={skill.id}
                        className="bg-gray-100 text-gray-700 px-2 py-1 rounded-full text-xs"
                      >
                        {skill.name}
                      </span>
                    ))}
                    {!(job as Job).major_skills?.length &&
                      !(job as Job).skills?.length && (
                        <span className="text-xs text-gray-500">
                          No skills specified
                        </span>
                      )}
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
