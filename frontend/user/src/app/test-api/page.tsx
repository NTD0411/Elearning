"use client";

import { useState } from "react";
import { AuthService } from "@/services/authService";
import toast from "react-hot-toast";

const TestApiPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  const testLogin = async () => {
    if (!email || !password) {
      toast.error("Please fill in email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await AuthService.login(email, password);
      setResult(response);
      toast.success("Login test successful!");
    } catch (error: any) {
      setResult({ error: error.message });
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const testConnectionToBackend = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth`, {
        method: 'GET',
      });
      
      if (response.ok) {
        const data = await response.text();
        setResult({ connectionTest: "Success", data });
        toast.success("Backend connection successful!");
      } else {
        setResult({ connectionTest: "Failed", status: response.status });
        toast.error("Backend connection failed!");
      }
    } catch (error: any) {
      setResult({ connectionTest: "Error", error: error.message });
      toast.error("Backend connection error!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-6">
              API Connection Test
            </h1>
            
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Test Backend Connection
                </h2>
                <button
                  onClick={testConnectionToBackend}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                >
                  {loading ? "Testing..." : "Test Connection"}
                </button>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                  Test Login API
                </h2>
                <div className="space-y-4">
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={testLogin}
                    disabled={loading}
                    className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
                  >
                    {loading ? "Testing..." : "Test Login"}
                  </button>
                </div>
              </div>

              {result && (
                <div className="bg-gray-100 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-2">
                    Test Result:
                  </h3>
                  <pre className="text-sm text-gray-600 dark:text-gray-300 overflow-x-auto">
                    {JSON.stringify(result, null, 2)}
                  </pre>
                </div>
              )}

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                  Backend API Information:
                </h3>
                <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                  <li><strong>Base URL:</strong> {process.env.NEXT_PUBLIC_API_URL}</li>
                  <li><strong>Login endpoint:</strong> POST /auth/login</li>
                  <li><strong>Expected payload:</strong> {`{ fullName: "email", passwordHash: "password" }`}</li>
                  <li><strong>Response:</strong> {`{ accessToken: "...", refreshToken: "..." }`}</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestApiPage;