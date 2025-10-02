"use client";

import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";
import { Icon } from "@iconify/react/dist/iconify.js";
import Link from "next/link";
import toast from "react-hot-toast";
import Loader from "@/components/Common/Loader";

export default function SettingsPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    emailNotifications: true,
    pushNotifications: false,
    marketingEmails: true,
    language: "en",
    timezone: "UTC",
    theme: "light"
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = async () => {
    setLoading(true);
    
    try {
      // Here you would implement the settings update API call
      // await AuthService.updateSettings(settings);
      toast.success("Settings saved successfully!");
    } catch (error: any) {
      toast.error(error.message || "Failed to save settings");
    } finally {
      setLoading(false);
    }
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
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600">Manage your account preferences and settings</p>
              </div>
              <button
                onClick={handleSaveSettings}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {loading && <Loader />}
                <Icon icon="heroicons:check" className="w-4 h-4 mr-2" />
                Save Settings
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Notifications</h2>
              <p className="text-sm text-gray-600">Choose what notifications you want to receive</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-500">Receive notifications via email</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-500">Receive push notifications in your browser</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-gray-900">Marketing Emails</h3>
                  <p className="text-sm text-gray-500">Receive emails about new features and promotions</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.marketingEmails}
                    onChange={(e) => handleSettingChange('marketingEmails', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </div>
          </div>

          {/* Preferences */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Preferences</h2>
              <p className="text-sm text-gray-600">Customize your experience</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="en">English</option>
                  <option value="vi">Tiếng Việt</option>
                  <option value="es">Español</option>
                  <option value="fr">Français</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Timezone
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="UTC">UTC</option>
                  <option value="Asia/Ho_Chi_Minh">Ho Chi Minh City (GMT+7)</option>
                  <option value="America/New_York">New York (GMT-5)</option>
                  <option value="Europe/London">London (GMT+0)</option>
                  <option value="Asia/Tokyo">Tokyo (GMT+9)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { value: 'light', label: 'Light', icon: 'heroicons:sun' },
                    { value: 'dark', label: 'Dark', icon: 'heroicons:moon' },
                    { value: 'auto', label: 'Auto', icon: 'heroicons:computer-desktop' }
                  ].map((theme) => (
                    <button
                      key={theme.value}
                      onClick={() => handleSettingChange('theme', theme.value)}
                      className={`flex flex-col items-center p-3 border rounded-lg transition-colors ${
                        settings.theme === theme.value
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <Icon icon={theme.icon} className="w-6 h-6 mb-2" />
                      <span className="text-sm font-medium">{theme.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Account Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Account Actions</h2>
              <p className="text-sm text-gray-600">Manage your account</p>
            </div>
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between p-4 border border-yellow-200 bg-yellow-50 rounded-lg">
                <div className="flex items-center">
                  <Icon icon="heroicons:exclamation-triangle" className="w-5 h-5 text-yellow-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-yellow-800">Export Data</h3>
                    <p className="text-sm text-yellow-700">Download a copy of your account data</p>
                  </div>
                </div>
                <button className="px-3 py-1 text-sm bg-yellow-600 text-white rounded hover:bg-yellow-700 transition-colors">
                  Export
                </button>
              </div>

              <div className="flex items-center justify-between p-4 border border-red-200 bg-red-50 rounded-lg">
                <div className="flex items-center">
                  <Icon icon="heroicons:trash" className="w-5 h-5 text-red-600 mr-3" />
                  <div>
                    <h3 className="text-sm font-medium text-red-800">Delete Account</h3>
                    <p className="text-sm text-red-700">Permanently delete your account and all data</p>
                  </div>
                </div>
                <button className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 transition-colors">
                  Delete
                </button>
              </div>
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
    </div>
  );
}