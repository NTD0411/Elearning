"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import FeedbackDiscussion from '@/components/Feedback/FeedbackDiscussion';

interface Submission {
  submissionId: number;
  userId?: number;
  examCourseId: number;
  examType?: string;
  examId?: number;
  answers?: string;
  totalWordCount?: number;
  timeSpent?: number;
  submittedAt?: string;
  aiScore?: number;
  mentorScore?: number;
  status?: string;
  examTitle?: string;
  courseTitle?: string;
  courseCode?: string;
  timeSpentFormatted: string;
  scoreFormatted: string;
  studentName?: string;
  studentEmail?: string;
  replyCount?: number;
  
  // AI Detailed Scoring Fields for Writing
  aiTaskAchievementScore?: number;
  aiTaskAchievementFeedback?: string;
  aiCoherenceCohesionScore?: number;
  aiCoherenceCohesionFeedback?: string;
  aiLexicalResourceScore?: number;
  aiLexicalResourceFeedback?: string;
  aiGrammaticalRangeScore?: number;
  aiGrammaticalRangeFeedback?: string;
  aiGeneralFeedback?: string;
}

interface GradeModalProps {
  submission: Submission;
  onClose: () => void;
  onGradeSubmit: () => void;
}

function GradeModal({ submission, onClose, onGradeSubmit }: GradeModalProps) {
  const [score, setScore] = useState(submission.mentorScore?.toString() || "");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const { data: session } = useSession();

  const getExamTypeColor = (examType?: string) => {
    switch (examType?.toLowerCase()) {
      case 'writing': return 'bg-orange-100 text-orange-800';
      case 'reading': return 'bg-blue-100 text-blue-800';
      case 'listening': return 'bg-green-100 text-green-800';
      case 'speaking': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'graded': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!score || parseFloat(score) < 0 || parseFloat(score) > 10) {
      alert("Please enter a valid score between 0 and 10");
      return;
    }

    setLoading(true);
    try {
      console.log('Session user:', session?.user);
      console.log('Mentor ID being sent:', session?.user?.id);
      
      const response = await fetch(`http://localhost:5074/api/Submission/${submission.submissionId}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({
          mentorScore: parseFloat(score),
          feedbackContent: feedback,
          status: "Graded",
          mentorId: parseInt(session?.user?.id || "0")
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to grade submission");
      }

      alert("Submission graded successfully");
      onGradeSubmit();
      onClose();
    } catch (error) {
      alert("Failed to grade submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Grade Submission - {submission.studentName || 'Student'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Toggle Details Button */}
        <div className="mt-4 mb-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <svg className={`w-4 h-4 mr-2 transition-transform ${showDetails ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
            {showDetails ? 'Hide Details' : 'View Submission Details'}
          </button>
        </div>

        {/* Submission Details */}
        {showDetails && (
          <div className="mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Basic Information */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Basic Information</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Student:</span>
                    <span className="ml-2 text-gray-900">{submission.studentName || 'Unknown'}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Exam Type:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getExamTypeColor(submission.examType)}`}>
                      {submission.examType}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Course:</span>
                    <span className="ml-2 text-gray-900">{submission.courseTitle}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Course Code:</span>
                    <span className="ml-2 text-gray-900">{submission.courseCode}</span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Exam Title:</span>
                    <span className="ml-2 text-gray-900">{submission.examTitle}</span>
                  </div>
                </div>
              </div>

              {/* Submission Details */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900">Submission Details</h4>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(submission.status)}`}>
                      {submission.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Submitted:</span>
                    <span className="ml-2 text-gray-900">
                      {submission.submittedAt ? new Date(submission.submittedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Time Spent:</span>
                    <span className="ml-2 text-gray-900">{submission.timeSpentFormatted}</span>
                  </div>
                  {submission.totalWordCount && (
                    <div>
                      <span className="font-medium text-gray-600">Word Count:</span>
                      <span className="ml-2 text-gray-900">{submission.totalWordCount} words</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* AI Scores */}
            {submission.aiScore && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">AI Scoring</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">AI Score</div>
                    <div className="text-lg font-bold text-blue-900">
                      {submission.aiScore ? `Band ${submission.aiScore}` : 'Not graded'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* AI Detailed Scoring for Writing */}
            {submission.examType?.toLowerCase() === 'writing' && submission.aiScore && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">AI Detailed Scoring (IELTS Criteria)</h4>
                <div className="space-y-4">
                  
                  {/* Task Achievement */}
                  {submission.aiTaskAchievementScore && (
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-purple-800">Task Achievement</span>
                        <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-bold">
                          {submission.aiTaskAchievementScore}/9
                        </span>
                      </div>
                      {submission.aiTaskAchievementFeedback && (
                        <p className="text-sm text-gray-700">{submission.aiTaskAchievementFeedback}</p>
                      )}
                    </div>
                  )}

                  {/* Coherence and Cohesion */}
                  {submission.aiCoherenceCohesionScore && (
                    <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-indigo-800">Coherence and Cohesion</span>
                        <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-bold">
                          {submission.aiCoherenceCohesionScore}/9
                        </span>
                      </div>
                      {submission.aiCoherenceCohesionFeedback && (
                        <p className="text-sm text-gray-700">{submission.aiCoherenceCohesionFeedback}</p>
                      )}
                    </div>
                  )}

                  {/* Lexical Resource */}
                  {submission.aiLexicalResourceScore && (
                    <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-teal-800">Lexical Resource</span>
                        <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-sm font-bold">
                          {submission.aiLexicalResourceScore}/9
                        </span>
                      </div>
                      {submission.aiLexicalResourceFeedback && (
                        <p className="text-sm text-gray-700">{submission.aiLexicalResourceFeedback}</p>
                      )}
                    </div>
                  )}

                  {/* Grammatical Range and Accuracy */}
                  {submission.aiGrammaticalRangeScore && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium text-orange-800">Grammatical Range and Accuracy</span>
                        <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-bold">
                          {submission.aiGrammaticalRangeScore}/9
                        </span>
                      </div>
                      {submission.aiGrammaticalRangeFeedback && (
                        <p className="text-sm text-gray-700">{submission.aiGrammaticalRangeFeedback}</p>
                      )}
                    </div>
                  )}

                  {/* General Feedback */}
                  {submission.aiGeneralFeedback && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-800 mb-2">General Feedback</h5>
                      <p className="text-sm text-gray-700">{submission.aiGeneralFeedback}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Answers */}
            {submission.answers && (
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Submitted Answers</h4>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {submission.examType?.toLowerCase() === 'speaking' ? (
                    // Handle Speaking Exam answers (audio files)
                    (() => {
                      const audioFiles = submission.answers.split(';').filter(path => path.trim());
                      return (
                        <div className="space-y-4">
                          <div className="text-sm text-gray-600 mb-3">
                            🎤 Speaking exam contains {audioFiles.length} audio recording{audioFiles.length !== 1 ? 's' : ''}
                          </div>
                          {audioFiles.map((filePath, index) => (
                            <div key={index} className="bg-white p-4 rounded-lg border">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium text-gray-700">
                                  Recording {index + 1}
                                </h5>
                                <span className="text-xs text-gray-500">
                                  {filePath.split('/').pop()?.split('_')[1] || `Question ${index + 1}`}
                                </span>
                              </div>
                              <div className="flex items-center space-x-3">
                                <audio 
                                  controls 
                                  className="flex-1"
                                  preload="metadata"
                                >
                                  <source src={`http://localhost:5074${filePath}`} type="audio/wav" />
                                  <source src={`http://localhost:5074${filePath}`} type="audio/mpeg" />
                                  Your browser does not support the audio element.
                                </audio>
                                <a
                                  href={`http://localhost:5074${filePath}`}
                                  download={`speaking_recording_${index + 1}.wav`}
                                  className="inline-flex items-center px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 rounded border border-blue-200"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Download
                                </a>
                              </div>
                              <div className="mt-2 text-xs text-gray-500">
                                File: {filePath}
                              </div>
                            </div>
                          ))}
                          {audioFiles.length === 0 && (
                            <div className="text-center py-4 text-gray-500">
                              No audio recordings found
                            </div>
                          )}
                        </div>
                      );
                    })()
                  ) : submission.examType?.toLowerCase() === 'writing' ? (
                    // Handle Writing Exam answers (JSON format with task1 and task2)
                    (() => {
                      try {
                        const answers = JSON.parse(submission.answers);
                        return (
                          <div className="space-y-4">
                            {answers.task1 && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Task 1 Answer:</h5>
                                <div className="bg-white p-3 rounded border text-sm text-gray-700 max-h-40 overflow-y-auto">
                                  {typeof answers.task1 === 'string' 
                                    ? answers.task1 
                                    : answers.task1.answer || JSON.stringify(answers.task1, null, 2)}
                                </div>
                                {typeof answers.task1 === 'object' && answers.task1.wordcount && (
                                  <p className="text-xs text-gray-500 mt-1">Word count: {answers.task1.wordcount}</p>
                                )}
                              </div>
                            )}
                            {answers.task2 && (
                              <div>
                                <h5 className="font-medium text-gray-700 mb-2">Task 2 Answer:</h5>
                                <div className="bg-white p-3 rounded border text-sm text-gray-700 max-h-40 overflow-y-auto">
                                  {typeof answers.task2 === 'string' 
                                    ? answers.task2 
                                    : answers.task2.answer || JSON.stringify(answers.task2, null, 2)}
                                </div>
                                {typeof answers.task2 === 'object' && answers.task2.wordcount && (
                                  <p className="text-xs text-gray-500 mt-1">Word count: {answers.task2.wordcount}</p>
                                )}
                              </div>
                            )}
                            {!answers.task1 && !answers.task2 && (
                              <pre className="whitespace-pre-wrap text-sm text-gray-700 max-h-60 overflow-y-auto">
                                {JSON.stringify(answers, null, 2)}
                              </pre>
                            )}
                          </div>
                        );
                      } catch (error) {
                        console.error('Error parsing answers JSON:', error);
                        return (
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 max-h-60 overflow-y-auto">
                            {submission.answers}
                          </pre>
                        );
                      }
                    })()
                  ) : (
                    // Handle other exam types
                    (() => {
                      try {
                        const parsedAnswers = JSON.parse(submission.answers);
                        return (
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 max-h-60 overflow-y-auto">
                            {JSON.stringify(parsedAnswers, null, 2)}
                          </pre>
                        );
                      } catch (error) {
                        return (
                          <pre className="whitespace-pre-wrap text-sm text-gray-700 max-h-60 overflow-y-auto">
                            {submission.answers}
                          </pre>
                        );
                      }
                    })()
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Grading Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <h4 className="font-medium text-yellow-800 mb-3">Mentor Grading</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Score (0-10)
                </label>
                <input
                  type="number"
                  min="0"
                  max="10"
                  step="0.1"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter score (0-10)"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Status
                </label>
                <div className="flex items-center">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                    {submission.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Feedback for Student
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 h-24"
                placeholder="Enter detailed feedback for the student..."
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : submission.mentorScore ? "Update Grade" : "Submit Grade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GradePage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [showFeedbackDiscussion, setShowFeedbackDiscussion] = useState(false);
  const [selectedSubmissionForDiscussion, setSelectedSubmissionForDiscussion] = useState<number | null>(null);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch("http://localhost:5074/api/Submission/mentor", {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }
      
      const data = await response.json();
      console.log('Mentor submissions data:', data);
      setSubmissions(data);
    } catch (err) {
      console.error("Error loading submissions:", err);
      setError("Failed to load submissions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewFeedbackDiscussion = (submissionId: number) => {
    setSelectedSubmissionForDiscussion(submissionId);
    setShowFeedbackDiscussion(true);
  };

  const closeFeedbackDiscussion = () => {
    setShowFeedbackDiscussion(false);
    setSelectedSubmissionForDiscussion(null);
  };

  useEffect(() => {
    const loadData = async () => {
      if (session?.user) {
        await fetchSubmissions();
      }
    };
    void loadData();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 min-h-[600px] flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Submissions to Grade</h1>
        
        {selectedSubmission && (
          <GradeModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onGradeSubmit={fetchSubmissions}
          />
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Course</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">AI Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Mentor Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Discussion</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.submissionId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{submission.studentName || 'Unknown Student'}</div>
                        {submission.studentEmail && (
                          <div className="text-xs text-gray-500">{submission.studentEmail}</div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>
                        <div className="font-medium">{submission.courseTitle || 'Unknown Course'}</div>
                        <div className="text-xs text-gray-500">{submission.courseCode}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${submission.examType?.toLowerCase() === 'writing' ? 'bg-orange-100 text-orange-800' : 
                          submission.examType?.toLowerCase() === 'reading' ? 'bg-blue-100 text-blue-800' :
                          submission.examType?.toLowerCase() === 'listening' ? 'bg-green-100 text-green-800' :
                          submission.examType?.toLowerCase() === 'speaking' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {submission.examType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${submission.status?.toLowerCase() === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          submission.status?.toLowerCase() === 'graded' ? 'bg-green-100 text-green-800' : 
                          submission.status?.toLowerCase() === 'submitted' ? 'bg-blue-100 text-blue-800' :
                          'bg-gray-100 text-gray-800'}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {submission.aiScore ? `Band ${submission.aiScore}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {submission.mentorScore ? `Band ${submission.mentorScore}` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {submission.mentorScore ? (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                          {submission.replyCount ? `${submission.replyCount} replies` : 'Discussion Available'}
                        </span>
                      ) : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div className="flex space-x-2">
                        <button
                          className={`font-medium ${
                            submission.status?.toLowerCase() === 'graded'
                              ? 'text-green-600 hover:text-green-700'
                              : 'text-blue-600 hover:text-blue-700'
                          }`}
                          onClick={() => setSelectedSubmission(submission)}
                        >
                          {submission.status?.toLowerCase() === 'graded' ? 'Edit Grade' : 'Grade & Review'}
                        </button>
                        {submission.mentorScore && (
                          <button
                            onClick={() => handleViewFeedbackDiscussion(submission.submissionId)}
                            className="font-medium text-purple-600 hover:text-purple-700"
                          >
                            View Discussion
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Feedback Discussion Modal */}
        {showFeedbackDiscussion && selectedSubmissionForDiscussion && (
          <FeedbackDiscussion
            submissionId={selectedSubmissionForDiscussion}
            onClose={closeFeedbackDiscussion}
          />
        )}
      </div>
    </div>
  );
}