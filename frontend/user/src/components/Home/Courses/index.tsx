"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  MicrophoneIcon,
  PencilIcon,
  SpeakerWaveIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";

interface ExamCourse {
  examCourseId: number;
  courseTitle: string;
  courseCode: string;
  description: string;
  examType: string;
  createdAt: string;
  readingExamSetsCount: number;
  writingExamSetsCount: number;
  listeningExamSetsCount: number;
  speakingExamSetsCount: number;
  totalExamSets: number;
}

const getSkillIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'reading':
      return <BookOpenIcon className="w-6 h-6" />;
    case 'speaking':
      return <MicrophoneIcon className="w-6 h-6" />;
    case 'writing':
      return <PencilIcon className="w-6 h-6" />;
    case 'listening':
      return <SpeakerWaveIcon className="w-6 h-6" />;
    default:
      return <BookOpenIcon className="w-6 h-6" />;
  }
};

const Courses = () => {
  const [courses, setCourses] = useState<ExamCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
  const response = await fetch("https://e-learningsite.runasp.net/api/ExamCourse");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        console.log("Fetched courses:", data);
        setCourses(data);
      } catch (err) {
        console.error("Error loading courses:", err);
        setError("Failed to load courses. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  // Group courses by exam type
  const groupedCourses = courses.reduce((acc, course) => {
    const type = course.examType.toLowerCase();
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(course);
    return acc;
  }, {} as Record<string, ExamCourse[]>);

  // Filter courses based on selected type and search query
  const filteredCourses = courses.filter(course => {
    if (!course) return false;
    
    // Log for debugging
    console.log('Course being filtered:', course);
    console.log('Current search query:', searchQuery);
    
    const matchesType = selectedType === "all" || 
      (course.examType && course.examType.toLowerCase() === selectedType);
    
    const titleMatch = course.courseTitle && course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    console.log('Title matches search:', titleMatch);
    
    return matchesType && (searchQuery === "" || titleMatch);
  });

  // Log filtered results
  console.log('Filtered courses:', filteredCourses);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-600 min-h-[400px] flex items-center justify-center">
        {error}
      </div>
    );
  }

  return (
    <section className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Explore Our Courses</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover a wide range of courses designed to help you master English proficiency
          </p>
        </div>

        {/* Search Box */}
        <div className="max-w-3xl mx-auto mb-12">
          <div className="relative">
            <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search for courses..."
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                setSearchQuery(value);
              }}
              className="w-full py-4 pl-12 pr-4 text-gray-900 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white shadow-sm"
            />
          </div>
        </div>

        {/* Course Type Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 ${
              selectedType === "all"
                ? "bg-primary text-white shadow-lg shadow-primary/30"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            All Courses ({courses.length})
          </button>
          {Object.keys(groupedCourses).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 capitalize ${
                selectedType === type
                  ? "bg-primary text-white shadow-lg shadow-primary/30"
                  : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
              }`}
            >
              {type} ({groupedCourses[type].length})
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <div key={course.examCourseId} className="group">
              <Link href={`/courses/${course.examCourseId}`}>
                <div className="h-full bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary/20">
                  <div className="flex items-start space-x-4">
                    <div className="p-3 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl text-primary transform group-hover:scale-110 transition-transform duration-300">
                      {getSkillIcon(course.examType)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-xl text-gray-900 group-hover:text-primary truncate">
                        {course.courseTitle}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Code: {course.courseCode}
                      </p>
                    </div>
                  </div>
                  
                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="inline-flex items-center px-4 py-2 rounded-lg bg-primary/[.08] text-primary text-sm font-medium">
                        {getSkillIcon(course.examType)}
                        <span className="ml-2">{course.examType}</span>
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(course.createdAt).toLocaleDateString(undefined, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center text-sm text-gray-500 space-x-4">
                      <span>{course.totalExamSets} Practice Sets</span>
                      <span>•</span>
                      <span>Updated Recently</span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;
