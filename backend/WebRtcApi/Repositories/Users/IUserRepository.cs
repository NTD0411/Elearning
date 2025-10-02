using WebRtcApi.Dtos.Users;
using WebRtcApi.Models;

namespace WebRtcApi.Repositories.Users
{
    public interface IUserRepository
    {
        Task<PaginatedUserListDto> GetUsersAsync(UserFilterDto filter);
        Task<List<UserListDto>> GetStudentsAsync();
        Task<List<UserListDto>> GetMentorsAsync();
        Task<UserListDto?> GetUserByIdAsync(int userId);
        Task<User?> GetUserEntityByIdAsync(int userId);
        Task<bool> UpdateUserStatusAsync(int userId, string status);
        Task<bool> UpdateUserRoleAsync(int userId, string role);
        Task<bool> ApproveUserAsync(int userId, bool approved);
        Task<bool> DeleteUserAsync(int userId);
        
        // Mentor Management
        Task<List<MentorManagementDto>> GetMentorManagementListAsync();
        Task<MentorManagementDto?> GetMentorManagementByIdAsync(int userId);
        Task<bool> BanMentorAsync(int userId, string reason, DateTime? banUntil = null);
        Task<bool> UnbanMentorAsync(int userId);
        Task<bool> UpdateMentorStatusAsync(int userId, MentorStatusUpdateDto statusUpdate);
    }
}