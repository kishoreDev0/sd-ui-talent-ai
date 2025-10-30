import React from 'react';
import { MainLayout } from '@/components/layout';
import { useUserRole } from '@/utils/getUserRole';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const InterviewDetailPage: React.FC = () => {
  const role = useUserRole();
  const navigate = useNavigate();
  const { id } = useParams();

  return (
    <MainLayout role={role}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            Interview #{id}
          </h1>
          <Button variant="outline" onClick={() => navigate(-1)}>
            Back
          </Button>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Technical Interview panel */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Technical Interview
            </h2>
            <div className="aspect-video w-full bg-gray-100 dark:bg-slate-700 rounded-lg mb-3" />
            <p className="text-sm text-indigo-700 dark:text-indigo-300 mb-3">
              Your Scheduled Interview Expired.
            </p>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">
                Job Summary
              </h3>
              <dl className="text-sm grid grid-cols-2 gap-y-2 text-gray-700 dark:text-gray-200">
                <dt className="opacity-70">Job Title</dt>
                <dd>Dot Net Azure Developer</dd>
                <dt className="opacity-70">Organization</dt>
                <dd>tringapps - BU2</dd>
                <dt className="opacity-70">Employment</dt>
                <dd>Full Time</dd>
                <dt className="opacity-70">Exp (Yrs)</dt>
                <dd>4+ Years</dd>
                <dt className="opacity-70">Category</dt>
                <dd>IT/Software</dd>
              </dl>
            </div>
          </div>

          {/* Resume Viewer */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 p-4 shadow-sm xl:col-span-1">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Resume
            </h2>
            <div className="h-[72vh] overflow-auto rounded-lg border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-900">
              {/* Placeholder resume content */}
              <div className="p-4 text-sm text-gray-800 dark:text-gray-100 space-y-3">
                <h3 className="text-xl font-bold text-center text-green-700">
                  tringapps
                </h3>
                <p>
                  <strong>Name:</strong> Candidate Name
                </p>
                <p className="font-semibold">Professional Summary:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>
                    12+ years across web technologies: .NET, React, SQL Server
                  </li>
                  <li>OO concepts, web apps, cloud exposure</li>
                  <li>Agile methodology, CI/CD, DevOps familiarity</li>
                </ul>
                <p className="font-semibold">Work Experience:</p>
                <ol className="list-decimal pl-6 space-y-1">
                  <li>Senior System Analyst at IBM — Chennai</li>
                  <li>Senior Associate at Cognizant — Chennai</li>
                  <li>Software Engineer at HCL Technologies — Chennai</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Feedback */}
          <div className="rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-slate-800 p-4 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Feedback
            </h2>
            <div className="h-[72vh] overflow-auto rounded-lg border border-gray-200 dark:border-white/10 p-4 text-indigo-700 dark:text-indigo-300">
              Your Scheduled Interview Expired.
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default InterviewDetailPage;
