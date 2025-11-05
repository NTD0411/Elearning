using WebRtcApi.Dtos.Packages;

namespace WebRtcApi.Repositories.Packages
{
    public interface IPackageRepository
    {
        Task<IEnumerable<PackageResponseDto>> GetAllAsync();
        Task<PackageResponseDto?> GetByIdAsync(int id);
        Task<PackageResponseDto> CreateAsync(CreatePackageDto dto, int createdByUserId);
        Task<bool> UpdateAsync(int id, UpdatePackageDto dto);
        Task<bool> DeleteAsync(int id);
    }
}


