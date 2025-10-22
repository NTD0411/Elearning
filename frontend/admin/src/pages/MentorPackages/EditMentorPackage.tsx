import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import ComponentCard from '../../components/common/ComponentCard';
import PageMeta from '../../components/common/PageMeta';
import { MentorPackageDto, UpdateMentorPackageDto } from '../../types/mentorPackage';

export default function EditMentorPackage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [mentorPackage, setMentorPackage] = useState<MentorPackageDto | null>(null);
  const [formData, setFormData] = useState<UpdateMentorPackageDto>({
    name: '',
    description: '',
    price: 0,
    durationMonths: 1
  });

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
        setFormData({
          name: data.name,
          description: data.description || '',
          price: data.price,
          durationMonths: data.durationMonths
        });
      } else {
        console.error('Failed to fetch mentor package');
        alert('❌ Mentor package not found');
        navigate('/mentor-packages');
      }
    } catch (error) {
      console.error('Error fetching mentor package:', error);
      alert('❌ Error fetching mentor package');
      navigate('/mentor-packages');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'price' || name === 'durationMonths' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const response = await fetch(`http://localhost:5074/api/MentorPackage/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedPackage = await response.json();
        alert('✅ Mentor package updated successfully!');
        navigate(`/mentor-packages/${updatedPackage.packageId}`);
      } else {
        const errorData = await response.json();
        alert(`❌ Failed to update mentor package: ${errorData.message || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error updating mentor package:', error);
      alert(`❌ Error updating mentor package: ${error instanceof Error ? error.message : 'Network error'}`);
    } finally {
      setSaving(false);
    }
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
        <button
          onClick={() => navigate('/mentor-packages')}
          className="mt-4 inline-block px-4 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90"
        >
          Back to Mentor Packages
        </button>
      </div>
    );
  }

  return (
    <>
      <PageMeta
        title={`Edit ${mentorPackage.name} | Elearning - Admin Dashboard`}
        description={`Edit mentor package: ${mentorPackage.name}`}
      />
      <PageBreadcrumb pageTitle="Edit Mentor Package" />
      <div className="space-y-6">
        <ComponentCard title={`Edit Mentor Package: ${mentorPackage.name}`}>
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
                  Created By
                </label>
                <input
                  type="text"
                  value={mentorPackage.createdByName || 'Unknown'}
                  disabled
                  className="w-full rounded border border-stroke bg-gray-100 px-3 py-2 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
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
                {formData.description.length}/500 characters
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
                  Current: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(mentorPackage.price)}
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
                  Current: {mentorPackage.durationMonths} month{mentorPackage.durationMonths !== 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Package Information</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Package ID:</span>
                  <span className="ml-2 font-mono text-gray-900 dark:text-white">{mentorPackage.packageId}</span>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Created At:</span>
                  <span className="ml-2 text-gray-900 dark:text-white">
                    {mentorPackage.createdAt ? new Date(mentorPackage.createdAt).toLocaleString() : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end space-x-4">
              <button
                type="button"
                onClick={() => navigate(`/mentor-packages/${id}`)}
                className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-white dark:hover:bg-gray-500"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </ComponentCard>
      </div>
    </>
  );
}
