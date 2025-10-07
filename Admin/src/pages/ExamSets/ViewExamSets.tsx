import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';

interface ExamSet {
  id: number;
  code: string;
  name: string;
  description: string;
  targetQuestions: number;
  questionCount: number;
  createdAt: string;
  type: 'Reading' | 'Listening' | 'Speaking' | 'Writing';
}

export default function ViewExamSets() {
  const [examSets, setExamSets] = useState<ExamSet[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  const examTypes = ['Reading', 'Listening', 'Speaking', 'Writing'];

  useEffect(() => {
    fetchExamSets();
  }, []);

  const fetchExamSets = async () => {
    try {
      setLoading(true);
      const allExamSets: ExamSet[] = [];

      // Fetch from all 4 exam set types
      for (const type of examTypes) {
        try {
          const response = await fetch(`http://localhost:5074/api/ExamSet/${type}`);
          if (response.ok) {
            const data = await response.json();
            console.log(`${type} exam sets:`, data); // Debug log
            const typedData = data.map((item: any) => ({
              id: item.ExamSetId || item.examSetId,
              code: item.ExamSetCode || item.examSetCode,
              name: item.ExamSetTitle || item.examSetTitle,
              description: item.Description || item.description || '',
              targetQuestions: item.TotalQuestions || item.totalQuestions,
              questionCount: item.QuestionCount || item.questionCount || 0,
              createdAt: item.CreatedAt || item.createdAt,
              type: type as ExamSet['type']
            }));
            allExamSets.push(...typedData);
          } else {
            console.error(`Failed to fetch ${type} exam sets:`, response.status);
          }
        } catch (error) {
          console.error(`Error fetching ${type} exam sets:`, error);
        }
      }

      // Sort by creation date (newest first)
      allExamSets.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setExamSets(allExamSets);
    } catch (error) {
      console.error('Error fetching exam sets:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredExamSets = selectedType === 'all' 
    ? examSets 
    : examSets.filter(set => set.type === selectedType);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Reading': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'Listening': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'Speaking': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'Writing': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const deleteExamSet = async (examSet: ExamSet) => {
    if (!window.confirm(`Are you sure you want to delete "${examSet.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5074/api/ExamSet/${examSet.type.toLowerCase()}/${examSet.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Remove the exam set from state
        setExamSets(prev => prev.filter(set => !(set.id === examSet.id && set.type === examSet.type)));
        console.log('Exam set deleted successfully');
      } else {
        console.error('Failed to delete exam set:', response.status);
        alert('Failed to delete exam set. Please try again.');
      }
    } catch (error) {
      console.error('Error deleting exam set:', error);
      alert('Error deleting exam set. Please try again.');
    }
  };

  const getProgressColor = (current: number, target: number) => {
    const percentage = target > 0 ? (current / target) * 100 : 0;
    if (percentage >= 100) return 'text-green-600 dark:text-green-400';
    if (percentage >= 50) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-270">
        <PageMeta
          title="Loading Exam Sets | E-Learning Admin"
          description="Loading exam sets from the E-Learning platform"
        />
        <PageBreadcrumb pageTitle="View Exam Sets" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-270 relative">
      <PageMeta
        title="View Exam Sets | E-Learning Admin"
        description="Manage and view all exam sets in the E-Learning platform"
      />
      <PageBreadcrumb pageTitle="View Exam Sets" />

      {/* Floating Add Exam Set Button */}
      <Link
        to="/create-exam-set"
        className="fixed bottom-8 right-8 z-50 inline-flex items-center justify-center w-16 h-16 bg-blue-500 text-white rounded-full shadow-2xl hover:bg-blue-600 transition-all duration-200 hover:scale-110 border-4 border-white"
        title="Create New Exam Set"
      >
        <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" />
        </svg>
      </Link>

      <div className="rounded-sm border border-stroke bg-white px-5 pt-6 pb-2.5 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        {/* Header with Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="mb-4 sm:mb-0">
            <h4 className="text-xl font-semibold text-black dark:text-white">
              Exam Sets ({filteredExamSets.length})
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Manage and view all exam sets
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            {/* Type Filter */}
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="min-w-[140px] px-4 py-3 text-sm font-medium border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white shadow-sm hover:border-gray-400 transition-colors"
            >
              <option value="all">All Types</option>
              {examTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>

            {/* Create New Button */}
            <Link
              to="/create-exam-set"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 py-3 px-5 text-center font-medium text-white hover:bg-blue-700 transition-colors shadow-sm"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create New Exam Set
            </Link>
          </div>
        </div>

        {/* Exam Sets Grid */}
        {filteredExamSets.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">No exam sets found</div>
            <p className="text-gray-500 mb-4">
              {selectedType === 'all' 
                ? 'Start by creating your first exam set'
                : `No ${selectedType} exam sets available`
              }
            </p>
            <Link
              to="/create-exam-set"
              className="inline-flex items-center justify-center rounded-md bg-blue-600 py-3 px-6 text-center font-medium text-white hover:bg-blue-700 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create Exam Set
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredExamSets.map((examSet) => (
              <div
                key={`${examSet.type}-${examSet.id}`}
                className="bg-white dark:bg-boxdark border border-stroke dark:border-strokedark rounded-lg p-6 hover:shadow-lg transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTypeColor(examSet.type)}`}>
                      {examSet.type}
                    </span>
                    <h3 className="text-lg font-semibold text-black dark:text-white mt-2 mb-1">
                      {examSet.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
                      {examSet.code}
                    </p>
                  </div>
                </div>

                {/* Description */}
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                  {examSet.description || 'No description provided'}
                </p>

                {/* Progress */}
                <div className="mb-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">Questions</span>
                    <span className={`text-sm font-medium ${getProgressColor(examSet.questionCount, examSet.targetQuestions)}`}>
                      {examSet.questionCount}/{examSet.targetQuestions}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 dark:bg-gray-700">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ 
                        width: examSet.targetQuestions > 0 
                          ? `${Math.min((examSet.questionCount / examSet.targetQuestions) * 100, 100)}%` 
                          : '0%' 
                      }}
                    ></div>
                  </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(examSet.createdAt).toLocaleDateString()}
                  </span>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => deleteExamSet(examSet)}
                      className="inline-flex items-center text-xs font-medium text-red-600 hover:text-red-700 hover:underline"
                      title="Delete Exam Set"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                      Delete
                    </button>
                    <Link
                      to={`/exam-sets/edit/${examSet.type.toLowerCase()}/${examSet.id}`}
                      className="inline-flex items-center text-xs font-medium text-yellow-600 hover:text-yellow-700 hover:underline"
                    >
                      <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                      Edit
                    </Link>
                    <Link
                      to={`/exam-sets/${examSet.type.toLowerCase()}/${examSet.id}`}
                      className="inline-flex items-center text-sm font-medium text-primary hover:underline"
                    >
                      View Questions
                      <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}