'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ReadingQuestion {
  questionId: number;
  questionOrder: number;
  questionText: string;
  options: string[];
  answerFill?: string;
  questionType: 'choice' | 'fill';
}

interface ReadingExamData {
  examSetId: number;
  examSetTitle: string;
  examSetCode: string;
  readingContext?: string;
  readingImage?: string;
  totalQuestions: number;
  questions: ReadingQuestion[];
}

interface ReadingAnswer {
  questionId: number;
  answerChoice?: string;
  answerFill?: string;
}

interface ReadingResult {
  submissionId: number;
  userId: number;
  examSetId: number;
  examSetTitle: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  score: number;
  timeSpent: number;
  submittedAt: string;
  answerResults: Array<{
    questionId: number;
    questionText: string;
    userAnswer?: string;
    correctAnswer: string;
    isCorrect: boolean;
    optionA?: string;
    optionB?: string;
    optionC?: string;
    optionD?: string;
  }>;
}

const ReadingExam: React.FC = () => {
  const searchParams = useSearchParams();
  const { data: session } = useSession();
  const examSetId = searchParams.get('examSetId');
  const userId = session?.user?.id || searchParams.get('userId') || '1'; // Use session user ID first

  const [examData, setExamData] = useState<ReadingExamData | null>(null);
  const [answers, setAnswers] = useState<ReadingAnswer[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [result, setResult] = useState<ReadingResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Timer
  useEffect(() => {
    if (!isSubmitted && examData) {
      const timer = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [isSubmitted, examData]);

  // Load exam questions
  useEffect(() => {
    if (examSetId) {
      loadExamQuestions();
    }
  }, [examSetId]);

  const loadExamQuestions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`http://localhost:5074/api/ReadingExam/examset/${examSetId}/questions`);
      if (!response.ok) {
        throw new Error('Failed to load exam questions');
      }
      const data = await response.json();
      setExamData(data);
      
      // Initialize answers array
      const initialAnswers: ReadingAnswer[] = data.questions.map((q: ReadingQuestion) => ({
        questionId: q.questionId,
        answerChoice: undefined,
        answerFill: undefined
      }));
      setAnswers(initialAnswers);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleAnswerChange = (questionId: number, value: string, type: 'choice' | 'fill') => {
    setAnswers(prev => prev.map(answer => 
      answer.questionId === questionId 
        ? { ...answer, [type === 'choice' ? 'answerChoice' : 'answerFill']: value }
        : answer
    ));
  };

  const submitExam = async () => {
    if (!examData) return;

    try {
      const submissionData = {
        userId: parseInt(userId),
        examSetId: examData.examSetId,
        answers: answers.filter(answer => 
          answer.answerChoice || answer.answerFill
        ),
        timeSpent: timeSpent,
        submittedAt: new Date().toISOString()
      };

      const response = await fetch('http://localhost:5074/api/ReadingExam/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Failed to submit exam');
      }

      const resultData = await response.json();
      setResult(resultData);
      setIsSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit exam');
    }
  };

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getCurrentAnswer = (questionId: number) => {
    return answers.find(answer => answer.questionId === questionId);
  };

  const isQuestionAnswered = (questionId: number) => {
    const answer = getCurrentAnswer(questionId);
    return answer?.answerChoice || answer?.answerFill;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải bài thi...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  if (!examData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-600">Không tìm thấy bài thi</p>
      </div>
    );
  }

  if (isSubmitted && result) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h1 className="text-2xl font-bold text-center mb-6 text-green-600">
              Kết quả bài thi Reading
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-3xl font-bold text-blue-600">{result.score}</div>
                <div className="text-sm text-gray-600">IELTS Band Score</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-3xl font-bold text-green-600">{result.correctAnswers}</div>
                <div className="text-sm text-gray-600">Câu đúng</div>
              </div>
              <div className="text-center p-4 bg-red-50 rounded-lg">
                <div className="text-3xl font-bold text-red-600">{result.incorrectAnswers}</div>
                <div className="text-sm text-gray-600">Câu sai</div>
              </div>
            </div>

            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-4">Chi tiết từng câu hỏi</h2>
              <div className="space-y-4">
                {result.answerResults.map((answerResult, index) => (
                  <div 
                    key={answerResult.questionId}
                    className={`p-4 rounded-lg border ${
                      answerResult.isCorrect 
                        ? 'bg-green-50 border-green-200' 
                        : 'bg-red-50 border-red-200'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">Câu {index + 1}</span>
                      <span className={`px-2 py-1 rounded text-sm ${
                        answerResult.isCorrect 
                          ? 'bg-green-200 text-green-800' 
                          : 'bg-red-200 text-red-800'
                      }`}>
                        {answerResult.isCorrect ? 'Đúng' : 'Sai'}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-2">{answerResult.questionText}</p>
                    <div className="text-sm">
                      <span className="text-gray-600">Đáp án của bạn: </span>
                      <span className="font-medium">{answerResult.userAnswer || 'Chưa trả lời'}</span>
                    </div>
                    <div className="text-sm">
                      <span className="text-gray-600">Đáp án đúng: </span>
                      <span className="font-medium text-green-600">{answerResult.correctAnswer}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-center">
              <button 
                onClick={() => window.location.href = '/courses'}
                className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Quay về danh sách khóa học
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestionData = examData.questions[currentQuestion];
  const currentAnswer = getCurrentAnswer(currentQuestionData.questionId);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{examData.examSetTitle}</h1>
              <p className="text-sm text-gray-600">Mã bài thi: {examData.examSetCode}</p>
            </div>
            <div className="text-right">
              <div className="text-lg font-bold text-blue-600">{formatTime(timeSpent)}</div>
              <div className="text-sm text-gray-600">Thời gian làm bài</div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Reading Context */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-lg font-semibold mb-4">Bài đọc</h2>
              {examData.readingImage && (
                <img 
                  src={examData.readingImage} 
                  alt="Reading context" 
                  className="w-full mb-4 rounded"
                />
              )}
              <div className="prose max-w-none">
                <div dangerouslySetInnerHTML={{ __html: examData.readingContext || '' }} />
              </div>
            </div>
          </div>

          {/* Questions */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-semibold">
                  Câu {currentQuestion + 1} / {examData.totalQuestions}
                </h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
                    disabled={currentQuestion === 0}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                  >
                    ← Trước
                  </button>
                  <button
                    onClick={() => setCurrentQuestion(Math.min(examData.questions.length - 1, currentQuestion + 1))}
                    disabled={currentQuestion === examData.questions.length - 1}
                    className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50"
                  >
                    Tiếp theo →
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <p className="text-gray-800 mb-4">{currentQuestionData.questionText}</p>
                
                {currentQuestionData.questionType === 'choice' ? (
                  <div className="space-y-2">
                    {currentQuestionData.options.map((option, index) => (
                      <label key={index} className="flex items-center space-x-3 p-3 border rounded hover:bg-gray-50 cursor-pointer">
                        <input
                          type="radio"
                          name={`question-${currentQuestionData.questionId}`}
                          value={String.fromCharCode(65 + index)}
                          checked={currentAnswer?.answerChoice === String.fromCharCode(65 + index)}
                          onChange={(e) => handleAnswerChange(currentQuestionData.questionId, e.target.value, 'choice')}
                          className="h-4 w-4 text-blue-600"
                        />
                        <span>{String.fromCharCode(65 + index)}. {option}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <div>
                    <input
                      type="text"
                      value={currentAnswer?.answerFill || ''}
                      onChange={(e) => handleAnswerChange(currentQuestionData.questionId, e.target.value, 'fill')}
                      placeholder="Nhập câu trả lời..."
                      className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                )}
              </div>

              {/* Question Navigation */}
              <div className="mb-6">
                <h3 className="text-sm font-medium mb-3">Điều hướng câu hỏi</h3>
                <div className="grid grid-cols-5 gap-2">
                  {examData.questions.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentQuestion(index)}
                      className={`p-2 text-sm rounded border ${
                        index === currentQuestion
                          ? 'bg-blue-600 text-white border-blue-600'
                          : isQuestionAnswered(examData.questions[index].questionId)
                          ? 'bg-green-100 text-green-800 border-green-300'
                          : 'bg-gray-100 text-gray-700 border-gray-300 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={submitExam}
                className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Nộp bài thi
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReadingExam;
