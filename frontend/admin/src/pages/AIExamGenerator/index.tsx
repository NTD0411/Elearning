import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Sparkles, BookOpen, Headphones, PenTool, Mic } from 'lucide-react';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

interface GeneratorTab {
  id: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

const AIExamGenerator: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<string>('reading');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const tabs: GeneratorTab[] = [
    {
      id: 'reading',
      label: 'Reading',
      icon: <BookOpen className="w-5 h-5" />,
      description: 'Generate reading passages with comprehension questions',
    },
    {
      id: 'listening',
      label: 'Listening',
      icon: <Headphones className="w-5 h-5" />,
      description: 'Create listening scenarios with audio scripts',
    },
    {
      id: 'writing',
      label: 'Writing',
      icon: <PenTool className="w-5 h-5" />,
      description: 'Generate writing tasks (Task 1 & Task 2)',
    },
    {
      id: 'speaking',
      label: 'Speaking',
      icon: <Mic className="w-5 h-5" />,
      description: 'Create speaking test with Part 1, 2, and 3',
    },
  ];

  // Reading Form State
  const [readingForm, setReadingForm] = useState({
    topic: '',
    difficulty: 'Medium',
    numberOfQuestions: 10,
    examCourseId: null,
  });

  // Listening Form State
  const [listeningForm, setListeningForm] = useState({
    topic: '',
    difficulty: 'Medium',
    numberOfQuestions: 10,
    examCourseId: null,
  });

  // Writing Form State
  const [writingForm, setWritingForm] = useState({
    topic: '',
    difficulty: 'Medium',
    essayType: 'Opinion',
    examCourseId: null,
  });

  // Speaking Form State
  const [speakingForm, setSpeakingForm] = useState({
    topic: '',
    difficulty: 'Medium',
    examCourseId: null,
  });

