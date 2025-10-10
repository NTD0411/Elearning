"use client";

import Courses from "@/components/Home/Courses";

export default function CoursesPage() {
  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 pt-20">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            All Courses
          </h1>
          <p className="text-xl text-gray-600">
            Explore our comprehensive range of exam preparation courses
          </p>
        </div>
        <Courses />
      </div>
    </div>
  );
}