import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { useExamSets } from '../../hooks/useExamSets';

interface CreateListeningQuestionDto {
  examSetId?: number;
  audioUrl: string;
  questionText?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  answerFill?: string;
  correctAnswer: string;
}

type QuestionType = 'multiple-choice' | 'true-false' | 'fill-blank';

export default function ListeningQuestionForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examSetId = searchParams.get('examSetId');
  const { examSets, loading: examSetsLoading } = useExamSets('listening');
  const [loading, setLoading] = useState(false);
  const [questionType, setQuestionType] = useState<QuestionType>('multiple-choice');
  const [optionCount, setOptionCount] = useState(4);
  const [formData, setFormData] = useState<CreateListeningQuestionDto>({
    examSetId: examSetId ? parseInt(examSetId) : undefined,
    audioUrl: '', // Will be empty, audio comes from exam set
    questionText: '',
    optionA: '',
    optionB: '',
    optionC: '',
    optionD: '',
    answerFill: '',
    correctAnswer: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Prepare data based on question type
      // Audio URL is not needed as it comes from the exam set
      const submitData = { 
        ...formData,
        audioUrl: '' // Audio is defined at exam set level
      };
      
      if (questionType === 'fill-blank') {
        // For fill-in-blank, clear multiple choice options
        submitData.optionA = '';
        submitData.optionB = '';
        submitData.optionC = '';
        submitData.optionD = '';
      } else if (questionType === 'true-false') {
        // For true/false, set fixed options
        submitData.optionA = 'True';
        submitData.optionB = 'False';
        submitData.optionC = '';
        submitData.optionD = '';
        submitData.answerFill = '';
      } else {
        // For multiple choice, clear fill answer
        submitData.answerFill = '';
      }

      const response = await fetch('http://localhost:5074/api/ListeningExam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert('Listening question created successfully!');
        // Reset form
        setFormData({
          examSetId: examSetId ? parseInt(examSetId) : undefined,
          audioUrl: '',
          questionText: '',
          optionA: '',
          optionB: '',
          optionC: '',
          optionD: '',
          answerFill: '',
          correctAnswer: ''
        });
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error('Error creating listening question:', error);
      alert('Failed to create listening question');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleQuestionTypeChange = (type: QuestionType) => {
    setQuestionType(type);
    // Reset form data when changing question type
    setFormData(prev => ({
      ...prev,
      optionA: '',
      optionB: '',
      optionC: '',
      optionD: '',
      answerFill: '',
      correctAnswer: ''
    }));
    
    // Set default option count based on type
    if (type === 'true-false') {
      setOptionCount(2);
    } else if (type === 'fill-blank') {
      setOptionCount(0);
    } else {
      setOptionCount(4);
    }
  };

  const handleOptionCountChange = (count: number) => {
    setOptionCount(count);
    // Clear options beyond the selected count
    const newFormData = { ...formData };
    if (count < 4) newFormData.optionD = '';
    if (count < 3) newFormData.optionC = '';
    if (count < 2) newFormData.optionB = '';
    setFormData(newFormData);
  };

  const getOptionLetters = () => {
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    return letters.slice(0, optionCount);
  };

  const renderOptionsGrid = () => {
    if (questionType === 'fill-blank') return null;
    
    if (questionType === 'true-false') {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              True
            </label>
            <input
              type="text"
              value="True"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              False
            </label>
            <input
              type="text"
              value="False"
              disabled
              className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 dark:bg-gray-600 dark:border-gray-600 dark:text-white"
            />
          </div>
        </div>
      );
    }

    const options = getOptionLetters();
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {options.map((letter) => {
          const fieldName = `option${letter}` as keyof CreateListeningQuestionDto;
          return (
            <div key={letter}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Option {letter}
              </label>
              <input
                type="text"
                name={fieldName}
                value={formData[fieldName] as string || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder={`Option ${letter}`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.05]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Create Listening Question
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Question Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Question Type *
          </label>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleQuestionTypeChange('multiple-choice')}
              className={`p-3 rounded-lg border text-left ${
                questionType === 'multiple-choice'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              <div className="font-medium text-sm">Multiple Choice</div>
              <div className="text-xs text-gray-500">A, B, C, D options</div>
            </button>
            
            <button
              type="button"
              onClick={() => handleQuestionTypeChange('true-false')}
              className={`p-3 rounded-lg border text-left ${
                questionType === 'true-false'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              <div className="font-medium text-sm">True/False</div>
              <div className="text-xs text-gray-500">Two options only</div>
            </button>
            
            <button
              type="button"
              onClick={() => handleQuestionTypeChange('fill-blank')}
              className={`p-3 rounded-lg border text-left ${
                questionType === 'fill-blank'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
              }`}
            >
              <div className="font-medium text-sm">Fill in Blank</div>
              <div className="text-xs text-gray-500">Text input answer</div>
            </button>
          </div>
        </div>

        {/* Option Count for Multiple Choice */}
        {questionType === 'multiple-choice' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Number of Options
            </label>
            <select
              value={optionCount}
              onChange={(e) => handleOptionCountChange(Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value={2}>2 options</option>
              <option value={3}>3 options</option>
              <option value={4}>4 options</option>
              <option value={5}>5 options</option>
              <option value={6}>6 options</option>
            </select>
          </div>
        )}

        {/* Exam Set Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Exam Set *
          </label>
          {examSetsLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600">
              <span className="text-gray-500">Loading exam sets...</span>
            </div>
          ) : examSets.length === 0 ? (
            <div className="space-y-2">
              <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300">
                <span className="text-yellow-700 dark:text-yellow-300">No exam sets available. Please create one first.</span>
              </div>
              <button
                type="button"
                onClick={() => navigate('/create-exam-set')}
                className="text-sm text-blue-600 hover:text-blue-800 underline"
              >
                → Create New Listening Exam Set
              </button>
            </div>
          ) : (
            <select
              name="examSetId"
              value={formData.examSetId || ''}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select an exam set</option>
              {examSets.map((examSet) => (
                <option key={examSet.examSetId} value={examSet.examSetId}>
                  {examSet.examSetTitle} ({examSet.examSetCode}) - {examSet.questionCount}/{examSet.totalQuestions} questions
                </option>
              ))}
            </select>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Choose which exam set this question belongs to. Questions in the same set can be used together for exams. Audio will be taken from the exam set.
          </p>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Text
          </label>
          <textarea
            name="questionText"
            value={formData.questionText}
            onChange={handleInputChange}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter the listening question (optional)..."
          />
        </div>

        {/* Multiple Choice Options */}
        {questionType !== 'fill-blank' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Answer Options
            </label>
            {renderOptionsGrid()}
          </div>
        )}

        {/* Fill in the blank answer */}
        {questionType === 'fill-blank' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Fill Answer *
            </label>
            <input
              type="text"
              name="answerFill"
              value={formData.answerFill}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter the correct answer for fill-in-the-blank"
            />
          </div>
        )}

        {/* Correct Answer */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Correct Answer *
          </label>
          {questionType === 'fill-blank' ? (
            <input
              type="text"
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter the exact answer text"
            />
          ) : questionType === 'true-false' ? (
            <select
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select correct answer</option>
              <option value="A">A - True</option>
              <option value="B">B - False</option>
            </select>
          ) : (
            <select
              name="correctAnswer"
              value={formData.correctAnswer}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="">Select correct answer</option>
              {getOptionLetters().map(letter => (
                <option key={letter} value={letter}>{letter}</option>
              ))}
            </select>
          )}
        </div>

        {/* Submit Buttons */}
        <div className="flex gap-4 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Question'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:ring-2 focus:ring-gray-500"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}