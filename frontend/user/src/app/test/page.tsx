"use client"

import { useState } from "react"

export default function TestPage() {
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)

  const testBackendConnection = async () => {
    setLoading(true)
    try {
      // Test với health check endpoint
      const response = await fetch("http://localhost:5074/api/auth/health", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
      
      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Backend connection successful! Status: ${data.status}`)
      } else {
        setResult(`❌ Backend connection failed: ${response.status}`)
      }
    } catch (error) {
      setResult(`❌ Error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testRegister = async () => {
    setLoading(true)
    try {
      // Generate random email to avoid duplicate
      const randomId = Math.floor(Math.random() * 1000);
      const response = await fetch("http://localhost:5074/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: `Test User ${randomId}`,
          email: `test${randomId}@example.com`,
          password: "password123",
          confirmPassword: "password123"
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setResult(`✅ User registered successfully! FullName: Test User ${randomId}, Email: test${randomId}@example.com`)
      } else {
        const errorText = await response.text()
        setResult(`❌ Registration failed: ${errorText}`)
      }
    } catch (error) {
      setResult(`❌ Registration error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  const testLogin = async () => {
    setLoading(true)
    try {
      const response = await fetch("http://localhost:5074/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fullName: "Test User", // Sử dụng FullName, không phải email
          passwordHash: "password123"
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        setResult(`✅ Login test successful! Token: ${data.accessToken ? "Present" : "Missing"}`)
      } else {
        const errorText = await response.text()
        setResult(`❌ Login failed: ${errorText}`)
      }
    } catch (error) {
      setResult(`❌ Login error: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Backend Connection Test</h1>
        
        <div className="space-y-4">
          <button
            onClick={testBackendConnection}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 mr-4"
          >
            {loading ? "Testing..." : "Test Backend Connection"}
          </button>
          
          <button
            onClick={testRegister}
            disabled={loading}
            className="bg-purple-500 hover:bg-purple-600 text-white px-6 py-3 rounded-lg disabled:opacity-50 mr-4"
          >
            {loading ? "Testing..." : "Register Test User"}
          </button>
          
          <button
            onClick={testLogin}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg disabled:opacity-50"
          >
            {loading ? "Testing..." : "Test Login API"}
          </button>
        </div>

        {result && (
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-semibold mb-2">Result:</h3>
            <p className="font-mono text-sm">{result}</p>
          </div>
        )}

        <div className="mt-6 text-sm text-gray-600">
          <p><strong>Backend URL:</strong> http://localhost:5074/api</p>
          <p><strong>Status:</strong> Backend is running on HTTP (no SSL required)</p>
          <h3 className="font-semibold mt-4 mb-2">Test Flow:</h3>
          <ol className="list-decimal list-inside space-y-1">
            <li>Click "Test Backend Connection" để kiểm tra backend</li>
            <li>Click "Register Test User" để tạo user test</li>
            <li>Click "Test Login API" để test đăng nhập</li>
          </ol>
        </div>
      </div>
    </div>
  )
}