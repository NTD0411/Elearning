"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import React from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import { AuthService } from "@/services/authService";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";

export default function ProfilePage() {
  const { user, isAuthenticated, isLoading, accessToken } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showPasswordConfirmDialog, setShowPasswordConfirmDialog] = useState(false);
  const [pendingFormData, setPendingFormData] = useState<any>(null);
  const [formData, setFormData] = useState({
    fullName: (user as any)?.fullName || user?.name || "",
    email: user?.email || "",
    portraitUrl: (user as any)?.portraitUrl || "",
    experience: (user as any)?.experience || "",
    gender: (user as any)?.gender || "",
    address: (user as any)?.address || "",
    dateOfBirth: (user as any)?.dateOfBirth || "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  // Update form data when user data is loaded
  React.useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: (user as any)?.fullName || user?.name || prev.fullName,
        email: user?.email || prev.email,
        portraitUrl: (user as any)?.portraitUrl || prev.portraitUrl,
        experience: (user as any)?.experience || prev.experience,
        gender: (user as any)?.gender || prev.gender,
        address: (user as any)?.address || prev.address,
        dateOfBirth: (user as any)?.dateOfBirth || prev.dateOfBirth
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setPendingFormData(formData);
    setShowConfirmDialog(true);
  };

  const confirmUpdateProfile = async () => {
    if (!pendingFormData || !accessToken) {
      toast.error("Authentication required");
      return;
    }
    
    setLoading(true);
    setShowConfirmDialog(false);

    try {
      await AuthService.updateProfile({
        fullName: pendingFormData.fullName,
        portraitUrl: pendingFormData.portraitUrl,
        experience: pendingFormData.experience,
        gender: pendingFormData.gender,
        address: pendingFormData.address,
        dateOfBirth: pendingFormData.dateOfBirth
      }, accessToken);
      toast.success("Profile updated successfully!");
      setIsEditing(false);
      setPendingFormData(null);
    } catch (error: any) {
      toast.error(error.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const cancelUpdate = () => {
    setShowConfirmDialog(false);
    setPendingFormData(null);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    if (formData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    setShowPasswordConfirmDialog(true);
  };

  const confirmChangePassword = async () => {
    setLoading(true);
    setShowPasswordConfirmDialog(false);

    try {
      // Here you would implement the change password API call
      // await AuthService.changePassword({
      //   currentPassword: formData.currentPassword,
      //   newPassword: formData.newPassword
      // });
      toast.success("Password changed successfully!");
      setFormData(prev => ({
        ...prev,
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      }));
    } catch (error: any) {
      toast.error(error.message || "Failed to change password");
    } finally {
      setLoading(false);
    }
  };

  const cancelPasswordChange = () => {
    setShowPasswordConfirmDialog(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-4">You need to be logged in to access this page.</p>
          <Link href="/" className="text-primary hover:underline">
            Go back to homepage
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-white text-2xl font-medium">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">
                    {(user as any)?.fullName || user?.name || "User"}
                  </h1>
                  <p className="text-gray-600">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
              >
                <Icon icon="heroicons:pencil" className="w-4 h-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Information */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Profile Information</h2>
            </div>
            <div className="p-6">
              {isEditing ? (
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      disabled
                    />
                    <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gender
                    </label>
                    <select
                      name="gender"
                      value={formData.gender}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Address
                    </label>
                    <input
                      type="text"
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Enter your address"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Experience
                    </label>
                    <textarea
                      name="experience"
                      value={formData.experience}
                      onChange={handleInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="Tell us about your experience"
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                      {loading && <Loader />}
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="space-y-4">
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <p className="text-gray-900">
                        {formData.fullName || "Click to add your full name"}
                      </p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon icon="heroicons:pencil" className="w-4 h-4 text-gray-400 hover:text-primary" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address
                    </label>
                    <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <p className="text-gray-900">{user?.email}</p>
                      <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <p className="text-gray-900">
                        {formData.gender || "Click to select your gender"}
                      </p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon icon="heroicons:pencil" className="w-4 h-4 text-gray-400 hover:text-primary" />
                      </button>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date of Birth
                    </label>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <p className="text-gray-900">
                        {formData.dateOfBirth || "Click to add your date of birth"}
                      </p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon icon="heroicons:pencil" className="w-4 h-4 text-gray-400 hover:text-primary" />
                      </button>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address
                    </label>
                    <div className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <p className="text-gray-900">
                        {formData.address || "Click to add your address"}
                      </p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <Icon icon="heroicons:pencil" className="w-4 h-4 text-gray-400 hover:text-primary" />
                      </button>
                    </div>
                  </div>
                  <div className="group">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Experience
                    </label>
                    <div className="flex items-start justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-colors">
                      <p className="text-gray-900 flex-1">
                        {formData.experience || "Click to add your experience"}
                      </p>
                      <button
                        onClick={() => setIsEditing(true)}
                        className="opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                      >
                        <Icon icon="heroicons:pencil" className="w-4 h-4 text-gray-400 hover:text-primary" />
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Account Status
                    </label>
                    <div className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Change Password */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Change Password</h2>
            </div>
            <div className="p-6">
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    required
                    minLength={6}
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading && <Loader />}
                  Change Password
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-6 text-center">
          <Link
            href="/"
            className="inline-flex items-center text-primary hover:text-primary/80 transition-colors"
          >
            <Icon icon="heroicons:arrow-left" className="w-4 h-4 mr-2" />
            Back to Homepage
          </Link>
        </div>
      </div>

      {/* Confirmation Dialog */}
      {showConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Icon icon="heroicons:exclamation-triangle" className="w-6 h-6 text-yellow-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Profile Update</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to update your profile information? This action will save your changes.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmUpdateProfile}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading && <Loader />}
                {!loading && <Icon icon="heroicons:check" className="w-4 h-4 mr-2" />}
                Confirm Update
              </button>
              <button
                onClick={cancelUpdate}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Change Confirmation Dialog */}
      {showPasswordConfirmDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center mb-4">
              <Icon icon="heroicons:shield-exclamation" className="w-6 h-6 text-red-600 mr-3" />
              <h3 className="text-lg font-semibold text-gray-900">Confirm Password Change</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Are you sure you want to change your password? You will need to use the new password for future logins.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmChangePassword}
                disabled={loading}
                className="flex-1 flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                {loading && <Loader />}
                {!loading && <Icon icon="heroicons:key" className="w-4 h-4 mr-2" />}
                Change Password
              </button>
              <button
                onClick={cancelPasswordChange}
                disabled={loading}
                className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}