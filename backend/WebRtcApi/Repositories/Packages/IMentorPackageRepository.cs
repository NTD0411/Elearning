using WebRtcApi.Models;

namespace WebRtcApi.Repositories.Packages
{
    public interface IMentorPackageRepository
    {
        Task<MentorPackage> GetByIdAsync(int id);
        Task<IEnumerable<MentorPackage>> GetAllAsync();
        Task<MentorPackage> CreateAsync(MentorPackage package);
        Task<MentorPackage> UpdateAsync(MentorPackage package);
        Task DeleteAsync(int id);
    }
}