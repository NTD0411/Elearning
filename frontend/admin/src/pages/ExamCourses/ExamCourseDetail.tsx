import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import ComponentCard from "../../components/common/ComponentCard";
import PageMeta from "../../components/common/PageMeta";

interface ExamSet {
  examSetId: number;
  examSetTitle: string;
  examSetCode: string;
  totalQuestions: number;
  questionCount: number;
  readingContext?: string;
  readingImage?: string;
  listeningImage?: string;
}

interface Question {
  questionId: number;
  questionText: string;
  questionOrder: number;
  questionType?: string;
  options?: string[];
  correctAnswer?: string;
  points?: number;
  examSetTitle?: string;
  examSetCode?: string;
  readingContext?: string;
  readingImage?: string;
  listeningImage?: string;
  audioUrl?: string; // Add audio URL for listening
}

interface ExamCourseDetail {
  examCourseId: number;
  courseTitle: string;
  courseCode: string;
  description: string;
  examType: string;
  createdAt: string;
  readingExamSets: ExamSet[];
  listeningExamSets: ExamSet[];
  speakingExamSets: ExamSet[];
  writingExamSets: ExamSet[];
}

export default function ExamCourseDetail() {
  const { id } = useParams<{ id: string }>();
  const [examCourse, setExamCourse] = useState<ExamCourseDetail | null>(null);
  const [allQuestions, setAllQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Helper function to construct media URLs
  const getMediaUrl = (path: string | undefined): string => {
    if (!path) return '';
    
    // If path already starts with http, return as is
    if (path.startsWith('http')) return path;
    
    // If path starts with /, prepend base URL
    if (path.startsWith('/')) {
      return `http://localhost:5074${path}`;
    }
    
    // If path doesn't start with /, assume it needs /uploads/ prefix
    // Check if it already contains 'uploads'
    if (path.includes('uploads/')) {
      return `http://localhost:5074/${path}`;
    }
    
    return `http://localhost:5074/uploads/${path}`;
  };

  useEffect(() => {
    fetchExamCourse();
  }, [id]);

  const fetchExamCourse = async () => {
    try {
      const response = await fetch(`http://localhost:5074/api/ExamCourse/${id}`);
      if (response.ok) {
        const data = await response.json();
        setExamCourse(data);
        // Automatically load all questions when course is loaded
        await loadAllQuestions(data);
      } else {
        console.error('Failed to fetch exam course');
      }
    } catch (error) {
      console.error('Error fetching exam course:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAllQuestions = async (courseData: ExamCourseDetail) => {
    setLoadingQuestions(true);
    try {
      const examSets = getExamSets(courseData);
      const allQuestionsPromises = examSets.map((examSet: ExamSet) => 
        fetchQuestionsForExamSet(examSet, courseData.examType)
      );
      
      const questionsBySet = await Promise.all(allQuestionsPromises);
      
      // Flatten and sort all questions
      const flatQuestions = questionsBySet.flat().sort((a: any, b: any) => {
        // First sort by exam set, then by question order
        if (a.examSetCode !== b.examSetCode) {
          return a.examSetCode!.localeCompare(b.examSetCode!);
        }
        return a.questionOrder - b.questionOrder;
      });
      
      setAllQuestions(flatQuestions);
    } catch (error) {
      console.error('Error loading all questions:', error);
      setAllQuestions([]);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const fetchQuestionsForExamSet = async (examSet: ExamSet, examType: string): Promise<Question[]> => {
    try {
      let endpoint = '';
      switch (examType.toLowerCase()) {
        case 'reading':
          endpoint = `http://localhost:5074/api/ReadingExam/examset/${examSet.examSetId}`;
          break;
        case 'listening':
          endpoint = `http://localhost:5074/api/ListeningExam/examset/${examSet.examSetId}`;
          break;
        case 'speaking':
          endpoint = `http://localhost:5074/api/SpeakingExam/examset/${examSet.examSetId}`;
          break;
        case 'writing':
          endpoint = `http://localhost:5074/api/WritingExam/examset/${examSet.examSetId}`;
          break;
        default:
          return [];
      }

      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        
        // Debug: Log the raw data for listening exams
        if (examType.toLowerCase() === 'listening') {
          console.log('Raw listening exam data:', data);
          console.log('ExamSet data:', examSet);
        }
        
        // Add exam set info to each question
        return data.map((question: Question) => {
          const processedQuestion = {
            ...question,
            examSetTitle: examSet.examSetTitle,
            examSetCode: examSet.examSetCode,
            readingContext: examSet.readingContext,
            readingImage: examSet.readingImage,
            // For listening, prioritize question-level image, fallback to examSet image
            listeningImage: question.listeningImage || examSet.listeningImage,
            // audioUrl should come from individual question data for listening
          };
          
          // Debug: Log processed question for listening
          if (examType.toLowerCase() === 'listening') {
            console.log('Processed listening question:', processedQuestion);
            console.log('Question listeningImage:', question.listeningImage);
            console.log('ExamSet listeningImage:', examSet.listeningImage);
            console.log('Final listeningImage:', processedQuestion.listeningImage);
          }
          
          return processedQuestion;
        });
      } else {
        console.error(`Failed to fetch questions for exam set ${examSet.examSetId}`);
        return [];
      }
    } catch (error) {
      console.error(`Error fetching questions for exam set ${examSet.examSetId}:`, error);
      return [];
    }
  };

  const getExamSets = (courseData?: ExamCourseDetail) => {
    const data = courseData || examCourse;
    if (!data) return [];
    
    switch (data.examType.toLowerCase()) {
      case 'reading':
        return data.readingExamSets;
      case 'listening':
        return data.listeningExamSets;
      case 'speaking':
        return data.speakingExamSets;
      case 'writing':
        return data.writingExamSets;
      default:
        return [];
    }
  };

  const getTypeColor = (type: string) => {
    const colors = {
      reading: 'blue',
      listening: 'green',
      speaking: 'purple',
      writing: 'orange'
    };
    return colors[type.toLowerCase() as keyof typeof colors] || 'gray';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!examCourse) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Exam Course not found</h2>
        <Link to="/exam-courses/view" className="mt-4 inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Back to Exam Courses
        </Link>
      </div>
    );
  }

  const examSets = getExamSets();
  const typeColor = getTypeColor(examCourse.examType);

  return (
    <>
      <PageMeta
        title={`${examCourse.courseTitle} | Exam Course Detail`}
        description={`View details and questions for ${examCourse.courseTitle}`}
      />
      <PageBreadcrumb pageTitle="Exam Course Detail" />
      
      <div className="space-y-6">
        {/* Course Info */}
        <ComponentCard title="Course Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {examCourse.courseTitle}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-4">
                {examCourse.courseCode}
              </p>
              <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-${typeColor}-100 text-${typeColor}-800 dark:bg-${typeColor}-900 dark:text-${typeColor}-200`}>
                {examCourse.examType.charAt(0).toUpperCase() + examCourse.examType.slice(1)} Course
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                {examCourse.description || 'No description provided'}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Created: {new Date(examCourse.createdAt).toLocaleDateString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Total Questions: {allQuestions.length} from {examSets.length} exam sets
              </p>
            </div>
          </div>
        </ComponentCard>

        {/* All Questions */}
        <ComponentCard title={`All Questions (${allQuestions.length})`}>
          {/* Debug: Check listening images */}
          {examCourse.examType.toLowerCase() === 'listening' && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <h5 className="font-medium text-yellow-800 mb-2">Listening Images Debug:</h5>
              <div className="text-sm text-yellow-700">
                <div>Total questions: {allQuestions.length}</div>
                <div>Questions with listening images: {allQuestions.filter(q => q.listeningImage).length}</div>
                <div>Questions with reading images: {allQuestions.filter(q => q.readingImage).length}</div>
                <button 
                  onClick={() => {
                    console.log('All questions:', allQuestions);
                    const questionsWithListeningImages = allQuestions.filter(q => q.listeningImage);
                    console.log('Questions with listening images:', questionsWithListeningImages);
                    alert(`Found ${questionsWithListeningImages.length} questions with listening images. Check console for details.`);
                  }}
                  className="mt-2 bg-yellow-600 text-white px-3 py-1 rounded text-sm hover:bg-yellow-700"
                >
                  Debug Questions Data
                </button>
              </div>
            </div>
          )}
          
          {loadingQuestions ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <span className="ml-2">Loading all questions...</span>
            </div>
          ) : allQuestions.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No questions found in this exam course.
            </div>
          ) : (
            <div className="space-y-6">
              {allQuestions.map((question, globalIndex) => (
                <div key={`${question.examSetCode}-${question.questionId}`} className="border border-gray-200 rounded-lg dark:border-gray-600 overflow-hidden">
                  {/* Question Header */}
                  <div className={`bg-${typeColor}-50 dark:bg-${typeColor}-900/20 px-4 py-3 border-b border-gray-200 dark:border-gray-600`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 text-sm font-medium rounded bg-${typeColor}-100 text-${typeColor}-800 dark:bg-${typeColor}-900 dark:text-${typeColor}-200`}>
                          Question {globalIndex + 1}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          from {question.examSetTitle} ({question.examSetCode})
                        </span>
                      </div>
                      {question.points && (
                        <span className="text-sm text-gray-500">
                          {question.points} points
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="p-4 space-y-4">
                    {/* Context (for Reading) */}
                    {question.readingContext && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Reading Context:</h4>
                        <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                          {question.readingContext}
                        </div>
                      </div>
                    )}

                    {/* Audio (for Listening) */}
                    {question.audioUrl && (
                      <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Audio:</h4>
                        <div className="space-y-3">
                          <audio 
                            controls 
                            className="w-full max-w-md"
                            preload="metadata"
                                onError={() => {
                                  console.error('Audio failed to load:', question.audioUrl);
                                  console.error('Full URL:', getMediaUrl(question.audioUrl));
                                }}
                            onLoadStart={() => {
                              console.log('Audio loading:', getMediaUrl(question.audioUrl));
                            }}
                          >
                            <source src={getMediaUrl(question.audioUrl)} type="audio/mpeg" />
                            <source src={getMediaUrl(question.audioUrl)} type="audio/mp3" />
                            <source src={getMediaUrl(question.audioUrl)} type="audio/wav" />
                            <source src={getMediaUrl(question.audioUrl)} type="audio/ogg" />
                            Your browser does not support the audio element.
                          </audio>
                          
                          {/* Debug info */}
                          <details className="text-xs text-gray-500">
                            <summary className="cursor-pointer hover:text-gray-700">Debug Info</summary>
                            <div className="mt-2 space-y-1 bg-gray-100 dark:bg-gray-700 p-2 rounded">
                              <div>Original URL: {question.audioUrl}</div>
                              <div>Full URL: {getMediaUrl(question.audioUrl)}</div>
                              <div>File exists check: 
                                <a 
                                  href={getMediaUrl(question.audioUrl)} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:underline ml-1"
                                >
                                  Test Direct Link
                                </a>
                              </div>
                              <div>
                                <button 
                                  onClick={() => {
                                    const audio = new Audio(getMediaUrl(question.audioUrl));
                                    audio.play().catch(err => {
                                      console.error('Audio play failed:', err);
                                      alert('Audio play failed: ' + err.message);
                                    });
                                  }}
                                  className="bg-blue-500 text-white px-2 py-1 rounded text-xs hover:bg-blue-600"
                                >
                                  Test Audio Play
                                </button>
                              </div>
                            </div>
                          </details>
                        </div>
                      </div>
                    )}

                    {/* Images - Show ExamSet level images */}
                    {(question.readingImage || question.listeningImage || 
                      (examCourse.examType.toLowerCase() === 'listening' && examSets.length > 0 && examSets[0].listeningImage)) && (
                      <div className="space-y-2">
                        <h4 className="font-medium text-gray-900 dark:text-white">Image:</h4>
                        
                        {/* Debug: Show which images are available */}
                        <div className="text-xs text-gray-400 mb-2">
                          Available images: 
                          {question.readingImage && <span className="bg-blue-100 px-1 rounded">Reading</span>}
                          {question.listeningImage && <span className="bg-green-100 px-1 rounded ml-1">Listening (Question)</span>}
                          {examCourse.examType.toLowerCase() === 'listening' && examSets.length > 0 && examSets[0].listeningImage && 
                            <span className="bg-purple-100 px-1 rounded ml-1">Listening (ExamSet)</span>}
                          {!question.readingImage && !question.listeningImage && 
                           !(examCourse.examType.toLowerCase() === 'listening' && examSets.length > 0 && examSets[0].listeningImage) && 
                           <span className="text-red-500">None</span>}
                          {/* Debug info */}
                          <div className="mt-1 text-xs">
                            <div>Reading: {question.readingImage || 'null'}</div>
                            <div>Listening (Question): {question.listeningImage || 'null'}</div>
                            {examCourse.examType.toLowerCase() === 'listening' && examSets.length > 0 && (
                              <div>Listening (ExamSet): {examSets[0].listeningImage || 'null'}</div>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap gap-4">
                          {question.readingImage && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <img 
                                src={getMediaUrl(question.readingImage)}
                                alt="Reading context image"
                                className="max-w-md max-h-64 object-contain"
                                onError={(e) => {
                                  console.error('Image failed to load:', question.readingImage);
                                  console.error('Full URL:', getMediaUrl(question.readingImage));
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', getMediaUrl(question.readingImage));
                                }}
                              />
                              <div className="p-2 bg-gray-50 text-xs text-gray-500">
                                <details>
                                  <summary className="cursor-pointer">Image Debug</summary>
                                  <div className="mt-1 space-y-1">
                                    <div>Original: {question.readingImage}</div>
                                    <div>Full URL: {getMediaUrl(question.readingImage)}</div>
                                    <div>
                                      <button 
                                        onClick={() => {
                                          window.open(getMediaUrl(question.readingImage), '_blank');
                                        }}
                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 mr-2"
                                      >
                                        Open in New Tab
                                      </button>
                                      <button 
                                        onClick={() => {
                                          fetch(getMediaUrl(question.readingImage))
                                            .then(response => {
                                              console.log('Image fetch response:', response);
                                              if (response.ok) {
                                                alert('✅ Image accessible!');
                                              } else {
                                                alert('❌ Image not accessible: ' + response.status);
                                              }
                                            })
                                            .catch(err => {
                                              console.error('Image fetch error:', err);
                                              alert('❌ Image fetch error: ' + err.message);
                                            });
                                        }}
                                        className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
                                      >
                                        Test Access
                                      </button>
                                    </div>
                                  </div>
                                </details>
                              </div>
                            </div>
                          )}
                          {question.listeningImage && (
                            <div className="border border-gray-200 rounded-lg overflow-hidden">
                              <img 
                                src={getMediaUrl(question.listeningImage)}
                                alt="Listening context image"
                                className="max-w-md max-h-64 object-contain"
                                onError={(e) => {
                                  console.error('Image failed to load:', question.listeningImage);
                                  console.error('Full URL:', getMediaUrl(question.listeningImage));
                                  e.currentTarget.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZGRkIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=';
                                }}
                                onLoad={() => {
                                  console.log('Image loaded successfully:', getMediaUrl(question.listeningImage));
                                }}
                              />
                              <div className="p-2 bg-gray-50 text-xs text-gray-500">
                                <details>
                                  <summary className="cursor-pointer">Image Debug</summary>
                                  <div className="mt-1 space-y-1">
                                    <div>Original: {question.listeningImage}</div>
                                    <div>Full URL: {getMediaUrl(question.listeningImage)}</div>
                                    <div>
                                      <button 
                                        onClick={() => {
                                          window.open(getMediaUrl(question.listeningImage), '_blank');
                                        }}
                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 mr-2"
                                      >
                                        Open in New Tab
                                      </button>
                                      <button 
                                        onClick={() => {
                                          fetch(getMediaUrl(question.listeningImage))
                                            .then(response => {
                                              console.log('Image fetch response:', response);
                                              if (response.ok) {
                                                alert('✅ Image accessible!');
                                              } else {
                                                alert('❌ Image not accessible: ' + response.status);
                                              }
                                            })
                                            .catch(err => {
                                              console.error('Image fetch error:', err);
                                              alert('❌ Image fetch error: ' + err.message);
                                            });
                                        }}
                                        className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
                                      >
                                        Test Access
                                      </button>
                                    </div>
                                  </div>
                                </details>
                              </div>
                            </div>
                          )}
                          
                          {/* Show ExamSet listening image if no question image */}
                          {!question.listeningImage && 
                           examCourse.examType.toLowerCase() === 'listening' && 
                           examSets.length > 0 && 
                           examSets[0].listeningImage && (
                            <div className="border border-purple-200 rounded-lg overflow-hidden">
                              <div className="bg-purple-50 px-2 py-1 text-xs text-purple-600 font-medium">
                                ExamSet Image (shared for all questions)
                              </div>
                              <img 
                                src={getMediaUrl(examSets[0].listeningImage)}
                                alt="Listening ExamSet image"
                                className="max-w-md max-h-64 object-contain"
                                onError={() => {
                                  console.error('ExamSet image failed to load:', examSets[0].listeningImage);
                                  console.error('Full URL:', getMediaUrl(examSets[0].listeningImage));
                                }}
                                onLoad={() => {
                                  console.log('ExamSet image loaded successfully:', getMediaUrl(examSets[0].listeningImage));
                                }}
                              />
                              <div className="p-2 bg-gray-50 text-xs text-gray-500">
                                <details>
                                  <summary className="cursor-pointer">ExamSet Image Debug</summary>
                                  <div className="mt-1 space-y-1">
                                    <div>ExamSet Image: {examSets[0].listeningImage}</div>
                                    <div>Full URL: {getMediaUrl(examSets[0].listeningImage)}</div>
                                    <div>
                                      <button 
                                        onClick={() => {
                                          window.open(getMediaUrl(examSets[0].listeningImage), '_blank');
                                        }}
                                        className="bg-green-500 text-white px-2 py-1 rounded text-xs hover:bg-green-600 mr-2"
                                      >
                                        Open in New Tab
                                      </button>
                                      <button 
                                        onClick={() => {
                                          fetch(getMediaUrl(examSets[0].listeningImage))
                                            .then(response => {
                                              console.log('ExamSet image fetch response:', response);
                                              if (response.ok) {
                                                alert('✅ ExamSet image accessible!');
                                              } else {
                                                alert('❌ ExamSet image not accessible: ' + response.status);
                                              }
                                            })
                                            .catch(err => {
                                              console.error('ExamSet image fetch error:', err);
                                              alert('❌ ExamSet image fetch error: ' + err.message);
                                            });
                                        }}
                                        className="bg-orange-500 text-white px-2 py-1 rounded text-xs hover:bg-orange-600"
                                      >
                                        Test Access
                                      </button>
                                    </div>
                                  </div>
                                </details>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Question Text */}
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white mb-2">Question:</h4>
                      <p className="text-gray-700 dark:text-gray-300">
                        {question.questionText}
                      </p>
                    </div>

                    {/* Options */}
                    {question.options && question.options.length > 0 && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Options:</h4>
                        <div className="space-y-2">
                          {question.options.map((option, optIndex) => (
                            <div key={optIndex} className="flex items-start gap-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
                              <span className="text-sm font-mono text-gray-500 min-w-[20px]">
                                {String.fromCharCode(65 + optIndex)}.
                              </span>
                              <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">
                                {option}
                              </span>
                              {question.correctAnswer === option && (
                                <span className="text-green-600 dark:text-green-400 text-xs font-medium px-2 py-1 bg-green-100 dark:bg-green-900 rounded">
                                  ✓ Correct
                                </span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Correct Answer (if no options) */}
                    {question.correctAnswer && (!question.options || question.options.length === 0) && (
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-white mb-2">Correct Answer:</h4>
                        <div className="p-2 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded">
                          <span className="text-green-700 dark:text-green-300 font-medium">
                            {question.correctAnswer}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </ComponentCard>

        {/* Back Button */}
        <div className="flex justify-start">
          <Link
            to="/exam-courses/view"
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
          >
            ← Back to Exam Courses
          </Link>
        </div>
      </div>
    </>
  );
}