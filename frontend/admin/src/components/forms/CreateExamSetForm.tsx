import { useState } from 'react';
import { useNavigate } from 'react-router';

interface CreateExamSetDto {
  examSetTitle: string;
  examSetCode?: string;
  targetQuestions?: number;
  readingContext?: string;
  readingImage?: string;
  listeningImage?: string;
}

type ExamType = 'reading' | 'listening' | 'speaking' | 'writing';

interface CreateExamSetFormProps {
  examType?: ExamType;
}

export default function CreateExamSetForm({ examType = 'reading' }: CreateExamSetFormProps) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [selectedType, setSelectedType] = useState<ExamType>(examType);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [formData, setFormData] = useState<CreateExamSetDto>({
    examSetTitle: '',
    examSetCode: '',
    targetQuestions: 5,
    readingContext: '',
    readingImage: '',
    listeningImage: ''
  });

  const getTypeInfo = (type: ExamType) => {
    const info = {
      reading: {
        title: 'Reading Exam Set',
        description: 'Create a new exam set container for reading comprehension questions',
        color: 'blue',
        prefix: 'RS',
        defaultTime: 30
      },
      listening: {
        title: 'Listening Exam Set',
        description: 'Create a new exam set container for listening comprehension questions',
        color: 'green',
        prefix: 'LS',
        defaultTime: 25
      },
      speaking: {
        title: 'Speaking Exam Set',
        description: 'Create a new exam set container for speaking questions',
        color: 'purple',
        prefix: 'SS',
        defaultTime: 15
      },
      writing: {
        title: 'Writing Exam Set',
        description: 'Create a new exam set container for writing questions',
        color: 'orange',
        prefix: 'WS',
        defaultTime: 45
      }
    };
    return info[type];
  };

  const handleTypeChange = (type: ExamType) => {
    setSelectedType(type);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetQuestions' ? Number(value) : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;
    
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      
      const response = await fetch('http://localhost:5074/api/Upload/image', {
        method: 'POST',
        body: formData,
      });
      
      if (response.ok) {
        const result = await response.json();
        return result.url;
      } else {
        throw new Error('Failed to upload image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
      return null;
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      // Upload image first if image is selected
      let imageUrl = '';
      if ((selectedType === 'reading' || selectedType === 'listening') && imageFile) {
        imageUrl = await uploadImage() || '';
      }
      
      const requestBody = {
        title: formData.examSetTitle,
        targetQuestions: formData.targetQuestions,
        ...(selectedType === 'reading' && {
          readingContext: formData.readingContext,
          readingImage: imageUrl
        }),
        ...(selectedType === 'listening' && {
          listeningImage: imageUrl
        })
      };
      
      const response = await fetch(`http://localhost:5074/api/ExamSet/${selectedType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const result = await response.json();
        alert(`${getTypeInfo(selectedType).title} "${result.examSetTitle}" created successfully with ID: ${result.examSetId}`);
        // Refresh the page to show updated data
        window.location.reload();
      } else {
        const error = await response.text();
        alert(`Error: ${error}`);
      }
    } catch (error) {
      console.error('Error creating exam set:', error);
      alert('Failed to create exam set');
    } finally {
      setLoading(false);
    }
  };

  const currentTypeInfo = getTypeInfo(selectedType);

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
                    selectedType === type
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

        {/* Exam Set Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Exam Set Title *
          </label>
          <input
            type="text"
            name="examSetTitle"
            value={formData.examSetTitle}
            onChange={handleInputChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={`Enter ${selectedType} exam set title (e.g., IELTS ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Practice Set 1)`}
          />
        </div>

        {/* Exam Set Code */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Exam Set Code (Optional)
          </label>
          <input
            type="text"
            name="examSetCode"
            value={formData.examSetCode}
            onChange={handleInputChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            placeholder={`Leave empty for auto-generated code (${currentTypeInfo.prefix}_yyyyMMddHHmmss)`}
          />
          <p className="text-xs text-gray-500 mt-1">
            If left empty, a code will be auto-generated with prefix {currentTypeInfo.prefix}_
          </p>
        </div>

        {/* Reading Context - Only show for reading exam type */}
        {selectedType === 'reading' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reading Context
            </label>
            <textarea
              name="readingContext"
              value={formData.readingContext}
              onChange={handleInputChange}
              rows={8}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Enter the reading passage here. This will be the text that students read before answering questions..."
            />
            <p className="text-xs text-gray-500 mt-1">
              The reading passage that students will read to answer the questions.
            </p>
          </div>
        )}

        {/* Reading Image - Only show for reading exam type */}
        {selectedType === 'reading' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Reading Image (Optional)
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-xs max-h-48 rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              {uploadingImage && (
                <p className="text-blue-600 text-sm">Uploading image...</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Optional image to accompany the reading passage (e.g., charts, diagrams).
            </p>
          </div>
        )}

        {/* Listening Image - Only show for listening exam type */}
        {selectedType === 'listening' && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Listening Image (Optional)
            </label>
            <div className="space-y-3">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
              {imagePreview && (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-w-xs max-h-48 rounded-lg border border-gray-300"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              )}
              {uploadingImage && (
                <p className="text-blue-600 text-sm">Uploading image...</p>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Optional image to accompany the listening material (e.g., maps, diagrams, visual aids).
            </p>
          </div>
        )}

        {/* Difficulty and Time Limit */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Target Number of Questions
            </label>
            <select
              name="targetQuestions"
              value={formData.targetQuestions}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
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
            <p className="text-xs text-gray-500 mt-1">
              This is your target. You can add questions individually after creating the exam set.
            </p>
          </div>
        </div>

        {/* Example Info */}
        <div className={`bg-${currentTypeInfo.color}-50 dark:bg-${currentTypeInfo.color}-900/20 p-4 rounded-lg`}>
          <h4 className={`font-medium text-${currentTypeInfo.color}-800 dark:text-${currentTypeInfo.color}-200 mb-2`}>
            💡 Tips for Creating {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Exam Sets:
          </h4>
          <ul className={`text-sm text-${currentTypeInfo.color}-700 dark:text-${currentTypeInfo.color}-300 space-y-1`}>
            <li>• Use descriptive titles (e.g., "IELTS Academic {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)}", "TOEFL {selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Set A")</li>
            <li>• Beginner: 5-10 questions, Intermediate: 10-15 questions, Advanced: 15-20 questions</li>
            <li>• Recommended time limit: {currentTypeInfo.defaultTime} minutes for {selectedType}</li>
            <li>• After creating the exam set, you can add individual questions to it</li>
          </ul>
        </div>

        {/* Form Actions */}
        <div className="flex justify-between">
          <button
            type="button"
            onClick={() => navigate('/admin/exam-sets')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Creating...' : `Create ${selectedType.charAt(0).toUpperCase() + selectedType.slice(1)} Exam Set`}
          </button>
        </div>
      </form>
    </div>
  );
}