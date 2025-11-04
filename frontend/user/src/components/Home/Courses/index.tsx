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
  targetBand?: string; // Band điểm mục tiêu
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

const getGradientByType = (type: string) => {
  switch (type.toLowerCase()) {
    case 'reading':
      return 'from-blue-500 via-blue-600 to-indigo-700';
    case 'writing':
      return 'from-purple-500 via-purple-600 to-pink-600';
    case 'listening':
      return 'from-green-500 via-teal-600 to-cyan-600';
    case 'speaking':
      return 'from-orange-500 via-red-500 to-pink-600';
    default:
      return 'from-gray-500 via-gray-600 to-gray-700';
  }
};

const getBandColor = (band: string) => {
  if (band.includes('8-9')) return 'bg-green-100 text-green-800 border-green-300';
  if (band.includes('7-8')) return 'bg-blue-100 text-blue-800 border-blue-300';
  if (band.includes('6-7')) return 'bg-yellow-100 text-yellow-800 border-yellow-300';
  return 'bg-gray-100 text-gray-800 border-gray-300';
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
        
        // Assign random target bands for demo (you can get this from backend later)
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

  // Filter courses based on selected type, band, and search query
  const filteredCourses = courses.filter(course => {
    if (!course) return false;
    
    const matchesType = selectedType === "all" || 
      (course.examType && course.examType.toLowerCase() === selectedType);
    
    const matchesBand = selectedBand === "all" || course.targetBand === selectedBand;
    
    const titleMatch = course.courseTitle && course.courseTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesBand && (searchQuery === "" || titleMatch);
  });

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
    <div className="w-full">
      {/* Search Box */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search for courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full py-4 pl-12 pr-4 text-gray-900 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-200 bg-white shadow-sm"
          />
        </div>
      </div>

      {/* Course Type Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-6">
        <button
          onClick={() => setSelectedType("all")}
          className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 text-sm ${
            selectedType === "all"
              ? "bg-primary text-white shadow-md"
              : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
          }`}
        >
          All Courses ({courses.length})
        </button>
        {Object.keys(groupedCourses).map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 capitalize text-sm ${
              selectedType === type
                ? "bg-primary text-white shadow-md"
                : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
            }`}
          >
            {type} ({groupedCourses[type].length})
          </button>
        ))}
      </div>

      {/* Band Filter */}
      <div className="flex flex-wrap justify-center gap-3 mb-10">
        <button
          onClick={() => setSelectedBand("all")}
          className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 text-sm border ${
            selectedBand === "all"
              ? "bg-indigo-600 text-white border-indigo-600"
              : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
          }`}
        >
          All Bands
        </button>
        {['Band 5-6', 'Band 6-7', 'Band 7-8', 'Band 8-9'].map((band) => (
          <button
            key={band}
            onClick={() => setSelectedBand(band)}
            className={`px-5 py-2 rounded-lg font-medium transition-all duration-200 text-sm border ${
              selectedBand === band
                ? getBandColor(band).replace('bg-', 'bg-') + ' font-semibold'
                : "bg-white text-gray-700 hover:bg-gray-50 border-gray-300"
            }`}
          >
            <AcademicCapIcon className="w-4 h-4 inline mr-1.5 -mt-0.5" />
            {band}
          </button>
        ))}
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCourses.map((course) => (
            <Link 
              key={course.examCourseId} 
              href={`/courses/${course.examCourseId}`}
              className="group block"
            >
              <div className="bg-white rounded-2xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                {/* Image Background with Overlay */}
                <div className="relative h-48 overflow-hidden">
                  {/* Background Image */}
                  <div 
                    className="absolute inset-0 bg-cover bg-center"
                    style={{
                      backgroundImage: `url('/images/ChatGPT Image 19_07_50 4 thg 11, 2025.png')`,
                    }}
                  />
                  
                  {/* Red Overlay matching the image color */}
                  <div className="absolute inset-0 bg-gradient-to-br from-red-600/90 via-red-500/85 to-red-700/90" />
                  
                  {/* Content on top */}
                  <div className="relative h-full p-6 flex flex-col items-center justify-center text-white">
                    {/* Skill Icon */}
                    <div className="transform group-hover:scale-110 transition-transform duration-300 mb-3">
                      {getSkillIcon(course.examType)}
                    </div>
                    
                    {/* IELTS Text */}
                    <div className="text-center">
                      <h4 className="text-2xl font-bold tracking-wide mb-1">IELTS</h4>
                      <p className="text-sm font-medium uppercase tracking-wider opacity-90">Preparation Test</p>
                    </div>
                  </div>
                  
                  {/* Band Badge */}
                  <div className={`absolute top-3 right-3 px-3 py-1.5 rounded-full text-xs font-bold border shadow-lg ${getBandColor(course.targetBand || 'Band 6-7')}`}>
                    {course.targetBand || 'Band 6-7'}
                  </div>
                </div>

                {/* Content */}
                <div className="p-5">
                  <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                    {course.courseTitle}
                  </h3>
                  
                  <div className="flex items-center gap-2 mb-4">
                    <span className={`inline-block px-3 py-1 rounded-md text-xs font-medium capitalize ${
                      course.examType.toLowerCase() === 'reading' ? 'bg-blue-100 text-blue-700' :
                      course.examType.toLowerCase() === 'writing' ? 'bg-purple-100 text-purple-700' :
                      course.examType.toLowerCase() === 'listening' ? 'bg-green-100 text-green-700' :
                      'bg-orange-100 text-orange-700'
                    }`}>
                      {course.examType}
                    </span>
                    <span className="text-xs text-gray-500">
                      Code: {course.courseCode}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t border-gray-100">
                    <span className="font-medium">{course.totalExamSets} Practice Sets</span>
                    <span className="text-xs">
                      {new Date(course.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {filteredCourses.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
              <MagnifyingGlassIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No courses found</h3>
            <p className="text-gray-600">Try adjusting your filters or search query</p>
          </div>
        )}
    </div>
  );
};

export default Courses;