  const handleGenerateReading = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5074/api/AIExamGenerator/generate-reading', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(readingForm),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        alert(`✅ Reading exam generated successfully!\nExam Set ID: ${data.examSet.examSetId}\nCode: ${data.examSet.examSetCode}`);
      }
    } catch (error) {
      console.error('Error generating reading exam:', error);
      alert('❌ Error generating reading exam');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateListening = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5074/api/AIExamGenerator/generate-listening', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(listeningForm),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        alert(`✅ Listening exam generated successfully!\nExam Set ID: ${data.examSet.examSetId}\nCode: ${data.examSet.examSetCode}\n\n⚠️ Don't forget to upload the audio file!`);
      }
    } catch (error) {
      console.error('Error generating listening exam:', error);
      alert('❌ Error generating listening exam');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateWriting = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5074/api/AIExamGenerator/generate-writing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(writingForm),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        alert(`✅ Writing exam generated successfully!\nExam Set ID: ${data.examSet.examSetId}\nCode: ${data.examSet.examSetCode}`);
      }
    } catch (error) {
      console.error('Error generating writing exam:', error);
      alert('❌ Error generating writing exam');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateSpeaking = async () => {
    setLoading(true);
    setResult(null);
    
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5074/api/AIExamGenerator/generate-speaking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(speakingForm),
      });

      const data = await response.json();
      setResult(data);
      
      if (data.success) {
        alert(`✅ Speaking exam generated successfully!\nExam Set ID: ${data.examSet.examSetId}\nCode: ${data.examSet.examSetCode}`);
      }
    } catch (error) {
      console.error('Error generating speaking exam:', error);
      alert('❌ Error generating speaking exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageBreadcrumb pageTitle="AI Exam Generator" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        {/* Header */}
        <div className="border-b border-stroke px-6.5 py-4 dark:border-strokedark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center justify-center rounded-md border border-stroke p-2 hover:bg-gray-2 dark:border-strokedark dark:hover:bg-meta-4"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h3 className="font-semibold text-black dark:text-white flex items-center gap-2">
                  <Sparkles className="w-6 h-6 text-primary" />
                  AI Exam Generator
                </h3>
                <p className="text-sm text-body">
                  Automatically generate IELTS exams for all 4 skills using AI
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-stroke px-6.5 dark:border-strokedark">
          <div className="flex gap-2 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-primary border-b-2 border-primary'
                    : 'text-body hover:text-primary'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6.5">
          {/* Reading Tab */}
          {activeTab === 'reading' && (
            <div className="space-y-5">
              <div className="rounded-md bg-primary bg-opacity-10 p-4">
                <p className="text-sm text-primary">
                  <Sparkles className="inline w-4 h-4 mr-1" />
                  {tabs.find((t) => t.id === 'reading')?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Topic <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Climate Change, Technology, Education"
                    value={readingForm.topic}
                    onChange={(e) =>
                      setReadingForm({ ...readingForm, topic: e.target.value })
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Difficulty Level
                  </label>
                  <select
                    value={readingForm.difficulty}
                    onChange={(e) =>
                      setReadingForm({ ...readingForm, difficulty: e.target.value })
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="Easy">Easy (Band 5-6)</option>
                    <option value="Medium">Medium (Band 6-7)</option>
                    <option value="Hard">Hard (Band 7-8)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="20"
                    value={readingForm.numberOfQuestions}
                    onChange={(e) =>
                      setReadingForm({
                        ...readingForm,
                        numberOfQuestions: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateReading}
                disabled={loading || !readingForm.topic}
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-5 h-5" />
                    Generate Reading Exam
                  </>
                )}
              </button>
            </div>
          )}

          {/* Listening Tab */}
          {activeTab === 'listening' && (
            <div className="space-y-5">
              <div className="rounded-md bg-primary bg-opacity-10 p-4">
                <p className="text-sm text-primary">
                  <Sparkles className="inline w-4 h-4 mr-1" />
                  {tabs.find((t) => t.id === 'listening')?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Topic <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Travel, University Life, Job Interview"
                    value={listeningForm.topic}
                    onChange={(e) =>
                      setListeningForm({ ...listeningForm, topic: e.target.value })
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Difficulty Level
                  </label>
                  <select
                    value={listeningForm.difficulty}
                    onChange={(e) =>
                      setListeningForm({ ...listeningForm, difficulty: e.target.value })
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="Easy">Easy (Band 5-6)</option>
                    <option value="Medium">Medium (Band 6-7)</option>
                    <option value="Hard">Hard (Band 7-8)</option>
                  </select>
                </div>

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Number of Questions
                  </label>
                  <input
                    type="number"
                    min="5"
                    max="20"
                    value={listeningForm.numberOfQuestions}
                    onChange={(e) =>
                      setListeningForm({
                        ...listeningForm,
                        numberOfQuestions: parseInt(e.target.value),
                      })
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>
              </div>

              <button
                onClick={handleGenerateListening}
                disabled={loading || !listeningForm.topic}
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-5 h-5" />
                    Generate Listening Exam
                  </>
                )}
              </button>
            </div>
          )}

          {/* Writing Tab */}
          {activeTab === 'writing' && (
            <div className="space-y-5">
              <div className="rounded-md bg-primary bg-opacity-10 p-4">
                <p className="text-sm text-primary">
                  <Sparkles className="inline w-4 h-4 mr-1" />
                  {tabs.find((t) => t.id === 'writing')?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Topic <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Environment, Social Issues, Technology"
                    value={writingForm.topic}
                    onChange={(e) =>
                      setWritingForm({ ...writingForm, topic: e.target.value })
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Difficulty Level
                  </label>
                  <select
                    value={writingForm.difficulty}
                    onChange={(e) =>
                      setWritingForm({ ...writingForm, difficulty: e.target.value })
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="Easy">Easy (Band 5-6)</option>
                    <option value="Medium">Medium (Band 6-7)</option>
                    <option value="Hard">Hard (Band 7-8)</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="mb-2.5 block text-black dark:text-white">
                    Essay Type (Task 2)
                  </label>
                  <select
                    value={writingForm.essayType}
                    onChange={(e) =>
                      setWritingForm({ ...writingForm, essayType: e.target.value })
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="Opinion">Opinion Essay</option>
                    <option value="Discussion">Discussion Essay</option>
                    <option value="Problem-Solution">Problem-Solution</option>
                    <option value="Advantages-Disadvantages">
                      Advantages & Disadvantages
                    </option>
                    <option value="Two-part Question">Two-part Question</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateWriting}
                disabled={loading || !writingForm.topic}
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-5 h-5" />
                    Generate Writing Exam
                  </>
                )}
              </button>
            </div>
          )}

          {/* Speaking Tab */}
          {activeTab === 'speaking' && (
            <div className="space-y-5">
              <div className="rounded-md bg-primary bg-opacity-10 p-4">
                <p className="text-sm text-primary">
                  <Sparkles className="inline w-4 h-4 mr-1" />
                  {tabs.find((t) => t.id === 'speaking')?.description}
                </p>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Main Topic <span className="text-meta-1">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., Hobbies, Travel, Work, Education"
                    value={speakingForm.topic}
                    onChange={(e) =>
                      setSpeakingForm({ ...speakingForm, topic: e.target.value })
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  />
                </div>

                <div>
                  <label className="mb-2.5 block text-black dark:text-white">
                    Difficulty Level
                  </label>
                  <select
                    value={speakingForm.difficulty}
                    onChange={(e) =>
                      setSpeakingForm({ ...speakingForm, difficulty: e.target.value })
                    }
                    className="w-full rounded border-[1.5px] border-stroke bg-transparent px-5 py-3 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  >
                    <option value="Easy">Easy (Band 5-6)</option>
                    <option value="Medium">Medium (Band 6-7)</option>
                    <option value="Hard">Hard (Band 7-8)</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerateSpeaking}
                disabled={loading || !speakingForm.topic}
                className="flex w-full justify-center rounded bg-primary p-3 font-medium text-gray hover:bg-opacity-90 disabled:bg-opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 w-5 h-5" />
                    Generate Speaking Exam
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className="mt-6 rounded-md border border-stroke p-4 dark:border-strokedark">
              <h4 className="mb-3 font-semibold text-black dark:text-white">
                Generation Result
              </h4>
              <pre className="overflow-auto rounded bg-gray-2 p-4 text-sm dark:bg-meta-4">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AIExamGenerator;
