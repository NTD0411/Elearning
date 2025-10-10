import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

interface SpeakingQuestion {
  partNumber: number;
  partTitle: string;
  questionText: string;
  cueCardTopic?: string;
  cueCardPrompts?: string;
  timeLimit?: number;
}

interface ExamSet {
  examSetId: number;
  examSetTitle: string;
  examSetCode: string;
  totalQuestions: number;
  questionCount: number;
}

export default function SpeakingQuestionForm() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const examSetId = searchParams.get('examSetId');

  // State management
  const [loading, setLoading] = useState(false);
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [examSetsLoading, setExamSetsLoading] = useState(true);
  const [selectedExamSetId, setSelectedExamSetId] = useState<number | null>(
    examSetId ? parseInt(examSetId) : null
  );

  // Part configuration
  const [partConfig, setPartConfig] = useState({
    part1Count: 4,
    part2Count: 1,
    part3Count: 4
  });

  // Questions data
  const [questions, setQuestions] = useState<SpeakingQuestion[]>([]);
  const [currentStep, setCurrentStep] = useState<'config' | 'questions'>('config');

  // Fetch exam sets
  useEffect(() => {
    fetchExamSets();
  }, []);

  const fetchExamSets = async () => {
    try {
      setExamSetsLoading(true);
      
      // Try multiple possible backend URLs
      const possibleUrls = [
        'http://localhost:5074/api/ExamSet/speaking',
        'http://localhost:7074/api/ExamSet/speaking', 
        'https://localhost:7075/api/ExamSet/speaking'
      ];
      
      let response = null;
      let lastError = null;
      
      for (const url of possibleUrls) {
        try {
          console.log(`Trying to fetch from: ${url}`);
          response = await fetch(url);
          if (response.ok) {
            console.log(`Success with URL: ${url}`);
            break;
          }
        } catch (error) {
          console.log(`Failed with URL ${url}:`, error);
          lastError = error;
          continue;
        }
      }
      
      if (response && response.ok) {
        const data = await response.json();
        const formattedData = data.map((item: any) => ({
          examSetId: item.ExamSetId || item.examSetId,
          examSetTitle: item.ExamSetTitle || item.examSetTitle,
          examSetCode: item.ExamSetCode || item.examSetCode,
          totalQuestions: item.TotalQuestions || item.totalQuestions,
          questionCount: item.QuestionCount || item.questionCount || 0,
        }));
        setExamSets(formattedData);
      } else {
        console.error('All backend URLs failed. Last error:', lastError);
        setExamSets([]);
      }
    } catch (error) {
      console.error('Error fetching exam sets:', error);
      setExamSets([]);
    } finally {
      setExamSetsLoading(false);
    }
  };

  const initializeQuestions = () => {
    const newQuestions: SpeakingQuestion[] = [];

    // Part 1 questions
    for (let i = 1; i <= partConfig.part1Count; i++) {
      newQuestions.push({
        partNumber: 1,
        partTitle: 'Introduction & Interview',
        questionText: '',
        timeLimit: 5
      });
    }

    // Part 2 question (Cue Card)
    newQuestions.push({
      partNumber: 2,
      partTitle: 'Long Turn (Cue Card)',
      questionText: '',
      cueCardTopic: '',
      cueCardPrompts: '',
      timeLimit: 4
    });

    // Part 3 questions
    for (let i = 1; i <= partConfig.part3Count; i++) {
      newQuestions.push({
        partNumber: 3,
        partTitle: 'Discussion',
        questionText: '',
        timeLimit: 5
      });
    }

    setQuestions(newQuestions);
    setCurrentStep('questions');
  };

  const updateQuestion = (index: number, field: keyof SpeakingQuestion, value: string | number) => {
    setQuestions(prev => prev.map((q, i) => 
      i === index ? { ...q, [field]: value } : q
    ));
  };

  const handleSubmit = async () => {
    if (!selectedExamSetId) {
      alert('Please select an exam set');
      return;
    }

    setLoading(true);
    try {
      const promises = questions.map(question => 
        fetch('http://localhost:5074/api/SpeakingExam', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            examSetId: selectedExamSetId,
            questionText: question.questionText,
            partNumber: question.partNumber,
            partTitle: question.partTitle,
            cueCardTopic: question.cueCardTopic || null,
            cueCardPrompts: question.cueCardPrompts || null,
            timeLimit: question.timeLimit
          }),
        })
      );

      const results = await Promise.all(promises);
      const failedRequests = results.filter(r => !r.ok);

      if (failedRequests.length === 0) {
        alert(`Successfully created ${questions.length} speaking questions!`);
        // Reset form
        setCurrentStep('config');
        setQuestions([]);
        setSelectedExamSetId(null);
      } else {
        alert(`Created ${results.length - failedRequests.length}/${results.length} questions. Some failed.`);
      }
    } catch (error) {
      console.error('Error creating questions:', error);
      alert('Failed to create speaking questions');
    } finally {
      setLoading(false);
    }
  };

  if (currentStep === 'config') {
    return (
      <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.05]">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Create Speaking Questions - Configuration
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Configure the structure for your IELTS Speaking test
          </p>
        </div>
        
        <div className="p-6 space-y-6">
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
              <div className="space-y-3">
                <div className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-yellow-50 dark:bg-yellow-900/20 border-yellow-300">
                  <span className="text-yellow-700 dark:text-yellow-300">No exam sets available. Please create one first.</span>
                </div>
                <div className="flex space-x-2">
                  <button
                    type="button"
                    onClick={() => navigate('/admin/exam-sets/create')}
                    className="text-sm text-blue-600 hover:text-blue-800 underline"
                  >
                    → Create New Speaking Exam Set
                  </button>
                  <span className="text-gray-400">or</span>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExamSetId(-1); // Bypass exam set requirement for testing
                    }}
                    className="text-sm text-green-600 hover:text-green-800 underline"
                  >
                    Skip for Testing →
                  </button>
                </div>
              </div>
            ) : (
              <select
                value={selectedExamSetId || ''}
                onChange={(e) => setSelectedExamSetId(e.target.value ? parseInt(e.target.value) : null)}
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

          {/* Speaking Test Structure */}
          <div className="bg-purple-50 dark:bg-purple-900/20 p-6 rounded-lg border border-purple-200 dark:border-purple-700">
            <h4 className="text-lg font-semibold text-purple-800 dark:text-purple-200 mb-4">
              📢 IELTS Speaking Test Structure
            </h4>
            
            <div className="space-y-4">
              {/* Part 1 */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-purple-700 dark:text-purple-300">
                    🗣️ Part 1: Introduction & Interview (4-5 phút)
                  </h5>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Số câu hỏi:</label>
                    <select
                      value={partConfig.part1Count}
                      onChange={(e) => setPartConfig(prev => ({ ...prev, part1Count: parseInt(e.target.value) }))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {[3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Giới thiệu bản thân (name, hometown, work/study)</li>
                  <li>• Câu hỏi về đề tài quen thuộc (family, hobbies, food, etc.)</li>
                </ul>
              </div>

              {/* Part 2 */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-purple-700 dark:text-purple-300">
                    🎯 Part 2: Long Turn - Cue Card (3-4 phút)
                  </h5>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">1 cue card topic</span>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• 1 phút chuẩn bị với cue card</li>
                  <li>• 1-2 phút nói liên tục về chủ đề</li>
                  <li>• Chủ đề: memorable journey, person, event, etc.</li>
                </ul>
              </div>

              {/* Part 3 */}
              <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
                <div className="flex items-center justify-between mb-3">
                  <h5 className="font-medium text-purple-700 dark:text-purple-300">
                    💭 Part 3: Discussion (4-5 phút)
                  </h5>
                  <div className="flex items-center space-x-2">
                    <label className="text-sm text-gray-600">Số câu hỏi:</label>
                    <select
                      value={partConfig.part3Count}
                      onChange={(e) => setPartConfig(prev => ({ ...prev, part3Count: parseInt(e.target.value) }))}
                      className="px-2 py-1 border border-gray-300 rounded text-sm"
                    >
                      {[3, 4, 5, 6].map(num => (
                        <option key={num} value={num}>{num}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  <li>• Thảo luận mở rộng từ Part 2</li>
                  <li>• Câu hỏi trừu tượng, phân tích sâu</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-end">
            <button
              onClick={initializeQuestions}
              disabled={!selectedExamSetId}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continue to Create Questions →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Questions input step
  return (
    <div className="rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="px-6 py-4 border-b border-gray-200 dark:border-white/[0.05]">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Create Speaking Questions
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Total: {questions.length} questions ({partConfig.part1Count} + 1 + {partConfig.part3Count})
            </p>
          </div>
          <button
            onClick={() => setCurrentStep('config')}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
          >
            ← Back to Config
          </button>
        </div>
      </div>
      
      <div className="p-6 space-y-8">
        {/* Part 1 Questions */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300 border-b border-purple-200 pb-2">
            🗣️ Part 1: Introduction & Interview ({partConfig.part1Count} questions)
          </h4>
          {questions.filter(q => q.partNumber === 1).map((question, index) => {
            const realIndex = questions.findIndex(q => q === question);
            return (
              <div key={`part1-${index}`} className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg border border-purple-200">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question {index + 1} *
                </label>
                <textarea
                  value={question.questionText}
                  onChange={(e) => updateQuestion(realIndex, 'questionText', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., Do you work or study? / What kind of music do you like?"
                />
              </div>
            );
          })}
        </div>

        {/* Part 2 Question */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300 border-b border-purple-200 pb-2">
            🎯 Part 2: Long Turn - Cue Card (1 topic)
          </h4>
          {questions.filter(q => q.partNumber === 2).map((question, index) => {
            const realIndex = questions.findIndex(q => q === question);
            return (
              <div key={`part2-${index}`} className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg border border-orange-200 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cue Card Topic *
                  </label>
                  <input
                    type="text"
                    value={question.cueCardTopic || ''}
                    onChange={(e) => updateQuestion(realIndex, 'cueCardTopic', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="e.g., Describe a memorable journey you have taken"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Cue Card Prompts (bullet points) *
                  </label>
                  <textarea
                    value={question.cueCardPrompts || ''}
                    onChange={(e) => updateQuestion(realIndex, 'cueCardPrompts', e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="• Where you went&#10;• Who you went with&#10;• What you did there&#10;• And explain why it was memorable"
                  />
                </div>
              </div>
            );
          })}
        </div>

        {/* Part 3 Questions */}
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-purple-700 dark:text-purple-300 border-b border-purple-200 pb-2">
            💭 Part 3: Discussion ({partConfig.part3Count} questions)
          </h4>
          {questions.filter(q => q.partNumber === 3).map((question, index) => {
            const realIndex = questions.findIndex(q => q === question);
            return (
              <div key={`part3-${index}`} className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Question {index + 1} *
                </label>
                <textarea
                  value={question.questionText}
                  onChange={(e) => updateQuestion(realIndex, 'questionText', e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="e.g., How has travel changed compared to the past? / What are the advantages of traveling abroad?"
                />
              </div>
            );
          })}
        </div>

        {/* Form Actions */}
        <div className="flex justify-between border-t pt-6">
          <button
            type="button"
            onClick={() => setCurrentStep('config')}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            ← Back to Configuration
          </button>
          
          <div className="flex flex-col items-end">
            <button
              onClick={() => {
                console.log('Button clicked!');
                console.log('selectedExamSetId:', selectedExamSetId);
                console.log('questions.length:', questions.length);
                console.log('loading:', loading);
                handleSubmit();
              }}
              disabled={loading || !selectedExamSetId || questions.length === 0}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Questions...' : `Create ${questions.length} Speaking Questions`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}