"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";

interface RoadmapCourse {
  roadmapCourseId: number;
  examCourseId: number;
  courseTitle: string;
  courseCode?: string;
  examType?: string;
  totalExamSets?: number;
  recommendationOrder: number;
  reasonForRecommendation: string;
  isCompleted: boolean;
}

interface RoadmapStep {
  roadmapStepId: number;
  stepOrder: number;
  title: string;
  description: string;
  skillType: string;
  difficulty: string;
  isCompleted: boolean;
  tips?: string;
  recommendedCourses?: RoadmapCourse[];
}

interface LearningGoal {
  goalTitle: string;
  targetBand: number;
  currentBand: number;
  focusSkill: string;
  targetDate: string;
  progressPercentage: number;
  completedExams: number;
  totalExamsRequired: number;
  roadmapSteps?: RoadmapStep[];
}

export default function RoadmapPage() {
  const { accessToken, isAuthenticated, isLoading: authLoading } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [goal, setGoal] = useState<LearningGoal | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    goalTitle: "",
    currentBand: "5.0",
    targetBand: "7.0",
    focusSkill: "Overall",
    targetDate: ""
  });

  useEffect(() => {
    if (isAuthenticated && accessToken) {
      fetchActiveGoal();
    } else if (!authLoading) {
      setLoading(false);
    }
  }, [isAuthenticated, accessToken, authLoading]);

  const fetchActiveGoal = async () => {
    try {
      console.log("Fetching active goal...");
      const response = await fetch("http://localhost:5074/api/LearningRoadmap/active", {
        headers: {
          "Authorization": `Bearer ${accessToken}`
        }
      });
      
      console.log("Fetch response status:", response.status);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log("Raw response:", responseData);
        
        // Backend returns { success: true, data: {...} }
        const data = responseData.data || responseData;
        
        console.log("Extracted goal data:", data);
        console.log("Goal title:", data.goalTitle);
        console.log("Roadmap steps count:", data.roadmapSteps?.length || 0);
        console.log("Roadmap steps:", data.roadmapSteps);
        
        if (data.roadmapSteps) {
          data.roadmapSteps.forEach((step: any, idx: number) => {
            console.log(`Step ${idx + 1}:`, step.title, "- Courses:", step.recommendedCourses?.length || 0);
          });
        }
        
        setGoal(data);
      } else {
        console.log("No active goal found or error:", response.status);
      }
    } catch (error) {
      console.error("Error fetching goal:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accessToken) {
      alert("Please login first!");
      return;
    }
    
    console.log("Submitting form data:", formData);
    setLoading(true);
    
    try {
      console.log("Token:", accessToken ? "exists" : "missing");
      
      const response = await fetch("http://localhost:5074/api/LearningRoadmap", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`
        },
        body: JSON.stringify(formData)
      });
      
      console.log("Response status:", response.status);
      
      if (response.ok) {
        const data = await response.json();
        console.log("Goal created:", data);
        // Backend returns { success: true, data: {...} }
        setGoal(data.data || data);
        setShowForm(false);
        await fetchActiveGoal(); // Refresh to get full data with relationships
        alert("Roadmap created successfully!");
      } else {
        const error = await response.text();
        console.error("Error response:", error);
        alert(`Failed to create roadmap: ${error}`);
      }
    } catch (error) {
      console.error("Error creating goal:", error);
      alert("Failed to create roadmap. Check console for details.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl text-gray-600">Please login to access roadmap</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800">My Learning Roadmap</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-6 rounded-lg transition-colors"
          >
            {showForm ? "Cancel" : "Create New Goal"}
          </button>
        </div>
        
        {showForm ? (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">Create Learning Goal</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Goal Title</label>
                <input 
                  type="text" 
                  value={formData.goalTitle}
                  onChange={(e) => setFormData({...formData, goalTitle: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2" 
                  placeholder="e.g., Achieve IELTS 7.0"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Current Band</label>
                  <select 
                    value={formData.currentBand}
                    onChange={(e) => setFormData({...formData, currentBand: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option>4.0</option>
                    <option>4.5</option>
                    <option>5.0</option>
                    <option>5.5</option>
                    <option>6.0</option>
                    <option>6.5</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Target Band</label>
                  <select 
                    value={formData.targetBand}
                    onChange={(e) => setFormData({...formData, targetBand: e.target.value})}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  >
                    <option>6.0</option>
                    <option>6.5</option>
                    <option>7.0</option>
                    <option>7.5</option>
                    <option>8.0</option>
                    <option>8.5</option>
                    <option>9.0</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Focus Skill</label>
                <select 
                  value={formData.focusSkill}
                  onChange={(e) => setFormData({...formData, focusSkill: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                >
                  <option>Overall</option>
                  <option>Listening</option>
                  <option>Reading</option>
                  <option>Writing</option>
                  <option>Speaking</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Target Date</label>
                <input 
                  type="date" 
                  value={formData.targetDate}
                  onChange={(e) => setFormData({...formData, targetDate: e.target.value})}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {loading ? "Generating..." : "Generate Roadmap with AI"}
              </button>
            </form>
          </div>
        ) : goal ? (
          <div className="space-y-6">
            {/* Goal Header */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-800 mb-2">{goal.goalTitle}</h2>
                  <p className="text-gray-600">Target: Band {goal.targetBand} | Focus: {goal.focusSkill}</p>
                </div>
                <div className="text-right">
                  <div className="text-4xl font-bold text-blue-600">{goal.progressPercentage}%</div>
                  <p className="text-sm text-gray-500">Progress</p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className="bg-blue-600 h-4 rounded-full transition-all" 
                  style={{width: `${goal.progressPercentage}%`}}
                ></div>
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-gray-800">{goal.currentBand}</p>
                  <p className="text-sm text-gray-600">Current Band</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{goal.completedExams}/{goal.totalExamsRequired}</p>
                  <p className="text-sm text-gray-600">Exams Completed</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-800">{new Date(goal.targetDate).toLocaleDateString()}</p>
                  <p className="text-sm text-gray-600">Target Date</p>
                </div>
              </div>
            </div>

            {/* Roadmap Steps */}
            <div className="bg-white rounded-lg shadow-lg p-8">
              <h3 className="text-2xl font-bold text-gray-800 mb-6">Learning Steps</h3>
              <div className="space-y-6">
                {goal.roadmapSteps?.map((step) => (
                  <div key={step.roadmapStepId} className="border-l-4 border-blue-500 pl-6 pb-6 relative">
                    <div className={`absolute -left-3 w-6 h-6 rounded-full ${step.isCompleted ? 'bg-green-500' : 'bg-gray-300'} border-4 border-white`}></div>
                    
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-xl font-semibold text-gray-800">
                        Step {step.stepOrder}: {step.title}
                      </h4>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        step.isCompleted ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {step.isCompleted ? 'Completed' : 'In Progress'}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-3">{step.description}</p>
                    
                    <div className="flex gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">{step.skillType}</span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm">{step.difficulty}</span>
                    </div>

                    {step.recommendedCourses && step.recommendedCourses.length > 0 && (
                      <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-200">
                        <p className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                          <span className="text-2xl">📚</span>
                          Recommended Courses to Practice:
                        </p>
                        <div className="space-y-3">
                          {step.recommendedCourses.map((rc) => (
                            <a
                              key={rc.roadmapCourseId}
                              href={`/courses/${rc.examCourseId}`}
                              className="block bg-white rounded-lg p-4 hover:shadow-md transition-shadow border border-gray-200 hover:border-blue-400"
                            >
                              <div className="flex items-start gap-3">
                                <span className="text-blue-600 text-xl">→</span>
                                <div className="flex-1">
                                  <div className="flex items-start justify-between gap-2">
                                    <h5 className="font-semibold text-gray-900 hover:text-blue-600">
                                      {rc.courseTitle}
                                      {rc.courseCode && <span className="text-sm text-gray-500 ml-2">({rc.courseCode})</span>}
                                    </h5>
                                    {rc.isCompleted && (
                                      <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">✓ Done</span>
                                    )}
                                  </div>
                                  <p className="text-sm text-gray-600 mt-1">{rc.reasonForRecommendation}</p>
                                  {rc.examType && (
                                    <div className="flex gap-2 mt-2">
                                      <span className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                        {rc.examType}
                                      </span>
                                      {rc.totalExamSets && rc.totalExamSets > 0 && (
                                        <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                                          {rc.totalExamSets} exam sets
                                        </span>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {step.tips && (
                      <div className="mt-3 bg-yellow-50 border-l-4 border-yellow-400 p-3 rounded">
                        <p className="text-sm text-gray-700">
                          <span className="font-semibold text-yellow-700">💡 Tips:</span> {step.tips}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-700 mb-4">No Active Goal</h2>
            <p className="text-gray-600">
              Create a learning goal to get your personalized AI-generated study roadmap!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
