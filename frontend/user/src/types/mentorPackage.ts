export interface MentorPackage {
  packageId: number;
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
  createdBy?: number;
  createdByName?: string;
  createdAt?: string;
}

export interface MentorPackageFilter {
  page?: number;
  pageSize?: number;
  searchTerm?: string;
  minPrice?: number;
  maxPrice?: number;
  minDuration?: number;
  maxDuration?: number;
  sortBy?: string;
  sortDirection?: string;
}
