import { useNavigate, useSearchParams } from 'react-router';
import { useQuestionForm } from '../../hooks/useQuestionForm';
import { useExamSets } from '../../hooks/useExamSets';

interface CreateWritingQuestionDto {
  examSetId: number;
  
  // Task 1 Properties
  task1Title: string;
  task1Description: string;
  task1ImageUrl?: string;
  task1Requirements?: string;
  task1MinWords: number;
  task1MaxTime: number;
  
  // Task 2 Properties
  task2Title: string;
  task2Question: string;
  task2Context?: string;
  task2Requirements?: string;
  task2MinWords: number;
  task2MaxTime: number;
  
  // General Properties
  totalTimeMinutes: number;
  instructions?: string;
  
  // Required by BaseQuestionDto (for compatibility)
  questionText: string;
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
    examSetId: examSetId ? parseInt(examSetId) : 0,
    
    // Task 1 defaults
    task1Title: '',
    task1Description: '',
    task1ImageUrl: '',
    task1Requirements: '',
    task1MinWords: 150,
    task1MaxTime: 20,
    
    // Task 2 defaults
    task2Title: '',
    task2Question: '',
    task2Context: '',
    task2Requirements: '',
    task2MinWords: 250,
    task2MaxTime: 40,
    
    // General defaults
    totalTimeMinutes: 60,
    instructions: '',
    
    // Required by BaseQuestionDto (will be auto-generated)
    questionText: '',
    correctAnswer: 'N/A' // Writing doesn't have correct answers
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      // Auto-generate questionText for backward compatibility
      const questionText = `Task 1: ${formData.task1Title} | Task 2: ${formData.task2Title}`;
      
      const submitData = prepareSubmitData({
        ...formData,
        questionText,
        correctAnswer: 'N/A' // Writing tasks don't have single correct answers
      });
      
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
          Create IELTS Writing Exam (Task 1 + Task 2)
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
        </div>

        {/* General Instructions */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            General Instructions
          </label>
          <textarea
            name="instructions"
            value={formData.instructions || ''}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
            placeholder="General instructions for the entire writing exam (e.g., 'You have 60 minutes to complete both tasks. Task 1 should take about 20 minutes, Task 2 should take about 40 minutes.')"
          />
        </div>

        {/* Total Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Total Exam Time (minutes) *
          </label>
          <input
            type="number"
            name="totalTimeMinutes"
            value={formData.totalTimeMinutes}
            onChange={handleInputChange}
            required
            min="30"
            max="120"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          />
        </div>

        {/* Task 1 Section */}
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50 dark:bg-blue-900/20">
          <h4 className="text-lg font-semibold text-blue-800 dark:text-blue-200 mb-4">
            📊 Task 1 - Report/Description (Academic) or Letter (General)
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task 1 Title *
              </label>
              <input
                type="text"
                name="task1Title"
                value={formData.task1Title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., 'Chart Analysis Task' or 'Formal Letter Task'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task 1 Description *
              </label>
              <textarea
                name="task1Description"
                value={formData.task1Description}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                placeholder="Describe what students need to do for Task 1. For Academic: 'The chart below shows... Summarise the information by selecting and reporting the main features.' For General: 'Write a letter to... In your letter..'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task 1 Image URL (for charts/graphs)
              </label>
              <input
                type="url"
                name="task1ImageUrl"
                value={formData.task1ImageUrl || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="https://example.com/chart-image.jpg"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task 1 Requirements
              </label>
              <textarea
                name="task1Requirements"
                value={formData.task1Requirements || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                placeholder="Specific requirements: 'Write at least 150 words. Include an overview. Compare and contrast key features.'"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Words *
                </label>
                <input
                  type="number"
                  name="task1MinWords"
                  value={formData.task1MinWords}
                  onChange={handleInputChange}
                  required
                  min="100"
                  max="300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recommended Time (minutes) *
                </label>
                <input
                  type="number"
                  name="task1MaxTime"
                  value={formData.task1MaxTime}
                  onChange={handleInputChange}
                  required
                  min="15"
                  max="30"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Task 2 Section */}
        <div className="border border-green-200 rounded-lg p-4 bg-green-50 dark:bg-green-900/20">
          <h4 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-4">
            ✍️ Task 2 - Essay Writing
          </h4>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task 2 Title *
              </label>
              <input
                type="text"
                name="task2Title"
                value={formData.task2Title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                placeholder="e.g., 'Opinion Essay' or 'Discussion Essay'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task 2 Question *
              </label>
              <textarea
                name="task2Question"
                value={formData.task2Question}
                onChange={handleInputChange}
                required
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                placeholder="Write the main essay question. E.g., 'Some people believe that technology has made our lives easier, while others think it has made life more complicated. Discuss both views and give your own opinion.'"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task 2 Context/Background
              </label>
              <textarea
                name="task2Context"
                value={formData.task2Context || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                placeholder="Provide context or background information to help students understand the topic better."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Task 2 Requirements
              </label>
              <textarea
                name="task2Requirements"
                value={formData.task2Requirements || ''}
                onChange={handleInputChange}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white resize-none"
                placeholder="Specific requirements: 'Write at least 250 words. Include relevant examples. Present a clear position.'"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Minimum Words *
                </label>
                <input
                  type="number"
                  name="task2MinWords"
                  value={formData.task2MinWords}
                  onChange={handleInputChange}
                  required
                  min="200"
                  max="400"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Recommended Time (minutes) *
                </label>
                <input
                  type="number"
                  name="task2MaxTime"
                  value={formData.task2MaxTime}
                  onChange={handleInputChange}
                  required
                  min="30"
                  max="50"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Guidelines */}
        <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
          <h4 className="font-medium text-yellow-800 dark:text-yellow-200 mb-2">IELTS Writing Guidelines:</h4>
          <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
            <li>• <strong>Task 1 (20 minutes, 150+ words):</strong> Academic - describe charts/graphs; General - write letters</li>
            <li>• <strong>Task 2 (40 minutes, 250+ words):</strong> Write an essay responding to a point of view, argument, or problem</li>
            <li>• <strong>Total time:</strong> 60 minutes for both tasks</li>
            <li>• <strong>Task 2 carries more weight:</strong> It's worth twice as much as Task 1 in scoring</li>
            <li>• Students should spend more time on Task 2 as it requires more depth and analysis</li>
          </ul>
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
            {loading ? 'Creating...' : 'Create Writing Exam'}
          </button>
        </div>
      </form>
    </div>
  );
}