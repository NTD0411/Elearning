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
  readingContext?: string;
  readingImage?: string;
  listeningImage?: string;
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
  // Speaking fields
  partNumber?: number;
  partTitle?: string;
  cueCardTopic?: string;
  cueCardPrompts?: string;
  timeLimit?: number;
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

      const response = await fetch(`http://localhost:5074/api/${endpoint}/examset/${id}`);
      if (response.ok) {
        const data = await response.json();
        console.log('Fetched questions:', data);
        // Map the fields correctly
        const mappedQuestions = data.map((q: any) => ({
          id: q.speakingExamId || q.readingExamId || q.listeningExamId || q.writingExamId,
          questionText: q.questionText,
          partNumber: q.partNumber,
          partTitle: q.partTitle,
          cueCardTopic: q.cueCardTopic,
          cueCardPrompts: q.cueCardPrompts,
          timeLimit: q.timeLimit,
          examSetId: q.examSetId,
          // Other fields for different exam types
          optionA: q.optionA,
          optionB: q.optionB,
          optionC: q.optionC,
          optionD: q.optionD,
          answerFill: q.answerFill,
          correctAnswer: q.correctAnswer,
          audioUrl: q.audioUrl,
          content: q.content
        }));
        // Sort by ID
        mappedQuestions.sort((a: Question, b: Question) => a.id - b.id);
        console.log('Mapped questions:', mappedQuestions);
        setQuestions(mappedQuestions);
      }
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const deleteQuestion = async (question: Question) => {
    if (!window.confirm(`Are you sure you want to delete this question? This action cannot be undone.`)) {
      return;
    }

    try {
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

      const response = await fetch(`http://localhost:5074/api/${endpoint}/${question.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the question from state
        setQuestions(prev => prev.filter(q => q.id !== question.id));
        // Also update the exam set question count if we have it
        if (examSet) {
          setExamSet(prev => prev ? {...prev, questionCount: prev.questionCount - 1} : null);
        }
        console.log('Question deleted successfully');
      } else {
        console.error('Failed to delete question:', response.status);
        alert('Failed to delete question. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting question:', error);
      alert('Error deleting question. Please try again.');
    }
  };

  const getQuestionCountDisplay = () => {
    console.log('getQuestionCountDisplay - type:', type, 'questions:', questions);
    if (type === 'speaking' && questions.length > 0) {
      const part1Questions = questions.filter(q => q.partNumber === 1).length;
      const part2Questions = questions.filter(q => q.partNumber === 2).length;
      const part3Questions = questions.filter(q => q.partNumber === 3).length;
      
      console.log('Part counts:', { part1Questions, part2Questions, part3Questions });
      return `Part 1: ${part1Questions}, Part 2: ${part2Questions}, Part 3: ${part3Questions} (Total: ${questions.length})`;
    }
    return `${questions.length}/${examSet?.targetQuestions || 0}`;
  };

  const getQuestionTypeColor = (question: Question) => {
    // Speaking questions
    if (question.partNumber !== undefined) {
      if (question.partNumber === 1) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      if (question.partNumber === 2) return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      if (question.partNumber === 3) return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      return 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300';
    }
    
    if (question.answerFill) return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    if (question.optionA === 'True' && question.optionB === 'False') 
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
  };

  const getQuestionTypeLabel = (question: Question) => {
    // Speaking questions
    if (question.partNumber !== undefined) {
      if (question.partNumber === 1) return 'Part 1: Interview';
      if (question.partNumber === 2) return 'Part 2: Long Turn';
      if (question.partNumber === 3) return 'Part 3: Discussion';
      return `Part ${question.partNumber}`;
    }
    
    if (question.answerFill) return 'Fill in the Blank';
    if (question.optionA === 'True' && question.optionB === 'False') return 'True/False';
    return 'Multiple Choice';
  };

  const renderSpeakingQuestions = () => {
    if (type !== 'speaking') return null;

    const part1Questions = questions.filter(q => q.partNumber === 1);
    const part2Questions = questions.filter(q => q.partNumber === 2);
    const part3Questions = questions.filter(q => q.partNumber === 3);

    const renderPartSection = (partQuestions: Question[], partNumber: number, partTitle: string) => {
      if (partQuestions.length === 0) return null;

      return (
        <div key={partNumber} className="mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-t-lg">
            <h3 className="text-lg font-semibold flex items-center">
              <span className="flex items-center justify-center w-8 h-8 bg-white text-blue-600 rounded-full text-sm font-bold mr-3">
                {partNumber}
              </span>
              {partTitle}
              <span className="ml-auto text-sm opacity-80">
                {partQuestions.length} {partQuestions.length === 1 ? 'Question' : 'Questions'}
              </span>
            </h3>
          </div>
          
          <div className="border border-gray-200 dark:border-gray-700 rounded-b-lg p-4 bg-white dark:bg-boxdark">
            {partQuestions.map((question, index) => (
              <div key={question.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4 last:mb-0">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="flex items-center justify-center w-6 h-6 bg-blue-500 text-white rounded-full text-xs font-medium">
                      {index + 1}
                    </span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">ID: {question.id}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteQuestion(question)}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                    <Link
                      to={`/questions/edit-speaking/${question.id}?examSetId=${id}`}
                      className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Question:
                    </label>
                    <p className="text-gray-900 dark:text-white">{question.questionText}</p>
                  </div>

                  {question.cueCardTopic && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cue Card Topic:
                      </label>
                      <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded p-2">
                        <p className="text-blue-800 dark:text-blue-200 font-medium">{question.cueCardTopic}</p>
                      </div>
                    </div>
                  )}

                  {question.cueCardPrompts && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Cue Card Prompts:
                      </label>
                      <div className="bg-gray-50 dark:bg-gray-800 p-2 rounded">
                        <p className="text-gray-700 dark:text-gray-300 text-sm whitespace-pre-wrap">{question.cueCardPrompts}</p>
                      </div>
                    </div>
                  )}

                  {question.timeLimit && (
                    <div>
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {question.timeLimit} {question.timeLimit === 1 ? 'minute' : 'minutes'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      );
    };

    return (
      <div className="space-y-6">
        {renderPartSection(part1Questions, 1, "Interview - Personal Questions")}
        {renderPartSection(part2Questions, 2, "Long Turn - Individual Task with Cue Card")}
        {renderPartSection(part3Questions, 3, "Discussion - Abstract Topics")}
      </div>
    );
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
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500 dark:text-gray-400">ID: {question.id}</span>
            <button
              onClick={() => deleteQuestion(question)}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded"
              title="Delete Question"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              Delete
            </button>
            <Link
              to={`/questions/edit-${type}/${question.id}?examSetId=${id}`}
              className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded"
            >
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit
            </Link>
          </div>
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

        {/* Speaking specific content */}
        {type === 'speaking' && (
          <>
            {/* Part Title */}
            {question.partTitle && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Part Title:
                </label>
                <p className="text-gray-900 dark:text-white">
                  {question.partTitle}
                </p>
              </div>
            )}

            {/* Cue Card Topic (Part 2) */}
            {question.cueCardTopic && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cue Card Topic:
                </label>
                <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg p-3">
                  <p className="text-blue-800 dark:text-blue-200 font-medium">
                    {question.cueCardTopic}
                  </p>
                </div>
              </div>
            )}

            {/* Cue Card Prompts (Part 2) */}
            {question.cueCardPrompts && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cue Card Prompts:
                </label>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {question.cueCardPrompts}
                  </p>
                </div>
              </div>
            )}

            {/* Time Limit */}
            {question.timeLimit && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Limit:
                </label>
                <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {question.timeLimit} {question.timeLimit === 1 ? 'minute' : 'minutes'}
                </div>
              </div>
            )}
          </>
        )}

        {/* Answer Options - Only show for non-speaking questions */}
        {type !== 'speaking' && (
          <>
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
          </>
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
    <div className="mx-auto max-w-270 relative">
      <PageBreadcrumb pageTitle="Exam Set Detail" />

      {/* Floating Add Question Button */}
      <Link
        to={`/questions/create-${type}?examSetId=${id}`}
        className="fixed bottom-8 right-8 z-50 inline-flex items-center justify-center w-16 h-16 bg-green-500 text-white rounded-full shadow-2xl hover:bg-green-600 transition-all duration-200 hover:scale-110 border-4 border-white"
        title="Add Question"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      </Link>

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
              
              {/* Reading Context - Only show for reading type */}
              {type === 'reading' && examSet.readingContext && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Reading Context</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                      {examSet.readingContext}
                    </p>
                  </div>
                </div>
              )}
              
              {/* Reading Image - Only show for reading type */}
              {type === 'reading' && examSet.readingImage && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Reading Image</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                    <img
                      src={examSet.readingImage}
                      alt="Reading passage illustration"
                      className="max-w-full h-auto rounded-lg"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                </div>
              )}
              
              {/* Listening Image - Only show for listening type */}
              {type === 'listening' && examSet.listeningImage && (
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-black dark:text-white mb-2">Listening Image</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg border">
                    <img
                      src={examSet.listeningImage}
                      alt="Listening material illustration"
                      className="max-w-full h-auto rounded-lg"
                      style={{ maxHeight: '400px' }}
                    />
                  </div>
                </div>
              )}
              
              <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
                <span>
                  Questions: <strong className="text-black dark:text-white">{getQuestionCountDisplay()}</strong>
                </span>
                <span>
                  Created: <strong className="text-black dark:text-white">{new Date(examSet.createdAt).toLocaleDateString()}</strong>
                </span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <Link
                to={`exam-sets/edit/${type}/${id}`}
                className="inline-flex items-center px-4 py-2 bg-yellow-600 border border-yellow-600 rounded-md text-sm font-medium text-white hover:bg-yellow-700"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Edit Set
              </Link>
              <Link
                to="exam-sets/view"
                className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                ← Back to List
              </Link>
            </div>
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
            to={`/questions/create-${type}?examSetId=${id}`}
            className="inline-flex items-center justify-center rounded-md bg-green-600 py-2 px-4 text-center font-medium text-white hover:bg-green-700 transition-colors"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
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
              to={`/questions/create-${type}?examSetId=${id}`}
              className="inline-flex items-center justify-center rounded-md bg-green-600 py-3 px-6 text-center font-medium text-white hover:bg-green-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First Question
            </Link>
          </div>
        ) : (
          <div>
            {type === 'speaking' ? (
              renderSpeakingQuestions()
            ) : (
              questions.map((question, index) => renderQuestion(question, index))
            )}
          </div>
        )}
      </div>
    </div>
  );
}