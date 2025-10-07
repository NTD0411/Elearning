import { useNavigate, useSearchParams } from 'react-router';
import { useQuestionForm } from '../../hooks/useQuestionForm';
import { useExamSets } from '../../hooks/useExamSets';

interface CreateWritingQuestionDto {
  examSetId?: number;
  questionText: string;
  additionalInstructions?: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  optionE?: string;
  optionF?: string;
  answerFill?: string;
  correctAnswer: string;
}

export default function WritingQuestionForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examSetId = searchParams.get('examSetId');
  const { examSets, loading: examSetsLoading } = useExamSets('writing');

  const {
    loading,
    formData,
    resetForm,
    handleInputChange,
    prepareSubmitData
  } = useQuestionForm<CreateWritingQuestionDto>({
    examSetId: examSetId ? parseInt(examSetId) : undefined,
    questionText: '',
    correctAnswer: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const submitData = prepareSubmitData(formData);
      const response = await fetch('http://localhost:5074/api/WritingExam', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      if (response.ok) {
        alert('Writing question created successfully!');
        // Reset form
        resetForm();
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error('Error creating writing question:', error);
      alert('Failed to create writing question');
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.05]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Create Writing Question
        </h3>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Select Exam Set */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Select Exam Set *
          </label>
          {examSetsLoading ? (
            <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-500">
              Loading exam sets...
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
                → Create New Writing Exam Set
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
            Writing Prompt *
          </label>
          <textarea
            name="questionText"
            value={formData.questionText}
            onChange={handleInputChange}
            required
            rows={8}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            placeholder="Enter the writing prompt. For example: 'Write an essay about the advantages and disadvantages of social media in modern society. Your essay should be 250-300 words and include specific examples.'"
          />
        </div>

        {/* Instructions */}
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-green-800 dark:text-green-200 mb-2">Writing Question Guidelines:</h4>
          <ul className="text-sm text-green-700 dark:text-green-300 space-y-1">
            <li>• Specify word count requirements (e.g., 250-300 words, 400-500 words)</li>
            <li>• Include clear task instructions (essay, letter, report, etc.)</li>
            <li>• Consider providing specific criteria for evaluation</li>
            <li>• Encourage use of examples and supporting details</li>
            <li>• Questions will be evaluated based on content, organization, language use, and mechanics</li>
          </ul>
        </div>

        {/* Additional Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Additional Instructions (Optional)
          </label>
          <textarea
            name="additionalInstructions"
            value={formData.additionalInstructions || ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            placeholder="Any additional instructions for students (time limit, formatting requirements, etc.)"
          />
        </div>

        {/* Form Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => resetForm()}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            Reset Form
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : 'Create Writing Question'}
          </button>
        </div>
      </form>
    </div>
  );
}