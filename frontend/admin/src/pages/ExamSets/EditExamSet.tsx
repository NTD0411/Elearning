import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';

interface ExamSet {
  id: number;
  code: string;
  name: string;
  description: string;
  targetQuestions: number;
  questionCount: number;
  createdAt: string;
  type: string;
}

export default function EditExamSet() {
  const { type, id } = useParams<{ type: string; id: string }>();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [examSet, setExamSet] = useState<ExamSet | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    targetQuestions: 5
  });

  useEffect(() => {
    if (type && id) {
      fetchExamSet();
    }
  }, [type, id]);

  const fetchExamSet = async () => {
    try {
      setLoading(true);
      const capitalizedType = type!.charAt(0).toUpperCase() + type!.slice(1);
      const response = await fetch(`${process.env.VITE_API_URL || 'https://e-learningsite.runasp.net/api'}/ExamSet/${capitalizedType}/${id}`);
      if (response.ok) {
        const data = await response.json();
        setExamSet(data);
        setFormData({
          name: data.name,
          targetQuestions: data.targetQuestions
        });
      } else {
        console.error('Failed to fetch exam set');
        navigate('/exam-sets/view');
      }
    } catch (error) {
      console.error('Error fetching exam set:', error);
      navigate('/exam-sets/view');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'targetQuestions' ? parseInt(value) : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const capitalizedType = type!.charAt(0).toUpperCase() + type!.slice(1);
      const response = await fetch(`${process.env.VITE_API_URL || 'https://e-learningsite.runasp.net/api'}/ExamSet/${capitalizedType}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          examSetTitle: formData.name,
          totalQuestions: formData.targetQuestions
        }),
      });

      if (response.ok) {
        alert('Exam set updated successfully!');
        navigate(`/exam-sets/${type}/${id}`);
      } else {
        const error = await response.text();
        alert(`Error updating exam set: ${error}`);
      }
    } catch (error) {
      console.error('Error updating exam set:', error);
      alert('Failed to update exam set');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-270">
        <PageBreadcrumb pageTitle="Edit Exam Set" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!examSet) {
    return (
      <div className="mx-auto max-w-270">
        <PageBreadcrumb pageTitle="Edit Exam Set" />
        <div className="text-center py-12">
          <div className="text-gray-400 text-lg mb-2">Exam set not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-270">
      <PageBreadcrumb pageTitle="Edit Exam Set" />

      <div className="rounded-sm border border-stroke bg-white shadow-default dark:border-strokedark dark:bg-boxdark">
        <div className="border-b border-stroke py-4 px-6.5 dark:border-strokedark">
          <h3 className="font-medium text-black dark:text-white">
            Edit {type ? type.charAt(0).toUpperCase() + type.slice(1) : 'Unknown'} Exam Set
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Code: {examSet.code} | Created: {new Date(examSet.createdAt).toLocaleDateString()}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6.5">
          <div className="mb-4.5">
            <label className="mb-2.5 block text-black dark:text-white">
              Exam Set Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
              placeholder="Enter exam set name"
            />
          </div>

          <div className="mb-6">
            <label className="mb-2.5 block text-black dark:text-white">
              Target Number of Questions *
            </label>
            <select
              name="targetQuestions"
              value={formData.targetQuestions}
              onChange={handleInputChange}
              required
              className="w-full rounded border-[1.5px] border-stroke bg-transparent py-3 px-5 text-black outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter dark:border-form-strokedark dark:bg-form-input dark:text-white dark:focus:border-primary"
            >
              {Array.from({ length: 18 }, (_, i) => i + 3).map(num => (
                <option key={num} value={num}>{num} questions</option>
              ))}
            </select>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Current questions: {examSet.questionCount}/{examSet.targetQuestions}
            </p>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => navigate(`/exam-sets/${type}/${id}`)}
              className="flex justify-center rounded border border-stroke py-2 px-6 font-medium text-black hover:shadow-1 dark:border-strokedark dark:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex justify-center rounded bg-primary py-2 px-6 font-medium text-gray hover:bg-opacity-90 disabled:opacity-50"
            >
              {saving ? 'Updating...' : 'Update Exam Set'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}