import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Plus, X, Hash } from 'lucide-react';

interface JobDescriptionEditorProps {
  onSave?: (jobData: Record<string, unknown>) => void;
}

const JobDescriptionEditor: React.FC<JobDescriptionEditorProps> = ({
  onSave,
}) => {
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [aiTags, setAiTags] = useState<string[]>([]);
  const [showAutoTag, setShowAutoTag] = useState(true);

  const handleAutoTag = () => {
    // Simulate AI tagging
    setAiTags([
      'React',
      'TypeScript',
      'Node.js',
      'AWS',
      'Docker',
      'PostgreSQL',
    ]);
    setShowAutoTag(false);
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-전 space-y-6">
      {/* Header with AI Tag Button */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Job Description</h2>
        {showAutoTag && (
          <button
            onClick={handleAutoTag}
            className="flex items-center space-x-2 bg-[#4F39F6] text-white px-4 py-2 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>Auto-tag Skills with AI</span>
          </button>
        )}
      </div>

      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Title *
        </label>
        <input
          type="text"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
          placeholder="e.g., Senior Frontend Developer"
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Job Description *
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Enter detailed job description..."
          rows={8}
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        />
      </div>

      {/* AI-Generated Tags */}
      {aiTags.length > 0 && (
        <div>
          <div className="flex items-center space-x-2 mb-3">
            <Hash className="w-5 h-5 text-gray-600" />
            <label className="block text-sm font-medium text-gray-700">
              Required Skills (AI-tagged)
            </label>
          </div>
          <div className="flex flex-wrap gap-2">
            {aiTags.map((tag, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="inline-flex items-center space-x-2 bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full text-sm font-medium"
              >
                <span>{tag}</span>
                <button
                  onClick={() =>
                    setAiTags(aiTags.filter((_, i) => i !== index))
                  }
                  className="hover:bg-blue-200 rounded-full p-0.5 transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </motion.span>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Skill */}
      <div className="flex items-center space-x-4">
        <button className="flex items-center space-x-2 text-blue-600 hover:text-blue-700 font-medium">
          <Plus className="w-4 h-4" />
          <span>Add Custom Skill</span>
        </button>
        <span className="text-sm text-gray-500">
          or drag to reorder importance
        </span>
      </div>

      {/* Actions */}
      <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
        <button className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors font-medium">
          Save Draft
        </button>
        <button
          onClick={() => onSave?.({ jobTitle, description, skills: aiTags })}
          className="px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:shadow-lg transition-all font-medium"
        >
          Publish Job
        </button>
      </div>
    </div>
  );
};

export default JobDescriptionEditor;
