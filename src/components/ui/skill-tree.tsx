import React from 'react';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  Briefcase,
  Clock,
} from 'lucide-react';
import type { SkillTreeItem } from '@/store/candidate/service/candidateService';
import { Tooltip } from './tooltip';

interface SkillTreeProps {
  skills: SkillTreeItem[];
  className?: string;
}

export const SkillTree: React.FC<SkillTreeProps> = ({
  skills,
  className = '',
}) => {
  const getStatusIcon = (status: 'exact' | 'partial' | 'missing') => {
    switch (status) {
      case 'exact':
        return <CheckCircle2 className="h-4 w-4 text-green-500" />;
      case 'partial':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 'missing':
        return <XCircle className="h-4 w-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: 'exact' | 'partial' | 'missing') => {
    switch (status) {
      case 'exact':
        return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
      case 'partial':
        return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
      case 'missing':
        return 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800';
    }
  };

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 80) return 'text-green-600 dark:text-green-400';
    if (efficiency >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getRelevanceColor = (relevance: number) => {
    if (relevance >= 80) return 'bg-blue-500';
    if (relevance >= 50) return 'bg-blue-400';
    return 'bg-blue-300';
  };

  if (!skills || skills.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-500 dark:text-gray-400">
        No skill analysis available
      </div>
    );
  }

  // Sort skills by relevance (highest first)
  const sortedSkills = [...skills].sort(
    (a, b) => b.relevance_to_job - a.relevance_to_job,
  );

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h5 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Skill Analysis Tree
        </h5>
        <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3 text-green-500" />
            <span>Exact Match</span>
          </div>
          <div className="flex items-center gap-1">
            <AlertCircle className="h-3 w-3 text-yellow-500" />
            <span>Partial</span>
          </div>
          <div className="flex items-center gap-1">
            <XCircle className="h-3 w-3 text-red-500" />
            <span>Missing</span>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {sortedSkills.map((skill, index) => (
          <div
            key={`${skill.skill_name}-${index}`}
            className={`border rounded-lg p-3 transition-all hover:shadow-md ${getStatusColor(
              skill.match_status,
            )}`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  {getStatusIcon(skill.match_status)}
                  <h6 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {skill.skill_name}
                  </h6>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                  <Tooltip
                    content={
                      <div>
                        <p className="font-semibold mb-1">Efficiency Score</p>
                        <p className="text-xs">
                          Candidate's proficiency level with this skill based on
                          resume analysis
                        </p>
                      </div>
                    }
                  >
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-3.5 w-3.5 text-gray-400" />
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Efficiency
                          </span>
                          <span
                            className={`text-xs font-semibold ${getEfficiencyColor(
                              skill.efficiency,
                            )}`}
                          >
                            {skill.efficiency}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${
                              skill.efficiency >= 80
                                ? 'bg-green-500'
                                : skill.efficiency >= 50
                                  ? 'bg-yellow-500'
                                  : 'bg-red-500'
                            }`}
                            style={{ width: `${skill.efficiency}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Tooltip>

                  <Tooltip
                    content={
                      <div>
                        <p className="font-semibold mb-1">Projects Used</p>
                        <p className="text-xs">
                          Number of projects where this skill was utilized
                        </p>
                      </div>
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                      <div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Projects
                        </span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {skill.used_in_projects}
                        </p>
                      </div>
                    </div>
                  </Tooltip>

                  <Tooltip
                    content={
                      <div>
                        <p className="font-semibold mb-1">
                          Years of Experience
                        </p>
                        <p className="text-xs">
                          Estimated years of experience with this skill
                        </p>
                      </div>
                    }
                  >
                    <div className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      <div>
                        <span className="text-xs text-gray-600 dark:text-gray-400">
                          Experience
                        </span>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                          {skill.years_of_experience}{' '}
                          {skill.years_of_experience === 1 ? 'yr' : 'yrs'}
                        </p>
                      </div>
                    </div>
                  </Tooltip>

                  <Tooltip
                    content={
                      <div>
                        <p className="font-semibold mb-1">Job Relevance</p>
                        <p className="text-xs">
                          How relevant this skill is to the job requirements
                        </p>
                      </div>
                    }
                  >
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs text-gray-600 dark:text-gray-400">
                            Relevance
                          </span>
                          <span className="text-xs font-semibold text-gray-900 dark:text-gray-100">
                            {skill.relevance_to_job}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div
                            className={`h-1.5 rounded-full transition-all ${getRelevanceColor(
                              skill.relevance_to_job,
                            )}`}
                            style={{ width: `${skill.relevance_to_job}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </Tooltip>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
