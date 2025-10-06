import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

interface ExamSet {
  id: number;
  code: string;
  name: string;
  description: string;
  targetQuestions: number;
  questionCount: number;
  createdAt: string;
}

interface Question {
  id: number;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  answerFill?: string;
  correctAnswer: string;
  audioUrl?: string; // For listening
  content?: string; // For reading
  examSetId?: number;
}

export default function ExamSetDetail() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const [examSet, setExamSet] = useState<ExamSet | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (type && id) {
      fetchExamSetDetail();
      fetchQuestions();
    }
  }, [type, id]);

  const fetchExamSetDetail = async () => {
    try {
      const capitalizedType = type!.charAt(0).toUpperCase() + type!.slice(1);
      const response = await fetch(`http://localhost:5074/api/ExamSet/${capitalizedType}/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Exam set detail:', data); // Debug log
        setExamSet(data);
      } else {
        console.error('Failed to fetch exam set detail:', response.status);
      }
    } catch (error) {
      console.error('Error fetching exam set detail:', error);
    }
  };

  const fetchQuestions = async () => {
    try {
      setLoading(true);
      let endpoint = '';
      
      switch (type) {
        case 'reading':
          endpoint = 'ReadingExam';
          break;
        case 'listening':
          endpoint = 'ListeningExam';
          break;
        case 'speaking':
          endpoint = 'SpeakingExam';
          break;
        case 'writing':
          endpoint = 'WritingExam';
          break;
        default:
          throw new Error('Invalid exam type');
      }

      const response = await fetch(`http://localhost:5074/api/${endpoint}`);
      if (response.ok) {
        const data = await response.json();
        // Filter questions by exam set ID
        const filteredQuestions = data.filter((q: Question) => q.examSetId === parseInt(id!));
        // Sort by ID
        filteredQuestions.sort((a: Question, b: Question) => a.id - b.id);
        setQuestions(filteredQuestions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const getQuestionTypeColor = (question: Question) => {
    if (question.answerFill) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    if (question.optionA === 'True' && question.optionB === 'False') 
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  };

  const getQuestionTypeLabel = (question: Question) => {
    if (question.answerFill) return 'Fill in the Blank';
    if (question.optionA === 'True' && question.optionB === 'False') return 'True/False';
    return 'Multiple Choice';
  };

  const renderQuestion = (question: Question, index: number) => {
    return (
      <div key={question.id} className="bg-white dark:bg-boxdark border border-stroke dark:border-strokedark rounded-lg p-6 mb-6">
        {/* Question Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <span className="flex items-center justify-center w-8 h-8 bg-primary text-white rounded-full text-sm font-medium">
              {index + 1}
            </span>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getQuestionTypeColor(question)}`}>
              {getQuestionTypeLabel(question)}
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">ID: {question.id}</span>
        </div>

        {/* Audio for Listening */}
        {type === 'listening' && question.audioUrl && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Audio:
            </label>
            <audio controls className="w-full">
              <source src={question.audioUrl} />
              Your browser does not support the audio element.
            </audio>
          </div>
        )}

        {/* Content for Reading */}
        {type === 'reading' && question.content && (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reading Passage:
            </label>
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                {question.content}
              </p>
            </div>
          </div>
        )}

        {/* Question Text */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question:
          </label>
          <p className="text-gray-900 dark:text-white font-medium">
            {question.questionText}
          </p>
        </div>

        {/* Answer Options */}
        {question.answerFill ? (
          // Fill in the blank
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Correct Answer:
            </label>
            <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg p-3">
              <span className="text-green-800 dark:text-green-200 font-medium">
                {question.answerFill}
              </span>
            </div>
          </div>
        ) : (
          // Multiple choice or True/False
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Options:
            </label>
            <div className="space-y-2">
              {[
                { key: 'A', value: question.optionA },
                { key: 'B', value: question.optionB },
                { key: 'C', value: question.optionC },
                { key: 'D', value: question.optionD }
              ].filter(option => option.value).map(option => (
                <div
                  key={option.key}
                  className={`flex items-center p-3 rounded-lg border ${
                    question.correctAnswer === option.key
                      ? 'bg-green-50 dark:bg-green-900 border-green-200 dark:border-green-700'
                      : 'bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <span className={`flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium mr-3 ${
                    question.correctAnswer === option.key
                      ? 'bg-green-600 text-white'
                      : 'bg-gray-400 text-white'
                  }`}>
                    {option.key}
                  </span>
                  <span className={question.correctAnswer === option.key 
                    ? 'text-green-800 dark:text-green-200 font-medium' 
                    : 'text-gray-700 dark:text-gray-300'
                  }>
                    {option.value}
                  </span>
                  {question.correctAnswer === option.key && (
                    <span className="ml-auto text-green-600 dark:text-green-400 text-sm font-medium">
                      Correct Answer
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-270">
        <PageBreadcrumb pageTitle="Exam Set Detail" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-270">
      <PageBreadcrumb pageTitle="Exam Set Detail" />

      {/* Exam Set Info */}
      {examSet && (
        <div className="rounded-sm border border-stroke bg-white px-6 py-6 shadow-default dark:border-strokedark dark:bg-boxdark mb-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-2xl font-bold text-black dark:text-white">
                  {examSet.name}
                </h1>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                  {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-3">
                {examSet.code}
              </p>
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                {examSet.description || 'No description provided'}
              </p>
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Questions: <strong className="text-black dark:text-white">{questions.length}/{examSet.targetQuestions}</strong>
                </span>
                <span>
                  Created: <strong className="text-black dark:text-white">{new Date(examSet.createdAt).toLocaleDateString()}</strong>
                </span>
              </div>
            </div>
            <Link
              to="/exam-sets/view"
              className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              ← Back to List
            </Link>
          </div>
        </div>
      )}

      {/* Questions */}
      <div className="rounded-sm border border-stroke bg-white px-6 py-6 shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Questions ({questions.length})
          </h2>
          <Link
            to={`/questions/create-${type}`}
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
          >
            Add Question
          </Link>
        </div>

        {questions.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No questions found</div>
            <p className="text-gray-500 mb-4">
              Start by adding questions to this exam set
            </p>
            <Link
              to={`/questions/create-${type}`}
              className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90"
            >
              Create First Question
            </Link>
          </div>
        ) : (
          <div>
            {questions.map((question, index) => renderQuestion(question, index))}
          </div>
        )}
      </div>
    </div>
  );
}