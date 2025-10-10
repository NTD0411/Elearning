'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface WritingExam {
  writingExamId: number;
  examTitle: string;
  task1Title: string;
  task1Description: string;
  task1ImageUrl?: string;
  task1Requirements: string;
  task1MinWords: number;
  task1MaxTime: number;
  task2Title: string;
  task2Question: string;
  task2Context?: string;
  task2Requirements: string;
  task2MinWords: number;
  task2MaxTime: number;
  totalTimeMinutes: number;
  instructions: string;
}

interface AIFeedback {
  overallBand: number;
  taskAchievementScore: number;
  taskAchievementFeedback: string;
  coherenceCohesionScore: number;
  coherenceCohesionFeedback: string;
  lexicalResourceScore: number;
  lexicalResourceFeedback: string;
  grammaticalRangeScore: number;
  grammaticalRangeFeedback: string;
  generalFeedback: string;
}

export default function WritingExamPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const courseId = searchParams.get('courseId');

  const [writingExam, setWritingExam] = useState<WritingExam | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Exam state
  const [activeTask, setActiveTask] = useState<1 | 2>(1);
  const [task1Answer, setTask1Answer] = useState('');
  const [task2Answer, setTask2Answer] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  
  // AI Feedback state
  const [showAIFeedback, setShowAIFeedback] = useState(false);
  const [aiFeedback, setAIFeedback] = useState<AIFeedback | null>(null);

  // Word count functions
  const countWords = (text: string) => {
    return text.trim().split(/\s+/).filter(word => word.length > 0).length;
  };

  const task1WordCount = countWords(task1Answer);
  const task2WordCount = countWords(task2Answer);

  useEffect(() => {
    const fetchWritingExam = async () => {
      if (!courseId) {
        setError('Course ID is required');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5074/api/WritingExam/course/${courseId}`);
        
        if (!response.ok) {
          throw new Error('Writing exam not found for this course');
        }
        
        const examData = await response.json();
        setWritingExam(examData);
        setTimeRemaining(examData.totalTimeMinutes * 60); // Convert to seconds
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load writing exam');
      } finally {
        setLoading(false);
      }
    };

    fetchWritingExam();
  }, [courseId]);

  // Timer countdown
  useEffect(() => {
    if (timeRemaining > 0 && !isSubmitted) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleSubmit(); // Auto submit when time is up
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [timeRemaining, isSubmitted]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = async () => {
    if (!session?.user?.id || !writingExam) {
      alert('Please login to submit your exam');
      return;
    }

    setSubmitting(true);
    
    try {
      const submissionData = {
        userId: session.user.id,
        examType: 'Writing',
        examId: writingExam.writingExamId,
        answers: JSON.stringify({
          task1: {
            answer: task1Answer,
            wordCount: task1WordCount
          },
          task2: {
            answer: task2Answer,
            wordCount: task2WordCount
          }
        }),
        totalWordCount: task1WordCount + task2WordCount,
        timeSpent: writingExam.totalTimeMinutes * 60 - timeRemaining,
        submittedAt: new Date().toISOString()
      };

      const response = await fetch('http://localhost:5074/api/Submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData)
      });

      if (!response.ok) {
        throw new Error('Failed to submit exam');
      }

      const result = await response.json();
      
      // Check if AI feedback is available
      if (result.aiScore && result.aiTaskAchievementScore) {
        setAIFeedback({
          overallBand: result.aiScore,
          taskAchievementScore: result.aiTaskAchievementScore,
          taskAchievementFeedback: result.aiTaskAchievementFeedback || '',
          coherenceCohesionScore: result.aiCoherenceCohesionScore || 0,
          coherenceCohesionFeedback: result.aiCoherenceCohesionFeedback || '',
          lexicalResourceScore: result.aiLexicalResourceScore || 0,
          lexicalResourceFeedback: result.aiLexicalResourceFeedback || '',
          grammaticalRangeScore: result.aiGrammaticalRangeScore || 0,
          grammaticalRangeFeedback: result.aiGrammaticalRangeFeedback || '',
          generalFeedback: result.aiGeneralFeedback || ''
        });
        setShowAIFeedback(true);
      }

      setIsSubmitted(true);
      
    } catch (err) {
      alert('Failed to submit exam. Please try again.');
      console.error('Submission error:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !writingExam) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Writing Exam Not Available</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div>
              <h1 className="text-xl font-semibold text-gray-900">{writingExam.examTitle}</h1>
              <p className="text-sm text-gray-500">IELTS Writing Test - Academic</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-4 py-2 rounded-lg ${timeRemaining < 300 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                <span className="font-mono text-lg">⏰ {formatTime(timeRemaining)}</span>
              </div>
              {!isSubmitted && (
                <button
                  onClick={handleSubmit}
                  disabled={submitting}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {submitting ? 'Submitting...' : 'Submit Exam'}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Task Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow p-6 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">Tasks</h3>
              
              <div className="space-y-3">
                <button
                  onClick={() => setActiveTask(1)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    activeTask === 1 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Task 1</div>
                  <div className="text-sm text-gray-500">{writingExam.task1MinWords} words minimum</div>
                  <div className="text-sm text-gray-500">{writingExam.task1MaxTime} minutes</div>
                  <div className="text-xs mt-1">
                    <span className={task1WordCount >= writingExam.task1MinWords ? 'text-green-600' : 'text-red-600'}>
                      {task1WordCount} words
                    </span>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTask(2)}
                  className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                    activeTask === 2 
                      ? 'border-blue-500 bg-blue-50 text-blue-700' 
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="font-medium">Task 2</div>
                  <div className="text-sm text-gray-500">{writingExam.task2MinWords} words minimum</div>
                  <div className="text-sm text-gray-500">{writingExam.task2MaxTime} minutes</div>
                  <div className="text-xs mt-1">
                    <span className={task2WordCount >= writingExam.task2MinWords ? 'text-green-600' : 'text-red-600'}>
                      {task2WordCount} words
                    </span>
                  </div>
                </button>
              </div>

              {/* Instructions */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
                <p className="text-sm text-gray-600">{writingExam.instructions}</p>
              </div>

              {/* Word Count Summary */}
              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Word Count</h4>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>Task 1:</span>
                    <span className={task1WordCount >= writingExam.task1MinWords ? 'text-green-600' : 'text-red-600'}>
                      {task1WordCount}/{writingExam.task1MinWords}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Task 2:</span>
                    <span className={task2WordCount >= writingExam.task2MinWords ? 'text-green-600' : 'text-red-600'}>
                      {task2WordCount}/{writingExam.task2MinWords}
                    </span>
                  </div>
                  <div className="flex justify-between font-medium pt-2 border-t">
                    <span>Total:</span>
                    <span className="text-blue-600">{task1WordCount + task2WordCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow">
              {/* Task 1 */}
              {activeTask === 1 && (
                <div className="p-6">
                  <div className="border-l-4 border-blue-500 pl-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{writingExam.task1Title}</h2>
                    <p className="text-gray-600 mb-4">{writingExam.task1Description}</p>
                    
                    {writingExam.task1ImageUrl && (
                      <div className="mb-4">
                        <img 
                          src={writingExam.task1ImageUrl} 
                          alt="Task 1 Chart/Graph" 
                          className="max-w-full h-auto border rounded-lg"
                        />
                      </div>
                    )}
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                      <p className="text-sm text-gray-700">{writingExam.task1Requirements}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer (Minimum {writingExam.task1MinWords} words)
                    </label>
                    <textarea
                      value={task1Answer}
                      onChange={(e) => setTask1Answer(e.target.value)}
                      disabled={isSubmitted}
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100"
                      placeholder="Write your answer for Task 1 here..."
                    />
                    <div className="mt-2 flex justify-between text-sm">
                      <span className={task1WordCount >= writingExam.task1MinWords ? 'text-green-600' : 'text-red-600'}>
                        {task1WordCount} words (minimum: {writingExam.task1MinWords})
                      </span>
                      <span className="text-gray-500">
                        Recommended time: {writingExam.task1MaxTime} minutes
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Task 2 */}
              {activeTask === 2 && (
                <div className="p-6">
                  <div className="border-l-4 border-green-500 pl-4 mb-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{writingExam.task2Title}</h2>
                    
                    {writingExam.task2Context && (
                      <div className="bg-gray-50 p-4 rounded-lg mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Context:</h4>
                        <p className="text-gray-700">{writingExam.task2Context}</p>
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <h4 className="font-medium text-gray-900 mb-2">Question:</h4>
                      <p className="text-gray-700">{writingExam.task2Question}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-medium text-gray-900 mb-2">Requirements:</h4>
                      <p className="text-sm text-gray-700">{writingExam.task2Requirements}</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer (Minimum {writingExam.task2MinWords} words)
                    </label>
                    <textarea
                      value={task2Answer}
                      onChange={(e) => setTask2Answer(e.target.value)}
                      disabled={isSubmitted}
                      className="w-full h-96 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:bg-gray-100"
                      placeholder="Write your answer for Task 2 here..."
                    />
                    <div className="mt-2 flex justify-between text-sm">
                      <span className={task2WordCount >= writingExam.task2MinWords ? 'text-green-600' : 'text-red-600'}>
                        {task2WordCount} words (minimum: {writingExam.task2MinWords})
                      </span>
                      <span className="text-gray-500">
                        Recommended time: {writingExam.task2MaxTime} minutes
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Section */}
              {!isSubmitted && (
                <div className="border-t bg-gray-50 px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">
                      Make sure both tasks meet the minimum word requirements before submitting.
                    </div>
                    <button
                      onClick={handleSubmit}
                      disabled={submitting || task1WordCount < writingExam.task1MinWords || task2WordCount < writingExam.task2MinWords}
                      className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {submitting && (
                        <svg className="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      <span>{submitting ? 'Submitting & Getting AI Feedback...' : 'Submit Writing Exam'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Submitted State */}
              {isSubmitted && (
                <div className="border-t bg-green-50 px-6 py-4">
                  <div className="flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-medium text-green-900 mb-1">Exam Submitted Successfully!</h3>
                      <p className="text-sm text-green-700 mb-4">
                        Your writing exam has been submitted with {task1WordCount + task2WordCount} total words.
                      </p>
                      <button
                        onClick={() => router.push('/')}
                        className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700"
                      >
                        Return to Dashboard
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* AI Feedback Modal */}
      {showAIFeedback && aiFeedback && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b">
              <h3 className="text-xl font-semibold text-gray-900">
                🤖 AI Scoring Results
              </h3>
              <button
                onClick={() => setShowAIFeedback(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="mt-4 max-h-96 overflow-y-auto">
              {/* Overall Score */}
              <div className="mb-6 text-center">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                  <h4 className="text-lg font-medium text-blue-800 mb-2">Overall IELTS Band Score</h4>
                  <div className="text-4xl font-bold text-blue-900">
                    Band {aiFeedback.overallBand}
                  </div>
                </div>
              </div>

              {/* Detailed Criteria */}
              <div className="space-y-4">
                {/* Task Achievement */}
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-purple-800">Task Achievement</span>
                    <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-sm font-bold">
                      {aiFeedback.taskAchievementScore}/9
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{aiFeedback.taskAchievementFeedback}</p>
                </div>

                {/* Coherence and Cohesion */}
                <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-indigo-800">Coherence and Cohesion</span>
                    <span className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-full text-sm font-bold">
                      {aiFeedback.coherenceCohesionScore}/9
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{aiFeedback.coherenceCohesionFeedback}</p>
                </div>

                {/* Lexical Resource */}
                <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-teal-800">Lexical Resource</span>
                    <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded-full text-sm font-bold">
                      {aiFeedback.lexicalResourceScore}/9
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{aiFeedback.lexicalResourceFeedback}</p>
                </div>

                {/* Grammatical Range and Accuracy */}
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-medium text-orange-800">Grammatical Range and Accuracy</span>
                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded-full text-sm font-bold">
                      {aiFeedback.grammaticalRangeScore}/9
                    </span>
                  </div>
                  <p className="text-sm text-gray-700">{aiFeedback.grammaticalRangeFeedback}</p>
                </div>

                {/* General Feedback */}
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h5 className="font-medium text-gray-800 mb-2">General Feedback</h5>
                  <p className="text-sm text-gray-700">{aiFeedback.generalFeedback}</p>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex justify-center space-x-4">
                <button
                  onClick={() => setShowAIFeedback(false)}
                  className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                >
                  Close
                </button>
                <button
                  onClick={() => router.push('/history')}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
                >
                  View History
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}