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

export default function MentorsTable() {
  const [mentors, setMentors] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMentors();
  }, []);

  const fetchMentors = async () => {
    try {
      setLoading(true);
      const response = await UserService.getUsers({
        role: 'mentor',
        page: 1,
        pageSize: 100
      });
      setMentors(response.users);
    } catch (err) {
      setError('Unable to load mentor list');
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (mentorId: string, currentStatus: string) => {
    try {
      const id = parseInt(mentorId);
      const newStatus = currentStatus?.toLowerCase() === 'active' ? 'Inactive' : 'Active';
      console.log('Current status:', currentStatus);
      console.log('New status:', newStatus);
      const response = await UserService.updateUserStatus(id, newStatus);
      console.log('Update response:', response);
      console.log('Status updated successfully');
      // Wait a moment before refreshing to ensure the update has propagated
      setTimeout(() => {
        fetchMentors();
      }, 500);
    } catch (err) {
      console.error('Error toggling mentor status:', err);
      toast.error('An error occurred while changing mentor status');
    }
  };

  const handleApproveToggle = async (mentorId: string, currentApproved: boolean) => {
    try {
      const id = parseInt(mentorId);
      await UserService.approveUser(id, !currentApproved);
      // Refresh the list
      fetchMentors();
    } catch (err) {
      console.error('Error toggling mentor approval:', err);
      toast.error('An error occurred while changing mentor approval status');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Loading mentor list...</div>
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
        <div className="min-w-[1200px]">
          <Table>
            {/* Table Header */}
            <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
              <TableRow>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Mentor
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
                  Experience
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Approval Status
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Activity Status
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
              {mentors.map((mentor) => (
                <TableRow key={mentor.userId}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 overflow-hidden rounded-full bg-gray-200">
                        {mentor.portraitUrl ? (
                          <img
                            width={40}
                            height={40}
                            src={mentor.portraitUrl}
                            alt={mentor.fullName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-500 text-lg font-semibold">
                            {mentor.fullName?.charAt(0) || 'M'}
                          </div>
                        )}
                      </div>
                      <div>
                        <span className="block font-medium text-gray-800 text-theme-sm dark:text-white/90">
                          {mentor.fullName || 'No name'}
                        </span>
                        <span className="block text-gray-500 text-theme-xs dark:text-gray-400">
                          ID: {mentor.userId}
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    {mentor.email}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <div className="max-w-xs truncate" title={mentor.experience}>
                      {mentor.experience || 'No information'}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={mentor.approved ? "success" : "warning"}
                    >
                      {mentor.approved ? "Approved" : "Pending"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={mentor.status?.toLowerCase() === 'active' ? "success" : "error"}
                    >
                      {mentor.status?.toLowerCase() === 'active' ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString('vi-VN') : 'Unknown'}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleApproveToggle(mentor.userId.toString(), mentor.approved || false)}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          mentor.approved
                            ? 'bg-orange-100 text-orange-700 hover:bg-orange-200'
                            : 'bg-blue-100 text-blue-700 hover:bg-blue-200'
                        }`}
                      >
                        {mentor.approved ? 'Unapprove' : 'Approve'}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(mentor.userId.toString(), mentor.status || '')}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        mentor.status?.toLowerCase() === 'active'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}
                      >
                        {mentor.status?.toLowerCase() === 'active' ? 'Lock' : 'Unlock'}
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {mentors.length === 0 && (
        <div className="flex justify-center items-center h-32">
          <div className="text-gray-500">No mentors found</div>
        </div>
      )}
    </div>
  );
}