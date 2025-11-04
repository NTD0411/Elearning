import { apiClient, apiConfig } from './api';
import { Package, CreatePackageInput, UpdatePackageInput } from '../types/mentorPackage';

export class PackageService {
  static async list(): Promise<Package[]> {
    return apiClient.get<Package[]>(apiConfig.endpoints.packages.list);
  }

  static async getById(id: number): Promise<Package> {
    return apiClient.get<Package>(apiConfig.endpoints.packages.getById(id));
  }

  static async create(data: CreatePackageInput): Promise<Package> {
    return apiClient.post<Package>(apiConfig.endpoints.packages.create, data);
  }

  static async update(id: number, data: UpdatePackageInput): Promise<void> {
    await apiClient.put(apiConfig.endpoints.packages.update(id), data);
  }

  static async delete(id: number): Promise<void> {
    await apiClient.delete(apiConfig.endpoints.packages.delete(id));
  }
}


