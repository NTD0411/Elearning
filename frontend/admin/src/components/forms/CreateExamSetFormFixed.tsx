import React, { useState } from 'react';
import { useNavigate } from 'react-router';

type ExamType = 'reading' | 'listening' | 'speaking' | 'writing';

interface CreateExamSetFormProps {
  onSuccess?: () => void;
}

const CreateExamSetForm: React.FC<CreateExamSetFormProps> = ({ onSuccess }) => {
  const [selectedType, setSelectedType] = useState<ExamType>('reading');
  const [title, setTitle] = useState('');
  const [targetQuestions, setTargetQuestions] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const examTypes = [
    { value: 'reading' as ExamType, label: 'Reading' },
    { value: 'listening' as ExamType, label: 'Listening' },
    { value: 'speaking' as ExamType, label: 'Speaking' },
    { value: 'writing' as ExamType, label: 'Writing' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!title.trim()) {
      alert('Please enter a title for the exam set');
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`${process.env.VITE_API_URL || 'https://e-learningsite.runasp.net/api'}/ExamSet/${selectedType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          targetQuestions: targetQuestions
        }),
      });

      if (response.ok) {
        await response.json();
        alert(`${examTypes.find(t => t.value === selectedType)?.label} exam set created successfully!`);
        setTitle('');
        setTargetQuestions(5);
        if (onSuccess) {
          onSuccess();
        } else {
          navigate('/admin');
        }
      } else {
        throw new Error('Failed to create exam set');
      }
    } catch (error) {
      console.error('Error creating exam set:', error);
      alert('Failed to create exam set. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6 text-center">Create New Exam Set</h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Exam Type Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Exam Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {examTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setSelectedType(type.value)}
                className={`px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                  selectedType === type.value
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Title Input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Exam Set Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter exam set title..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        {/* Target Questions Input */}
        <div>
          <label htmlFor="targetQuestions" className="block text-sm font-medium text-gray-700 mb-1">
            Target Number of Questions
          </label>
          <select
            id="targetQuestions"
            value={targetQuestions}
            onChange={(e) => setTargetQuestions(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value={3}>3 questions</option>
            <option value={4}>4 questions</option>
            <option value={5}>5 questions</option>
            <option value={6}>6 questions</option>
            <option value={7}>7 questions</option>
            <option value={8}>8 questions</option>
            <option value={10}>10 questions</option>
            <option value={15}>15 questions</option>
            <option value={20}>20 questions</option>
          </select>
          <p className="text-sm text-gray-500 mt-1">
            This is your target. You can add questions individually after creating the exam set.
          </p>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isLoading ? 'Creating...' : `Create ${examTypes.find(t => t.value === selectedType)?.label} Exam Set`}
        </button>
      </form>
    </div>
  );
};

export default CreateExamSetForm;