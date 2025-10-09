"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

interface Submission {
  submissionId: number;
  examType: string;
  studentName: string;
  submissionDate: string;
  status: string;
  mentorScore?: number;
  mentorId?: number;
  feedback?: string;
  answerText?: string;
  answerAudioUrl?: string;
}

interface GradeModalProps {
  submission: Submission;
  onClose: () => void;
  onGradeSubmit: () => void;
}

function GradeModal({ submission, onClose, onGradeSubmit }: GradeModalProps) {
  const [score, setScore] = useState("");
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const { data: session } = useSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!score || parseFloat(score) < 0 || parseFloat(score) > 10) {
      alert("Please enter a valid score between 0 and 10");
      return;
    }

    setLoading(true);
    try {
  const response = await fetch(`https://e-learningsite.runasp.net/api/Submission/${submission.submissionId}/grade`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({
          mentorScore: parseFloat(score),
          feedbackContent: feedback,
          status: "Graded",
          mentorId: parseInt(session?.user?.id || "0")
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to grade submission");
      }

      alert("Submission graded successfully");
      onGradeSubmit();
      onClose();
    } catch (error) {
      alert("Failed to grade submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Grade Submission</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ×
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-4 gap-4">
            <div className="text-gray-600 text-right">Student:</div>
            <div className="col-span-3">{submission.studentName}</div>
          </div>
          
          <div className="grid grid-cols-4 gap-4">
            <div className="text-gray-600 text-right">Type:</div>
            <div className="col-span-3">{submission.examType}</div>
          </div>

          {submission.answerText && (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-gray-600 text-right">Answer:</div>
              <div className="col-span-3">
                <div className="p-4 bg-gray-50 rounded-md">
                  <pre className="whitespace-pre-wrap">{submission.answerText}</pre>
                </div>
              </div>
            </div>
          )}

          {submission.answerAudioUrl && (
            <div className="grid grid-cols-4 gap-4">
              <div className="text-gray-600 text-right">Audio:</div>
              <div className="col-span-3">
                <audio controls className="w-full">
                  <source src={submission.answerAudioUrl} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              </div>
            </div>
          )}

          <div className="grid grid-cols-4 gap-4">
            <div className="text-gray-600 text-right">Score:</div>
            <div className="col-span-3">
              <input
                type="number"
                min="0"
                max="10"
                step="0.1"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full p-2 border rounded"
                placeholder="Enter score (0-10)"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-4 gap-4">
            <div className="text-gray-600 text-right">Feedback:</div>
            <div className="col-span-3">
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full p-2 border rounded h-32"
                placeholder="Enter feedback for student"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border rounded hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {loading ? "Submitting..." : "Submit Grade"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function GradePage() {
  const { data: session } = useSession();
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);

  const fetchSubmissions = async () => {
    try {
  const response = await fetch("https://e-learningsite.runasp.net/api/Submission/mentor", {
        headers: {
          Authorization: `Bearer ${session?.user?.accessToken}`,
        },
      });
      
      if (!response.ok) {
        throw new Error("Failed to fetch submissions");
      }
      
      const data = await response.json();
      setSubmissions(data);
    } catch (err) {
      console.error("Error loading submissions:", err);
      setError("Failed to load submissions. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      if (session?.user) {
        await fetchSubmissions();
      }
    };
    void loadData();
  }, [session]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 min-h-[600px] flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <div className="py-20 bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Submissions to Grade</h1>
        
        {selectedSubmission && (
          <GradeModal
            submission={selectedSubmission}
            onClose={() => setSelectedSubmission(null)}
            onGradeSubmit={fetchSubmissions}
          />
        )}

        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Student</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Type</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Submitted</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Score</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {submissions.map((submission) => (
                  <tr key={submission.submissionId} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {submission.studentName}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                        ${submission.examType.toLowerCase() === 'writing' ? 'bg-blue-100 text-blue-800' : 'bg-purple-100 text-purple-800'}`}>
                        {submission.examType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {new Date(submission.submissionDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                        ${submission.status === 'Pending' ? 'bg-yellow-100 text-yellow-800' : 
                          submission.status === 'Graded' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {submission.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {submission.mentorScore ? `${submission.mentorScore}/10` : '-'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <button
                        className={`font-medium ${
                          submission.status.toLowerCase() === 'graded'
                            ? 'text-green-600 hover:text-green-700'
                            : 'text-blue-600 hover:text-blue-700'
                        }`}
                        onClick={() => setSelectedSubmission(submission)}
                      >
                        {submission.status.toLowerCase() === 'graded' ? 'Edit Grade' : 'Grade'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}