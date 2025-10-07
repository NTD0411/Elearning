// Type definitions for User Management
export interface User {
  userId: number;
  fullName: string;
  email: string;
  role: 'student' | 'mentor' | 'admin';
  status?: string;
  portraitUrl?: string;
  experience?: string;
  approved?: boolean;
  gender?: string;
  address?: string;
  dateOfBirth?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedUserList {
  users: User[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface UserFilter {
  role?: string;
  status?: string;
  approved?: boolean;
  gender?: string;
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

export interface MentorManagement extends User {
  totalStudents: number;
  averageRating: number;
}

export interface MentorStatusUpdate {
  status: string;
  reason?: string;
}

export interface MentorStatistics {
  totalMentors: number;
  activeMentors: number;
  bannedMentors: number;
  pendingApproval: number;
  approvedMentors: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
}