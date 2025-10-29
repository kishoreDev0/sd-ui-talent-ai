import React from 'react';
import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { Candidate } from '@/types';

interface PipelineBoardProps {
  candidates: Candidate[];
}

const stages = [
  { id: 'applied', name: 'Applied', color: 'bg-blue-500' },
  { id: 'screening', name: 'Screening', color: 'bg-yellow-500' },
  { id: 'interview', name: 'Interview', color: 'bg-orange-500' },
  { id: 'offer', name: 'Offer', color: 'bg-purple-500' },
  { id: 'hired', name: 'Hired', color: 'bg-green-500' },
];

const PipelineBoard: React.FC<PipelineBoardProps> = ({ candidates }) => {
  const getCandidatesForStage = (stageId: string) => {
    return (
      candidates.filter(
        (c) => c.status.toLowerCase().replace(' ', '_') === stageId,
      ) || []
    );
  };

  return (
    <div className="bg-gray-50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Candidate Pipeline
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Drag and drop to move candidates
          </p>
        </div>
        <button className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all">
          <Plus className="w-4 h-4" />
          <span>Add Candidate</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {stages.map((stage, stageIndex) => {
          const stageCandidates = getCandidatesForStage(stage.id);

          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stageIndex * 0.1 }}
              className="flex-shrink-0 w-full md:w-64"
            >
              {/* Stage Header */}
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <h3 className="font-semibold text-gray-900">{stage.name}</h3>
                  <span className="bg-gray-200 text-gray-700 text-xs font-medium px-2 py-0.5 rounded-full">
                    {stageCandidates.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-3 min-h-[200px]">
                {stageCandidates.map((candidate, index) => (
                  <motion.div
                    key={candidate.id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all cursor-move"
                  >
                    <div className="flex items-start space-x-3">
                      <div className="bg-gradient-to-br from-blue-500 to-blue-600 w-10 h-10 rounded-lg text-white flex items-center justify-center font-bold flex-shrink-0">
                        {candidate.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-900 text-sm truncate">
                          {candidate.name}
                        </h4>
                        <p className="text-xs text-gray-600 truncate mt-0.5">
                          {candidate.email}
                        </p>
                        {candidate.matchScore && (
                          <div className="mt-2 flex items-center space-x-1">
                            <div
                              className={`w-full h-2 rounded-full overflow-hidden ${
                                candidate.matchScore >= 85
                                  ? 'bg-green-200'
                                  : candidate.matchScore >= 70
                                    ? 'bg-blue-200'
                                    : 'bg-yellow-200'
                              }`}
                            >
                              <div
                                className={`h-full ${
                                  candidate.matchScore >= 85
                                    ? 'bg-green-500'
                                    : candidate.matchScore >= 70
                                      ? 'bg-blue-500'
                                      : 'bg-yellow-500'
                                }`}
                                style={{ width: `${candidate.matchScore}%` }}
                              />
                            </div>
                            <span className="text-xs font-medium text-gray-700">
                              {candidate.matchScore}%
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Add Card Button */}
                <button className="w-full py-3 border-2 border-dashed border-gray-300 rounded-xl text-gray-600 hover:border-blue-400 hover:text-blue-600 transition-colors flex items-center justify-center space-x-2 text-sm font-medium">
                  <Plus className="w-4 h-4" />
                  <span>Add Card</span>
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default PipelineBoard;
