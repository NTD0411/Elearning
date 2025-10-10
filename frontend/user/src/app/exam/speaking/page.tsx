'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';

interface SpeakingQuestion {
  speakingExamId: number;
  questionText: string;
  partNumber: number;
  partTitle: string;
  cueCardTopic?: string;
  cueCardPrompts?: string;
  timeLimit: number;
}

interface ExamSet {
  examSetId: number;
  title: string;
  description: string;
}

export default function SpeakingExam() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const examSetId = searchParams.get('examSetId');
  const courseId = searchParams.get('courseId');
  
  const [examSet, setExamSet] = useState<ExamSet | null>(null);
  const [questions, setQuestions] = useState<SpeakingQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [currentPart, setCurrentPart] = useState(1);
  const [recordings, setRecordings] = useState<{ [key: number]: Blob }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const recordingQuestionIndexRef = useRef<number>(0);
  const recordingSavePromiseRef = useRef<((value: void) => void) | null>(null);

  useEffect(() => {
    if (examSetId || courseId) {
      fetchExamData();
    }
  }, [examSetId, courseId]);

  useEffect(() => {
    if (hasStarted && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleTimeUp();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [hasStarted, timeLeft]);

  const fetchExamData = async () => {
    try {
      setIsLoading(true);
      
      let actualExamSetId = examSetId;
      
      // If we have courseId instead of examSetId, get the first speaking exam set for this course
      if (courseId && !examSetId) {
        // For now, we'll use a default examSetId. In a real app, you'd fetch exam sets by course
        actualExamSetId = '2'; // Default speaking exam set
      }
      
      if (!actualExamSetId) {
        throw new Error('No exam set ID available');
      }
      
      // Fetch exam set details
      const examSetResponse = await fetch(`http://localhost:5074/api/ExamSet/Speaking/${actualExamSetId}`);
      if (examSetResponse.ok) {
        const examSetData = await examSetResponse.json();
        setExamSet(examSetData);
      }

      // Fetch questions
      const questionsResponse = await fetch(`http://localhost:5074/api/SpeakingExam/examset/${actualExamSetId}`);
      if (questionsResponse.ok) {
        const questionsData = await questionsResponse.json();
        const sortedQuestions = questionsData.sort((a: SpeakingQuestion, b: SpeakingQuestion) => {
          // Sort by part first, then by question ID
          if (a.partNumber !== b.partNumber) {
            return a.partNumber - b.partNumber;
          }
          return a.speakingExamId - b.speakingExamId;
        });
        setQuestions(sortedQuestions);
        
        if (sortedQuestions.length > 0) {
          setTimeLeft(sortedQuestions[0].timeLimit * 60); // Convert minutes to seconds
          setCurrentPart(sortedQuestions[0].partNumber);
        }
      }
    } catch (error) {
      console.error('Error fetching exam data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async (questionIndex?: number) => {
    const currentIndex = questionIndex !== undefined ? questionIndex : currentQuestionIndex;
    recordingQuestionIndexRef.current = currentIndex;
    console.log(`Starting recording for question ${currentIndex} (stored in ref: ${recordingQuestionIndexRef.current})`);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
          console.log(`Audio data chunk received for question ${recordingQuestionIndexRef.current}, size: ${event.data.size}`);
        }
      };

      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const questionIndex = recordingQuestionIndexRef.current; // Use ref value
        console.log(`Recording stopped and saved for question ${questionIndex}, size: ${audioBlob.size} bytes`);
        setRecordings(prev => {
          const newRecordings = {
            ...prev,
            [questionIndex]: audioBlob
          };
          console.log('Updated recordings:', Object.keys(newRecordings).map(k => `Q${k}`).join(', '));
          console.log('Recordings object:', newRecordings);
          
          // Resolve the promise when recording is saved
          if (recordingSavePromiseRef.current) {
            recordingSavePromiseRef.current();
            recordingSavePromiseRef.current = null;
          }
          
          return newRecordings;
        });
        
        // Stop all tracks to release microphone
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorderRef.current.start();
      setIsRecording(true);
      console.log(`MediaRecorder started for question ${currentQuestionIndex}`);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Unable to access microphone. Please check your browser permissions.');
    }
  };

  const stopRecording = () => {
    console.log(`Attempting to stop recording for question ${currentQuestionIndex}, isRecording: ${isRecording}`);
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      console.log(`Recording stopped for question ${currentQuestionIndex}`);
    } else {
      console.log(`No active recording to stop for question ${currentQuestionIndex}`);
    }
  };

  const handleTimeUp = async () => {
    console.log(`Time up for question ${currentQuestionIndex}`);
    if (isRecording) {
      console.log(`Stopping recording due to time up for question ${currentQuestionIndex}`);
      stopRecording();
    }
    
    // Auto advance to next question or finish exam
    if (currentQuestionIndex < questions.length - 1) {
      console.log(`Auto advancing to next question`);
      await nextQuestion();
    } else {
      console.log(`Time up on last question, finishing exam`);
      await finishExam();
    }
  };

  const nextQuestion = async () => {
    console.log(`Moving from question ${currentQuestionIndex} to ${currentQuestionIndex + 1}`);
    console.log(`Current recordings before next:`, Object.keys(recordings));
    
    setIsTransitioning(true);
    
    if (isRecording) {
      console.log(`Stopping recording for question ${currentQuestionIndex}`);
      
      // Create a promise that resolves when recording is saved
      const recordingSaved = new Promise<void>((resolve) => {
        recordingSavePromiseRef.current = resolve;
      });
      
      stopRecording();
      
      // Wait for recording to be saved
      console.log(`Waiting for recording ${currentQuestionIndex} to be saved...`);
      await recordingSaved;
      console.log(`Recording ${currentQuestionIndex} saved successfully`);
    }

    const nextIndex = currentQuestionIndex + 1;
    if (nextIndex < questions.length) {
      setCurrentQuestionIndex(nextIndex);
      setTimeLeft(questions[nextIndex].timeLimit * 60);
      setCurrentPart(questions[nextIndex].partNumber);
      setIsPaused(false);
      
      console.log(`Starting question ${nextIndex}, starting recording immediately`);
      console.log(`Question details:`, questions[nextIndex]);
      console.log(`All question indices:`, questions.map((q, i) => ({ index: i, id: q.speakingExamId, partNumber: q.partNumber })));
      // Start recording immediately for next question
      setTimeout(() => {
        console.log(`Starting recording for question ${nextIndex}`);
        startRecording(nextIndex); // Pass the correct index
        setIsTransitioning(false);
      }, 300); // Minimal delay just for UI update
    } else {
      console.log(`Reached end of exam, finishing...`);
      setIsTransitioning(false);
      finishExam();
    }
  };

  const startExam = () => {
    setHasStarted(true);
    startRecording(0); // Start with question 0
  };

  const pauseResume = () => {
    if (isPaused) {
      setIsPaused(false);
      if (!isRecording) {
        startRecording(currentQuestionIndex); // Use current question index
      }
    } else {
      setIsPaused(true);
      if (isRecording) {
        stopRecording();
      }
    }
  };

  const finishExam = async () => {
    console.log('Finishing exam, current recording state:', isRecording);
    
    if (isRecording) {
      console.log('Stopping final recording for question', currentQuestionIndex);
      
      // Create a promise that resolves when final recording is saved
      const finalRecordingSaved = new Promise<void>((resolve) => {
        recordingSavePromiseRef.current = resolve;
      });
      
      stopRecording();
      
      // Wait for final recording to be saved
      console.log('Waiting for final recording to be saved...');
      await finalRecordingSaved;
      console.log('Final recording saved successfully');
    }

    console.log('Finishing exam with recordings:', Object.keys(recordings));
    console.log('Total recordings to submit:', Object.keys(recordings).length);
    
    // Small delay to ensure state is updated
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Submit all recordings
    await submitExam();
  };

  const submitExam = async () => {
    try {
      const formData = new FormData();
      formData.append('userId', '1'); // Replace with actual user ID
      formData.append('examSetId', examSetId || '2');

      console.log('Submitting exam with recordings:', recordings);
      console.log('Number of recordings:', Object.keys(recordings).length);

      // Add all audio recordings
      Object.entries(recordings).forEach(([questionIndex, audioBlob]) => {
        console.log(`Adding audio for question ${questionIndex}, size: ${audioBlob.size} bytes`);
        formData.append('audioFiles', audioBlob, `question_${questionIndex}.wav`);
      });

      console.log('Sending request to: http://localhost:5074/api/Submission/speaking');
      
      const response = await fetch('http://localhost:5074/api/Submission/speaking', {
        method: 'POST',
        body: formData,
      });

      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        const result = await response.json();
        console.log('Submission successful:', result);
        alert('Speaking exam submitted successfully!');
        router.push('/dashboard');
      } else {
        const errorText = await response.text();
        console.error('Response error:', errorText);
        throw new Error(`Server error: ${response.status} - ${errorText}`);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      alert(`Failed to submit exam: ${error instanceof Error ? error.message : 'Unknown error'}. Please check console for details.`);
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const getPartTitle = (partNumber: number) => {
    switch (partNumber) {
      case 1: return 'Introduction & Interview';
      case 2: return 'Long Turn (Cue Card)';
      case 3: return 'Discussion';
      default: return `Part ${partNumber}`;
    }
  };

  const getPartColor = (partNumber: number) => {
    switch (partNumber) {
      case 1: return 'bg-green-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading speaking exam...</p>
        </div>
      </div>
    );
  }

  if (!examSet || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No speaking exam found.</p>
          <button 
            onClick={() => router.push('/dashboard')}
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl mx-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{examSet.title}</h1>
          <p className="text-gray-600 mb-6">{examSet.description}</p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-800 mb-2">Speaking Test Instructions:</h3>
            <ul className="text-blue-700 space-y-1 text-sm">
              <li>• Part 1: Personal questions (4-5 minutes)</li>
              <li>• Part 2: Individual task with cue card (3-4 minutes)</li>
              <li>• Part 3: Discussion questions (4-5 minutes)</li>
              <li>• Your answers will be recorded</li>
              <li>• You can pause and resume during the test</li>
              <li>• Click "Next Question" to move forward</li>
            </ul>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={startExam}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Start Speaking Test
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-800">{examSet.title}</h1>
              <p className="text-sm text-gray-600">
                Question {currentQuestionIndex + 1} of {questions.length}
              </p>
            </div>
            <div className="text-right">
              <div className={`text-2xl font-mono font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-blue-600'}`}>
                {formatTime(timeLeft)}
              </div>
              <p className="text-xs text-gray-500">Time remaining</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Part Header */}
        <div className={`${getPartColor(currentPart)} text-white rounded-lg p-4 mb-6`}>
          <div className="flex items-center">
            <div className="bg-white text-gray-800 rounded-full w-8 h-8 flex items-center justify-center font-bold mr-3">
              {currentPart}
            </div>
            <div>
              <h2 className="text-lg font-semibold">PART {currentPart} {getPartTitle(currentPart).toUpperCase()}</h2>
              <p className="text-sm opacity-90">
                {currentPart === 1 && "Answer questions about yourself and your life"}
                {currentPart === 2 && "Speak for 1-2 minutes on the given topic"}
                {currentPart === 3 && "Discuss abstract ideas related to the topic"}
              </p>
            </div>
          </div>
        </div>

        {/* Question Content */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center mb-4">
            <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              Question {currentQuestionIndex + 1}
            </span>
          </div>

          {currentQuestion.partNumber === 2 && currentQuestion.cueCardTopic ? (
            // Cue Card Layout for Part 2
            <div>
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                <h3 className="font-semibold text-yellow-800 mb-2">Cue Card Topic:</h3>
                <p className="text-yellow-700 font-medium">{currentQuestion.cueCardTopic}</p>
              </div>
              
              {currentQuestion.cueCardPrompts && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-700 mb-2">You should say:</h4>
                  <div className="text-gray-600 whitespace-pre-line">
                    {currentQuestion.cueCardPrompts}
                  </div>
                </div>
              )}
            </div>
          ) : (
            // Regular Question Layout
            <div>
              <h3 className="text-xl font-medium text-gray-800 mb-4">
                {currentQuestion.questionText}
              </h3>
            </div>
          )}
        </div>

        {/* Recording Controls */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-center space-x-4">
            <div className={`w-4 h-4 rounded-full ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-gray-300'}`}></div>
            <span className="text-lg font-medium">
              {isTransitioning ? 'Saving recording...' : isRecording ? 'Recording...' : isPaused ? 'Paused' : 'Ready to record'}
            </span>
          </div>

          <div className="flex justify-center space-x-4 mt-6">
            <button
              onClick={pauseResume}
              disabled={isTransitioning}
              className={`px-6 py-3 rounded-lg font-medium ${
                isTransitioning 
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : isPaused 
                  ? 'bg-green-600 hover:bg-green-700 text-white' 
                  : 'bg-yellow-600 hover:bg-yellow-700 text-white'
              }`}
            >
              {isPaused ? 'Resume' : 'Pause'}
            </button>

            <button
              onClick={nextQuestion}
              disabled={isTransitioning}
              className={`px-6 py-3 rounded-lg font-medium ${
                isTransitioning
                  ? 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isTransitioning ? 'Saving...' : currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Exam'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <p className="text-sm text-gray-500">
              Recording: {recordings[currentQuestionIndex] ? '✓ Saved' : 'In progress...'}
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Total recordings saved: {Object.keys(recordings).length}/{questions.length}
            </p>
            <p className="text-xs text-gray-300 mt-1">
              Debug: Current Q{currentQuestionIndex}, Saved: [{Object.keys(recordings).join(', ')}]
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}