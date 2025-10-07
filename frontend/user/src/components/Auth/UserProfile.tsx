"use client";

import { useAuth } from "@/hooks/useAuth";
import { signOut } from "next-auth/react";
import { useState, useRef, useEffect } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";

const UserProfile = () => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  if (isLoading) {
    return (
      <div className="flex items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
      >
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white text-sm font-medium">
            {(user.name || user.email)?.charAt(0).toUpperCase()}
          </span>
        </div>
        <span className="text-gray-900 dark:text-gray-100 text-sm font-medium">
          {user.name || user.email?.split('@')[0]}
        </span>
        <Icon
          icon={isDropdownOpen ? "heroicons:chevron-up" : "heroicons:chevron-down"}
          className="text-gray-500 w-4 h-4"
        />
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="py-2">
            <Link
              href="/profile"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Icon icon="heroicons:user" className="w-4 h-4 mr-2" />
              Profile
            </Link>
            <Link
              href="/settings"
              className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
              onClick={() => setIsDropdownOpen(false)}
            >
              <Icon icon="heroicons:cog-6-tooth" className="w-4 h-4 mr-2" />
              Settings
            </Link>
            <hr className="my-2 border-gray-200 dark:border-gray-700" />
            <button
              onClick={handleSignOut}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <Icon icon="heroicons:arrow-right-on-rectangle" className="w-4 h-4 mr-2" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;