using WebRtcApi.Dtos.MentorPackages;
using WebRtcApi.Models;

namespace WebRtcApi.Repositories.MentorPackages
{
    public interface IMentorPackageRepository
    {
        // Get operations
        Task<PaginatedMentorPackageListDto> GetMentorPackagesAsync(MentorPackageFilterDto filter);
        Task<MentorPackageDto?> GetMentorPackageByIdAsync(int packageId);
        Task<MentorPackage?> GetMentorPackageEntityByIdAsync(int packageId);
        Task<List<MentorPackageDto>> GetMentorPackagesByCreatorAsync(int createdBy);
        Task<List<MentorPackageDto>> GetAllMentorPackagesAsync();

        // Create operations
        Task<MentorPackageDto> CreateMentorPackageAsync(CreateMentorPackageDto createDto);

        // Update operations
        Task<MentorPackageDto?> UpdateMentorPackageAsync(int packageId, UpdateMentorPackageDto updateDto);

        // Delete operations
        Task<bool> DeleteMentorPackageAsync(int packageId);

        // Validation operations
        Task<bool> MentorPackageExistsAsync(int packageId);
        Task<bool> MentorPackageNameExistsAsync(string name, int? excludePackageId = null);
    }
}
