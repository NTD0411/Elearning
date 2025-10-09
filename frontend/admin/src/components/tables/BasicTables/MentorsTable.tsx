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
      setError('Không thể tải danh sách mentor');
      console.error('Error fetching mentors:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (mentorId: string, currentStatus: boolean) => {
    try {
      const id = parseInt(mentorId);
      if (currentStatus) {
        await UserService.updateUserStatus(id, 'inactive');
      } else {
        await UserService.updateUserStatus(id, 'active');
      }
      // Refresh the list
      fetchMentors();
    } catch (err) {
      console.error('Error toggling mentor status:', err);
      alert('Có lỗi xảy ra khi thay đổi trạng thái mentor');
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
      alert('Có lỗi xảy ra khi thay đổi trạng thái duyệt mentor');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-500">Đang tải danh sách mentor...</div>
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
                  Kinh nghiệm
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Trạng thái duyệt
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Trạng thái hoạt động
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Ngày tham gia
                </TableCell>
                <TableCell
                  isHeader
                  className="px-5 py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400"
                >
                  Hành động
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
                          {mentor.fullName || 'Chưa có tên'}
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
                      {mentor.experience || 'Chưa có thông tin'}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={mentor.approved ? "success" : "warning"}
                    >
                      {mentor.approved ? "Đã duyệt" : "Chờ duyệt"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-theme-sm dark:text-gray-400">
                    <Badge
                      size="sm"
                      color={mentor.status === 'active' ? "success" : "error"}
                    >
                      {mentor.status === 'active' ? "Hoạt động" : "Bị khóa"}
                    </Badge>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                    {mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString('vi-VN') : 'Chưa rõ'}
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
                        {mentor.approved ? 'Hủy duyệt' : 'Duyệt'}
                      </button>
                      <button
                        onClick={() => handleToggleStatus(mentor.userId.toString(), mentor.status === 'active')}
                        className={`px-2 py-1 rounded text-xs font-medium ${
                          mentor.status === 'active'
                            ? 'bg-red-100 text-red-700 hover:bg-red-200'
                            : 'bg-green-100 text-green-700 hover:bg-green-200'
                        }`}
                      >
                        {mentor.status === 'active' ? 'Khóa' : 'Mở khóa'}
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
          <div className="text-gray-500">Không có mentor nào</div>
        </div>
      )}
    </div>
  );
}