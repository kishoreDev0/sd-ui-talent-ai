import React, { useState, useEffect } from 'react';
import { X, Video, VideoOff, Mic, MicOff, Volume2, Phone } from 'lucide-react';
import type { InterviewRound } from '@/store/interviews/types/interviewTypes';
import { Button } from '@/components/ui/button';

interface InterviewHostingProps {
  round: InterviewRound;
  onClose: () => void;
}

const InterviewHosting: React.FC<InterviewHostingProps> = ({
  round,
  onClose,
}) => {
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isMicOn, setIsMicOn] = useState(true);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [currentTab, setCurrentTab] = useState<
    'summary' | 'transcript' | 'information'
  >('summary');
  const [interviewScore] = useState(87);

  // Mock questions
  const questions = [
    'Tell us about yourself and your background.',
    'What interests you most about this position?',
    "Describe a time when your initial design didn't solve the user's problem. How did you identify the issue and what steps did you take to improve it?",
    'How do you handle tight deadlines?',
    'What are your strengths and weaknesses?',
  ];

  // Mock Workmap Score data
  const workmapScores = {
    Technical: 92,
    Communication: 88,
    ProblemSolving: 85,
    Leadership: 75,
    Personality: 88,
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRecording]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Extract meeting code from URL if available
  const meetingCode =
    round.meeting_url?.match(/meet\.google\.com\/([a-z-]+)/i)?.[1] || '';
  const embedUrl = meetingCode
    ? `https://meet.google.com/${meetingCode}?authuser=0`
    : round.meeting_url || '';

  return (
    <div className="absolute inset-0 z-50 bg-gray-100 dark:bg-slate-900 flex flex-col">
      {/* Header */}
      <div className="bg-white dark:bg-slate-800 border-b border-gray-200 dark:border-white/10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            {round.round_name}
          </h2>
          {round.candidate_id && (
            <span className="text-sm text-gray-600 dark:text-gray-400">
              Candidate #{round.candidate_id}
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-gray-600 hover:text-gray-900"
        >
          <X className="h-5 w-5" />
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-12 gap-3 p-3 overflow-auto xl:auto-rows-[minmax(260px,auto)]">
        {/* Top Left: Video Interview Interface */}
        <div className="col-span-1 xl:col-span-4 bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-white/10 overflow-hidden flex flex-col h-full">
          <div className="relative bg-gray-900 flex-1 min-h-[220px]">
            {embedUrl ? (
              <iframe
                src={embedUrl}
                className="w-full h-full"
                allow="camera; microphone; fullscreen; speaker; display-capture"
                style={{ border: 'none' }}
                title="Google Meet"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-white">
                <div className="text-center">
                  <Video className="h-16 w-16 mx-auto mb-4 opacity-50" />
                  <p className="text-sm opacity-75">No meeting URL available</p>
                </div>
              </div>
            )}

            {/* Recording Indicator */}
            {isRecording && (
              <div className="absolute top-4 left-4 flex items-center gap-2 bg-red-600 text-white px-3 py-1.5 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                Recording {formatTime(recordingTime)}
              </div>
            )}

            {/* User Profile in Top Left */}
            <div className="absolute top-4 left-4 bg-white/90 dark:bg-slate-800/90 rounded-full px-3 py-1.5 flex items-center gap-2 text-sm">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold">
                U
              </div>
              <span className="font-medium text-gray-900 dark:text-gray-100">
                You
              </span>
            </div>
          </div>

          {/* Video Controls */}
          <div className="bg-gray-50 dark:bg-slate-900 border-t border-gray-200 dark:border-white/10 px-4 py-3 flex items-center justify-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsVideoOn(!isVideoOn)}
              className={isVideoOn ? '' : 'bg-red-100 border-red-300'}
            >
              {isVideoOn ? (
                <Video className="h-4 w-4" />
              ) : (
                <VideoOff className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsMicOn(!isMicOn)}
              className={isMicOn ? '' : 'bg-red-100 border-red-300'}
            >
              {isMicOn ? (
                <Mic className="h-4 w-4" />
              ) : (
                <MicOff className="h-4 w-4" />
              )}
            </Button>
            <Button variant="outline" size="sm">
              <Volume2 className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRecording(!isRecording)}
              className={
                isRecording ? 'bg-red-600 text-white border-red-600' : ''
              }
            >
              <div className="w-2 h-2 rounded-full bg-current" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="bg-red-600 text-white border-red-600 hover:bg-red-700"
            >
              <Phone className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Top Right: Tabs for Summary / Transcript / Information */}
        <div className="col-span-1 xl:col-span-8 flex flex-col gap-3">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-white/10 p-3 flex flex-col h-full">
            <div className="flex gap-3 border-b border-gray-200 dark:border-white/10 mb-3 pb-1.5 text-sm font-semibold text-gray-600">
              {(['summary', 'transcript', 'information'] as const).map(
                (tab) => (
                  <button
                    key={tab}
                    className={`pb-1 capitalize ${
                      currentTab === tab
                        ? 'text-indigo-600 border-b-2 border-indigo-600'
                        : 'text-gray-400'
                    }`}
                    onClick={() => setCurrentTab(tab)}
                  >
                    {tab}
                  </button>
                ),
              )}
            </div>
            {currentTab === 'summary' && (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Summary
                </h3>
                <p>{questions[2]}</p>
                <p className="text-xs text-gray-500">
                  Key highlights, AI insights, and interviewer notes appear
                  here.
                </p>
              </div>
            )}
            {currentTab === 'transcript' && (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Transcript
                </h3>
                <p className="leading-relaxed">
                  [00:01] Interviewer: Introduce yourself.
                  <br />
                  [00:02] Candidate: Provided background, projects, and role
                  summary.
                  <br />
                  [00:05] Interviewer: Describe a time you iterated on a design.
                </p>
              </div>
            )}
            {currentTab === 'information' && (
              <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
                  Information
                </h3>
                <ul className="text-xs text-gray-500 space-y-1">
                  <li>Candidate Email: candidate@example.com</li>
                  <li>Job Title: Senior Product Designer</li>
                  <li>Panel: Moderator, Hiring Manager, Product Lead</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* Bottom Left: Candidate Summary and Workmap Score */}
        <div className="col-span-1 xl:col-span-4 bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-white/10 p-3 flex flex-col">
          <div className="flex gap-2 mb-3 border-b border-gray-200 dark:border-white/10 pb-1.5">
            <button className="px-3 py-1 text-sm font-semibold text-indigo-600 border-b-2 border-indigo-600">
              Summary
            </button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
              Transcript
            </button>
            <button className="px-3 py-1 text-sm text-gray-500 hover:text-gray-700">
              Information
            </button>
          </div>

          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Workmap Score
            </h3>
            <p className="text-xs text-gray-500 mb-4">
              See the workmap in the sheet
            </p>

            {/* Workmap Score Visualization */}
            <div className="space-y-3">
              {Object.entries(workmapScores).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-xs text-gray-600 dark:text-gray-400">
                    {key}
                  </span>
                  <div className="flex-1 mx-2 h-2 bg-gray-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${value}%`,
                        backgroundColor:
                          value >= 90
                            ? '#10b981'
                            : value >= 80
                              ? '#3b82f6'
                              : value >= 70
                                ? '#f59e0b'
                                : '#ef4444',
                      }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-gray-900 dark:text-gray-100 w-12 text-right">
                    {value}/100
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Right: Interview Score and Summary */}
        <div className="col-span-1 xl:col-span-4 bg-white dark:bg-slate-800 rounded-xl shadow border border-gray-200 dark:border-white/10 p-3 flex flex-col">
          <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-lg p-3 mb-3 text-white">
            <div className="text-3xl font-bold mb-1">{interviewScore}%</div>
            <div className="text-sm font-medium">Matched</div>
          </div>

          <div className="mb-4">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">
              AI Video Score Summary
            </h3>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              The presentation of talent is <strong>Good</strong>. Check the
              breakdown summary of AI Video Score.
            </p>
          </div>

          <div className="mt-auto">
            <h4 className="text-xs font-semibold text-gray-900 dark:text-gray-100 mb-2">
              Move Forward?
            </h4>
            <div className="flex gap-2">
              <Button
                size="sm"
                className="flex-1 bg-pink-600 hover:bg-pink-700 text-white"
              >
                Yes
              </Button>
              <Button size="sm" variant="outline" className="flex-1">
                No
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterviewHosting;
