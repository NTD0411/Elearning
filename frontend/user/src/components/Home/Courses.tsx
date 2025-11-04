"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  BookOpenIcon,
  MicrophoneIcon,
  PencilIcon,
  SpeakerWaveIcon,
  MagnifyingGlassIcon,
  AcademicCapIcon,
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
  targetBand?: string;
}

const getSkillIcon = (type: string) => {
  switch (type.toLowerCase()) {
    case 'reading':
      return <BookOpenIcon className="w-8 h-8" />;
    case 'speaking':
      return <MicrophoneIcon className="w-8 h-8" />;
    case 'writing':
      return <PencilIcon className="w-8 h-8" />;
    case 'listening':
      return <SpeakerWaveIcon className="w-8 h-8" />;
    default:
      return <BookOpenIcon className="w-8 h-8" />;
  }
};

const getBandColor = (band: string) => {
  if (band.includes('8-9')) return 'from-green-500 to-emerald-600';
  if (band.includes('7-8')) return 'from-blue-500 to-indigo-600';
  if (band.includes('6-7')) return 'from-yellow-500 to-amber-600';
  if (band.includes('5-6')) return 'from-orange-500 to-red-500';
  return 'from-gray-500 to-gray-600';
};

const Courses = () => {
  const [courses, setCourses] = useState<ExamCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedBand, setSelectedBand] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const response = await fetch("http://localhost:5074/api/ExamCourse");
        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }
        const data = await response.json();
        console.log("Fetched courses:", data);
        
        // Assign random target bands for demo
        const coursesWithBands = data.map((course: ExamCourse) => ({
          ...course,
          targetBand: ['Band 5-6', 'Band 6-7', 'Band 7-8', 'Band 8-9'][Math.floor(Math.random() * 4)]
        }));
        
        setCourses(coursesWithBands);
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

  // Filter courses
  const filteredCourses = courses
    .filter(course => {
      if (!course) return false;
      
      const matchesType = selectedType === "all" || 
        (course.examType && course.examType.toLowerCase() === selectedType);
      
      const matchesBand = selectedBand === "all" || course.targetBand === selectedBand;
      
      const titleMatch = course.courseTitle && course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesType && matchesBand && (searchQuery === "" || titleMatch);
    })
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()); // Sort by createdAt in descending order

  // Log filtered and sorted results
  console.log('Filtered and sorted courses:', filteredCourses);

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
    <div>
      {/* Search and Filter Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Box */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-6 flex items-center pointer-events-none">
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
              className="block w-full pl-14 pr-12 py-5 bg-white border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 shadow-sm text-lg"
            />
          </div>
        </div>

        {/* Course Type Filter */}
        <div className="flex flex-wrap justify-center gap-3 mt-8 mb-8">
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

        {/* Band Score Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          <button
            onClick={() => setSelectedBand("all")}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-sm ${
              selectedBand === "all"
                ? "bg-gradient-to-r from-yellow-500 to-amber-600 text-white shadow-lg"
                : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
            }`}
          >
            <AcademicCapIcon className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            All Bands
          </button>
          {['Band 5-6', 'Band 6-7', 'Band 7-8', 'Band 8-9'].map((band) => (
            <button
              key={band}
              onClick={() => setSelectedBand(band)}
              className={`px-5 py-2.5 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 text-sm ${
                selectedBand === band
                  ? `bg-gradient-to-r ${getBandColor(band)} text-white shadow-lg`
                  : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-300"
              }`}
            >
              {band}
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredCourses.map((course) => (
            <Link key={course.examCourseId} href={`/courses/${course.examCourseId}`}>
              <div className="h-full bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 group">
                {/* IELTS Header with Background Image */}
                <div className="relative h-40 overflow-hidden">
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: "url('/images/ChatGPT Image 19_07_50 4 thg 11, 2025.png')" }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/90 via-red-500/85 to-red-700/90" />
                  
                  {/* Band Badge */}
                  {course.targetBand && (
                    <div className="absolute top-3 right-3 z-10">
                      <div className={`px-3 py-1.5 rounded-full text-white text-xs font-bold shadow-lg bg-gradient-to-r ${getBandColor(course.targetBand)}`}>
                        <AcademicCapIcon className="w-3.5 h-3.5 inline mr-1 -mt-0.5" />
                        {course.targetBand}
                      </div>
                    </div>
                  )}
                  
                  {/* Centered Content */}
                  <div className="relative h-full flex flex-col items-center justify-center text-white p-6">
                    <div className="mb-3 transform group-hover:scale-110 transition-transform duration-300">
                      {getSkillIcon(course.examType)}
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold tracking-wider uppercase opacity-90">
                        IELTS Preparation Test
                      </p>
                      <p className="text-sm font-medium mt-1 capitalize">
                        {course.examType}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-6">
                  <h3 className="font-bold text-xl text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.courseTitle}
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Code: <span className="font-medium text-gray-700">{course.courseCode}</span>
                  </p>
                  
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="flex items-center text-gray-600">
                        <span className="font-semibold text-primary">{course.totalExamSets}</span>
                        <span className="ml-1">Practice Sets</span>
                      </span>
                      <span className="text-gray-400">
                        {new Date(course.createdAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Courses;