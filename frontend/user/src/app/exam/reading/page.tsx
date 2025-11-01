'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ReadingQuestion {
  questionId: number;
  questionText: string;
  questionOrder: number;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface ExamSet {
  id: number;
  code: string;
  name: string;
  targetQuestions: number;
  readingContext?: string;
  readingImage?: string;
  timeLimit?: number;
}

interface Answer {
  questionId: number;
  selectedAnswer: string;
}

interface Result {
  questionId: number;
  questionText: string;
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
}

export default function ReadingExam() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const examSetId = searchParams.get('examSetId');
  const courseId = searchParams.get('courseId');
  
  const [examSet, setExamSet] = useState<ExamSet | null>(null);
  const [questions, setQuestions] = useState<ReadingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(1800); // 30 phút = 1800 giây
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (examSetId || courseId) {
      fetchExamData();
    }
  }, [examSetId, courseId]);

  useEffect(() => {
    if (hasStarted && timeLeft > 0 && !showResults) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [hasStarted, timeLeft, showResults]);

  const fetchExamData = async () => {
    try {
      setIsLoading(true);
      
      let examSetIds: string[] = [];
      
      // If we have courseId, get all exam sets for this course
      if (courseId) {
        const courseSetsResponse = await fetch(`http://localhost:5074/api/ExamCourse/${courseId}/examsets`);
        if (courseSetsResponse.ok) {
          const courseSetsData = await courseSetsResponse.json();
          if (courseSetsData && courseSetsData.length > 0) {
            examSetIds = courseSetsData.map((set: any) => set.examSetId.toString());
            console.log(`Found ${examSetIds.length} exam sets for course ${courseId}:`, examSetIds);
          }
        }
      } else if (examSetId) {
        examSetIds = [examSetId];
      }
      
      if (examSetIds.length === 0) {
        console.error('No exam set IDs available');
        setIsLoading(false);
        return;
      }
      
      // Fetch exam set details from the first set
      const firstExamSetId = examSetIds[0];
      const examSetResponse = await fetch(`http://localhost:5074/api/ExamSet/Reading/${firstExamSetId}`);
      if (examSetResponse.ok) {
        const examSetData = await examSetResponse.json();
        setExamSet(examSetData);
        
        // Set time limit if available, otherwise default to 30 minutes
        const timeInSeconds = examSetData.timeLimit ? examSetData.timeLimit * 60 : 1800;
        setTimeLeft(timeInSeconds);
      }

      // Fetch questions from ALL exam sets and merge them
      const allQuestions: ReadingQuestion[] = [];
      for (const setId of examSetIds) {
        const questionsResponse = await fetch(`http://localhost:5074/api/ReadingExam/examset/${setId}`);
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          console.log(`Fetched ${questionsData.length} questions from exam set ${setId}`);
          
          // Transform questions to include options array
          const transformedQuestions = questionsData.map((q: any) => ({
            questionId: q.readingExamId,
            questionText: q.questionText,
            questionOrder: q.readingExamId,
            options: [q.optionA, q.optionB, q.optionC, q.optionD].filter(opt => opt),
            correctAnswer: q.correctAnswer,
            points: 1
          }));
          
          allQuestions.push(...transformedQuestions);
        }
      }
      
      console.log(`Total questions loaded: ${allQuestions.length}`);
      setQuestions(allQuestions);
      
      // Initialize answers array
      const initialAnswers = allQuestions.map((q: ReadingQuestion) => ({
        questionId: q.questionId,
        selectedAnswer: ''
      }));
      setAnswers(initialAnswers);
      
      // Calculate total score
      const total = allQuestions.reduce((sum: number, q: ReadingQuestion) => sum + q.points, 0);
      setTotalScore(total);
    } catch (error) {
      console.error('Error fetching exam data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTimeUp = () => {
    if (!showResults) {
      alert('Hết giờ! Bài thi sẽ được nộp tự động.');
      handleSubmit();
    }
  };

  const handleStart = () => {
    setHasStarted(true);
  };

  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers(prev => 
      prev.map(a => 
        a.questionId === questionId ? { ...a, selectedAnswer: answer } : a
      )
    );
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handleQuestionNavigation = (index: number) => {
    setCurrentQuestionIndex(index);
  };

  const handleSubmit = async () => {
    if (!session?.user?.id) {
      alert('Vui lòng đăng nhập để nộp bài!');
      return;
    }

    const unansweredCount = answers.filter(a => !a.selectedAnswer).length;
    if (unansweredCount > 0) {
      const confirmed = confirm(`Bạn còn ${unansweredCount} câu chưa trả lời. Bạn có chắc muốn nộp bài?`);
      if (!confirmed) return;
    }

    setIsSubmitting(true);

    try {
      // Calculate score and prepare results
      let calculatedScore = 0;
      const calculatedResults: Result[] = questions.map(q => {
        const userAnswer = answers.find(a => a.questionId === q.questionId)?.selectedAnswer || '';
        const isCorrect = userAnswer.toLowerCase() === q.correctAnswer.toLowerCase();
        
        if (isCorrect) {
          calculatedScore += q.points;
        }

        return {
          questionId: q.questionId,
          questionText: q.questionText,
          userAnswer,
          correctAnswer: q.correctAnswer,
          isCorrect
        };
      });

      setScore(calculatedScore);
      setResults(calculatedResults);
      setShowResults(true);

      // Submit to backend
      const submissionData = {
        userId: parseInt(session.user.id),
        examCourseId: courseId ? parseInt(courseId) : null,
        examType: 'Reading',
        examId: examSetId ? parseInt(examSetId) : (examSet?.id || 0),
        answers: JSON.stringify(answers),
        timeSpent: 1800 - timeLeft,
        submittedAt: new Date().toISOString()
      };

      console.log('Submitting reading exam:', submissionData);

      const response = await fetch('http://localhost:5074/api/Submission', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        console.error('Failed to submit exam');
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert('Có lỗi xảy ra khi nộp bài. Vui lòng thử lại!');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center mb-8">
            <div className="inline-block p-4 bg-blue-100 rounded-full mb-4">
              <svg className="w-12 h-12 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {examSet?.name || 'IELTS Reading Test'}
            </h1>
            <p className="text-gray-600">
              {examSet?.code}
            </p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Thời gian làm bài</p>
                <p className="text-sm text-gray-600">{Math.floor(timeLeft / 60)} phút</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Số câu hỏi</p>
                <p className="text-sm text-gray-600">{questions.length} câu</p>
              </div>
            </div>

            <div className="flex items-center p-4 bg-gray-50 rounded-lg">
              <svg className="w-6 h-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="font-medium text-gray-900">Tổng điểm</p>
                <p className="text-sm text-gray-600">{totalScore} điểm</p>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex">
              <svg className="w-5 h-5 text-yellow-600 mr-2 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="text-sm text-yellow-800">
                <p className="font-medium mb-1">Lưu ý:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Đọc kỹ đề bài và đoạn văn trước khi trả lời</li>
                  <li>Thời gian sẽ bắt đầu đếm ngược khi bạn nhấn "Bắt đầu"</li>
                  <li>Bài thi sẽ tự động nộp khi hết giờ</li>
                </ul>
              </div>
            </div>
          </div>

          <button
            onClick={handleStart}
            className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Bắt đầu làm bài
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className={`inline-block p-4 rounded-full mb-4 ${
                score >= totalScore * 0.7 ? 'bg-green-100' : score >= totalScore * 0.5 ? 'bg-yellow-100' : 'bg-red-100'
              }`}>
                <svg className={`w-16 h-16 ${
                  score >= totalScore * 0.7 ? 'text-green-600' : score >= totalScore * 0.5 ? 'text-yellow-600' : 'text-red-600'
                }`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {score >= totalScore * 0.7 ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  )}
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Kết quả bài thi</h2>
              <p className="text-5xl font-bold text-blue-600 mb-2">{score}/{totalScore}</p>
              <p className="text-gray-600">
                Bạn đã trả lời đúng {results.filter(r => r.isCorrect).length}/{questions.length} câu
              </p>
            </div>

            <div className="space-y-4 mb-6">
              {results.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`p-4 rounded-lg border-2 ${
                    result.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-medium text-gray-900">Câu {index + 1}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {result.isCorrect ? '✓ Đúng' : '✗ Sai'}
                    </span>
                  </div>
                  <p className="text-gray-700 mb-3">{result.questionText}</p>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-700 w-32">Câu trả lời:</span>
                      <span className={result.isCorrect ? 'text-green-700' : 'text-red-700'}>
                        {result.userAnswer || '(Chưa trả lời)'}
                      </span>
                    </div>
                    {!result.isCorrect && (
                      <div className="flex items-center">
                        <span className="font-medium text-gray-700 w-32">Đáp án đúng:</span>
                        <span className="text-green-700 font-medium">{result.correctAnswer}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => router.push('/courses')}
                className="flex-1 bg-gray-100 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-200 transition-colors"
              >
                Về trang chủ
              </button>
              <button
                onClick={() => router.push('/history')}
                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Xem lịch sử
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">{examSet?.name}</h1>
            <p className="text-sm text-gray-600">Câu {currentQuestionIndex + 1} / {questions.length}</p>
          </div>
          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
              timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
            }`}>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="font-bold text-lg">{formatTime(timeLeft)}</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors disabled:bg-gray-400"
            >
              {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reading Passage */}
          <div className="lg:col-span-2 bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <svg className="w-6 h-6 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
              Reading Passage
            </h2>

            {/* Reading Image */}
            {examSet?.readingImage && (
              <div className="mb-6">
                <img
                  src={examSet.readingImage.startsWith('http') 
                    ? examSet.readingImage 
                    : `http://localhost:5074/${examSet.readingImage.replace(/^\/+/, '')}`}
                  alt="Reading passage illustration"
                  className="w-full rounded-lg shadow-md"
                />
              </div>
            )}

            {/* Reading Context */}
            {examSet?.readingContext && (
              <div className="prose max-w-none">
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {examSet.readingContext}
                </div>
              </div>
            )}

            {!examSet?.readingContext && !examSet?.readingImage && (
              <p className="text-gray-500 italic">Đoạn văn sẽ được hiển thị ở đây</p>
            )}
          </div>

          {/* Questions Panel */}
          <div className="space-y-6">
            {/* Current Question */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="mb-4">
                <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium mb-3">
                  Câu {currentQuestionIndex + 1} (1 điểm)
                </span>
                <h3 className="text-lg font-medium text-gray-900 mb-4">
                  {currentQuestion?.questionText || 'Câu hỏi'}
                </h3>
              </div>

              {/* Answer Options */}
              <div className="space-y-3 mb-6">
                {currentQuestion?.options && currentQuestion.options.length > 0 ? (
                  // Multiple choice questions
                  currentQuestion.options.map((option, index) => {
                    const letter = String.fromCharCode(65 + index); // A, B, C, D
                    const isSelected = answers.find(a => a.questionId === currentQuestion.questionId)?.selectedAnswer === letter;
                    
                    return (
                      <button
                        key={index}
                        onClick={() => handleAnswerChange(currentQuestion.questionId, letter)}
                        className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                        }`}
                      >
                        <div className="flex items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mr-3 ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'bg-gray-100 text-gray-600'
                          }`}>
                            {letter}
                          </div>
                          <span className="text-gray-700">{option}</span>
                        </div>
                      </button>
                    );
                  })
                ) : (
                  // Fill in the blank questions
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Answer:
                    </label>
                    <input
                      type="text"
                      value={answers.find(a => a.questionId === currentQuestion?.questionId)?.selectedAnswer || ''}
                      onChange={(e) => currentQuestion && handleAnswerChange(currentQuestion.questionId, e.target.value)}
                      placeholder="Type your answer here..."
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                    />
                    <p className="text-xs text-gray-500 mt-2">
                      💡 Tip: Type your answer carefully. Spelling matters!
                    </p>
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  ← Trước
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Tiếp →
                </button>
              </div>
            </div>

            {/* Question Navigation Grid */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="font-bold text-gray-900 mb-4">Danh sách câu hỏi</h3>
              <div className="grid grid-cols-5 gap-2">
                {questions.map((_, index) => {
                  const isAnswered = answers[index]?.selectedAnswer !== '';
                  const isCurrent = index === currentQuestionIndex;
                  
                  return (
                    <button
                      key={index}
                      onClick={() => handleQuestionNavigation(index)}
                      className={`aspect-square rounded-lg font-medium transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white ring-2 ring-blue-300'
                          : isAnswered
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              
              {/* Legend */}
              <div className="mt-4 space-y-2 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-600 rounded"></div>
                  <span className="text-gray-600">Câu hiện tại</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 rounded"></div>
                  <span className="text-gray-600">Đã trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded"></div>
                  <span className="text-gray-600">Chưa trả lời</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
