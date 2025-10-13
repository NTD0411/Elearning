'use client';

import React, { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

// Types
interface Question {
  questionId: number;
  questionNumber: number;
  questionText: string;
  questionType: 'multiple_choice' | 'fill';
  options?: Array<{ value: string; text: string }>;
  points: number;
}

interface ExamData {
  examSetId: number;
  examTitle: string;
  examCode: string;
  readingContext: string;
  readingImage?: string;
  totalQuestions: number;
  timeLimit: number;
  questions: Question[];
}

interface Answer {
  questionId: number;
  selectedAnswer?: string;
  fillAnswer?: string;
}

interface SubmissionResult {
  submissionId: number;
  userId: number;
  examSetId: number;
  examCourseId: number;
  examType: string;
  answers: Answer[];
  timeSpent: number;
  submittedAt: string;
  score?: number;
  correctAnswers: number;
  totalQuestions: number;
  questionResults: Array<{
    questionId: number;
    userAnswer?: string;
    correctAnswer?: string;
    isCorrect: boolean;
    points: number;
  }>;
  status: string;
}

const IELTSReading: React.FC = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const courseId = searchParams.get('courseId');
  const examCourseId = courseId || '1';
  const userId = searchParams.get('userId') || '1';

  // State
  const [examData, setExamData] = useState<ExamData | null>(null);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [current, setCurrent] = useState<number>(0);
  const [time, setTime] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<SubmissionResult | null>(null);
  const [error, setError] = useState<string>('');

  // Load exam data
  useEffect(() => {
    if (!courseId) {
      setError('Course ID is required');
      setLoading(false);
      return;
    }

    const loadExam = async () => {
      try {
        // First get the course details to find exam sets
        const courseResponse = await fetch(`http://localhost:5074/api/ExamCourse/${courseId}`);
        if (!courseResponse.ok) {
          throw new Error('Failed to load course');
        }
        const courseData = await courseResponse.json();
        
        // Get the first reading exam set from the course
        const readingExamSets = courseData.readingExamSets || [];
        if (readingExamSets.length === 0) {
          throw new Error('No reading exams available for this course');
        }
        
        const examSetId = readingExamSets[0].examSetId;
        const response = await fetch(`http://localhost:5000/api/ReadingExam/examset/${examSetId}/take-exam`);
        if (!response.ok) {
          throw new Error('Failed to load exam');
        }
        const data = await response.json();
        setExamData(data);
        setTime(data.timeLimit * 60); // Convert minutes to seconds
        setAnswers(data.questions.map((q: Question) => ({
          questionId: q.questionId,
          selectedAnswer: undefined,
          fillAnswer: undefined
        })));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load exam');
      } finally {
        setLoading(false);
      }
    };

    loadExam();
  }, [courseId]);

  // Timer
  useEffect(() => {
    if (time <= 0 || result) return;

    const timer = setInterval(() => {
      setTime((t) => {
        if (t <= 1) {
          handleSubmit();
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [time, result]);

  // Handlers
  const handleSelect = (questionId: number, value: string, type: 'multiple_choice' | 'fill') => {
    setAnswers(prev => prev.map(answer => 
      answer.questionId === questionId 
        ? { 
            ...answer, 
            [type === 'multiple_choice' ? 'selectedAnswer' : 'fillAnswer']: value,
            [type === 'multiple_choice' ? 'fillAnswer' : 'selectedAnswer']: undefined
          }
        : answer
    ));
  };

  const jump = (idx: number) => {
    if (examData) {
      const clamped = Math.min(Math.max(idx, 0), examData.questions.length - 1);
      setCurrent(clamped);
    }
  };

  const handleSubmit = async () => {
    if (!examData || submitting) return;

    setSubmitting(true);
    try {
      const submissionData = {
        userId: parseInt(userId),
        examSetId: examData.examSetId,
        examCourseId: parseInt(examCourseId),
        answers: answers,
        timeSpent: (examData.timeLimit * 60) - time,
        submittedAt: new Date().toISOString()
      };

      const response = await fetch('http://localhost:5000/api/ReadingExam/submit', {
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
      setResult(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit exam');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (sec: number): string => {
    const mm = Math.floor(sec / 60).toString().padStart(2, "0");
    const ss = (sec % 60).toString().padStart(2, "0");
    return `${mm}:${ss}`;
  };

  const getCurrentAnswer = (questionId: number) => {
    return answers.find(a => a.questionId === questionId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Loading exam...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">Error</div>
          <p className="text-slate-600">{error}</p>
          <button 
            onClick={() => router.back()} 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (result) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-purple-700 mb-6">Exam Results</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-purple-700">{result.score?.toFixed(1)}%</div>
              <div className="text-sm text-purple-600">Overall Score</div>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-green-700">{result.correctAnswers}</div>
              <div className="text-sm text-green-600">Correct Answers</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-3xl font-bold text-blue-700">{result.totalQuestions}</div>
              <div className="text-sm text-blue-600">Total Questions</div>
            </div>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-semibold mb-4">Question Details</h2>
            {result.questionResults.map((qr, index) => (
              <div key={qr.questionId} className={`p-4 rounded-lg border ${qr.isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="font-medium">Question {index + 1}</div>
                    <div className="text-sm text-slate-600 mt-1">
                      Your answer: <span className="font-medium">{qr.userAnswer || 'Not answered'}</span>
                    </div>
                    <div className="text-sm text-slate-600">
                      Correct answer: <span className="font-medium">{qr.correctAnswer}</span>
                    </div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${qr.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {qr.isCorrect ? 'Correct' : 'Incorrect'}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-8 flex gap-4">
            <button 
              onClick={() => router.push('/exam')} 
              className="px-6 py-2 bg-purple-600 text-white rounded hover:bg-purple-700"
            >
              Back to Exams
            </button>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2 bg-slate-200 text-slate-800 rounded hover:bg-slate-300"
            >
              Retake Exam
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!examData) return null;

  const q = examData.questions[current];
  const currentAnswer = getCurrentAnswer(q.questionId);
  const answered = answers.filter(a => a.selectedAnswer || a.fillAnswer).length;
  const pct = Math.round((time / (examData.timeLimit * 60)) * 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 grid grid-cols-1 lg:grid-cols-12 gap-0">
      {/* Left Controls */}
      <aside className="lg:col-span-3 border-b lg:border-b-0 lg:border-r border-slate-200 bg-white/90 p-4 lg:p-5 flex flex-col gap-4">
        {/* Progress */}
        <div>
          <div className="h-2 w-full bg-purple-100 rounded-full overflow-hidden">
            <div className="h-full bg-purple-500" style={{ width: `${pct}%` }} />
          </div>
          <div className="mt-2 text-sm text-slate-600">Time remaining</div>
          <div className="text-2xl font-bold text-purple-700">{formatTime(time)}</div>
        </div>

        {/* Navigator */}
        <div>
          <div className="grid grid-cols-5 gap-2">
            {examData.questions.map((_, i) => {
              const isAnswered = answers[i]?.selectedAnswer || answers[i]?.fillAnswer;
              const isActive = i === current;
              return (
                <button
                  key={i}
                  onClick={() => jump(i)}
                  className={[
                    "py-2 rounded-md text-sm font-medium border transition",
                    isActive
                      ? "bg-purple-700 text-white border-purple-700"
                      : isAnswered
                      ? "bg-purple-100 text-purple-800 border-purple-300"
                      : "bg-slate-200 text-slate-700 border-slate-300 hover:bg-purple-50 hover:border-purple-300",
                  ].join(" ")}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex gap-2">
          <button onClick={() => jump(current - 1)} className="flex-1 py-2 rounded-md bg-green-600 text-white hover:bg-green-700">← Previous</button>
          <button onClick={() => jump(current + 1)} className="flex-1 py-2 rounded-md bg-emerald-600 text-white hover:bg-emerald-700">Next →</button>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={submitting}
          className="w-full py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {submitting ? 'Submitting...' : 'Submit Exam'}
        </button>

        <div className="text-sm text-slate-600">
          <div>Answered: {answered}/{examData.totalQuestions}</div>
        </div>
      </aside>

      {/* Middle: Reading Passage */}
      <main className="lg:col-span-5 p-5 overflow-y-auto max-h-screen bg-white">
        <h2 className="text-lg font-semibold text-purple-700 mb-3">Reading Passage</h2>
        {examData.readingImage && (
          <img src={examData.readingImage} alt="Reading passage" className="w-full mb-4 rounded" />
        )}
        <article className="prose max-w-none prose-p:my-3 prose-headings:mt-6 prose-headings:mb-2">
          <p className="whitespace-pre-line leading-relaxed text-sm text-slate-700">{examData.readingContext}</p>
        </article>
      </main>

      {/* Right: Current Question */}
      <section className="lg:col-span-4 p-5">
        <h3 className="text-lg font-semibold text-slate-900 mb-1">
          QUESTION {current + 1} <span className="text-xs text-slate-500">({q.questionType.toUpperCase()})</span>
        </h3>
        <p className="text-sm text-slate-700 mb-5">{q.questionText}</p>

        <div className="space-y-2">
          {q.questionType === 'multiple_choice' && q.options ? (
            q.options.map((opt, j) => (
            <label
              key={j}
              className={`flex items-center gap-3 p-2 rounded-md border text-sm transition ${
                  currentAnswer?.selectedAnswer === opt.value
                  ? "border-purple-600 bg-purple-50"
                  : "border-slate-300 hover:border-purple-300 hover:bg-purple-50/50"
              }`}
            >
              <input
                type="radio"
                  name={`q-${q.questionId}`}
                  checked={currentAnswer?.selectedAnswer === opt.value}
                  onChange={() => handleSelect(q.questionId, opt.value, 'multiple_choice')}
                className="h-4 w-4 text-purple-600 focus:ring-purple-500"
                />
                <span>{opt.text}</span>
              </label>
            ))
          ) : (
            <div>
              <input
                type="text"
                value={currentAnswer?.fillAnswer || ''}
                onChange={(e) => handleSelect(q.questionId, e.target.value, 'fill')}
                placeholder="Enter your answer..."
                className="w-full p-3 border border-slate-300 rounded-md focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          )}
        </div>

        <hr className="my-6" />
        <div className="flex gap-2">
          <button onClick={() => jump(current - 1)} className="flex-1 py-2 rounded-md border border-slate-300 hover:bg-slate-50">← Previous</button>
          <button onClick={() => jump(current + 1)} className="flex-1 py-2 rounded-md bg-purple-600 text-white hover:bg-purple-700">Next →</button>
        </div>
      </section>
    </div>
  );
};

export default IELTSReading;