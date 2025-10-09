import { useState, useEffect } from 'react';
import { Link } from 'react-router';
import PageBreadcrumb from '../../components/common/PageBreadCrumb';
import PageMeta from '../../components/common/PageMeta';
import { ExamCourseDto, DeleteResultDto } from '../../types/examCourse';

export default function ViewExamCourses() {
  const [examCourses, setExamCourses] = useState<ExamCourseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');

  useEffect(() => {
    fetchExamCourses();
  }, []);

  const fetchExamCourses = async () => {
    try {
      const response = await fetch('http://localhost:5074/api/ExamCourse');
      if (response.ok) {
        const data = await response.json();
        setExamCourses(data);
      } else {
        console.error('Failed to fetch exam courses');
      }
    } catch (error) {
      console.error('Error fetching exam courses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Group courses by exam type
  const groupedCourses = examCourses.reduce((acc, course) => {
    const type = course.examType.toLowerCase();
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type].push(course);
    return acc;
  }, {} as Record<string, ExamCourseDto[]>);

  // Filter courses based on selected type
  const filteredCourses = selectedType === 'all' 
    ? examCourses 
    : examCourses.filter(course => course.examType.toLowerCase() === selectedType);

  const getTypeCounts = () => {
    return {
      all: examCourses.length,
      reading: groupedCourses.reading?.length || 0,
      listening: groupedCourses.listening?.length || 0,
      speaking: groupedCourses.speaking?.length || 0,
      writing: groupedCourses.writing?.length || 0,
    };
  };

  const typeCounts = getTypeCounts();

  const deleteExamCourse = async (id: number, title: string) => {
    const reason = window.prompt(
      `Are you sure you want to delete the exam course "${title}"?\n\nThis action cannot be undone and will remove all associated data.\n\nOptional: Please provide a reason for deletion:`,
      ''
    );
    
    if (reason === null) {
      return; // User cancelled
    }

    try {
      const deleteRequest = {
        examCourseId: id,
        forceDelete: false,
        reason: reason.trim() || undefined
      };

      const response = await fetch(`http://localhost:5074/api/ExamCourse/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deleteRequest),
      });

      if (response.ok) {
        const result: DeleteResultDto = await response.json();
        alert(
          `✅ ${result.message}\n\n` +
          `📊 Statistics:\n` +
          `• Deleted submissions: ${result.deletedSubmissionsCount}\n` +
          `• Deleted assignments: ${result.deletedAssignmentsCount}\n` +
          `• Deleted at: ${new Date(result.deletedAt).toLocaleString()}`
        );
        fetchExamCourses(); // Refresh the list
      } else {
        const errorResult: DeleteResultDto = await response.json();
        console.error('Delete failed:', errorResult);
        alert(`❌ Failed to delete exam course:\n\n${errorResult.message}`);
      }
    } catch (error) {
      console.error('Error deleting exam course:', error);
      alert(`❌ Error deleting exam course: ${error instanceof Error ? error.message : 'Network error'}`);
    }
  };

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'reading': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'listening': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'speaking': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
      case 'writing': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="mx-auto max-w-270">
        <PageMeta
          title="Exam Courses | Elearning - Admin Dashboard"
          description="Manage exam courses"
        />
        <PageBreadcrumb pageTitle="Exam Courses" />
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-270">
      <PageMeta
        title="Exam Courses | Elearning - Admin Dashboard"
        description="Manage exam courses"
      />
      <PageBreadcrumb pageTitle="Exam Courses" />

      <div className="rounded-sm border border-stroke bg-white px-5 pb-2.5 pt-6 shadow-default dark:border-strokedark dark:bg-boxdark sm:px-7.5 xl:pb-1">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h4 className="text-xl font-semibold text-black dark:text-white">
            Exam Courses ({filteredCourses.length})
          </h4>
          <Link
            to="/exam-courses/create"
            className="inline-flex items-center justify-center rounded-md bg-primary py-2 px-4 text-center font-medium text-white hover:bg-opacity-90 lg:px-8 xl:px-10"
          >
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create New Course
          </Link>
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            {[
              { key: 'all', label: 'All', count: typeCounts.all },
              { key: 'reading', label: 'Reading', count: typeCounts.reading },
              { key: 'listening', label: 'Listening', count: typeCounts.listening },
              { key: 'speaking', label: 'Speaking', count: typeCounts.speaking },
              { key: 'writing', label: 'Writing', count: typeCounts.writing },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setSelectedType(tab.key)}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  selectedType === tab.key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </nav>
        </div>

        {filteredCourses.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-gray-400 text-lg mb-2">
              {selectedType === 'all' ? 'No exam courses found' : `No ${selectedType} exam courses found`}
            </div>
            <p className="text-gray-500 mb-4">
              {selectedType === 'all' 
                ? 'Create your first exam course to get started'
                : `Create your first ${selectedType} exam course`
              }
            </p>
            <Link
              to="/exam-courses/create"
              className="inline-flex items-center justify-center rounded-md bg-primary py-3 px-6 text-center font-medium text-white hover:bg-opacity-90"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Create First Course
            </Link>
          </div>
        ) : (
          <div className="max-w-full overflow-x-auto">
            <table className="w-full table-auto">
              <thead>
                <tr className="bg-gray-2 text-left dark:bg-meta-4">
                  <th className="min-w-[220px] px-4 py-4 font-medium text-black dark:text-white xl:pl-11">
                    Course Title
                  </th>
                  <th className="min-w-[150px] px-4 py-4 font-medium text-black dark:text-white">
                    Course Code
                  </th>
                  <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                    Type
                  </th>
                  <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                    Exam Sets
                  </th>
                  <th className="min-w-[120px] px-4 py-4 font-medium text-black dark:text-white">
                    Created
                  </th>
                  <th className="px-4 py-4 font-medium text-black dark:text-white">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((course) => (
                  <tr key={course.examCourseId}>
                    <td className="border-b border-[#eee] px-4 py-5 pl-9 dark:border-strokedark xl:pl-11">
                      <h5 className="font-medium text-black dark:text-white">
                        {course.courseTitle}
                      </h5>
                      {course.description && (
                        <p className="text-sm text-gray-500 mt-1">
                          {course.description.length > 100 
                            ? `${course.description.substring(0, 100)}...` 
                            : course.description}
                        </p>
                      )}
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="text-black dark:text-white font-mono text-sm">
                        {course.courseCode}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <span className={`inline-flex rounded-full px-3 py-1 text-xs font-medium ${getTypeColor(course.examType)}`}>
                        {course.examType.charAt(0).toUpperCase() + course.examType.slice(1)}
                      </span>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="text-black dark:text-white font-semibold">
                        {course.totalExamSets}
                      </p>
                      <p className="text-xs text-gray-500">
                        exam sets
                      </p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <p className="text-black dark:text-white">
                        {new Date(course.createdAt).toLocaleDateString()}
                      </p>
                    </td>
                    <td className="border-b border-[#eee] px-4 py-5 dark:border-strokedark">
                      <div className="flex items-center space-x-2">
                        <Link
                          to={`/exam-courses/${course.examCourseId}`}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900 rounded"
                          title="View Details"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                          View
                        </Link>
                        <Link
                          to={`/exam-courses/edit/${course.examCourseId}`}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-600 hover:text-yellow-700 hover:bg-yellow-50 dark:hover:bg-yellow-900 rounded"
                          title="Edit Course"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Edit
                        </Link>
                        <button
                          onClick={() => deleteExamCourse(course.examCourseId, course.courseTitle)}
                          className="inline-flex items-center px-2 py-1 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900 rounded"
                          title="Delete Course"
                        >
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}