import { useState } from 'react';
import { useNavigate } from 'react-router';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import { CreateMentorPackageDto } from '../../types/mentorPackage';

export default function CreateMentorPackage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<CreateMentorPackageDto>({
    name: '',
    description: '',
    price: 0,
    durationMonths: 1,
    createdBy: 1 // Default to admin user ID
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'durationMonths' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Sending request to:', 'http://localhost:5074/api/MentorPackage');
      console.log('Request data:', formData);
      
      const response = await fetch('http://localhost:5074/api/MentorPackage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', response.headers);

      if (response.ok) {
        try {
          const createdPackage = await response.json();
          alert('✅ Mentor package created successfully!');
          navigate(`/mentor-packages/${createdPackage.packageId}`);
        } catch (jsonError) {
          // If response is not JSON, just show success message
          alert('✅ Mentor package created successfully!');
          navigate('/mentor-packages');
        }
      } else {
        try {
          const errorData = await response.json();
          alert(`❌ Failed to create mentor package: ${errorData.message || 'Unknown error'}`);
        } catch (jsonError) {
          alert(`❌ Failed to create mentor package: HTTP ${response.status} - ${response.statusText}`);
        }
      }
    } catch (error) {
      console.error('Error creating mentor package:', error);
      alert(`❌ Error creating mentor package: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PageMeta
        title="Create Mentor Package | Elearning - Admin Dashboard"
        description="Create new mentor packages"
      />
      <PageBreadcrumb pageTitle="Create Mentor Package" />
      <div className="space-y-6">
        <ComponentCard title="Create New Mentor Package">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Package Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  maxLength={100}
                  className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter package name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Created By (User ID) *
                </label>
                <input
                  type="number"
                  name="createdBy"
                  value={formData.createdBy}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter user ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                maxLength={500}
                rows={4}
                className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                placeholder="Enter package description"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.description?.length || 0}/500 characters
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Price (VND) *
                </label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  required
                  min="0.01"
                  step="0.01"
                  className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter price"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Price in Vietnamese Dong
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Duration (Months) *
                </label>
                <input
                  type="number"
                  name="durationMonths"
                  value={formData.durationMonths}
                  onChange={handleInputChange}
                  required
                  min="1"
                  className="w-full rounded border border-stroke bg-transparent px-3 py-2 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
                  placeholder="Enter duration in months"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Duration in months
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => navigate('/mentor-packages')}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading ? 'Creating...' : 'Create Package'}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
