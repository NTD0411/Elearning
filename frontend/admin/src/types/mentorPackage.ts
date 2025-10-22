// DTOs for MentorPackage API communication

export interface MentorPackageDto {
  packageId: number;
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
  createdBy?: number;
  createdByName?: string;
  createdAt?: string;
}

export interface CreateMentorPackageDto {
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
  createdBy: number;
}

export interface UpdateMentorPackageDto {
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
}

export interface MentorPackageFilterDto {
  page: number;
  pageSize: number;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  createdBy?: number;
  sortBy?: string;
  sortDirection?: string;
}

export interface PaginatedMentorPackageListDto {
  mentorPackages: MentorPackageDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

// Type aliases for convenience
export type MentorPackage = MentorPackageDto;
