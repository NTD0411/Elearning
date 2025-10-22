import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import { MentorPackageDto } from '../../types/mentorPackage';

export default function MentorPackageDetail() {
  const { id } = useParams<{ id: string }>();
  const [mentorPackage, setMentorPackage] = useState<MentorPackageDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchMentorPackage();
    }
  }, [id]);

  const fetchMentorPackage = async () => {
    try {
      const response = await fetch(`http://localhost:5074/api/MentorPackage/${id}`);
      if (response.ok) {
        const data: MentorPackageDto = await response.json();
        setMentorPackage(data);
      } else {
        console.error('Failed to fetch mentor package');
      }
    } catch (error) {
      console.error('Error fetching mentor package:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(price);
  };

  const formatDuration = (months: number) => {
    if (months === 1) return '1 month';
    return `${months} months`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!mentorPackage) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Mentor package not found</h2>
        <Link to="/mentor-packages" className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90">
          Back to Mentor Packages
        </Link>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`${mentorPackage.name} | Mentor Package Detail`}
        description={`View details for mentor package: ${mentorPackage.name}`}
      />
      <PageBreadcrumb pageTitle="Mentor Package Detail" />
      
      <div className="space-y-6">
        {/* Package Info */}
        <ComponentCard title="Package Information">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                {mentorPackage.name}
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 font-mono mb-4">
                Package ID: {mentorPackage.packageId}
              </p>
              <div className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Mentor Package
              </div>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">Description</h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                {mentorPackage.description || 'No description provided'}
              </p>
              <p className="text-xs text-gray-500">
                Created: {mentorPackage.createdAt ? new Date(mentorPackage.createdAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </ComponentCard>

        {/* Package Details */}
        <ComponentCard title="Package Details">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Price</h4>
              <p className="text-2xl font-bold text-primary">
                {formatPrice(mentorPackage.price)}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Duration</h4>
              <p className="text-2xl font-bold text-green-600">
                {formatDuration(mentorPackage.durationMonths)}
              </p>
            </div>
            
            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Created By</h4>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">
                {mentorPackage.createdByName || 'Unknown'}
              </p>
              {mentorPackage.createdBy && (
                <p className="text-xs text-gray-500 mt-1">
                  User ID: {mentorPackage.createdBy}
                </p>
              )}
            </div>
          </div>
        </ComponentCard>

        {/* Package Statistics */}
        <ComponentCard title="Package Statistics">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Package Information</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Package ID:</span>
                  <span className="font-mono text-gray-900 dark:text-white">{mentorPackage.packageId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Name:</span>
                  <span className="text-gray-900 dark:text-white">{mentorPackage.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Price:</span>
                  <span className="text-gray-900 dark:text-white">{formatPrice(mentorPackage.price)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Duration:</span>
                  <span className="text-gray-900 dark:text-white">{formatDuration(mentorPackage.durationMonths)}</span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-3">Creation Details</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created By:</span>
                  <span className="text-gray-900 dark:text-white">{mentorPackage.createdByName || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Created At:</span>
                  <span className="text-gray-900 dark:text-white">
                    {mentorPackage.createdAt ? new Date(mentorPackage.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
                {mentorPackage.createdBy && (
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Creator ID:</span>
                    <span className="text-gray-900 dark:text-white">{mentorPackage.createdBy}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </ComponentCard>

        {/* Actions */}
        <ComponentCard title="Actions">
          <div className="flex items-center space-x-4">
            <Link
              to={`/mentor-packages/edit/${mentorPackage.packageId}`}
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-yellow-600 rounded-lg hover:bg-yellow-700"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Edit Package
            </Link>
            
            <Link
              to="/mentor-packages"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Packages
            </Link>
          </div>
        </ComponentCard>
      </div>
    </>
  );
}
