"use client";

import Courses from "@/components/Home/Courses";

export default function CoursesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section with Gradient Background */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/90 to-primary pt-16 pb-24">
        {/* Decorative Elements */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10"></div>
          <div className="absolute right-0 top-0 -translate-y-12 translate-x-12 transform">
            <svg width="400" height="400" fill="none" viewBox="0 0 400 400">
              <defs>
                <pattern id="pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="4" height="4" className="text-white" fill="currentColor"></rect>
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#pattern)" fillOpacity="0.1"></rect>
            </svg>
          </div>
          <div className="absolute bottom-0 left-0 translate-y-12 -translate-x-12 transform">
            <svg width="400" height="400" fill="none" viewBox="0 0 400 400">
              <defs>
                <pattern id="pattern2" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                  <rect x="0" y="0" width="4" height="4" className="text-white" fill="currentColor"></rect>
                </pattern>
              </defs>
              <rect width="400" height="400" fill="url(#pattern2)" fillOpacity="0.1"></rect>
            </svg>
          </div>
        </div>
        
        {/* Hero Content */}
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
              Explore Our Courses
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-xl text-white/80">
              Enhance your English proficiency with our comprehensive range of exam preparation courses.
              Master Reading, Writing, Speaking, and Listening skills.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="relative">
        {/* Decorative curved shape */}
        <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
          <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-primary to-secondary opacity-20 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
        </div>

        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <Courses />
        </div>
      </div>
    </div>
  );
}