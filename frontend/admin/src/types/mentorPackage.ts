export interface Package {
  packageId: number;
  name: string;
  description?: string | null;
  price: number;
  durationMonths: number;
  createdAt: string;
  createdBy?: {
    id: number;
    name: string;
    avatar?: string | null;
  } | null;
}

export interface CreatePackageInput {
  name: string;
  description?: string;
  price: number;
  durationMonths: number;
}

export interface UpdatePackageInput {
  name?: string;
  description?: string;
  price?: number;
  durationMonths?: number;
}


