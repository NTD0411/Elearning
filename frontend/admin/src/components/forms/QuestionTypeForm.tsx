import { QuestionType } from '../../hooks/useQuestionForm';

interface QuestionTypeFormProps {
  questionType: QuestionType;
  optionCount: number;
  formData: any;
  onQuestionTypeChange: (type: QuestionType) => void;
  onOptionCountChange: (count: number) => void;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => void;
  getOptionLetters: () => string[];
}

export default function QuestionTypeForm({
  questionType,
  optionCount,
  formData,
  onQuestionTypeChange,
  onOptionCountChange,
  onInputChange,
  getOptionLetters
}: QuestionTypeFormProps) {

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
          const fieldName = `option${letter}`;
          return (
            <div key={letter}>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Option {letter}
              </label>
              <input
                type="text"
                name={fieldName}
                value={formData[fieldName] || ''}
                onChange={onInputChange}
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
    <>
      {/* Question Type Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          Question Type *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => onQuestionTypeChange('multiple-choice')}
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
            onClick={() => onQuestionTypeChange('true-false')}
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
            onClick={() => onQuestionTypeChange('fill-blank')}
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
            onChange={(e) => onOptionCountChange(Number(e.target.value))}
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

      {/* Answer Options */}
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
            value={formData.answerFill || ''}
            onChange={onInputChange}
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
            value={formData.correctAnswer || ''}
            onChange={onInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder="Enter the exact answer text"
          />
        ) : questionType === 'true-false' ? (
          <select
            name="correctAnswer"
            value={formData.correctAnswer || ''}
            onChange={onInputChange}
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
            value={formData.correctAnswer || ''}
            onChange={onInputChange}
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
    </>
  );
}