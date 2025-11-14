'use client';

import { useSession } from 'next-auth/react';
import { useState } from 'react';
import Link from 'next/link';

export default function MentorRequestPage() {
  const { data: session, status } = useSession();
  const [certificate, setCertificate] = useState<File | null>(null);
  const [experience, setExperience] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (status !== 'authenticated' || !session?.user?.id) {
      setError('Please login to submit request.');
      return;
    }
    if (!certificate || !experience) {
      setError('Please upload certificate and enter experience.');
      return;
    }

    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('certificate', certificate);
      formData.append('experience', experience);
      
      const headers: Record<string, string> = {};
      // Add authorization header if we have access token
      if ((session as any)?.accessToken) {
        headers['Authorization'] = `Bearer ${(session as any).accessToken}`;
      }

      const res = await fetch(`http://localhost:5074/api/User/${session.user.id}/mentor-request`, {
        method: 'POST',
        headers,
        body: formData
      });
      
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || 'Failed to submit mentor request');
      }
      setMessage('Your registration has been submitted successfully. Please wait for admin approval.');
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="mb-4">Please login to continue.</p>
          <Link className="text-blue-600" href="/">Back to Home</Link>
        </div>
      </div>
    );
  }

  const role = (session?.user as any)?.role?.toLowerCase?.();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Request to Become Mentor</h1>
          <p className="text-gray-600">Please upload your certificate and share your experience.</p>
        </div>

        {role === 'mentor' && (
          <div className="bg-green-50 border border-green-200 text-green-800 rounded p-4 mb-6">
            You are already registered as a mentor.
          </div>
        )}

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded p-3">{error}</div>
          )}
          {message && (
            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded p-3">{message}</div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certificate</label>
            <div className="flex items-center gap-2">
              <label className="cursor-pointer px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-full hover:bg-blue-100">
                Choose File
                <input
                  type="file"
                  onChange={(e) => setCertificate(e.target.files?.[0] || null)}
                  accept="image/*,.pdf"
                  className="hidden"
                  required
                />
              </label>
              <span className="text-sm text-gray-500">
                {certificate ? certificate.name : 'No file selected'}
              </span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Experience</label>
            <textarea
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
              rows={5}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="Enter your teaching experience, certificates, achievements..."
              required
            />
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={submitting || role === 'mentor'}
              className="px-4 py-2 text-white bg-blue-600 rounded hover:bg-blue-700 disabled:opacity-60"
            >
              {submitting ? 'Submitting...' : 'Submit Request'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


