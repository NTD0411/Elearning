'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

interface ListeningQuestion {
  questionId: number;
  questionText: string;
  questionOrder: number;
  audioUrl: string;
  listeningImage?: string;
  options: string[];
  correctAnswer: string;
  points: number;
}

interface ExamSet {
  id: number;
  code: string;
  name: string;
  targetQuestions: number;
  listeningImage?: string;
  timeLimit?: number; // Thời gian làm bài (phút)
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

export default function ListeningExam() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session } = useSession();
  const examSetId = searchParams.get('examSetId');
  const courseId = searchParams.get('courseId');
  
  const [examSet, setExamSet] = useState<ExamSet | null>(null);
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [timeLeft, setTimeLeft] = useState(2400); // 40 phút = 2400 giây
  const [hasStarted, setHasStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState<Result[]>([]);
  const [score, setScore] = useState(0);
  const [totalScore, setTotalScore] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentAudioUrlRef = useRef<string>('');

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
            // Get all exam set IDs from the course
            examSetIds = courseSetsData.map((set: any) => set.examSetId.toString());
            console.log(`Found ${examSetIds.length} exam sets for course ${courseId}:`, examSetIds);
          }
        }
      } else if (examSetId) {
        // If only examSetId provided, use it
        examSetIds = [examSetId];
      }
      
      if (examSetIds.length === 0) {
        console.error('No exam set IDs available');
        setIsLoading(false);
        return;
      }
      
      // Fetch exam set details from the first set for general info
      const firstExamSetId = examSetIds[0];
      const examSetResponse = await fetch(`http://localhost:5074/api/ExamSet/Listening/${firstExamSetId}`);
      if (examSetResponse.ok) {
        const examSetData = await examSetResponse.json();
        setExamSet(examSetData);
        
        // Set time limit if available, otherwise default to 40 minutes
        const timeInSeconds = examSetData.timeLimit ? examSetData.timeLimit * 60 : 2400;
        setTimeLeft(timeInSeconds);
      }

      // Fetch questions from ALL exam sets and merge them
      const allQuestions: ListeningQuestion[] = [];
      for (const setId of examSetIds) {
        const questionsResponse = await fetch(`http://localhost:5074/api/ListeningExam/examset/${setId}`);
        if (questionsResponse.ok) {
          const questionsData = await questionsResponse.json();
          console.log(`Fetched ${questionsData.length} questions from exam set ${setId}`);
          allQuestions.push(...questionsData);
        }
      }
      
      console.log(`Total questions loaded: ${allQuestions.length}`);
      setQuestions(allQuestions);
      
      // Initialize answers array
      const initialAnswers = allQuestions.map((q: ListeningQuestion) => ({
        questionId: q.questionId,
        selectedAnswer: ''
      }));
      setAnswers(initialAnswers);
      
      // Calculate total score
      const total = allQuestions.reduce((sum: number, q: ListeningQuestion) => sum + q.points, 0);
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

    // Check if all questions are answered
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
        examCourseId: courseId ? parseInt(courseId) : null, // Include courseId if available
        examType: 'Listening',
        examId: examSetId ? parseInt(examSetId) : (examSet?.id || 0), // Use examSetId or first exam set ID
        answers: JSON.stringify(answers),
        timeSpent: 2400 - timeLeft, // Thời gian đã làm bài
        submittedAt: new Date().toISOString()
      };

      console.log('Submitting listening exam:', submissionData);

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

  // Reset audio only when audioUrl changes (different audio file)
  useEffect(() => {
    const newAudioUrl = currentQuestion?.audioUrl || '';
    
    // If audio URL changed (different audio file), load new audio
    if (audioRef.current && newAudioUrl && newAudioUrl !== currentAudioUrlRef.current) {
      audioRef.current.load(); // Load new audio
      currentAudioUrlRef.current = newAudioUrl;
    }
  }, [currentQuestion?.audioUrl]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải đề thi...</p>
        </div>
      </div>
    );
  }

  if (!hasStarted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50 p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-2xl w-full">
          <div className="text-center">
            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">🎧</span>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {examSet?.name || 'Listening Test'}
            </h1>
            <p className="text-gray-600 mb-8">
              Mã đề: {examSet?.code}
            </p>
            
            <div className="bg-purple-50 rounded-xl p-6 mb-8 text-left">
              <h2 className="font-semibold text-lg mb-4 text-purple-900">📋 Hướng dẫn làm bài:</h2>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Tổng số câu hỏi: <strong>{questions.length} câu</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Thời gian làm bài: <strong>40 phút</strong></span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Nghe audio và chọn đáp án đúng nhất</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Có thể nghe lại audio nhiều lần trong thời gian cho phép</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Bạn có thể chuyển qua lại giữa các câu hỏi</span>
                </li>
                <li className="flex items-start">
                  <span className="text-purple-600 mr-2">•</span>
                  <span>Nhấn "Nộp bài" khi hoàn thành</span>
                </li>
              </ul>
            </div>

            <button
              onClick={handleStart}
              className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              Bắt đầu làm bài
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResults) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8 mb-6">
            <div className="text-center mb-8">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-5xl">
                  {score >= totalScore * 0.8 ? '🎉' : score >= totalScore * 0.5 ? '👍' : '📝'}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                Kết quả bài thi
              </h1>
              <p className="text-gray-600 mb-6">
                {examSet?.name}
              </p>
              
              <div className="bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl p-6 max-w-md mx-auto">
                <div className="text-5xl font-bold mb-2">
                  {score} / {totalScore}
                </div>
                <div className="text-xl">
                  {((score / totalScore) * 100).toFixed(1)}%
                </div>
                <div className="mt-4 text-sm opacity-90">
                  Số câu đúng: {results.filter(r => r.isCorrect).length} / {questions.length}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Chi tiết câu trả lời:
              </h2>
              
              {results.map((result, index) => (
                <div
                  key={result.questionId}
                  className={`p-6 rounded-xl border-2 ${
                    result.isCorrect
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                      result.isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                    }`}>
                      {index + 1}
                    </div>
                    
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 mb-3">
                        {result.questionText}
                      </p>
                      
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Câu trả lời của bạn:</span>
                          <span className={`font-medium ${
                            result.isCorrect ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {result.userAnswer || '(Không trả lời)'}
                          </span>
                          {result.isCorrect ? (
                            <span className="text-green-600">✓</span>
                          ) : (
                            <span className="text-red-600">✗</span>
                          )}
                        </div>
                        
                        {!result.isCorrect && (
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-gray-700">Đáp án đúng:</span>
                            <span className="font-medium text-green-700">
                              {result.correctAnswer}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex gap-4 justify-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
              >
                Về trang chủ
              </button>
              <button
                onClick={() => router.push('/history')}
                className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200"
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
    <div className="min-h-screen bg-gray-50">
      {/* Header with Timer */}
      <div className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                {examSet?.name}
              </h1>
              <p className="text-sm text-gray-600">
                Câu {currentQuestionIndex + 1} / {questions.length}
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <div className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                timeLeft < 300 ? 'bg-red-100 text-red-700' : 'bg-purple-100 text-purple-700'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-bold text-lg">
                  {formatTime(timeLeft)}
                </span>
              </div>
              
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all duration-200 disabled:opacity-50"
              >
                {isSubmitting ? 'Đang nộp...' : 'Nộp bài'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Audio Player and Image */}
          <div className="lg:col-span-2 space-y-6">
            {/* Audio Player */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-2xl">🎧</span>
                Listening Audio
              </h2>
              {currentQuestion?.audioUrl ? (
                <div className="bg-purple-50 rounded-lg p-4">
                  <audio
                    ref={audioRef}
                    controls
                    controlsList="nodownload"
                    crossOrigin="anonymous"
                    className="w-full"
                    src={currentQuestion.audioUrl}
                    onError={(e) => {
                      console.error('Audio error:', e);
                      console.log('Audio URL:', currentQuestion.audioUrl);
                      console.log('Current question:', currentQuestion);
                    }}
                    onLoadedData={() => console.log('Audio loaded successfully:', currentQuestion.audioUrl)}
                  >
                    Trình duyệt của bạn không hỗ trợ audio player.
                  </audio>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    Bạn có thể nghe lại audio nhiều lần
                  </p>
                  {/* Debug info - có thể xóa sau */}
                  <p className="text-xs text-gray-500 mt-2 break-all">
                    🔊 {currentQuestion.audioUrl}
                  </p>
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-lg p-4 text-center">
                  <p className="text-yellow-800">⚠️ Không có audio cho câu hỏi này</p>
                  <p className="text-sm text-yellow-600 mt-2">Vui lòng liên hệ giáo viên</p>
                </div>
              )}
            </div>

            {/* Image if available */}
            {currentQuestion?.listeningImage && (
              <div className="bg-white rounded-xl shadow-md p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Hình minh họa
                </h3>
                <img
                  src={currentQuestion.listeningImage}
                  alt="Listening context"
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {/* Question Navigation */}
            <div className="bg-white rounded-xl shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Danh sách câu hỏi
              </h3>
              <div className="grid grid-cols-10 gap-2">
                {questions.map((q, index) => {
                  const hasAnswer = answers[index]?.selectedAnswer !== '';
                  return (
                    <button
                      key={q.questionId}
                      onClick={() => handleQuestionNavigation(index)}
                      className={`w-10 h-10 rounded-lg font-semibold transition-all duration-200 ${
                        index === currentQuestionIndex
                          ? 'bg-purple-600 text-white ring-2 ring-purple-300'
                          : hasAnswer
                          ? 'bg-green-100 text-green-700 hover:bg-green-200'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {index + 1}
                    </button>
                  );
                })}
              </div>
              <div className="mt-4 flex gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-600 rounded"></div>
                  <span className="text-gray-600">Câu hiện tại</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-700 rounded"></div>
                  <span className="text-gray-600">Đã trả lời</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 border-2 border-gray-400 rounded"></div>
                  <span className="text-gray-600">Chưa trả lời</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Question and Options */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md p-6 sticky top-24">
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900">
                    Câu {currentQuestionIndex + 1}
                  </h3>
                  <span className="text-sm text-gray-600">
                    ({currentQuestion?.points || 1} điểm)
                  </span>
                </div>
                
                <p className="text-gray-800 leading-relaxed mb-6">
                  {currentQuestion?.questionText}
                </p>

                {/* Answer Options */}
                {currentQuestion?.options && currentQuestion?.options.length > 0 ? (
                  // Multiple Choice Options
                  <div className="space-y-3">
                    {currentQuestion?.options.map((option, index) => {
                      const optionLabel = String.fromCharCode(65 + index); // A, B, C, D...
                      const isSelected = answers[currentQuestionIndex]?.selectedAnswer === optionLabel;
                      
                      return (
                        <label
                          key={index}
                          className={`flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            isSelected
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300 hover:bg-gray-50'
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.questionId}`}
                            value={optionLabel}
                            checked={isSelected}
                            onChange={(e) => handleAnswerChange(currentQuestion.questionId, e.target.value)}
                            className="mt-1 w-4 h-4 text-purple-600 focus:ring-purple-500"
                          />
                          <div className="flex-1">
                            <span className="font-semibold text-purple-700 mr-2">
                              {optionLabel}.
                            </span>
                            <span className="text-gray-800">
                              {option}
                            </span>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                ) : (
                  // Fill-in-blank Text Input
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={answers[currentQuestionIndex]?.selectedAnswer || ''}
                      onChange={(e) => handleAnswerChange(currentQuestion.questionId, e.target.value)}
                      placeholder="Nhập câu trả lời của bạn..."
                      className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-all duration-200"
                    />
                  </div>
                )}
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={handlePrevious}
                  disabled={currentQuestionIndex === 0}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  ← Trước
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === questions.length - 1}
                  className="flex-1 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Tiếp →
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
