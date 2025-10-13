'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import FeedbackView from '@/components/Feedback/FeedbackView';

interface SubmissionHistory {
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

export default function ExamHistoryPage() {
  const { data: session, status } = useSession();
  const [submissions, setSubmissions] = useState<SubmissionHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedExamType, setSelectedExamType] = useState<string>('all');
  const [selectedSubmission, setSelectedSubmission] = useState<SubmissionHistory | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);
  const [selectedSubmissionForFeedback, setSelectedSubmissionForFeedback] = useState<number | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      // Wait for session to load
      if (status === 'loading') {
        return;
      }

      if (status === 'unauthenticated') {
        setError('Please login to view exam history');
        setLoading(false);
        return;
      }

      if (!session?.user?.id) {
        setError('User ID not available. Please login again.');
        setLoading(false);
        return;
      }

      try {
        console.log('Fetching history for user ID:', session.user.id);
        const response = await fetch(`http://localhost:5074/api/Submission/user/${session.user.id}/history`);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('API Error:', response.status, errorText);
          throw new Error(`API Error: ${response.status} - ${errorText || 'Failed to fetch exam history'}`);
        }
        
        const historyData = await response.json();
        console.log('History data received:', historyData);
        setSubmissions(historyData);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Failed to load exam history');
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [session, status]);

  // Auto-refresh when DB changes: periodic polling and on focus/visibility change
  useEffect(() => {
    if (status !== 'authenticated' || !session?.user?.id) return;

    let timer: any;
    const doFetch = async () => {
      try {
        const response = await fetch(`http://localhost:5074/api/Submission/user/${session.user.id}/history`, { cache: 'no-store' });
        if (!response.ok) return;
        const historyData = await response.json();
        setSubmissions(historyData);
      } catch {}
    };

    // Poll every 20s
    timer = setInterval(doFetch, 20000);

    // Refetch on window focus or when tab becomes visible
    const onFocus = () => doFetch();
    const onVisibility = () => { if (document.visibilityState === 'visible') doFetch(); };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      clearInterval(timer);
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibility);
    };
  }, [session, status]);

  const filteredSubmissions = submissions.filter(submission => {
    if (selectedExamType === 'all') return true;
    return submission.examType?.toLowerCase() === selectedExamType.toLowerCase();
  });

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

  const handleViewDetails = (submission: SubmissionHistory) => {
    setSelectedSubmission(submission);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedSubmission(null);
  };

  const handleViewFeedback = (submissionId: number) => {
    setSelectedSubmissionForFeedback(submissionId);
    setShowFeedbackModal(true);
  };

  const closeFeedbackModal = () => {
    setShowFeedbackModal(false);
    setSelectedSubmissionForFeedback(null);
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && showModal) {
        closeModal();
      }
    };

    if (showModal) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [showModal]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-24 w-24 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Error Loading History</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Link 
              href="/" 
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Exam History</h1>
            <p className="text-gray-600 mt-2">View your exam submissions and results</p>
          </div>
        </div>
        {/* Filter Section */}
        <div className="bg-white rounded-lg shadow mb-6 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-medium text-gray-900">Filter by Exam Type</h2>
              <p className="text-sm text-gray-500">Show submissions for specific exam types</p>
            </div>
            <select
              value={selectedExamType}
              onChange={(e) => setSelectedExamType(e.target.value)}
              className="ml-4 block w-48 pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="all">All Exam Types</option>
              <option value="writing">Writing</option>
              <option value="reading">Reading</option>
              <option value="listening">Listening</option>
              <option value="speaking">Speaking</option>
            </select>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Exams</dt>
                    <dd className="text-lg font-medium text-gray-900">{filteredSubmissions.length}</dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Completed</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {filteredSubmissions.filter(s => s.status === 'Submitted').length}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Avg Score</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {filteredSubmissions.filter(s => s.aiScore || s.mentorScore).length > 0
                        ? (filteredSubmissions.reduce((acc, s) => acc + (s.aiScore || s.mentorScore || 0), 0) / 
                           filteredSubmissions.filter(s => s.aiScore || s.mentorScore).length).toFixed(1)
                        : 'N/A'}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <svg className="h-6 w-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">Total Time</dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {Math.round(filteredSubmissions.reduce((acc, s) => acc + (s.timeSpent || 0), 0) / 60)}m
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white shadow rounded-lg p-8 text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No exam submissions</h3>
            <p className="mt-1 text-sm text-gray-500">Get started by taking your first exam.</p>
            <div className="mt-6">
              <Link
                href="/"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Courses
              </Link>
            </div>
          </div>
        ) : (
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Recent Submissions ({filteredSubmissions.length})
              </h3>
            </div>
            <ul className="divide-y divide-gray-200">
              {filteredSubmissions.map((submission) => (
                <li key={submission.submissionId} className="px-6 py-4 hover:bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getExamTypeColor(submission.examType)}`}>
                          {submission.examType}
                        </div>
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="flex items-center">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {submission.examTitle || 'Untitled Exam'}
                          </p>
                          <div className={`ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                            {submission.status}
                          </div>
                        </div>
                        <p className="text-sm text-gray-500">
                          {submission.courseTitle} • {submission.courseCode}
                        </p>
                        <div className="flex items-center mt-1 text-xs text-gray-400">
                          <span>Submitted: {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Unknown'}</span>
                          <span className="mx-2">•</span>
                          <span>Time: {submission.timeSpentFormatted}</span>
                          {submission.totalWordCount && (
                            <>
                              <span className="mx-2">•</span>
                              <span>Words: {submission.totalWordCount}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          Score: {submission.scoreFormatted}
                        </p>
                        {submission.examType?.toLowerCase() === 'writing' && submission.aiScore && (
                          <div className="flex items-center justify-end mt-1">
                            <div className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                              AI: Band {submission.aiScore}
                            </div>
                          </div>
                        )}
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleViewDetails(submission)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50"
                        >
                          View Details
                        </button>
                        {submission.mentorScore && (
                          <button
                            onClick={() => handleViewFeedback(submission.submissionId)}
                            className="inline-flex items-center px-3 py-1.5 border border-blue-300 shadow-sm text-xs font-medium rounded text-blue-700 bg-blue-50 hover:bg-blue-100"
                          >
                            View Feedback
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {showModal && selectedSubmission && (
        <div 
          className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              closeModal();
            }
          }}
        >
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                Exam Submission Details
              </h3>
              <button
                onClick={closeModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Content */}
            <div className="mt-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Basic Information */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Basic Information</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Exam Type:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getExamTypeColor(selectedSubmission.examType)}`}>
                        {selectedSubmission.examType}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Course:</span>
                      <span className="ml-2 text-gray-900">{selectedSubmission.courseTitle}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Course Code:</span>
                      <span className="ml-2 text-gray-900">{selectedSubmission.courseCode}</span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Exam Title:</span>
                      <span className="ml-2 text-gray-900">{selectedSubmission.examTitle}</span>
                    </div>
                  </div>
                </div>

                {/* Submission Details */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900">Submission Details</h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs ${getStatusColor(selectedSubmission.status)}`}>
                        {selectedSubmission.status}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Submitted:</span>
                      <span className="ml-2 text-gray-900">
                        {selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleString() : 'N/A'}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Time Spent:</span>
                      <span className="ml-2 text-gray-900">{selectedSubmission.timeSpentFormatted}</span>
                    </div>
                    {selectedSubmission.totalWordCount && (
                      <div>
                        <span className="font-medium text-gray-600">Word Count:</span>
                        <span className="ml-2 text-gray-900">{selectedSubmission.totalWordCount} words</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Scores */}
              <div className="mb-6">
                <h4 className="font-medium text-gray-900 mb-3">Scores</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-800">AI Score</div>
                    <div className="text-lg font-bold text-blue-900">
                      {selectedSubmission.aiScore ? `Band ${selectedSubmission.aiScore}` : 'Not graded'}
                    </div>
                  </div>
                  <div className="bg-green-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-green-800">Mentor Score</div>
                    <div className="text-lg font-bold text-green-900">
                      {selectedSubmission.mentorScore ? `Band ${selectedSubmission.mentorScore}` : 'Not graded'}
                    </div>
                  </div>
                </div>
              </div>

              {/* AI Detailed Scoring for Writing */}
              {selectedSubmission.examType?.toLowerCase() === 'writing' && selectedSubmission.aiScore && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">AI Detailed Scoring (IELTS Criteria)</h4>
                  <div className="space-y-4">
                    
                    {/* Task Achievement */}
                    {selectedSubmission.aiTaskAchievementScore && (
                      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-purple-800">Task Achievement</span>
                          <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-bold">
                            {selectedSubmission.aiTaskAchievementScore}/9
                          </span>
                        </div>
                        {selectedSubmission.aiTaskAchievementFeedback && (
                          <p className="text-sm text-gray-700">{selectedSubmission.aiTaskAchievementFeedback}</p>
                        )}
                      </div>
                    )}

                    {/* Coherence and Cohesion */}
                    {selectedSubmission.aiCoherenceCohesionScore && (
                      <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-indigo-800">Coherence and Cohesion</span>
                          <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-bold">
                            {selectedSubmission.aiCoherenceCohesionScore}/9
                          </span>
                        </div>
                        {selectedSubmission.aiCoherenceCohesionFeedback && (
                          <p className="text-sm text-gray-700">{selectedSubmission.aiCoherenceCohesionFeedback}</p>
                        )}
                      </div>
                    )}

                    {/* Lexical Resource */}
                    {selectedSubmission.aiLexicalResourceScore && (
                      <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-teal-800">Lexical Resource</span>
                          <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-sm font-bold">
                            {selectedSubmission.aiLexicalResourceScore}/9
                          </span>
                        </div>
                        {selectedSubmission.aiLexicalResourceFeedback && (
                          <p className="text-sm text-gray-700">{selectedSubmission.aiLexicalResourceFeedback}</p>
                        )}
                      </div>
                    )}

                    {/* Grammatical Range and Accuracy */}
                    {selectedSubmission.aiGrammaticalRangeScore && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium text-orange-800">Grammatical Range and Accuracy</span>
                          <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-bold">
                            {selectedSubmission.aiGrammaticalRangeScore}/9
                          </span>
                        </div>
                        {selectedSubmission.aiGrammaticalRangeFeedback && (
                          <p className="text-sm text-gray-700">{selectedSubmission.aiGrammaticalRangeFeedback}</p>
                        )}
                      </div>
                    )}

                    {/* General Feedback */}
                    {selectedSubmission.aiGeneralFeedback && (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                        <h5 className="font-medium text-gray-800 mb-2">General Feedback</h5>
                        <p className="text-sm text-gray-700">{selectedSubmission.aiGeneralFeedback}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Answers */}
              {selectedSubmission.answers && (
                <div className="mb-6">
                  <h4 className="font-medium text-gray-900 mb-3">Submitted Answers</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    {selectedSubmission.examType?.toLowerCase() === 'speaking' ? (
                      // Handle Speaking Exam answers (audio files)
                      (() => {
                        const audioFiles = selectedSubmission.answers.split(';').filter(path => path.trim());
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
                    ) : selectedSubmission.examType?.toLowerCase() === 'writing' ? (
                      // Handle Writing Exam answers (JSON format with task1 and task2)
                      (() => {
                        try {
                          const answers = JSON.parse(selectedSubmission.answers);
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
                              {selectedSubmission.answers}
                            </pre>
                          );
                        }
                      })()
                    ) : (
                      // Handle other exam types
                      (() => {
                        try {
                          const parsedAnswers = JSON.parse(selectedSubmission.answers);
                          return (
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 max-h-60 overflow-y-auto">
                              {JSON.stringify(parsedAnswers, null, 2)}
                            </pre>
                          );
                        } catch (error) {
                          return (
                            <pre className="whitespace-pre-wrap text-sm text-gray-700 max-h-60 overflow-y-auto">
                              {selectedSubmission.answers}
                            </pre>
                          );
                        }
                      })()
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3 pt-4 border-t">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                {selectedSubmission.examType?.toLowerCase() === 'writing' && (
                  <button
                    onClick={() => {
                      // TODO: Navigate to retake exam
                      alert('Retake exam functionality to be implemented');
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700"
                  >
                    Retake Exam
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Feedback Modal */}
      {showFeedbackModal && selectedSubmissionForFeedback && (
        <FeedbackView
          submissionId={selectedSubmissionForFeedback}
          onClose={closeFeedbackModal}
        />
      )}
    </div>
  );
}