"use client";

import { useAuth } from "@/hooks/useAuth";
import { useApiClient } from "@/hooks/useApiClient";
import { useEffect, useState } from "react";

const DashboardPage = () => {
  const { user, accessToken, isAuthenticated, isLoading } = useAuth();
  const { apiCall } = useApiClient();
  const [authTestResult, setAuthTestResult] = useState<string>("");

  useEffect(() => {
    const testAuthenticatedEndpoint = async () => {
      if (accessToken) {
        try {
          const result = await apiCall(`${process.env.NEXT_PUBLIC_API_URL}/auth`);
          setAuthTestResult("Authenticated endpoint test successful!");
        } catch (error) {
          setAuthTestResult(`Error: ${error}`);
        }
      }
    };

    if (isAuthenticated) {
      testAuthenticatedEndpoint();
    }
  }, [isAuthenticated, accessToken, apiCall]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Access Denied
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Please sign in to access the dashboard.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
              Dashboard
            </h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  User Information
                </h2>
                <div className="space-y-2">
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Email:</span> {user?.email}
                  </p>
                  <p className="text-gray-600 dark:text-gray-300">
                    <span className="font-medium">Status:</span> Authenticated
                  </p>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-100 mb-4">
                  IELTS Exams
                </h2>
                <div className="space-y-3">
                  <a 
                    href="/exam/speaking?examSetId=1" 
                    className="block w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-center"
                  >
                    🎤 Speaking Test
                  </a>
                  <a 
                    href="/exam/writing?examSetId=1" 
                    className="block w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-center"
                  >
                    ✍️ Writing Test  
                  </a>
                  <a 
                    href="/exam/reading?examSetId=1" 
                    className="block w-full px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-center"
                  >
                    📖 Reading Test
                  </a>
                  <a 
                    href="/exam/listening?examSetId=1" 
                    className="block w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-center"
                  >
                    🎧 Listening Test
                  </a>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <a 
                    href="/history" 
                    className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
                  >
                    📊 Exam History
                  </a>
                  <a 
                    href="/profile" 
                    className="block w-full px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-center"
                  >
                    👤 Profile Settings
                  </a>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-yellow-800 dark:text-yellow-100 mb-4">
                🎯 Speaking Test Features
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <h3 className="font-medium text-yellow-700 dark:text-yellow-200 mb-2">Part 1: Interview</h3>
                  <ul className="text-yellow-600 dark:text-yellow-300 space-y-1">
                    <li>• Personal questions about yourself</li>
                    <li>• 4-5 minutes duration</li>
                    <li>• Voice recording enabled</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-yellow-700 dark:text-yellow-200 mb-2">Part 2: Long Turn</h3>
                  <ul className="text-yellow-600 dark:text-yellow-300 space-y-1">
                    <li>• Cue card topic speaking</li>
                    <li>• 3-4 minutes preparation + speaking</li>
                    <li>• Individual task recording</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-yellow-700 dark:text-yellow-200 mb-2">Part 3: Discussion</h3>
                  <ul className="text-yellow-600 dark:text-yellow-300 space-y-1">
                    <li>• Abstract topic discussion</li>
                    <li>• 4-5 minutes duration</li>
                    <li>• Advanced level questions</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-medium text-yellow-700 dark:text-yellow-200 mb-2">Features</h3>
                  <ul className="text-yellow-600 dark:text-yellow-300 space-y-1">
                    <li>• ⏱️ Timer countdown</li>
                    <li>• 🎙️ Audio recording</li>
                    <li>• ⏸️ Pause/Resume</li>
                    <li>• 💾 Auto-save answers</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Authentication Test
              </h2>
              <div className="space-y-2">
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">Access Token:</span>{" "}
                  {accessToken ? "Present" : "Missing"}
                </p>
                <p className="text-gray-600 dark:text-gray-300">
                  <span className="font-medium">API Test:</span> {authTestResult}
                </p>
              </div>
            </div>

            <div className="mt-6 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Token Details (for debugging)
              </h2>
              <div className="bg-gray-100 dark:bg-gray-600 rounded p-2 overflow-x-auto">
                <pre className="text-sm text-gray-800 dark:text-gray-200">
                  {accessToken ? 
                    `Access Token: ${accessToken.substring(0, 50)}...` : 
                    "No access token available"
                  }
                </pre>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;