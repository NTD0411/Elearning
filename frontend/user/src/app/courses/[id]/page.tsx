'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

interface ExamCourse {
  examCourseId: number;
  courseTitle: string;
  courseCode: string;
  description: string;
  examType: string;
  createdAt: string;
}

export default function CourseDetailPage() {
  const params = useParams();
  const [course, setCourse] = useState<ExamCourse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`http://localhost:5074/api/ExamCourse/${params.id}`);
        
        if (!response.ok) {
          throw new Error('Course not found');
        }
        
        const courseData = await response.json();
        setCourse(courseData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load course');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCourse();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="mb-4">
            <svg className="mx-auto h-24 w-24 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Course Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'The course you are looking for does not exist.'}</p>
          <Link
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
          >
            Go Back Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-blue-600 hover:text-blue-800">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Course Details */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Course Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-8 text-white">
            <div className="flex items-center justify-between">
              <div>
                <span className="inline-block px-3 py-1 text-sm font-semibold bg-blue-500 rounded-full mb-2">
                  {course.examType}
                </span>
                <h1 className="text-3xl font-bold mb-2">{course.courseTitle}</h1>
                <p className="text-blue-100">Course Code: {course.courseCode}</p>
              </div>
              <div className="text-right">
                <p className="text-blue-200 text-sm">Created</p>
                <p className="text-white font-semibold">
                  {new Date(course.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Course Content */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Main Content */}
              <div className="lg:col-span-2">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Description</h2>
                  <div className="prose max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      {course.description || 'No description available for this course.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="lg:col-span-1">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Course Information</h3>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Exam Type</p>
                      <p className="text-gray-900">{course.examType}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Course Code</p>
                      <p className="text-gray-900">{course.courseCode}</p>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500">Created Date</p>
                      <p className="text-gray-900">{new Date(course.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <h4 className="text-md font-semibold text-gray-900 mb-3">Quick Actions</h4>
                    <div className="space-y-2">
                      <Link
                        href={`/exam/writing?courseId=${course.examCourseId}`}
                        className="block w-full bg-blue-600 text-white text-center py-2 px-4 rounded hover:bg-blue-700 transition-colors"
                      >
                        Start Writing Exam
                      </Link>
                      <Link
                        href="/courses"
                        className="block w-full bg-gray-200 text-gray-700 text-center py-2 px-4 rounded hover:bg-gray-300 transition-colors"
                      >
                        Browse Other Courses
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}