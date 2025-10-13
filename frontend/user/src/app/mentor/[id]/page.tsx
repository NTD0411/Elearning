'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { getImagePrefix } from '@/utils/util';

interface Mentor {
  userId: number;
  fullName: string;
  email: string;
  portraitUrl?: string;
  experience?: string;
  status?: string;
  gender?: string;
  address?: string;
  createdAt?: string;
}

interface Rating {
  ratingId: number;
  studentId: number;
  mentorId: number;
  ratingValue: number;
  comment?: string;
  createdAt?: string;
  studentName?: string;
}

export default function MentorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [mentor, setMentor] = useState<Mentor | null>(null);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingValue, setRatingValue] = useState(5);
  const [ratingComment, setRatingComment] = useState('');
  const [submittingRating, setSubmittingRating] = useState(false);

  const mentorId = params.id as string;

  useEffect(() => {
    const fetchMentorDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5074/api/User/${mentorId}`);
        if (response.ok) {
          const data = await response.json();
          setMentor(data);
        } else {
          setError('Mentor not found');
        }
      } catch (error) {
        console.error('Error fetching mentor:', error);
        setError('Error loading mentor details');
      } finally {
        setLoading(false);
      }
    };

    if (mentorId) {
      fetchMentorDetails();
    }
  }, [mentorId]);

  useEffect(() => {
    const fetchRatings = async () => {
      try {
        const response = await fetch(`http://localhost:5074/api/Rating/mentor/${mentorId}`);
        if (response.ok) {
          const data = await response.json();
          setRatings(data);
        }
      } catch (error) {
        console.error('Error fetching ratings:', error);
      }
    };

    if (mentorId) {
      fetchRatings();
    }
  }, [mentorId]);

  const handleSubmitRating = async () => {
    if (!session?.user?.id || status !== 'authenticated') {
      alert('Please login to rate this mentor');
      return;
    }

    setSubmittingRating(true);
    try {
      const response = await fetch('http://localhost:5074/api/Rating', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Authorization: `Bearer ${(session as any).accessToken}`, // Add when auth is enabled
        },
        body: JSON.stringify({
          studentId: parseInt(session.user.id as string),
          mentorId: parseInt(mentorId),
          ratingValue: ratingValue,
          comment: ratingComment
        })
      });

      if (response.ok) {
        alert('Rating submitted successfully!');
        setShowRatingModal(false);
        setRatingComment('');
        setRatingValue(5);
        // Refresh ratings
        const ratingsResponse = await fetch(`http://localhost:5074/api/Rating/mentor/${mentorId}`);
        if (ratingsResponse.ok) {
          const data = await ratingsResponse.json();
          setRatings(data);
        }
      } else {
        alert('Failed to submit rating');
      }
    } catch (error) {
      console.error('Error submitting rating:', error);
      alert('Error submitting rating');
    } finally {
      setSubmittingRating(false);
    }
  };

  const userRole = (session?.user as any)?.role?.toLowerCase?.();
  const isStudent = userRole === 'student';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !mentor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentor Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The mentor you are looking for does not exist.'}</p>
          <Link
            href="/mentor"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Back to Mentors
          </Link>
        </div>
      </div>
    );
  }

  const averageRating = ratings.length > 0 
    ? (ratings.reduce((sum, rating) => sum + rating.ratingValue, 0) / ratings.length).toFixed(1)
    : 'No ratings yet';

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <div className="mb-6">
          <nav className="flex items-center" aria-label="Breadcrumb">
            <ol className="inline-flex items-center space-x-1 md:space-x-3">
              <li className="inline-flex items-center">
                <Link href="/" className="inline-flex items-center text-sm font-medium text-gray-700 hover:text-blue-600">
                  <svg className="w-3 h-3 mr-2.5" aria-hidden="true" fill="currentColor" viewBox="0 0 20 20">
                    <path d="m19.707 9.293-2-2-7-7a1 1 0 0 0-1.414 0l-7 7-2 2a1 1 0 0 0 1.414 1.414L2 10.414V18a2 2 0 0 0 2 2h3a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h3a2 2 0 0 0 2-2v-7.586l.293.293a1 1 0 0 0 1.414-1.414Z"/>
                  </svg>
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7"></path>
                  </svg>
                  <Link href="/mentor" className="ml-1 text-sm font-medium text-gray-700 hover:text-blue-600 md:ml-2">Mentors</Link>
                </div>
              </li>
              <li aria-current="page">
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-gray-400 mx-1" aria-hidden="true" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m9 5 7 7-7 7"></path>
                  </svg>
                  <span className="ml-1 text-sm font-medium text-gray-500 md:ml-2">{mentor.fullName}</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>

        {/* Mentor Profile */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-8">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              <div className="flex-shrink-0">
                <Image
                  src={mentor.portraitUrl || `${getImagePrefix()}images/mentor/user1.png`}
                  alt={`${mentor.fullName} profile`}
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                />
              </div>
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{mentor.fullName}</h1>
                <p className="text-lg text-gray-600 mb-4">Mentor</p>
                <div className="flex items-center space-x-4 mb-4">
                  <div className="flex items-center">
                    <span className="text-sm text-gray-500 mr-2">Rating:</span>
                    <div className="flex items-center">
                      <span className="text-2xl font-bold text-yellow-500">{averageRating}</span>
                      <svg className="w-5 h-5 text-yellow-400 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <span className="text-sm text-gray-500 ml-1">({ratings.length} reviews)</span>
                    </div>
                  </div>
                </div>
                {isStudent && (
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    Rate Mentor
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Experience Section */}
          {mentor.experience && (
            <div className="px-6 py-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-3">Experience</h3>
              <p className="text-gray-600 whitespace-pre-wrap">{mentor.experience}</p>
            </div>
          )}

          {/* Additional Info */}
          <div className="px-6 py-6 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <dt className="text-sm font-medium text-gray-500">Email</dt>
                <dd className="mt-1 text-sm text-gray-900">{mentor.email}</dd>
              </div>
              {mentor.gender && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Gender</dt>
                  <dd className="mt-1 text-sm text-gray-900">{mentor.gender}</dd>
                </div>
              )}
              {mentor.address && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Location</dt>
                  <dd className="mt-1 text-sm text-gray-900">{mentor.address}</dd>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ratings Section */}
        <div className="mt-8 bg-white shadow rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Student Reviews</h3>
          </div>
          <div className="px-6 py-6">
            {ratings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No reviews yet. Be the first to rate this mentor!</p>
            ) : (
              <div className="space-y-4">
                {ratings.map((rating) => (
                  <div key={rating.ratingId} className="border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-medium text-gray-900">
                          {rating.studentName || `Student ${rating.studentId}`}
                        </span>
                        <div className="flex">
                          {[...Array(5)].map((_, i) => (
                            <svg
                              key={i}
                              className={`w-4 h-4 ${i < rating.ratingValue ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill="currentColor"
                              viewBox="0 0 20 20"
                            >
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                      <span className="text-sm text-gray-500">
                        {rating.createdAt ? new Date(rating.createdAt).toLocaleDateString() : 'Recently'}
                      </span>
                    </div>
                    {rating.comment && (
                      <p className="text-gray-600">{rating.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      {showRatingModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Rate Mentor</h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <div className="flex space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRatingValue(star)}
                      className={`w-8 h-8 ${star <= ratingValue ? 'text-yellow-400' : 'text-gray-300'}`}
                    >
                      <svg fill="currentColor" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Comment (Optional)</label>
                <textarea
                  value={ratingComment}
                  onChange={(e) => setRatingComment(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Share your experience with this mentor..."
                />
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowRatingModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitRating}
                  disabled={submittingRating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-md"
                >
                  {submittingRating ? 'Submitting...' : 'Submit Rating'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
