'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

interface FeedbackDto {
  feedbackId: number;
  submissionId: number;
  mentorId?: number;
  mentorName?: string;
  feedbackText?: string;
  createdAt?: string;
  replies: FeedbackReplyDto[];
}

interface FeedbackReplyDto {
  replyId: number;
  feedbackId: number;
  userId: number;
  userName?: string;
  replyText?: string;
  createdAt?: string;
}

interface FeedbackDiscussionProps {
  submissionId: number;
  onClose: () => void;
}

export default function FeedbackDiscussion({ submissionId, onClose }: FeedbackDiscussionProps) {
  const { data: session } = useSession();
  const [feedback, setFeedback] = useState<FeedbackDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [submittingReply, setSubmittingReply] = useState(false);

  useEffect(() => {
    fetchFeedback();
  }, [submissionId]);

  const fetchFeedback = async () => {
    try {
      const response = await fetch(`http://localhost:5074/api/Submission/feedback/${submissionId}`, {
        headers: {
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          setError('No feedback available for this submission yet.');
        } else {
          throw new Error('Failed to fetch feedback');
        }
        return;
      }

      const data = await response.json();
      setFeedback(data);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError('Failed to load feedback. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReply = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!replyText.trim() || !feedback || !session?.user?.id) {
      return;
    }

    setSubmittingReply(true);
    try {
      const response = await fetch('http://localhost:5074/api/Submission/feedback/reply', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session?.user?.accessToken}`,
        },
        body: JSON.stringify({
          feedbackId: feedback.feedbackId,
          userId: parseInt(session.user.id),
          replyText: replyText.trim(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit reply');
      }

      // Refresh feedback to show new reply
      await fetchFeedback();
      setReplyText('');
    } catch (err) {
      console.error('Error submitting reply:', err);
      alert('Failed to submit reply. Please try again.');
    } finally {
      setSubmittingReply(false);
    }
  };

  const getReplyAuthorInfo = (reply: FeedbackReplyDto) => {
    // Check if this reply is from the mentor (original feedback author)
    if (reply.userId === feedback?.mentorId) {
      return {
        name: feedback.mentorName || 'Mentor',
        role: 'Mentor',
        bgColor: 'bg-blue-50 border-blue-200',
        textColor: 'text-blue-800',
        roleColor: 'bg-blue-100 text-blue-800'
      };
    } else {
      return {
        name: reply.userName || 'Student',
        role: 'Student',
        bgColor: 'bg-gray-50 border-gray-200',
        textColor: 'text-gray-800',
        roleColor: 'bg-gray-100 text-gray-800'
      };
    }
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2">Loading feedback discussion...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-2/3 xl:w-1/2 shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b">
          <h3 className="text-lg font-semibold text-gray-900">
            Feedback Discussion
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error ? (
          <div className="py-8 text-center">
            <div className="mb-4">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No Feedback Available</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Close
            </button>
          </div>
        ) : feedback ? (
          <div className="mt-4">
            {/* Original Mentor Feedback */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <h4 className="font-medium text-blue-800">Your Original Feedback</h4>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-medium">
                    Mentor
                  </span>
                </div>
                <div className="text-sm text-blue-600">
                  {feedback.createdAt && new Date(feedback.createdAt).toLocaleDateString()}
                </div>
              </div>
              <div className="text-gray-700 whitespace-pre-wrap">
                {feedback.feedbackText}
              </div>
            </div>

            {/* Discussion Thread */}
            <div className="mb-6">
              <h4 className="font-medium text-gray-900 mb-3">
                Discussion Thread ({feedback.replies.length} {feedback.replies.length === 1 ? 'reply' : 'replies'})
              </h4>
              
              {feedback.replies.length > 0 ? (
                <div className="space-y-4">
                  {feedback.replies.map((reply) => {
                    const authorInfo = getReplyAuthorInfo(reply);
                    return (
                      <div key={reply.replyId} className={`border rounded-lg p-4 ${authorInfo.bgColor}`}>
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <span className={`font-medium ${authorInfo.textColor}`}>
                              {authorInfo.name}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${authorInfo.roleColor}`}>
                              {authorInfo.role}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">
                            {reply.createdAt && new Date(reply.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <div className={`whitespace-pre-wrap ${authorInfo.textColor}`}>
                          {reply.replyText}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No replies yet. Start the discussion!
                </div>
              )}
            </div>

            {/* Reply Form */}
            <form onSubmit={handleSubmitReply} className="border-t pt-4">
              <div className="mb-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add Your Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  rows={3}
                  placeholder="Respond to student questions or provide additional feedback..."
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={submittingReply || !replyText.trim()}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {submittingReply ? 'Submitting...' : 'Send Reply'}
                </button>
              </div>
            </form>
          </div>
        ) : null}
      </div>
    </div>
  );
}


