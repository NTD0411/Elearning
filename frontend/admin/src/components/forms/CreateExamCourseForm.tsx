import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { CreateExamCourseDto, ExamSetSummaryDto, ExamType } from '../../types/examCourse';

export default function CreateExamCourseForm() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedExamType, setSelectedExamType] = useState<ExamType>('reading');
  const [availableExamSets, setAvailableExamSets] = useState<ExamSetSummaryDto[]>([]);
  const [selectedExamSets, setSelectedExamSets] = useState<number[]>([]);
  const [loadingExamSets, setLoadingExamSets] = useState(false);
  
  const [formData, setFormData] = useState<CreateExamCourseDto>({
    courseTitle: '',
    courseCode: '',
    description: '',
    examType: 'reading',
    examSetIds: []
  });

  const getTypeInfo = (type: ExamType) => {
    const info = {
      reading: {
        title: 'Reading Course',
        description: 'Create a reading comprehension exam course',
        color: 'blue',
        prefix: 'RC'
      },
      listening: {
        title: 'Listening Course',
        description: 'Create a listening comprehension exam course',
        color: 'green',
        prefix: 'LC'
      },
      speaking: {
        title: 'Speaking Course',
        description: 'Create a speaking exam course',
        color: 'purple',
        prefix: 'SC'
      },
      writing: {
        title: 'Writing Course',
        description: 'Create a writing exam course',
        color: 'orange',
        prefix: 'WC'
      }
    };
    return info[type];
  };

  useEffect(() => {
    fetchAvailableExamSets(selectedExamType);
  }, [selectedExamType]);

  const fetchAvailableExamSets = async (examType: ExamType) => {
    setLoadingExamSets(true);
    try {
      const response = await fetch(`${process.env.VITE_API_URL || 'https://e-learningsite.runasp.net/api'}/ExamCourse/available-examsets/${examType}`);
      if (response.ok) {
        const data = await response.json();
        setAvailableExamSets(data);
      } else {
        console.error('Failed to fetch exam sets');
        setAvailableExamSets([]);
      }
    } catch (error) {
      console.error('Error fetching exam sets:', error);
      setAvailableExamSets([]);
    } finally {
      setLoadingExamSets(false);
    }
  };

  const handleTypeChange = (type: ExamType) => {
    setSelectedExamType(type);
    setSelectedExamSets([]);
    setFormData(prev => ({
      ...prev,
      examType: type,
      examSetIds: []
    }));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleExamSetToggle = (examSetId: number) => {
    const newSelection = selectedExamSets.includes(examSetId)
      ? selectedExamSets.filter(id => id !== examSetId)
      : [...selectedExamSets, examSetId];
    
    setSelectedExamSets(newSelection);
    setFormData(prev => ({
      ...prev,
      examSetIds: newSelection
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedExamSets.length === 0) {
      alert('Please select at least one exam set');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch(`${process.env.VITE_API_URL || 'https://e-learningsite.runasp.net/api'}/ExamCourse`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseTitle: formData.courseTitle,
          courseCode: formData.courseCode,
          description: formData.description,
          examType: selectedExamType,
          examSetIds: selectedExamSets
        }),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`Exam Course "${result.courseTitle}" created successfully!`);
        navigate('/exam-courses/view');
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error('Error creating exam course:', error);
      alert('Failed to create exam course');
    } finally {
      setLoading(false);
    }
  };

  const currentTypeInfo = getTypeInfo(selectedExamType);

  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.05]">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          Create {currentTypeInfo.title}
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
          {currentTypeInfo.description}
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Exam Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Exam Type *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {(['reading', 'listening', 'speaking', 'writing'] as ExamType[]).map((type) => {
              const typeInfo = getTypeInfo(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => handleTypeChange(type)}
                  className={`p-3 rounded-lg border text-left transition-colors ${
                    selectedExamType === type
                      ? `border-${typeInfo.color}-500 bg-${typeInfo.color}-50 dark:bg-${typeInfo.color}-900/20`
                      : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="font-medium text-sm capitalize">{type}</div>
                  <div className="text-xs text-gray-500">{typeInfo.prefix}_xxx</div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Course Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Course Title *
          </label>
          <input
            type="text"
            name="courseTitle"
            value={formData.courseTitle}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={`Enter ${selectedExamType} course title (e.g., IELTS ${selectedExamType.charAt(0).toUpperCase() + selectedExamType.slice(1)} Complete Course)`}
          />
        </div>

        {/* Course Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Course Code (Optional)
          </label>
          <input
            type="text"
            name="courseCode"
            value={formData.courseCode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={`Leave empty for auto-generated code (${currentTypeInfo.prefix}_yyyyMMddHHmmss)`}
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter course description..."
          />
        </div>

        {/* Exam Sets Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Select Exam Sets * ({selectedExamSets.length} selected)
          </label>
          
          {loadingExamSets ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading exam sets...</span>
            </div>
          ) : availableExamSets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No available {selectedExamType} exam sets found. Create exam sets first.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
              {availableExamSets.map((examSet) => (
                <div
                  key={examSet.examSetId}
                  onClick={() => handleExamSetToggle(examSet.examSetId)}
                  className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                    selectedExamSets.includes(examSet.examSetId)
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-300 hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-sm text-gray-900 dark:text-white">
                        {examSet.examSetTitle}
                      </h4>
                      <p className="text-xs text-gray-500 font-mono">{examSet.examSetCode}</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Questions: {examSet.questionCount}/{examSet.totalQuestions}
                      </p>
                    </div>
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                      selectedExamSets.includes(examSet.examSetId)
                        ? 'border-blue-500 bg-blue-500'
                        : 'border-gray-300'
                    }`}>
                      {selectedExamSets.includes(examSet.examSetId) && (
                        <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/exam-courses/view')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || selectedExamSets.length === 0}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : `Create ${selectedExamType.charAt(0).toUpperCase() + selectedExamType.slice(1)} Course`}
          </button>
        </div>
      </form>
    </div>
  );
}