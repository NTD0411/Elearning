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
        const response = await fetch("http://localhost:5074/api/ExamCourse");
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
    <section className="pt-[120px] pb-[90px]">
      <div className="container">
        {/* Search Box */}
        <div className="max-w-3xl mx-auto mb-8">
          <div className="relative rounded-full">
            <input
              type="text"
              placeholder="Search courses..."
              value={searchQuery}
              onChange={(e) => {
                const value = e.target.value;
                console.log('Search input changed:', value);
                setSearchQuery(value);
              }}
              className="py-6 lg:py-8 pl-8 pr-20 text-lg w-full text-black rounded-full focus:outline-none shadow-[0_0_30px_rgba(0,0,0,0.06)]"
            />
            <button 
              className="bg-primary p-5 rounded-full absolute right-2 top-1/2 transform -translate-y-1/2 text-white hover:bg-primary/90 transition-colors"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Course Type Filter */}
        <div className="flex justify-center mb-8 space-x-4">
          <button
            onClick={() => setSelectedType("all")}
            className={`px-4 py-2 rounded-lg ${
              selectedType === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All ({courses.length})
          </button>
          {Object.keys(groupedCourses).map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              className={`px-4 py-2 rounded-lg capitalize ${
                selectedType === type
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {type} ({groupedCourses[type].length})
            </button>
          ))}
        </div>

        {/* Course Grid */}
        <div className="flex flex-wrap -mx-4">
          {filteredCourses.map((course) => (
            <div key={course.examCourseId} className="w-full md:w-1/2 lg:w-1/3 px-4">
              <div className="mb-10 group bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-all">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="p-2 bg-primary/[.08] rounded-lg text-primary">
                    {getSkillIcon(course.examType)}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-dark group-hover:text-primary">
                      <Link href={`/courses/${course.examCourseId}`}>
                        {course.courseTitle}
                      </Link>
                    </h3>
                    <p className="text-sm text-gray-500">
                      Course Code: {course.courseCode}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="bg-primary/[.08] rounded-lg py-1 px-3 text-sm font-medium text-primary">
                    {course.examType}
                  </span>
                  <span className="text-sm text-gray-500">
                    Created: {new Date(course.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Courses;