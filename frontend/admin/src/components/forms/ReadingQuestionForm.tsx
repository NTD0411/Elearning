import { useNavigate, useSearchParams } from 'react-router';
import { useQuestionForm } from '../../hooks/useQuestionForm';
import { useExamSets } from '../../hooks/useExamSets';
import QuestionTypeForm from './QuestionTypeForm';

interface CreateReadingQuestionDto {
  examSetId?: number;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  optionE?: string;
  optionF?: string;
  answerFill?: string;
  correctAnswer: string;
}

export default function ReadingQuestionForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examSetId = searchParams.get('examSetId');
  const { examSets, loading: examSetsLoading } = useExamSets('reading');

  const {
    loading,
    questionType,
    optionCount,
    formData,
    resetForm,
    handleInputChange,
    handleQuestionTypeChange,
    handleOptionCountChange,
    getOptionLetters,
    prepareSubmitData
  } = useQuestionForm<CreateReadingQuestionDto>({
    examSetId: examSetId ? parseInt(examSetId) : undefined,
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
    
    try {
      const submitData = prepareSubmitData(formData);
      const response = await fetch('http://localhost:5074/api/ReadingExam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert('Reading question created successfully!');
        // Reset form
        resetForm();
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error('Error creating reading question:', error);
      alert('Failed to create reading question');
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.05]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Create Reading Question
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
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
                → Create New Reading Exam Set
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
            Choose which exam set this question belongs to. Questions in the same set can be used together for exams.
          </p>
        </div>

        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Question Text *
          </label>
          <textarea
            name="questionText"
            value={formData.questionText}
            onChange={handleInputChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            placeholder="Enter the reading question text"
          />
        </div>

        {/* Question Type Form Component */}
        <QuestionTypeForm
          questionType={questionType}
          optionCount={optionCount}
          formData={formData}
          onQuestionTypeChange={handleQuestionTypeChange}
          onOptionCountChange={handleOptionCountChange}
          onInputChange={handleInputChange}
          getOptionLetters={getOptionLetters}
        />

        {/* Form Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/admin/questions/reading')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Question'}
          </button>
        </div>
      </form>
    </div>
  );
}