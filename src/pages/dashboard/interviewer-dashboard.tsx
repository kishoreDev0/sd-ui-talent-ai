import React from 'react';
import { motion } from 'framer-motion';
import {
  Clock,
  CheckCircle2,
  Calendar,
  User,
  FileText,
  MessageSquare,
} from 'lucide-react';

const InterviewerDashboard: React.FC = () => {
  // Dashboard: Candidate details, questions, scorecard
  // Permissions: Feedback only

  const upcomingInterviews = [
    {
      id: 1,
      candidate: 'Sarah Johnson',
      job: 'Product Designer',
      time: 'Today, 10:00 AM',
      duration: '45 min',
      type: 'Technical',
      questionsCount: 8,
      resume: 'Download',
      scorecard: 'View',
    },
    {
      id: 2,
      candidate: 'Michael Chen',
      job: 'Frontend Developer',
      time: 'Tomorrow, 2:00 PM',
      duration: '60 min',
      type: 'Behavioral',
      questionsCount: 6,
      resume: 'Download',
      scorecard: 'View',
    },
    {
      id: 3,
      candidate: 'Emily Davis',
      job: 'UI/UX Designer',
      time: 'Oct 25, 11:00 AM',
      duration: '45 min',
      type: 'Final',
      questionsCount: 10,
      resume: 'Download',
      scorecard: 'View',
    },
  ];

  const interviewQuestions = [
    {
      category: 'Technical Skills',
      questions: [
        'Explain your experience with design systems',
        'How do you approach user research?',
        'Walk me through your portfolio',
      ],
    },
    {
      category: 'Behavioral Questions',
      questions: [
        'Tell me about a challenging project',
        'How do you handle feedback?',
        'Describe your design process',
      ],
    },
  ];

  const completedInterviews = [
    {
      id: 4,
      candidate: 'John Smith',
      job: 'Engineering Manager',
      date: 'Oct 20',
      rating: 4,
      feedback: 'Submitted',
    },
    {
      id: 5,
      candidate: 'Lisa Wang',
      job: 'Product Manager',
      date: 'Oct 19',
      rating: 5,
      feedback: 'Submitted',
    },
  ];

  return (
    <div className="space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-4xl font-bold text-gray-900">
          Interview Panel Dashboard
        </h1>
        <p className="text-gray-600 mt-2">
          Candidate details, questions, scorecard
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              Upcoming Interviews
            </h2>
            <Calendar className="w-5 h-5 text-gray-400" />
          </div>
          <div className="space-y-4">
            {upcomingInterviews.map((interview, index) => (
              <motion.div
                key={interview.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all"
              >
                {/* Candidate Details */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <User className="w-5 h-5 text-blue-600" />
                      {interview.candidate}
                    </h3>
                    <p className="text-sm text-gray-600 ml-7">
                      {interview.job}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                    {interview.type}
                  </span>
                </div>

                {/* Questions Count */}
                <div className="ml-7 mb-3">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <FileText className="w-4 h-4" />
                    <span>{interview.questionsCount} questions prepared</span>
                    <span>•</span>
                    <span>{interview.duration}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="ml-7 flex items-center space-x-2">
                  <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                    {interview.scorecard}
                  </button>
                  <span>•</span>
                  <button className="text-xs text-blue-600 hover:text-blue-800 hover:underline">
                    {interview.resume}
                  </button>
                </div>

                {/* Start Interview */}
                <div className="flex items-center justify-between mt-3 pt-3 border-t">
                  <div className="flex items-center text-sm text-gray-600 ml-7">
                    <Clock className="w-4 h-4 mr-2" />
                    {interview.time}
                  </div>
                  <button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
                    Start Interview
                  </button>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Interview Questions Section */}
          <div className="mt-8 pt-6 border-t">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Interview Questions
            </h3>
            <div className="space-y-4">
              {interviewQuestions.map((category, idx) => (
                <div
                  key={idx}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  <h4 className="font-semibold text-gray-900 mb-2">
                    {category.category}
                  </h4>
                  <ul className="space-y-1">
                    {category.questions.map((q, i) => (
                      <li
                        key={i}
                        className="text-sm text-gray-600 flex items-start"
                      >
                        <MessageSquare className="w-4 h-4 mr-2 text-blue-600 mt-0.5 flex-shrink-0" />
                        {q}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scorecard & Completed */}
        <div className="space-y-6">
          {/* Scorecard Template */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Scorecard Template
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Technical Skills</span>
                <span className="text-sm font-medium text-gray-900">/10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Communication</span>
                <span className="text-sm font-medium text-gray-900">/10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Problem Solving</span>
                <span className="text-sm font-medium text-gray-900">/10</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Cultural Fit</span>
                <span className="text-sm font-medium text-gray-900">/10</span>
              </div>
              <button className="w-full mt-4 bg-gray-100 text-gray-700 py-2 rounded-lg text-sm font-medium hover:bg-gray-200">
                Submit Feedback
              </button>
            </div>
          </div>

          {/* Recently Completed */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Recently Completed
            </h2>
            <div className="space-y-4">
              {completedInterviews.map((interview) => (
                <div
                  key={interview.id}
                  className="p-4 rounded-xl border border-gray-100"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {interview.candidate}
                      </h3>
                      <p className="text-sm text-gray-600">{interview.job}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">{interview.date}</span>
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />
                        <span className="font-medium">
                          {interview.rating}/5
                        </span>
                      </div>
                      <span className="text-xs text-green-600 font-medium">
                        {interview.feedback}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewerDashboard;
