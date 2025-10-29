import React from 'react';
import { motion } from 'framer-motion';
import { MainLayout } from '@/components/layout';
import { Search, Filter, TrendingUp, Download } from 'lucide-react';
import { UserRole } from '@/types';

const CandidatesPage: React.FC = () => {
  const getUserRole = (): UserRole => 'admin';

  const candidates = [
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@email.com',
      role: 'Product Designer',
      matchScore: 92,
      skills: ['UI/UX Design', 'Figma', 'Prototyping', 'User Research'],
      matchedSkills: ['UI/UX Design', 'Figma', 'Prototyping'],
      status: 'Interview',
      appliedDate: 'Oct 18, 2024',
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@email.com',
      role: 'Frontend Developer',
      matchScore: 88,
      skills: ['React', 'TypeScript', 'Next.js', 'Node.js'],
      matchedSkills: ['React', 'TypeScript', 'Next.js'],
      status: 'Screening',
      appliedDate: 'Oct 20, 2024',
    },
    {
      id: 3,
      name: 'Emily Davis',
      email: 'emily.davis@email.com',
      role: 'UI/UX Designer',
      matchScore: 85,
      skills: ['Design Systems', 'Sketch', 'Adobe XD', 'Wireframing'],
      matchedSkills: ['Design Systems', 'Sketch', 'Wireframing'],
      status: 'Applied',
      appliedDate: 'Oct 22, 2024',
    },
  ];

  const getMatchColor = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-700';
    if (score >= 80) return 'bg-blue-100 text-blue-700';
    if (score >= 70) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  return (
    <MainLayout role={getUserRole()}>
      <div className="space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-4xl font-bold text-gray-900">Candidates</h1>
          <p className="text-gray-600 mt-2">Review and manage candidates</p>
        </motion.div>

        <div className="flex items-center space-x-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search candidates..."
              className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button className="px-4 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors flex items-center space-x-2">
            <Filter className="w-5 h-5" />
            <span>Filter</span>
          </button>
        </div>

        <div className="grid gap-4">
          {candidates.map((candidate, index) => (
            <motion.div
              key={candidate.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-4 flex-1">
                  <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-3 rounded-xl text-white w-12 h-12 flex items-center justify-center font-bold">
                    {candidate.name.charAt(0)}
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-1">
                      {candidate.name}
                    </h3>
                    <p className="text-gray-600 mb-1">{candidate.email}</p>
                    <p className="text-sm text-gray-500">
                      Applied on {candidate.appliedDate}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-right">
                    <div className="flex items-center space-x-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      <span className="text-lg font-bold text-gray-900">
                        Match Score
                      </span>
                    </div>
                    <span
                      className={`inline-block mt-1 px-3 py-1 rounded-full text-sm font-medium ${getMatchColor(candidate.matchScore)}`}
                    >
                      {candidate.matchScore}%
                    </span>
                  </div>
                  <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors">
                    <Download className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Matched Skills:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {candidate.matchedSkills.map((skill, skillIndex) => (
                    <span
                      key={skillIndex}
                      className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    candidate.status === 'Interview'
                      ? 'bg-purple-100 text-purple-700'
                      : candidate.status === 'Screening'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {candidate.status}
                </span>
                <div className="flex space-x-2">
                  <button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium">
                    View Profile
                  </button>
                  <button className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium">
                    Shortlist
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default CandidatesPage;
