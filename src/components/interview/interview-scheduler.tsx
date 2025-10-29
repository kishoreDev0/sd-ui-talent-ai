import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Video,
  StopCircle,
  Play,
  Download,
} from 'lucide-react';

interface InterviewSchedulerProps {
  candidate: {
    name: string;
    email: string;
    job: string;
  };
}

const InterviewScheduler: React.FC<InterviewSchedulerProps> = ({
  candidate,
}) => {
  const [scheduled, setScheduled] = useState(false);
  const [recording, setRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);

  const handleSchedule = () => {
    setScheduled(true);
  };

  const handleStartRecording = () => {
    setRecording(true);
    // Simulate timer
    const interval = setInterval(() => {
      setRecordingTime((prev) => prev + 1);
    }, 1000);

    setTimeout(() => {
      clearInterval(interval);
      setRecording(false);
    }, 10000);
  };

  const handleStopRecording = () => {
    setRecording(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 space-y-6">
      {/* Candidate Info */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Interview: {candidate.name}
        </h2>
        <p className="text-gray-600">{candidate.job} Position</p>
      </div>

      {!scheduled ? (
        // Scheduling Form
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date
              </label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="date"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Time
              </label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="time"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Interview Type
            </label>
            <select className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500">
              <option>Technical Interview</option>
              <option>Behavioral Interview</option>
              <option>Final Round</option>
              <option>Phone Screen</option>
            </select>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-center space-x-2 text-blue-700 font-medium mb-2">
              <Video className="w-5 h-5" />
              <span>Google Meet Link</span>
            </div>
            <p className="text-sm text-blue-600">
              meet.google.com/abc-defg-hij
            </p>
          </div>

          <button
            onClick={handleSchedule}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
          >
            Schedule Interview & Send Invite
          </button>
        </div>
      ) : (
        // Interview Interface
        <div className="space-y-6">
          {/* Interview Controls */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold mb-2">
                  Live Interview Recording
                </h3>
                <p className="text-sm opacity-90">
                  AI is analyzing in real-time
                </p>
              </div>
              <div className="flex items-center space-x-4">
                {recording ? (
                  <>
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                      <span className="text-sm font-medium">
                        {formatTime(recordingTime)}
                      </span>
                    </div>
                    <button
                      onClick={handleStopRecording}
                      className="bg-red-500 hover:bg-red-600 text-white p-3 rounded-full transition-colors"
                    >
                      <StopCircle className="w-6 h-6" />
                    </button>
                  </>
                ) : (
                  <button
                    onClick={handleStartRecording}
                    className="bg-white bg-opacity-20 hover:bg-opacity-30 text-white p-3 rounded-full transition-colors"
                  >
                    <Play className="w-6 h-6" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Interview Questions */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              Interview Questions
            </h3>
            <div className="space-y-4">
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Technical Questions
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Explain your experience with React and TypeScript</li>
                  <li>• How do you handle state management?</li>
                  <li>• Describe your testing approach</li>
                </ul>
              </div>
              <div className="p-4 bg-gray-50 rounded-lg">
                <h4 className="font-semibold text-gray-900 mb-2">
                  Behavioral Questions
                </h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Tell me about a challenging project</li>
                  <li>• How do you handle feedback?</li>
                  <li>• Describe your collaboration style</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Live Transcription */}
          <div className="bg-gray-50 rounded-xl p-4">
            <h4 className="font-semibold text-gray-900 mb-3">
              Live Transcription
            </h4>
            <div className="bg-white rounded-lg p-4 min-h-[200px] border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                Transcription will appear here during the interview...
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-xl font-medium hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2">
              <Download className="w-5 h-5" />
              <span>Download Recording</span>
            </button>
            <button className="flex-1 bg-green-600 text-white py-3 px-4 rounded-xl font-medium hover:bg-green-700 transition-colors">
              Submit Feedback
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InterviewScheduler;
