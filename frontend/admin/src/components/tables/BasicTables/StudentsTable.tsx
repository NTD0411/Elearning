import {
  Table,
  TableBody,
  TableCell,
  TableHeader,
  TableRow,
} from "../../ui/table";
import Badge from "../../ui/badge/Badge";
import { useState, useEffect } from "react";
import { UserService } from "../../../services/userService";

import { User } from "../../../types/user";
import toast from "react-hot-toast";

export default function StudentsTable() {
  const [students, setStudents] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await UserService.getUsers({
        role: 'Student',
        page: 1,
        pageSize: 100
      });
      setStudents(response.users);
    } catch (err) {
      setError('Unable to load student list');
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (studentId: string, currentStatus: string) => {
    try {
      const id = parseInt(studentId);
      const newStatus = currentStatus?.toLowerCase() === 'active' ? 'Inactive' : 'Active';
      await UserService.updateUserStatus(id, newStatus);
      // Refresh the list
      fetchStudents();
    } catch (err) {
      console.error('Error toggling student status:', err);
      toast.error('An error occurred while changing student status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading student list...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <div className="min-w-[1102px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Student
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Email
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Address
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Gender
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Join Date
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Actions
                </TableCell>
              </TableRow>
            </TableHeader>

            {/* Table Body */}
            <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
              {students.map((student) => (
                <TableRow key={student.userId}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200">
                        {student.portraitUrl ? (
                          <img
                            width={40}
                            height={40}
                            src={student.portraitUrl}
                            alt={student.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-semibold">
                            {student.fullName?.charAt(0) || 'U'}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {student.fullName || 'No name'}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          ID: {student.userId}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {student.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {student.address || 'Not provided'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {student.gender || 'Unknown'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={student.status?.toLowerCase() === 'active' ? "success" : "error"}
                    >
                      {student.status?.toLowerCase() === 'active' ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {student.createdAt ? new Date(student.createdAt).toLocaleDateString('vi-VN') : 'Unknown'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <button
                      onClick={() => handleToggleStatus(student.userId.toString(), student.status || '')}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        student.status?.toLowerCase() === 'active'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                    >
                      {student.status?.toLowerCase() === 'active' ? 'Lock' : 'Unlock'}
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {students.length === 0 && (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">No students found</div>
        </div>
      )}
    </div>
  );
}