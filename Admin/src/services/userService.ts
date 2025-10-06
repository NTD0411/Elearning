import { apiClient, apiConfig } from './api';
import { User, PaginatedUserList, UserFilter, MentorManagement, MentorStatusUpdate, MentorStatistics } from '../types/user';

export class UserService {
  // Get paginated users list
  static async getUsers(filter: UserFilter = {}): Promise<PaginatedUserList> {
    const params = new URLSearchParams();
    
    if (filter.role) params.append('role', filter.role);
    if (filter.status) params.append('status', filter.status);
    if (filter.approved !== undefined) params.append('approved', filter.approved.toString());
    if (filter.gender) params.append('gender', filter.gender);
    if (filter.searchTerm) params.append('searchTerm', filter.searchTerm);
    if (filter.page) params.append('page', filter.page.toString());
    if (filter.pageSize) params.append('pageSize', filter.pageSize.toString());
    if (filter.sortBy) params.append('sortBy', filter.sortBy);
    if (filter.sortDirection) params.append('sortDirection', filter.sortDirection);

    const endpoint = `${apiConfig.endpoints.users.list}?${params.toString()}`;
    return apiClient.get<PaginatedUserList>(endpoint);
  }

  // Get all students
  static async getStudents(): Promise<User[]> {
    return apiClient.get<User[]>(apiConfig.endpoints.users.students);
  }

  // Get all mentors
  static async getMentors(): Promise<User[]> {
    return apiClient.get<User[]>(apiConfig.endpoints.users.mentors);
  }

  // Get user by ID
  static async getUserById(id: number): Promise<User> {
    return apiClient.get<User>(apiConfig.endpoints.users.getById(id));
  }

  // Update user status
  static async updateUserStatus(id: number, status: string): Promise<any> {
    return apiClient.put(apiConfig.endpoints.users.updateStatus(id), status);
  }

  // Update user role
  static async updateUserRole(id: number, role: string): Promise<any> {
    return apiClient.put(apiConfig.endpoints.users.updateRole(id), role);
  }

  // Approve/disapprove user
  static async approveUser(id: number, approved: boolean): Promise<any> {
    return apiClient.put(apiConfig.endpoints.users.approve(id), approved);
  }

  // Delete user
  static async deleteUser(id: number): Promise<any> {
    return apiClient.delete(apiConfig.endpoints.users.delete(id));
  }

  // Mentor Management
  static async getMentorManagement(): Promise<MentorManagement[]> {
    return apiClient.get<MentorManagement[]>(apiConfig.endpoints.mentor.management);
  }

  // Ban mentor
  static async banMentor(id: number, reason: string): Promise<any> {
    return apiClient.post(apiConfig.endpoints.mentor.ban(id), { reason });
  }

  // Unban mentor
  static async unbanMentor(id: number): Promise<any> {
    return apiClient.post(apiConfig.endpoints.mentor.unban(id));
  }

  // Update mentor status
  static async updateMentorStatus(id: number, statusUpdate: MentorStatusUpdate): Promise<any> {
    return apiClient.put(apiConfig.endpoints.mentor.updateStatus(id), statusUpdate);
  }

  // Get mentor statistics
  static async getMentorStatistics(): Promise<MentorStatistics> {
    return apiClient.get<MentorStatistics>(apiConfig.endpoints.mentor.statistics);
  }
}