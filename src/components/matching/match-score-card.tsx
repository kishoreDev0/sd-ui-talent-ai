import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Award, XCircle, AlertTriangle } from 'lucide-react';

interface MatchScoreCardProps {
  candidate: {
    name: string;
    email: string;
    matchScore: number;
    matchedSkills: string[];
    missingSkills: string[];
    roleFit: 'Strong Fit' | 'Fit' | 'Stretch' | 'No Fit';
  };
}

const MatchScoreCard: React.FC<MatchScoreCardProps> = ({ candidate }) => {
  const getRoleFitIcon = () => {
    switch (candidate.roleFit) {
      case 'Strong Fit':
        return <Award className="w-5 h-5 text-green-600" />;
      case 'Fit':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'Stretch':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      default:
        return <XCircle className="w-5 h-5 text-red-600" />;
    }
  };

  const getRoleFitColor = () => {
    switch (candidate.roleFit) {
      case 'Strong Fit':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Fit':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Stretch':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default:
        return 'bg-red-100 text-red-700 border-red-200';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'from-green-500 to-green-600';
    if (score >= 70) return 'from-blue-500 to-blue-600';
    if (score >= 50) return 'from-yellow-500 to-yellow-600';
    return 'from-red-500 to-red-600';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-lg transition-all"
    >
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4 flex-1">
          <div
            className={`bg-gradient-to-br ${getScoreColor(candidate.matchScore)} p-3 rounded-xl text-white w-16 h-16 flex items-center justify-center font-bold text-xl`}
          >
            {candidate.matchScore}
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">
              {candidate.name}
            </h3>
            <p className="text-sm text-gray-600">{candidate.email}</p>
            <div className="flex items-center space-x-2 mt-3">
              {getRoleFitIcon()}
              <span
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getRoleFitColor()}`}
              >
                {candidate.roleFit}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Matched Skills */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-semibold text-gray-900 text-sm">
            Matched Skills ({candidate.matchedSkills.length})
          </h4>
          <span className="text-xs text-green-600 font-medium">✓ Present</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {candidate.matchedSkills.map((skill, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium"
            >
              {skill}
            </span>
          ))}
        </div>
      </div>

      {/* Missing Skills */}
      {candidate.missingSkills.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="font-semibold text-gray-900 text-sm">
              Missing Skills ({candidate.missingSkills.length})
            </h4>
            <span className="text-xs text-red-600 font-medium">✗ Missing</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {candidate.missingSkills.map((skill, index) => (
              <span
                key={index}
                className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex space-x-2 mt-6 pt-4 border-t border-gray-100">
        <button className="flex-1 px-4 py-2 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium text-sm">
          View Full Profile
        </button>
        <button className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium text-sm">
          Shortlist
        </button>
      </div>
    </motion.div>
  );
};

export default MatchScoreCard;
